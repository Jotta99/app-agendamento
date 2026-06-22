# ============================================================
# Imagem ÚNICA: builda o front (Vue) e a API (NestJS).
# O NestJS serve o front e a API no mesmo container/porta.
# Contexto de build: a RAIZ do projeto.
# ============================================================

# ---------- Estágio 1: build do front ----------
FROM node:20-alpine AS client-build
WORKDIR /client
COPY client/package.json client/yarn.lock* ./
RUN yarn install --frozen-lockfile || yarn install
COPY client/ ./
# O front chama a API em /api (mesma origem) — VITE_API_URL fica vazio.
RUN yarn build

# ---------- Estágio 2: build da API ----------
FROM node:20-alpine AS server-build
WORKDIR /server
COPY server/package.json server/yarn.lock* ./
RUN yarn install --frozen-lockfile || yarn install
COPY server/ ./
RUN yarn build

# ---------- Estágio 3: runtime ----------
FROM node:20-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app

COPY --from=server-build /server/node_modules ./node_modules
COPY --from=server-build /server/dist ./dist
COPY --from=server-build /server/package.json ./package.json
# Necessários para migrations/seeders via sequelize-cli (opcional).
COPY --from=server-build /server/.sequelizerc ./.sequelizerc
COPY --from=server-build /server/src/database ./src/database
# Front buildado em ./client — o main.ts (Express) serve esses arquivos e faz o
# fallback de SPA (rotas fora de /api caem no index.html).
COPY --from=client-build /client/dist ./client

EXPOSE 3000
CMD ["node", "dist/main.js"]

# ============================================================
# GERAR E RODAR A IMAGEM (rode na RAIZ do projeto):
#
#   docker build -t app-agendamento .
#                                    ^ o ponto final é OBRIGATÓRIO
#                                      (contexto de build = pasta atual)
#   docker compose up --build
#
# Banco na sua máquina (host) — use host.docker.internal:
#   docker run -p 3000:3000 --env-file ./server/.env \
#     -e DB_HOST=host.docker.internal app-agendamento
#
# Depois abra http://localhost:3000  (tela + API no mesmo container).
# Com migrations em vez de DB_SYNC:
#   docker run -p 3000:3000 --env-file ./server/.env \
#     -e DB_HOST=host.docker.internal app-agendamento \
#     sh -c "yarn db:migrate && node dist/main.js"
# ============================================================
