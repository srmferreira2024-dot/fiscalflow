# FiscalFlow — Claude Development Guide

**Last updated:** 2026-07-03  
**Current status:** Sprint 5 complete (96 tests passing, invoice engine live)

---

## The Rule

> **Nenhuma regra de negócio pode depender de um fornecedor específico de fiscal.** Toda integração é um Adapter que implementa `InvoiceProvider` (Strategy + Adapter pattern), injetado via DI. O núcleo nunca referencia um Adapter diretamente.

This is **the most important rule** of the project. It decouples business logic from fiscal providers (SEFAZ, Focus NFe, eNotas, prefeituras). When a new provider arrives, only the binding changes — `InvoicesService` doesn't know which Adapter runs.

---

## Architecture

### Multi-Tenant SaaS

```
Office (escritório de contabilidade)
  ├─ User (1..n)
  ├─ Company (1..n) — empresa cliente do escritório
  │   ├─ CompanyCertificate (A1, criptografado)
  │   ├─ Client (1..n) — destinatário de notas
  │   ├─ Product (1..n) — NCM, CFOP, alíquotas
  │   ├─ ServiceItem (1..n) — ISS, código LC116
  │   └─ Invoice (1..n) — nota emitida
  │       └─ InvoiceItem (1..n) — snapshot de Produto/Serviço
  └─ AuditLog (1..n) — registro de ações
```

**Tenant isolation rule:** Every repository method takes `companyId` AND `officeId` — no method accepts just `id` alone. This makes it structurally impossible to leak data between offices or between companies in the same office.

Example from `ClientsRepository`:
```typescript
findByIdAndCompany(id: string, companyId: string, officeId: string) {
  return this.prisma.client.findFirst({
    where: { id, companyId, officeId }
  });
}
// No method like findById(id) — it doesn't exist.
```

### Clean Architecture + DDD

Each module follows the same structure:

```
modules/[entity]/
  domain/
    ports/           # Interfaces (InvoiceProvider)
    value-objects/   # CPF, CNPJ (encapsulated validation)
  application/
    dto/             # Input/output validation (class-validator)
    services/        # Business logic (orchestration, validation)
  infrastructure/
    adapters/        # Implementations (MockInvoiceProviderAdapter)
    [entity].controller.ts      # REST endpoints
    [entity].repository.ts      # Data access
    [entity].module.ts          # DI binding
```

**DI binding pattern:** Controller → Service → Repository. Services orchestrate and never know implementation details.

### Json Fields for Flexibility

Two fields defer detailed structure to later sprints:

- `Company.fiscalSettings` (Json?) — where to eventually put serie/numeração/ambiente
- `Product.aliquotas` (Json?) — flexible because tax-set varies by regime

The schema stays open; the format is nailed down only when needed (Sprint of detailed Notes).

---

## Tech Stack

| Layer | Tech | Notes |
|-------|------|-------|
| **Frontend** | Next.js 16 + React | SSR pages + client components, type-safe |
| **Backend** | NestJS + TypeScript | Modular, DI-based, strong typing |
| **Database** | PostgreSQL 16 | Multi-tenant schema (denormalized officeId+companyId) |
| **ORM** | Prisma | Type-safe, migrations via `migrate dev` |
| **Cache/Queue** | Redis 7 | Rate limiting (throttler), future: BullMQ queue |
| **Auth** | JWT (HS256) + refresh token | Access + refresh, auto-rotation via middleware |
| **Container** | Docker Compose | Multi-stage builds, Alpine Linux |
| **Crypto** | Node.js crypto (AES-256-GCM) | A1 certificates encrypted at rest, never exposed via API |
| **Testing** | Jest + Supertest | Unit + e2e (NestJS TestingModule) |
| **CI/CD** | GitHub Actions | Lint, type-check, test on PR; deploy on main |

---

## Sprints Completed

### Sprint 1: Fundação + Autenticação
- Monorepo (backend + frontend)
- Multi-tenant schema (Office → Company)
- JWT + refresh token, RBAC (ADMIN/CONTADOR/OPERADOR/CLIENTE)
- Docker Compose + Nginx
- InvoiceProvider port (interface only, no implementation)

### Sprint 2: Empresas + Clientes
- Company fiscal data (regime, inscrições, CNAE, município, UF)
- CompanyCertificate (A1, AES-256-GCM encrypted, never exposed)
- Client CRUD (aninhado por Empresa, tenant-isolated)
- Swagger docs
- Frontend types + companies-table UI

### Sprint 3: Produtos + Serviços
- Product (NCM, CFOP, CST, aliquotas JSON, preço)
- ServiceItem (código LC116, ISS, descrição, município)
- Both follow Client pattern (officeId+companyId denormalized, code unique per company)
- ServiceItem name chosen to avoid collision with `application/services/` folder pattern
- All routes tested for cross-tenant isolation

### Sprint 4: Tela de Detalhe de Empresa (Frontend)
- Page `/dashboard/empresas/[id]` with tabs: Dados Fiscais, Certificado, Clientes, Produtos, Serviços
- Helper `proxyJson()` to reduce BFF route boilerplate
- One concrete component per tab (clients-tab, products-tab, services-tab), not generic CRUD abstraction
- Certificate upload via FileReader→base64 (no multipart)
- React Query for data fetching + mutations, RHF+Zod for forms

### Sprint 5: Motor de Emissão de Notas (Backend)
- Invoice + InvoiceItem models (Prisma schema)
- InvoiceStatus enum (RASCUNHO, PROCESSANDO, AUTORIZADA, REJEITADA, CANCELADA)
- MockInvoiceProviderAdapter (deterministic, 7 methods, no external I/O)
- InvoicesService + InvoicesRepository + InvoicesController
- 96 tests passing (71 unit + 25 e2e), tenant isolation confirmed
- All endpoints tested: POST emit, GET list/detail, PATCH reemit, DELETE cancel, GET xml/pdf

---

## Key Patterns & Rules

### Tenant Isolation (Critical)

**Every repository method:**
- Takes `companyId` AND `officeId` as parameters
- Validates in WHERE clause: `where: { id, companyId, officeId }`
- Never fetches without both guards

**Every service method:**
- Calls `CompaniesService.getForOffice(companyId, officeId)` first
- This throws `NotFoundException` if company doesn't belong to office
- Prevents "I'm user A, but I'll request company B's data"

**Every controller:**
- Uses `@TenantGuard` to verify the user's officeId matches the request
- Uses `@CurrentUser()` decorator to inject authenticated user context

**E2E tests:**
- Create two offices, confirm cross-office access returns 404
- Proven: you literally cannot read/write another office's data (it 404s)

### Certificate Encryption (A1)

- Stored: encrypted (AES-256-GCM) + IV + authTag + password hash
- API: only exposes metadata (`uploadedAt`, `validoAte`)
- Never expose raw bytes or decrypt in HTTP response
- Decryption happens server-side-only when Adapter needs it

### Repository Pattern

**Never:**
```typescript
// WRONG: Accepts only ID
async findById(id: string) { ... }
```

**Always:**
```typescript
// CORRECT: Requires company + office context
async findByIdAndCompany(id: string, companyId: string, officeId: string) { ... }
```

This forces all callers to prove they know the entity belongs to them.

### Adapter Pattern (InvoiceProvider)

```typescript
// The interface (defined once, Sprint 1)
export interface InvoiceProvider {
  emitirNota(input: EmitirNotaInput): Promise<EmitirNotaOutput>;
  cancelarNota(input: CancelarNotaInput): Promise<CancelarNotaOutput>;
  // ... 5 more methods
}

// Service never imports an Adapter
@Injectable()
export class InvoicesService {
  constructor(
    @Inject(INVOICE_PROVIDER) private readonly invoiceProvider: InvoiceProvider
  ) {}
  
  async emitirNota(companyId, officeId, dto) {
    // ... validation ...
    const result = await this.invoiceProvider.emitirNota({ ... });
    // Service doesn't know if this is MockAdapter, Focus NFe, or SEFAZ
  }
}

// Only the module knows which implementation to use
@Module({
  providers: [
    InvoicesService,
    MockInvoiceProviderAdapter,
    // This line is the ONLY place MockAdapter is referenced by name
    { provide: INVOICE_PROVIDER, useExisting: MockInvoiceProviderAdapter }
  ]
})
export class InvoicesModule {}
```

When a real fiscal provider arrives, change **one line** in `invoices.module.ts`. `InvoicesService` doesn't change.

### XOR Validation (productId XOR serviceItemId)

In `CreateInvoiceItemDto`, both `productId` and `serviceItemId` are `@IsOptional()`. 

**Why not class-validator @Validate()?** Because when field A is `@IsOptional()`, class-validator skips **all** validators on that field if it's absent — including custom validators. So the case "both fields absent" would never be caught.

**Solution:** Validate in the service (`InvoicesService.buildInvoiceItems()`):
```typescript
const hasProduct = Boolean(itemDto.productId);
const hasService = Boolean(itemDto.serviceItemId);
if (hasProduct === hasService) {
  throw new BadRequestException('Exactly one of productId or serviceItemId required');
}
```

Tested: unit test covers both "neither" and "both" cases.

### Snapshot Pattern (Invoice Items)

When a Note is emitted, `InvoiceItem` stores a **snapshot** of the Product/Service at that moment:
- `description` — copied from Product.name or ServiceItem.description
- `price` — captured (Product.price doesn't change the Item retroactively)
- References (`productId`, `serviceItemId`) — kept for audit trail, but the numbers are frozen

This prevents "I emitted a Note for 100 units at $50 each, then changed the price to $10, and now the Note shows $10."

---

## Development Workflow

### Branching

- `main` — production branch, protected, all tests must pass
- `feature/*` — feature branches off main
- Never force-push to main

### Adding a New Module

1. Create folder: `backend/src/modules/[entity]/`
2. Create structure:
   ```
   domain/ports/
   application/dto/
   application/services/
   infrastructure/adapters/
   ```
3. Define service with `CompaniesService.getForOffice()` guard
4. Define repository with `companyId + officeId` pattern
5. Define controller with `@TenantGuard + @CurrentUser()`
6. Add e2e test: cross-tenant read/write returns 404
7. Add unit test: isolation via mock
8. Import module in `app.module.ts`

### Running Tests

```bash
# Unit + integration
npm test

# E2E only (requires running services)
npm run test:e2e

# Watch mode
npm test -- --watch

# Coverage
npm test -- --coverage
```

### Docker Compose

```bash
# Start full stack
docker-compose up -d

# Rebuild after schema changes
docker-compose up -d --build backend

# Logs
docker-compose logs -f backend

# Tear down
docker-compose down
```

Backend auto-applies migrations via `docker-entrypoint.sh` — no manual `prisma migrate deploy`.

### Frontend Development

```bash
# Dev server (HMR enabled)
npm run dev

# Type-check
npx tsc --noEmit

# Lint + fix
npm run lint -- --fix

# Build
npm run build
```

### Git & Commits

- No commits unless explicitly asked
- When committing, create NEW commits (don't amend) unless user says otherwise
- Commit message format: one or two sentences, focus on WHY not WHAT
- Co-authored: `Co-Authored-By: Claude <noreply@anthropic.com>`

---

## Handoff Checklist (Before Next Sprint)

- [ ] All tests passing (npm test + npm run test:e2e)
- [ ] Lint clean (npx eslint)
- [ ] Type-check clean (npx tsc --noEmit)
- [ ] Docker Compose up -d --build completes without error
- [ ] E2E tests confirm tenant isolation (cross-office 404)
- [ ] Documentation updated (README.md, docs/ARQUITETURA.md, docs/DER.md)
- [ ] Postman collection updated with new endpoints
- [ ] Git state ready (no uncommitted changes, unless explicitly left for user)

---

## Common Questions

**Q: Can I add a method that takes just `id`?**  
A: No. Every repository method requires `companyId + officeId`. If you think you need `id` alone, you're missing a tenant check. Escalate to service layer.

**Q: Where do I put business logic?**  
A: In the Service, never in the Controller or Repository. Services orchestrate, validate, and call repositories. Controllers just parse HTTP.

**Q: Can I change the InvoiceProvider binding?**  
A: Only in `invoices.module.ts` on the `{ provide: INVOICE_PROVIDER, useExisting: ... }` line. That's the **only** place an Adapter is named.

**Q: Why is it `ServiceItem` not `Service`?**  
A: Naming collision with `application/services/` folder pattern in every module. The model is `ServiceItem`, but routes/Swagger show `/services` — invisible to API consumers.

**Q: Why is Certificate data never exposed?**  
A: A1 is PII + high-value attack surface. Always encrypt at rest (AES-256-GCM). API returns only metadata (`uploadedAt`, `validoAte`). Decryption only on server-side when Adapter requests it.

---

## Next Steps (Sprint 6+)

Three independent options (choose one):

1. **BullMQ Async Queue** (2-3 days) — Auto-retry failed emission with backoff
2. **Frontend Invoices Tab** (3-4 days) — Full UI for Notes CRUD (mirrors clients/products/services pattern)
3. **User Management + Audit** (4-5 days) — Invite/remove users, full audit logging

See `/Users/sandrarayane/.claude/plans/sprint-6-options.md` for details.

---

## References

- **Architecture:** [docs/ARQUITETURA.md](docs/ARQUITETURA.md)
- **ERD:** [docs/DER.md](docs/DER.md)
- **Installation:** [docs/GUIA_INSTALACAO.md](docs/GUIA_INSTALACAO.md)
- **Postman:** [postman/fiscalflow-auth.postman_collection.json](postman/fiscalflow-auth.postman_collection.json)
- **Plan (Sprint 6 options):** `/Users/sandrarayane/.claude/plans/sprint-6-options.md`
- **Memory (persistent context):** `/Users/sandrarayane/.claude/projects/-Users-sandrarayane-projetos-claude/memory/fiscalflow_*.md`

---

## Language & Style

- **Frontend:** English (React convention)
- **Backend:** Portuguese (domain language, business logic, error messages)
- **Tests:** Portuguese (describe blocks)
- **Comments:** Minimal — only WHY, not WHAT. Well-named code is self-documenting.
- **Commits:** Portuguese for why, English for file paths/function names
