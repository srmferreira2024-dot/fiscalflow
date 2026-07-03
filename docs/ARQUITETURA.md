# Arquitetura — FiscalFlow

## Visão geral

Duas aplicações independentes, sem monorepo tooling (Nx/Turborepo), orquestradas via Docker Compose e expostas atrás de um único Nginx:

```
                      ┌───────────┐
   usuário  ─────────▶│  Nginx    │
                      └─────┬─────┘
                 ┌──────────┴──────────┐
                 ▼                     ▼
          /  ───▶ frontend      /api ───▶ backend
         (Next.js 16)                 (NestJS)
                                          │
                                 ┌────────┼────────┐
                                 ▼        ▼         ▼
                            PostgreSQL  Redis   (futuro: filas)
```

Optamos por **duas pastas com `package.json` próprios** em vez de um monorepo com ferramentas dedicadas: o time é pequeno, o número de pacotes compartilhados é zero nesta fase, e cada `Dockerfile` builda seu próprio contexto — isso mantém o custo operacional baixo, como exige o objetivo do projeto.

## Por que `/api` no Nginx aponta direto para o backend

O backend expõe sua API pública em `/api/*` (prefixo usado no Swagger, documentado para integrações externas). Por isso, as rotas internas do Next.js que fazem proxy autenticado para o backend (Route Handlers que leem/escrevem os cookies httpOnly de sessão) **não podem** viver em `/api/*` — colidiriam com o roteamento do Nginx. Elas vivem em `/bff/*` (Backend-for-Frontend): `/bff/auth/login`, `/bff/auth/logout`, `/bff/auth/me`, `/bff/companies`. Isso ficou claro durante a verificação end-to-end desta sprint e é uma decisão deliberada, não um detalhe incidental — qualquer nova rota de proxy no frontend deve seguir o prefixo `/bff`.

## Backend — Clean Architecture / DDD

```
backend/src/
  common/       # kernel compartilhado: guards, decorators, filters, interceptors, value objects
  infra/        # adapters de infraestrutura (Prisma, Redis) — nada de regra de negócio aqui
  modules/
    auth/
      application/   # use-cases e DTOs — regra de negócio, sem depender de HTTP/Nest
      infrastructure/ # controller, estratégias Passport, module — a "casca" HTTP
    users/ offices/ companies/  # mesmo padrão application/infrastructure
    invoices/
      domain/ports/invoice-provider.port.ts   # ver seção "Regra mais importante" abaixo
```

Cada módulo separa **application** (regra de negócio, testável sem framework) de **infrastructure** (controllers, estratégias de autenticação, mapeamento HTTP). O `PrismaService` é a única porta de saída para persistência, injetada via DI — nunca importada diretamente dentro de um use-case como um singleton global.

### Repository Pattern como mecanismo de isolamento de tenant

`CompaniesRepository` não tem nenhum método que busque um registro só pelo `id`. Toda leitura/escrita exige `officeId` explicitamente, extraído do JWT (nunca de parâmetro de URL/body). Isso torna estruturalmente impossível um endpoint vazar dado de outro tenant por engano — não é uma convenção que se possa esquecer de seguir, é a única assinatura de método disponível. `tenant-isolation.e2e-spec.ts` prova isso automaticamente.

## Regra mais importante: `InvoiceProvider`

Nenhuma regra de negócio pode depender de um fornecedor específico de emissão fiscal. `src/modules/invoices/domain/ports/invoice-provider.port.ts` define a interface (`emitirNota`, `cancelarNota`, `consultarNota`, `baixarXML`, `baixarPDF`, `listarMunicipios`, `validarCertificado`) que **qualquer** integração futura (SEFAZ, prefeituras, Focus NFe, eNotas, PlugNotas etc.) deverá implementar como um Adapter, injetado via DI (Strategy + Adapter pattern). Essa interface já existe nesta sprint — sem implementação, sem wiring — justamente para que o contrato fique fixado desde o início e nenhuma sprint futura precise quebrar compatibilidade ou re-acoplar regra de negócio a um fornecedor.

## Autenticação e multi-tenant

- JWT de acesso (15 min) + refresh token opaco (7 dias, hash SHA-256 armazenado no banco, rotacionado a cada uso).
- `JwtAuthGuard` (global) exige token em toda rota, exceto as marcadas `@Public()`.
- `RolesGuard` (global) aplica RBAC via `@Roles(...)` com os papéis do domínio: `ADMIN`, `CONTADOR`, `OPERADOR`, `CLIENTE`.
- `TenantGuard` garante que o JWT decodificado contenha `officeId` antes de qualquer acesso a recurso tenant-scoped — uma camada extra além do Repository Pattern.
- Senhas com `argon2`. Rate limit (`@nestjs/throttler` + storage Redis) nas rotas de login/registro, limite configurável via `AUTH_THROTTLE_LIMIT`.
- `AuditLogInterceptor` grava eventos marcados com `@Audit(action, entity)` — nesta sprint, apenas os eventos de autenticação. O módulo de Auditoria completo (cobrindo toda ação do sistema) é escopo de sprint futura.

## Frontend — sessão via cookies httpOnly

O frontend nunca guarda o access/refresh token em `localStorage` (evita exposição a XSS). O fluxo:

1. `app/(auth)/login/page.tsx` (client) envia o formulário para `POST /bff/auth/login`.
2. O Route Handler chama o backend, recebe os tokens e os grava como cookies `httpOnly` via `src/lib/session.ts` — só o objeto `user` retorna ao browser.
3. `src/proxy.ts` (renomeado de `middleware.ts` a partir do Next.js 16) faz uma checagem **otimista**: se não há cookie de acesso, redireciona `/dashboard` para `/login`. Essa checagem só olha o cookie, nunca chama o backend.
4. `(dashboard)/layout.tsx` (server component) faz a checagem **real**: chama `GET /users/me` no backend com o token do cookie. Se falhar, redireciona para `/login`.
5. `src/lib/backend-fetch.ts` centraliza toda chamada autenticada ao backend a partir do servidor Next.js: anexa o access token, e se receber 401, tenta renovar via refresh token uma única vez antes de desistir.

## Segurança

Helmet, `ValidationPipe` global (whitelist + forbidNonWhitelisted), CORS restrito à origem do frontend, rate limit nas rotas de auth, senhas com argon2, cookies de sessão httpOnly + SameSite=Lax. O flag `Secure` do cookie é controlado por `COOKIE_SECURE` (não por `NODE_ENV`) — ele só deve ser `true` quando o tráfego realmente chegar via HTTPS na borda; amarrar isso a `NODE_ENV=production` quebraria a sessão em qualquer deploy que ainda sirva HTTP puro.

## Sprint 2 — Empresas completo + Clientes

### Certificado A1 sempre criptografado, nunca no controller

`src/infra/security/certificate-encryption.service.ts` criptografa o arquivo `.pfx` e a senha do Certificado A1 separadamente com AES-256-GCM, cada um com seu próprio IV/authTag (reaproveitar o mesmo IV entre duas criptografias com a mesma chave quebra a garantia de segurança do GCM — por isso `CompanyCertificate` tem `dataIv`/`dataAuthTag` e `passwordIv`/`passwordAuthTag` distintos). A chave mestra vem de `CERTIFICATE_ENCRYPTION_KEY` (32 bytes em base64), nunca do banco. `CompaniesService` mapeia toda resposta através de `toCompanyView()` (`modules/companies/application/company-view.ts`), que só inclui metadados do certificado (`uploadedAt`, `validoAte`) — os bytes criptografados nunca atravessam a fronteira HTTP, nem por engano.

Upload aceita o arquivo em base64 dentro do JSON (`UploadCertificateDto`), não multipart — decisão deliberada para não trazer `multer` como dependência nesta sprint, já que não há tela de upload no frontend ainda.

### Clientes pertencem a uma Empresa, não ao Escritório

`Client` carrega `officeId` **e** `companyId`. Toda rota de `/companies/:companyId/clients` primeiro chama `CompaniesService.getForOffice(companyId, officeId)` (reaproveitado do módulo `companies`) antes de tocar em qualquer cliente — isso garante que um usuário não possa criar/ler/editar um cliente informando um `companyId` de outro escritório na URL, mesmo que o `id` do cliente não exista ainda. `ClientsRepository` segue o mesmo padrão de `CompaniesRepository`: nenhum método aceita só o `id`.

## Sprint 3 — Produtos + Serviços

`Product` e `ServiceItem` (`modules/products`, `modules/service-items`) reaproveitam exatamente o padrão de `Client` da Sprint 2: aninhados em `/companies/:companyId/products` e `/companies/:companyId/services`, `CompaniesService.getForOffice()` valida a posse da empresa antes de qualquer operação, e os repositórios nunca aceitam só o `id`.

O model se chama `ServiceItem`, não `Service` — nome escolhido de propósito para não colidir com a convenção `application/services/` que cada módulo já usa para sua camada de regra de negócio (`modules/service-items/application/services/service-items.service.ts` seria ambíguo demais com `Service` como nome de entidade). Na API e no Swagger a rota e a tag continuam `/services`/`services`, então a decisão é invisível para quem consome a API.

## Sprint 4 — Tela de detalhe de Empresa (frontend)

### `proxyJson` — um helper para não repetir cada rota `/bff/*`

`frontend/src/lib/proxy-response.ts` centraliza o padrão que antes era repetido em cada `route.ts`: chama `backendFetch()` (que já cuida de renovação automática de token) e converte a resposta em `NextResponse.json(...)`, tratando `204 No Content` sem tentar fazer `.json()` de um corpo vazio. As ~9 rotas novas desta sprint (`/bff/companies/[id]`, `.../certificate`, `.../clients[/[clientId]]`, `.../products[/[productId]]`, `.../services[/[serviceId]]`) viraram cada uma ~5 linhas por causa disso — sem esse helper, seriam ~15 linhas repetidas por rota.

### Um componente de aba por recurso, sem abstração genérica de CRUD

`clients-tab.tsx`, `products-tab.tsx` e `services-tab.tsx` (`frontend/src/components/company-detail/`) têm a mesma forma (listar com React Query, criar/editar num `Dialog` reaproveitado com RHF+Zod, remover com `useMutation`), mas são três componentes concretos e independentes, não uma abstração genérica de "tabela CRUD". Os campos e validações de cada recurso (CPF/CNPJ, NCM/CFOP/CST, código de serviço LC116) são diferentes o bastante para que generalizar agora custasse mais do que economiza — mesma lógica já aplicada à decisão de não criar um `Client`/`Product`/`ServiceItem` genérico no backend.

### Certificado A1: upload em base64, leitura client-side via `FileReader`

O backend só aceita o certificado como base64 dentro do JSON (decisão da Sprint 2, sem `multer`). `certificate-tab.tsx` lê o arquivo escolhido com a API `FileReader` do browser antes de enviar — nenhum arquivo passa pelo servidor Next.js como stream; ele é lido inteiro na memória do client primeiro. Aceitável para certificados A1 (poucos KB), mas não seria a escolha certa para arquivos grandes.

## Sprint 5 — Motor de emissão de Notas

### O primeiro Adapter prova a arquitetura de plugins

`InvoiceProvider` (`modules/invoices/domain/ports/invoice-provider.port.ts`) existe desde a Sprint 1, sem implementação. Esta sprint cria `MockInvoiceProviderAdapter` — simula emissão/cancelamento/consulta de forma determinística, sem chamar nenhum serviço externo — e o registra no único lugar que sabe qual Adapter está ativo:

```ts
// modules/invoices/infrastructure/invoices.module.ts
{ provide: INVOICE_PROVIDER, useExisting: MockInvoiceProviderAdapter }
```

`InvoicesService` nunca importa `MockInvoiceProviderAdapter` diretamente — só a interface `InvoiceProvider`, injetada via `@Inject(INVOICE_PROVIDER)`. Quando um Adapter fiscal real existir (Focus NFe, eNotas, SEFAZ direto etc.), a troca é essa única linha do binding; nenhum código de `InvoicesService` muda. Isso é literalmente a "regra mais importante" do projeto, agora com um caso de uso real em vez de só a interface.

### Por que `productId`/`serviceItemId` não são validados via XOR no DTO

`CreateInvoiceItemDto` tem os dois campos `@IsOptional()`. Tentar expressar "exatamente um dos dois" com `class-validator` teria um buraco: quando o campo A está ausente, `@IsOptional()` pula **todos** os validadores daquele campo — inclusive um `@Validate()` customizado — então o caso "os dois ausentes" nunca dispararia o erro. A regra é validada em `InvoicesService.buildInvoiceItems()`, com teste unitário cobrindo os dois casos (nenhum informado, os dois informados).

### Sem fila nesta sprint

A emissão acontece de forma síncrona dentro da requisição HTTP: `InvoicesService.emitirNota()` cria a `Invoice` (`RASCUNHO`) e chama o `InvoiceProvider` na mesma chamada. Se o Adapter falhar, a `Invoice` fica registrada com o status atual e pode ser reemitida manualmente via `POST .../invoices/:id/reemitir` — não há retry automático nem fila de reprocessamento. O Redis já roda no `docker-compose.yml` (usado hoje pelo rate limit de auth), mas BullMQ como biblioteca ainda não foi adicionado — fica para quando a fila assíncrona virar sua própria sprint.
