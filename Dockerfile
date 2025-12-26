#BUILD
FROM node:22.21.1-alpine3.22 AS build

RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@10.13.1 --activate

WORKDIR /app

ENV HUSKY=0
ENV PRISMA_SKIP_POSTINSTALL_GENERATE=1

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --ignore-scripts

COPY . .

RUN pnpm prisma generate
RUN pnpm run build


#DEPS
FROM node:22.21.1-alpine3.22 AS deps

RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@10.13.1 --activate

WORKDIR /app

ENV HUSKY=0
ENV PRISMA_SKIP_POSTINSTALL_GENERATE=1

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile --ignore-scripts

COPY prisma ./prisma
RUN pnpm prisma generate

#PROD
FROM node:22.21.1-alpine3.22 AS production

RUN apk add --no-cache libc6-compat

WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/dist ./dist
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json
COPY prisma ./prisma
COPY prisma.config.ts ./prisma.config.ts
COPY emails ./emails

COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 3200

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "dist/src/main.js"]
