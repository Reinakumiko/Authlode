# ── Build ────────────────────────────────────────────────────────────────
FROM node:20-alpine AS build
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.4.2 --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

# ── Runtime ──────────────────────────────────────────────────────────────
FROM node:20-alpine
WORKDIR /app

COPY --from=build /app/.output/ .output/
COPY --from=build /app/node_modules/ node_modules/

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
