### ================== build ==================
FROM node:22.21.1-alpine3.22 AS build

RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@10.13.1 --activate

WORKDIR /app

# отключаем лишнее
ENV HUSKY=0
ENV PRISMA_SKIP_POSTINSTALL_GENERATE=1

# кэш зависимостей
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --ignore-scripts

# исходники
COPY . .

# prisma + build
RUN pnpm prisma generate
RUN pnpm run build


### ================== deps (prod only) ==================
FROM node:22.21.1-alpine3.22 AS deps

RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@10.13.1 --activate

WORKDIR /app

ENV HUSKY=0
ENV PRISMA_SKIP_POSTINSTALL_GENERATE=1

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile --ignore-scripts


### ================== production ==================
FROM node:22.21.1-alpine3.22 AS production

RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@10.13.1 --activate

WORKDIR /app
ENV NODE_ENV=production

# runtime код
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma

# prod-зависимости
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json

# prisma client под runtime (alpine)
RUN pnpm prisma generate

EXPOSE 3200
CMD ["node", "dist/src/main.js"]
