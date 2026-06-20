# app-agendamento

Sistema de agendamento para manicures / nail designers. Substitui a planilha de
agendamentos por uma interface moderna, simples e rápida.

> MVP focado em produtividade: cadastrar clientes e serviços, agendar
> atendimentos, visualizar a agenda do dia e acompanhar/atualizar atendimentos.

## Estrutura

```
app-agendamento/
├── client/   # Frontend — Vue 3 + TypeScript + Tailwind + Pinia + Vue Router + Axios
└── server/   # Backend  — NestJS + TypeScript + Sequelize + PostgreSQL
```

## Tecnologias

**Frontend:** Vue 3, TypeScript, Tailwind CSS, Vue Router, Pinia, Axios
**Backend:** NestJS, TypeScript, Sequelize (`sequelize-typescript`), PostgreSQL

## Modelo de dados

- `cliente` — nome (obrigatório), telefone, instagram, observacao
- `servico` — nome (obrigatório), descricao, duracao_minuto, valor (obrigatório)
- `agendamento` — cliente_id, servico_id, data, hora_inicio, hora_fim, valor,
  observacao, status (`AGENDADO` | `CONCLUIDO` | `CANCELADO` | `FALTOU`), pago

Todas as tabelas usam nomes no singular, chave primária `id INT`, os campos
`created_at` / `updated_at` / `deleted_at`, e **Soft Delete** (recurso *paranoid*
do Sequelize). O `valor` do serviço é copiado para o agendamento na criação —
alterações futuras de preço não afetam atendimentos antigos.

## Segurança

Este repositório é **público**. Cuidados aplicados:

- Segredos ficam **apenas** em `.env` (ignorado pelo git). Versionamos só os
  `.env.example`. **Nunca** comite um `.env` real.
- No frontend, apenas variáveis `VITE_*` públicas (a URL da API). Nada sensível.
- Autenticação via **JWT**. Como o acesso é de **uma única pessoa** (a manicure),
  o login é definido apenas no `.env` (`AUTH_EMAIL` / `AUTH_SENHA`) — não há
  tabela de usuários. A senha é comparada em tempo constante (timing-safe).
- Validação e sanitização de toda entrada (`class-validator`, `whitelist`).
- `helmet`, **CORS** restrito à origem do frontend e **rate limiting**
  (login limitado para mitigar brute-force).
- Validação das variáveis de ambiente na inicialização (fail-fast).

## Como rodar

### Pré-requisitos
- Node.js 20+
- PostgreSQL rodando localmente

### 1. Backend

```bash
cd server
cp .env.example .env      # edite com as credenciais do seu PostgreSQL
yarn install
# crie o banco indicado em DB_DATABASE no seu PostgreSQL, depois:
yarn db:migrate           # cria as tabelas
yarn db:seed              # (opcional) cria serviços de exemplo
yarn dev                  # API em http://localhost:3000/api
```

### 2. Frontend

```bash
cd client
cp .env.example .env
yarn install
yarn serve                # app em http://localhost:5173
```

### Acesso

Faça login com o e-mail e a senha definidos em `AUTH_EMAIL` / `AUTH_SENHA` no
`server/.env`. Para trocar a senha, basta editar o `.env` e reiniciar a API.

## Páginas

- **Dashboard** — resumo do dia (atendimentos, horários livres, receita
  prevista, próximo atendimento e lista do dia).
- **Agenda** — visualização diária com navegação entre datas; horários livres
  clicáveis abrem o formulário de novo agendamento.
- **Clientes** — busca, listagem e cadastro/edição.
- **Serviços** — listagem e cadastro/edição.

## Scripts úteis (server)

| Script | Descrição |
| --- | --- |
| `yarn dev` | API em modo watch |
| `yarn build` | Compila para `dist/` |
| `yarn db:migrate` | Executa as migrations |
| `yarn db:seed` | Executa os seeders |
| `yarn db:migrate:undo` | Desfaz a última migration |
