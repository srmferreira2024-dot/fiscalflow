# Guia para Desenvolvedores

## Convenções gerais

- Conventional Commits (`feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`...).
- ESLint + Prettier obrigatórios (`npm run lint` em cada app antes de abrir PR).
- Nunca importar `PrismaService` diretamente dentro de um use-case sem passar por injeção de dependência — isso quebra testabilidade.
- Nenhuma query tenant-scoped pode filtrar por um `officeId` vindo de parâmetro de URL/body. Sempre use `@CurrentUser()` (o `officeId` do JWT).

## Como adicionar um novo módulo no backend

Siga o padrão usado em `modules/companies`:

```
modules/<nome>/
  application/
    dto/                  # DTOs de entrada (class-validator)
    services/ ou use-cases/   # regra de negócio, sem import de @nestjs/common HTTP decorators
  infrastructure/
    <nome>.controller.ts  # mapeamento HTTP, guards, decorators de rota
    <nome>.repository.ts  # única camada que fala com o PrismaService
    <nome>.module.ts
```

Checklist:

1. Se o recurso é tenant-scoped, o repository **não deve ter** nenhum método que aceite só o `id` — sempre `id` + `officeId` (veja `CompaniesRepository` como referência).
2. Toda rota tenant-scoped: `@UseGuards(TenantGuard)` no controller e `@CurrentUser()` para extrair o `officeId`.
3. Rotas que exigem papel específico: `@Roles(UserRole.ADMIN, ...)`.
4. Ações que devem virar auditoria: `@Audit('ACTION', 'Entity')`.
5. Escreva testes unitários do service/use-case (mockando o repository) e, se o módulo expõe endpoints novos relevantes para isolamento de tenant, um cenário no estilo de `test/tenant-isolation.e2e-spec.ts`.
6. Registre o módulo em `app.module.ts`.

## Integrações fiscais futuras (Adapter Pattern)

Nenhuma integração com provedor de nota fiscal deve ser referenciada diretamente por um módulo de domínio. Implemente a interface `InvoiceProvider` (`modules/invoices/domain/ports/invoice-provider.port.ts`) em um novo Adapter (ex.: `modules/invoices/infrastructure/adapters/focus-nfe.adapter.ts`), registre-o via token de injeção (`INVOICE_PROVIDER`) e resolva qual Adapter usar por Factory/Strategy baseado na configuração fiscal da empresa — nunca com `if/else` espalhado pelos use-cases.

## Como adicionar uma nova rota de proxy no frontend

Rotas internas do Next.js que conversam com o backend usando os cookies de sessão vivem em `src/app/bff/**/route.ts` — **nunca** em `src/app/api/**`, pois o Nginx já reserva `/api/*` para o backend (veja `docs/ARQUITETURA.md`). Use `backendFetch()` (`src/lib/backend-fetch.ts`) para herdar automaticamente o comportamento de renovação de token.

## Rodando localmente durante o desenvolvimento

`docker compose up -d postgres redis` sobe só a infra, e você roda backend/frontend com `npm run start:dev` / `npm run dev` fora de container, com hot-reload.
