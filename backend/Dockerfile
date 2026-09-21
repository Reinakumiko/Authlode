# ── Build ────────────────────────────────────────────────────────────────
FROM node:20-alpine AS build
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.4.2 --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY prisma/ prisma/
RUN npx prisma generate

COPY tsconfig.json tsconfig.build.json ./
COPY src/ src/
RUN npm run build

# ── Runtime ──────────────────────────────────────────────────────────────
FROM node:20-alpine
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.4.2 --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile

COPY --from=build /app/node_modules/.prisma/ node_modules/.prisma/
COPY --from=build /app/dist/ dist/
COPY prisma/ prisma/

EXPOSE 3001

CMD ["node", "dist/main.js"]
