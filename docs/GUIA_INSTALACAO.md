# Guia de Instalação

## Pré-requisitos

- Docker + Docker Compose (ou `docker-compose` standalone)
- Node.js 20 LTS (apenas para rodar testes/seed localmente fora do container)

## Subindo tudo via Docker Compose (recomendado)

```bash
cd fiscalflow
cp .env.example .env
```

Edite o `.env` e defina `JWT_ACCESS_SECRET` e `JWT_REFRESH_SECRET` com valores fortes (nunca use os padrões em produção). Se as portas padrão (5432, 6379, 3000, 3001, 8080) já estiverem em uso na sua máquina, ajuste `POSTGRES_PORT`, `REDIS_PORT`, `FRONTEND_PORT`, `BACKEND_PORT` e `NGINX_PORT` no `.env`.

```bash
docker compose up -d --build
```

As migrations do Prisma são aplicadas automaticamente pelo `docker-entrypoint.sh` do backend antes de subir a API.

Acesse:

- App: `http://localhost:8080` (ou a porta definida em `NGINX_PORT`)
- Swagger: `http://localhost:8080/api/docs`

## Populando dados de teste (seed)

O seed usa `ts-node`, que não existe na imagem de produção (dependência de dev removida). Rode a partir da máquina host, apontando para o Postgres publicado pelo compose:

```bash
cd backend
cp .env.example .env
# ajuste DATABASE_URL para usar localhost e a porta publicada (ex.: POSTGRES_PORT do .env raiz)
npm install
npm run prisma:seed
```

Login criado: `admin@fiscalflow.dev` / `Admin@123`.

## Rodando sem Docker (desenvolvimento)

### Backend

```bash
cd backend
cp .env.example .env   # aponte DATABASE_URL/REDIS_HOST para instâncias locais ou via `docker compose up -d postgres redis`
npm install
npm run prisma:migrate
npm run start:dev
```

### Frontend

```bash
cd frontend
cp .env.example .env.local   # BACKEND_URL=http://localhost:3001/api
npm install
npm run dev
```

## Rodando os testes do backend

```bash
cd backend
npm test              # unitários
npm run test:cov      # unitários com cobertura
```

Para os testes e2e (`test:e2e`), é necessário um Postgres e um Redis acessíveis — configure `backend/.env.test` com as credenciais (veja `.env.example` como referência) e rode:

```bash
npm run test:e2e
```

## Parando os serviços

```bash
docker compose down          # mantém os volumes (dados do Postgres/Redis)
docker compose down -v       # remove também os volumes
```
