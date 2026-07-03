# FiscalFlow

SaaS white-label multi-tenant para escritórios de contabilidade, com foco em automatizar a emissão de notas fiscais.

- **Sprint 1: Fundação + Autenticação** — monorepo simples (backend + frontend), infraestrutura via Docker Compose, banco de dados multi-tenant e autenticação completa (JWT + refresh token + RBAC).
- **Sprint 2: Empresas completo + Clientes** — cadastro fiscal completo de Empresa (regime tributário, inscrições, CNAE, município, Certificado A1 criptografado) e o módulo de Clientes (CRUD aninhado por Empresa).
- **Sprint 3: Produtos + Serviços** — últimos cadastros-mestre antes do módulo de Notas: Produtos (NCM, CFOP, CST, alíquotas, preço, categoria) e Serviços (código, ISS, descrição, município), ambos aninhados por Empresa.
- **Sprint 4: Tela de detalhe de Empresa** — fecha a dívida de UI das Sprints 2-3: criação de Empresa, e uma página `/dashboard/empresas/[id]` com abas para editar dados fiscais, subir/remover Certificado A1, e gerenciar Clientes/Produtos/Serviços.
- **Sprint 5: Motor de emissão de Notas** — módulo de Notas Fiscais (referenciando Empresa+Cliente+Produto/Serviço) e o primeiro Adapter real (`MockInvoiceProviderAdapter`) implementando `InvoiceProvider` — prova a arquitetura de plugins que é a regra mais importante do projeto.

Veja [docs/ARQUITETURA.md](docs/ARQUITETURA.md) para as decisões arquiteturais, [docs/GUIA_INSTALACAO.md](docs/GUIA_INSTALACAO.md) para o passo a passo de instalação e [docs/GUIA_DESENVOLVEDOR.md](docs/GUIA_DESENVOLVEDOR.md) para o guia de contribuição.

## Stack

- **Backend**: NestJS, TypeScript, PostgreSQL, Prisma, Redis, JWT, Swagger, Docker
- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, TailwindCSS, shadcn/ui, React Query, React Hook Form, Zod
- **Infraestrutura**: Docker Compose, Nginx, GitHub Actions

## Quick start

```bash
cp .env.example .env
# edite JWT_ACCESS_SECRET, JWT_REFRESH_SECRET e CERTIFICATE_ENCRYPTION_KEY no .env antes de subir em produção

docker compose up -d --build
```

Serviços disponíveis:

- App (via Nginx): http://localhost:8080
- Swagger: http://localhost:8080/api/docs
- Backend direto: http://localhost:3001
- Frontend direto: http://localhost:3000

Crie um usuário de teste populando o banco:

```bash
cd backend
cp .env.example .env   # ajuste DATABASE_URL/REDIS_HOST para localhost e as portas publicadas
npm install
npm run prisma:seed
```

Login de teste criado pelo seed: `admin@fiscalflow.dev` / `Admin@123`.

## Estrutura do repositório

```
fiscalflow/
  backend/     # API NestJS (Clean Architecture / DDD)
  frontend/    # Next.js App Router
  nginx/       # Reverse proxy
  docs/        # Documentação do projeto
  postman/     # Coleção Postman
  docker-compose.yml
```

## Escopo até agora

Incluído: monorepo, Docker Compose, schema multi-tenant (Escritório/Usuário/Empresa/Cliente/Produto/Serviço/Nota), autenticação JWT+refresh com RBAC, isolamento de tenant testado automaticamente (inclusive entre Empresas de um mesmo escritório, no caso de Clientes/Produtos/Serviços/Notas/Certificado A1), cadastro fiscal completo de Empresa, Certificado A1 sempre criptografado (AES-256-GCM) e nunca exposto via API, auditoria mínima dos eventos de auth/certificado, a tela de detalhe de Empresa no frontend (`/dashboard/empresas/[id]`) com abas para Dados Fiscais, Certificado, Clientes, Produtos e Serviços, e o módulo de emissão de Notas Fiscais (emitir/reemitir/cancelar/consultar/baixar XML e PDF) através de um Adapter mock que prova a arquitetura de plugins (`InvoiceProvider`) sem depender de nenhum fornecedor fiscal real.

Fora do escopo (sprints futuras): fila assíncrona (BullMQ), qualquer Adapter fiscal real (SEFAZ/prefeituras/Focus NFe etc.), geração real de XML/PDF, cálculo real de impostos, módulos de Automação/Dashboard/Webhooks/API Pública, aba "Notas" no frontend, upload de certificado via multipart (segue base64+JSON), 2FA ativo, auditoria completa.
