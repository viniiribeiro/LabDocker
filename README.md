# CRM básico

Aplicação web de CRM com cadastro/login de usuários e gestão de clientes.

- **Frontend:** React + TypeScript + Vite (`frontend/`)
- **Backend:** Python + FastAPI + SQLAlchemy (`backend/`)
- **Banco:** PostgreSQL

## Funcionalidades
- Cadastro e login de usuários (JWT)
- CRUD de clientes (nome, e-mail, telefone, empresa, status, observações)
- Busca por nome/e-mail/empresa e filtro por status
- Dashboard com contagem por status (lead, prospect, cliente, inativo)
- Cada usuário enxerga apenas os seus clientes

## Configuração (variáveis de ambiente)

**Backend** (`backend/.env`, veja `.env.example`):

| Variável | Padrão |
|---|---|
| `DATABASE_URL` | `postgresql+psycopg://crm:crm@localhost:5432/crm` |
| `SECRET_KEY` | `dev-secret-change-me` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `60` |
| `CORS_ORIGINS` | `http://localhost:5173` (separar por vírgula) |

**Frontend** (`frontend/.env`): `VITE_API_URL` (padrão `http://localhost:8000`). É lida em build/dev.

As tabelas são criadas automaticamente na subida da API (com tentativas de reconexão
caso o Postgres ainda esteja iniciando).

## Rodar localmente

Banco: tenha um Postgres com o banco/usuário `crm` (ou ajuste `DATABASE_URL`).

```bash
# backend (porta 8000, docs em /docs)
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload

# frontend (porta 5173)
cd frontend
npm install
cp .env.example .env
npm run dev
```

## Endpoints principais
| Método | Rota | Descrição |
|---|---|---|
| GET | `/health` | healthcheck |
| POST | `/auth/register` | cadastro de usuário |
| POST | `/auth/login` | login (form `username`=e-mail, `password`) → token |
| GET | `/users/me` | usuário logado |
| GET | `/clients?q=&status=` | listar clientes |
| POST | `/clients` | criar |
| GET/PUT/DELETE | `/clients/{id}` | detalhar / editar / excluir |
| GET | `/clients/stats` | contagem por status |
