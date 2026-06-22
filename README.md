# app-agendamento

Sistema de agendamento para **manicures / nail designers**. Substitui a planilha de
agendamentos por uma interface moderna, rápida e simples.

Monorepo com dois apps independentes:

| Pasta       | App        | Stack                                                          |
| ----------- | ---------- | -------------------------------------------------------------- |
| [`client/`](client) | Frontend   | Vue 3 · TypeScript · Vite · Tailwind CSS · Pinia · Vue Router · Axios |
| [`server/`](server) | Backend/API | NestJS · TypeScript · Sequelize (`sequelize-typescript`) · PostgreSQL |

```
Vue 3 (browser)  ──HTTP──▶  NestJS REST API  ──Sequelize──▶  PostgreSQL
```

---

## Sumário

- [Início rápido (Docker)](#início-rápido-docker)
- [Início rápido (local, sem Docker)](#início-rápido-local-sem-docker)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Scripts](#scripts)
- [API](#api)
- [Modelo de dados](#modelo-de-dados)
- [Autenticação](#autenticação)
- [Estrutura de pastas](#estrutura-de-pastas)
- [Deploy (Render)](#deploy-render)
- [Segurança](#segurança)

---

## Início rápido (Docker)

Uma **única imagem** roda tudo: o NestJS serve o front (Vue) e a API na mesma
porta. O banco vem por **variáveis de ambiente** (Postgres externo — sua máquina
ou um gerenciado). Veja o [`Dockerfile`](Dockerfile).

Com `docker compose` (lê o `server/.env` e aponta para o Postgres da sua máquina):

```bash
docker compose up --build
```

Ou gerando/rodando a imagem na mão (rode na **raiz** do projeto):

```bash
docker build -t app-agendamento .   # ← o ponto final é obrigatório (contexto = pasta atual)

# DB_HOST=localhost dentro do container = o próprio container; para acessar o
# Postgres da sua máquina, aponte para o host:
docker run -p 3000:3000 --env-file ./server/.env \
  -e DB_HOST=host.docker.internal app-agendamento
```

- Abra <http://localhost:3000> → **a tela** · a API fica em `/api`
- Login: senha = `AUTH_SENHA` (no `server/.env`)

> Para usar um Postgres **em container** também (sem depender do seu local),
> dá pra adicionar um serviço `db` no compose. Para conectar no Postgres do
> Windows, ele precisa aceitar conexões externas (`listen_addresses='*'` +
> `pg_hba.conf`).

---

## Início rápido (local, sem Docker)

**Pré-requisitos:** Node.js 20+, Yarn e um PostgreSQL rodando.

### 1. Backend (API)

```bash
cd server
cp .env.example .env      # ajuste as credenciais do seu PostgreSQL
yarn install
yarn dev                  # API em http://localhost:3000/api
```

Ao subir, a API tenta **criar o banco** (se não existir) e **sincroniza as tabelas**
sozinha (`DB_SYNC=true`). Você verá no log:

```
[Bootstrap] Banco "app_agendamento" encontrado.
[Bootstrap] ✅ Banco conectado: PostgreSQL em localhost:5432/app_agendamento
[Bootstrap] 🚀 API rodando na porta 3000 (acessível pela rede em /api)
```

> Se o seu PostgreSQL não permitir criar bancos, crie o banco manualmente
> (com o nome de `DB_DATABASE`) e suba de novo — as tabelas são criadas pela app.

(Opcional) popular serviços de exemplo: `yarn db:seed`.

### 2. Frontend

```bash
cd client
yarn install
yarn serve                # app em http://localhost:5173
```

> Não há `.env` no client: o Vite lê o **mesmo** `server/.env` (via `envDir`).
> O front chama `/api` e, em dev, o Vite faz proxy para a API na porta 3000 —
> funciona em localhost e pelo IP da rede (ex.: celular em `http://192.168.x.x:5173`).

---

## Variáveis de ambiente

Tudo num **único arquivo**: `server/.env` (a API e o front leem dele). Veja
[`server/.env.example`](server/.env.example).

| Variável        | Obrigatória | Padrão               | Descrição                                                    |
| --------------- | :---------: | -------------------- | ------------------------------------------------------------ |
| `NODE_ENV`      |     não     | `development`        | `development` \| `production` \| `test`                      |
| `PORT`          |     não     | `3000`               | Porta da API                                                 |
| `CORS_ORIGIN`   |   **sim**   | —                    | Origem do front liberada no CORS (localhost/LAN já liberados)|
| `DB_HOST`       |   **sim**   | —                    | Host do PostgreSQL                                           |
| `DB_PORT`       |     não     | `5432`               | Porta do PostgreSQL                                          |
| `DB_USERNAME`   |   **sim**   | —                    | Usuário do banco                                             |
| `DB_PASSWORD`   |   **sim**   | —                    | Senha do banco                                               |
| `DB_DATABASE`   |   **sim**   | —                    | Nome do banco                                                |
| `DB_TIMEZONE`   |     não     | `America/Porto_Velho`| Fuso usado pelo Sequelize                                    |
| `DB_SSL`        |     não     | `false`              | `true` para conexões SSL (cloud)                             |
| `DB_SYNC`       |     não     | `true`               | Cria/atualiza tabelas a partir dos models. **`false` em prod** |
| `JWT_SECRET`    |   **sim**   | —                    | Segredo do JWT (mín. 32 caracteres)                          |
| `JWT_EXPIRES_IN`|     não     | `1d`                 | Validade do token                                            |
| `AUTH_SENHA`    |   **sim**   | —                    | Senha única de acesso (mín. 6). O login pede só a senha.     |
| `SELF_PING_URL` |     não     | —                    | URL pública p/ keep-alive (auto-ping em `/api/health`). No Render usa a `RENDER_EXTERNAL_URL`. |
| `VITE_API_URL`  |     não     | `/api`               | **Front.** Vazio = `/api` na mesma origem (dev via proxy do Vite). Só preencha se o front estiver em outro domínio. |

> A API valida as variáveis na inicialização (fail-fast): se faltar uma obrigatória
> ou o `JWT_SECRET` for curto, ela não sobe.
>
> ⚠️ `VITE_*` são embutidas no bundle público — **nunca** coloque segredos com esse prefixo.

---

## Scripts

### Server (`cd server`)

| Comando              | O que faz                                  |
| -------------------- | ------------------------------------------ |
| `yarn dev`           | API em modo watch                          |
| `yarn build`         | Compila para `dist/`                       |
| `yarn start:prod`    | Roda o build (`node dist/main.js`)         |
| `yarn db:migrate`    | Executa as migrations                      |
| `yarn db:seed`       | Executa os seeders (serviços de exemplo)   |
| `yarn db:migrate:undo` | Desfaz a última migration                |

### Client (`cd client`)

| Comando        | O que faz                          |
| -------------- | ---------------------------------- |
| `yarn serve`   | Dev server (Vite) em `:5173`       |
| `yarn build`   | Type-check + build para `dist/`    |
| `yarn preview` | Pré-visualiza o build              |

---

## API

Base: `/api` · Tudo exige `Authorization: Bearer <token>`, **exceto** o login.

| Método | Rota                         | Descrição                                            |
| ------ | ---------------------------- | ---------------------------------------------------- |
| GET    | `/api/health`                | Health check (público) → `{ status, uptime_s, timestamp }` |
| POST   | `/api/auth/login`            | Login (body `{ "senha": "..." }`) → `{ access_token }` |
| GET    | `/api/auth/me`               | Dados da sessão                                      |
| GET    | `/api/cliente?busca=`        | Lista clientes (busca por nome/telefone)             |
| POST   | `/api/cliente`               | Cria cliente                                         |
| GET    | `/api/cliente/:id`           | Detalha cliente                                      |
| PATCH  | `/api/cliente/:id`           | Atualiza cliente                                     |
| DELETE | `/api/cliente/:id`           | Remove (soft delete)                                 |
| GET    | `/api/servico`               | Lista serviços                                       |
| POST   | `/api/servico`               | Cria serviço                                         |
| PATCH  | `/api/servico/:id`           | Atualiza serviço                                     |
| DELETE | `/api/servico/:id`           | Remove (soft delete)                                 |
| GET    | `/api/agendamento?data=`     | Agenda de um dia (`AAAA-MM-DD`)                      |
| GET    | `/api/agendamento?inicio=&fim=` | Agenda de um intervalo (semana/mês)               |
| GET    | `/api/agendamento/resumo?data=` | Resumo do dia (dashboard)                          |
| POST   | `/api/agendamento`           | Cria agendamento                                     |
| POST   | `/api/agendamento/:id/concluir` | Conclui e registra avaliação (`{ avaliacao: 1–5, observacao? }`) |
| PATCH  | `/api/agendamento/:id`       | Atualiza (status, pago, horário...)                  |
| DELETE | `/api/agendamento/:id`       | Remove (soft delete)                                 |

**Exemplo de login:**

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"senha":"123456"}'
```

---

## Modelo de dados

- **cliente** — `nome` (obrigatório), `telefone`, `instagram`, `observacao`
- **servico** — `nome` (obrigatório), `descricao`, `duracao_minuto`, `valor`
- **agendamento** — `cliente_id`, `servico_id`, `data`, `hora_inicio`, `hora_fim`,
  `valor`, `observacao`, `status` (`AGENDADO` · `CONCLUIDO` · `CANCELADO` · `FALTOU`), `pago`
- **avaliacao_atendimento** — `agendamento_id`, `avaliacao` (1–5), `observacao` (≤250).
  Registrada ao concluir; a média por cliente vira a "nota geral" dele.

Convenções: tabelas/colunas no **singular**; PK `id INT`; campos
`created_at` / `updated_at` / `deleted_at`; **soft delete** (paranoid do Sequelize).
Relações: `cliente 1—N agendamento` e `servico 1—N agendamento`.

Regras de negócio:

- O `valor` do serviço é **copiado** para o agendamento na criação (snapshot
  histórico — alterar o preço do serviço não muda atendimentos passados).
- Agendamentos **não podem se sobrepor** no mesmo dia (validação de conflito).
- Agendamento com horário **no passado** entra como **retroativo** (`CONCLUIDO`)
  e não conta como "próximo atendimento".

---

## Autenticação

Acesso de **uma única pessoa** (a profissional). Não há tabela de usuários: a senha
fica só em `AUTH_SENHA` (no `.env`). O login devolve um **JWT**; o front guarda o
token e o envia em toda requisição. A senha é comparada em tempo constante.

---

## Estrutura de pastas

```
app-agendamento/
├── client/                 # Frontend Vue 3
│   ├── src/
│   │   ├── components/      # base/ (UI), forms/, layout/
│   │   ├── composables/     # useToast, useConfirm
│   │   ├── services/        # axios + chamadas à API
│   │   ├── stores/          # Pinia (auth)
│   │   ├── views/           # Login, Dashboard, Agenda, Cliente, Servico
│   │   └── utils/           # formatação de data/hora/moeda
│   └── (buildado e servido pela API no container)
├── server/                 # API NestJS (também serve o front buildado)
│   └── src/
│       ├── config/          # validação das envs (Joi)
│       ├── database/        # models, migrations, seeders
│       ├── modules/         # auth, cliente, servico, agendamento, health
│       └── main.ts          # bootstrap (cria banco + sync + serve front)
├── Dockerfile               # imagem única: build do front + API
└── docker-compose.yml       # sobe a imagem única (banco vem por env)
```

---

## Deploy (Render)

Um **único Web Service (Docker)** serve front + API:

- Root Directory: a **raiz** do projeto · Dockerfile: [`Dockerfile`](Dockerfile)
- Não precisa configurar start command — o `Dockerfile` já tem o `CMD`
  (`node dist/main.js`). Com `DB_SYNC=true` as tabelas são criadas no boot.
- Variáveis: configure as da tabela acima. Aponte `DB_*` para o **PostgreSQL do
  Render** (não `localhost`) e use `DB_SSL=true`. `VITE_API_URL` pode ficar vazio
  (front e API na mesma origem). `CORS_ORIGIN` é irrelevante nesse modo, mas
  mantenha um valor válido (ex.: a própria URL do serviço).

> Em Postgres gerenciado o banco já vem criado e o acesso ao banco `postgres` é
> bloqueado — a app detecta isso, apenas avisa no log e segue usando `DB_DATABASE`.

**Evitar hibernação (free tier):** a API faz **auto-ping** em `/api/health` a cada
5 minutos para não dormir por inatividade. No Render isso liga sozinho (ele injeta
`RENDER_EXTERNAL_URL`); em outros provedores, defina `SELF_PING_URL` com a URL
pública da API. Sem URL pública, o keep-alive fica desligado (ex.: local).

---

## Segurança

Repositório **público** — cuidados aplicados:

- Segredos só em `.env` (ignorado pelo git); versionamos apenas os `.env.example`.
- **JWT** + senha comparada em tempo constante; validação das envs na subida.
- **helmet**, **CORS** restrito (origem do front + localhost/LAN) e **rate limit**
  (login limitado para mitigar brute-force).
- Toda entrada é validada/sanitizada (`class-validator`, whitelist).

> Em produção: use um `JWT_SECRET` forte e único, `AUTH_SENHA` robusta,
> `DB_SYNC=false` (prefira migrations) e `DB_SSL=true`.
