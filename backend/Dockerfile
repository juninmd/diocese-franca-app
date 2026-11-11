# API REST da Diocese de Franca (Express 5, TypeScript). Os dados vêm de backend/data (gerados pelo scraper).

# 1) Compila src/ -> dist/ com todas as dependências (inclui typescript).
FROM node:22-alpine AS build
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
# --ignore-scripts: o build só precisa do tsc; evita falha do pnpm com scripts de build ignorados (esbuild etc.).
RUN pnpm install --frozen-lockfile --ignore-scripts
COPY tsconfig.json ./
COPY src ./src
RUN pnpm build

# 2) Só as dependências de produção.
FROM node:22-alpine AS deps
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

# 3) Imagem final: node_modules de produção + dist + data.
FROM node:22-alpine
ENV NODE_ENV=production PORT=3000
WORKDIR /app
COPY --from=deps --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node package.json ./
COPY --from=build --chown=node:node /app/dist ./dist
COPY --chown=node:node data ./data
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s CMD wget -qO- http://127.0.0.1:3000/api/health >/dev/null || exit 1
CMD ["node", "dist/index.js"]
