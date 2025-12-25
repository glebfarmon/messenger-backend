FROM node:22.21.1-alpine3.22 AS build

RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@10.13.1 --activate

WORKDIR /app

ENV PRISMA_SKIP_POSTINSTALL_GENERATE=1
ENV HUSKY=0
ENV NODE_ENV=production

COPY package*.json pnpm-lock.yaml* ./

RUN pnpm i --ignore-scripts --frozen-lockfile

COPY prisma.config.ts ./
COPY prisma ./prisma/

RUN pnpm prisma generate

COPY . .

RUN pnpm run build
RUN pnpm prune --prod --ignore-scripts

FROM node:22.21.1-alpine3.22 AS production

RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@10.13.1 --activate

WORKDIR /app

COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/package*.json ./
COPY --from=build /app/.env ./.env

RUN pnpm i --prod --ignore-scripts

ENV NODE_ENV=production
EXPOSE 3200

#ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "dist/src/main.js"]