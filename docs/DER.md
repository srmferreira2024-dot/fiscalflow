# DER

Atualizado na Sprint 5 (Motor de emissão de Notas). Histórico: Sprint 1 introduziu `Office`, `User`, `Company` (mínima), `RefreshToken`, `AuditLog`; Sprint 2 completou `Company` e adicionou `Client`/`CompanyCertificate`; Sprint 3 adicionou `Product`/`ServiceItem`.

```mermaid
erDiagram
    OFFICE ||--o{ USER : possui
    OFFICE ||--o{ COMPANY : possui
    OFFICE ||--o{ AUDIT_LOG : gera
    OFFICE ||--o{ CLIENT : possui
    OFFICE ||--o{ PRODUCT : possui
    OFFICE ||--o{ SERVICE_ITEM : possui
    OFFICE ||--o{ INVOICE : possui
    COMPANY ||--o{ PRODUCT : cataloga
    COMPANY ||--o{ SERVICE_ITEM : cataloga
    COMPANY ||--o{ INVOICE : emite
    CLIENT ||--o{ INVOICE : recebe
    INVOICE ||--o{ INVOICE_ITEM : contém
    PRODUCT ||--o{ INVOICE_ITEM : referenciado
    SERVICE_ITEM ||--o{ INVOICE_ITEM : referenciado
    USER ||--o{ REFRESH_TOKEN : possui
    USER ||--o{ AUDIT_LOG : gera
    COMPANY ||--o| COMPANY_CERTIFICATE : possui
    COMPANY ||--o{ CLIENT : atende

    OFFICE {
        uuid id PK
        string name
        string slug UK
        string document
        string logoUrl
        boolean isActive
    }

    USER {
        uuid id PK
        uuid officeId FK
        string name
        string email UK
        string passwordHash
        enum role "ADMIN | CONTADOR | OPERADOR | CLIENTE"
        boolean twoFactorEnabled
        string twoFactorSecret
        boolean isActive
        datetime lastLoginAt
    }

    COMPANY {
        uuid id PK
        uuid officeId FK
        string cnpj
        string razaoSocial
        string nomeFantasia
        enum regimeTributario "SIMPLES_NACIONAL | LUCRO_PRESUMIDO | LUCRO_REAL | MEI"
        string inscricaoEstadual
        string inscricaoMunicipal
        string cnae
        string municipio
        string uf
        string logoUrl
        json fiscalSettings
        boolean isActive
    }

    COMPANY_CERTIFICATE {
        uuid id PK
        uuid companyId FK UK
        bytes encryptedData
        bytes dataIv
        bytes dataAuthTag
        bytes encryptedPassword
        bytes passwordIv
        bytes passwordAuthTag
        datetime uploadedAt
        datetime validoAte
    }

    CLIENT {
        uuid id PK
        uuid officeId FK
        uuid companyId FK
        enum documentType "CPF | CNPJ"
        string document
        string name
        string email
        string phone
        string zipCode
        string street
        string number
        string complement
        string neighborhood
        string city
        string state
        string notes
        boolean isActive
    }

    PRODUCT {
        uuid id PK
        uuid officeId FK
        uuid companyId FK
        string code
        string name
        string ncm
        string cfop
        string cst
        json aliquotas
        decimal price
        string category
        boolean isActive
    }

    SERVICE_ITEM {
        uuid id PK
        uuid officeId FK
        uuid companyId FK
        string code
        string description
        decimal issAliquota
        string municipio
        boolean isActive
    }

    INVOICE {
        uuid id PK
        uuid officeId FK
        uuid companyId FK
        uuid clientId FK
        enum status "RASCUNHO | PROCESSANDO | AUTORIZADA | REJEITADA | CANCELADA"
        string numero
        string protocolo
        decimal valorTotal
        datetime dataEmissao
        string motivo
        string providerName
    }

    INVOICE_ITEM {
        uuid id PK
        uuid invoiceId FK
        string description
        decimal quantidade
        decimal valorUnitario
        decimal valorTotal
        uuid productId FK
        uuid serviceItemId FK
    }

    REFRESH_TOKEN {
        uuid id PK
        uuid userId FK
        string tokenHash UK
        datetime expiresAt
        datetime revokedAt
        string ipAddress
        string userAgent
    }

    AUDIT_LOG {
        uuid id PK
        uuid officeId FK
        uuid userId FK
        string action
        string entity
        string entityId
        string ipAddress
        json metadata
    }
```

Notas:

- `Office` é o tenant raiz. Toda entidade tenant-scoped (`User`, `Company`, `Client`, `AuditLog`) carrega `officeId` com `onDelete: Cascade`.
- `Company.cnpj` é único **por escritório** (`@@unique([officeId, cnpj])`).
- `Client` carrega `officeId` **e** `companyId` (denormalizado) — todo acesso passa pelos dois, nunca só pelo `id` (ver `ClientsRepository`). `Client.document` é único **por empresa** (`@@unique([companyId, document])`).
- `CompanyCertificate` é 1:1 com `Company`. Os seis campos de bytes (`encryptedData`/`dataIv`/`dataAuthTag` para o arquivo, `encryptedPassword`/`passwordIv`/`passwordAuthTag` para a senha) nunca saem do banco via API — só metadados (`uploadedAt`, `validoAte`). IV e authTag são únicos por criptografia (AES-256-GCM nunca reutiliza IV com a mesma chave).
- `RefreshToken` guarda apenas o **hash** do token (SHA-256), nunca o valor em texto puro.
- `fiscalSettings` (Json) fica com schema aberto de propósito — só o sprint de Notas vai definir o formato definitivo (série, numeração, ambiente).
- `Product` e `ServiceItem` seguem o mesmo padrão de `Client`: `officeId` + `companyId` denormalizados, `code` único por empresa (`@@unique([companyId, code])`). `Product.aliquotas` é `Json?` pela mesma razão de `fiscalSettings` — o conjunto de impostos relevante varia por regime tributário.
- `Invoice` também carrega `officeId` + `companyId` denormalizados. `providerName` registra qual `InvoiceProvider` (Adapter) emitiu — hoje só `"mock"` existe, mas o campo já está pronto para quando houver mais de um.
- `InvoiceItem.description`/`valorUnitario` são um **snapshot** do Produto/Serviço no momento da emissão — não acompanham alterações futuras do cadastro. Cada item referencia exatamente um entre `productId`/`serviceItemId` (regra validada em `InvoicesService`, não no schema — `class-validator` com `@IsOptional()` nos dois campos não expressa XOR de forma confiável).
- O módulo de Auditoria completo (cobrindo toda ação do sistema, não só auth) segue como escopo de sprint futura.
