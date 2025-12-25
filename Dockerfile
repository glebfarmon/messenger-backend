FROM node:20.19.6-alpine3.22 AS build

RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@10.13.1 --activate

WORKDIR /app

ENV PRISMA_SKIP_POSTINSTALL_GENERATE=1
ENV HUSKY=0

COPY package*.json pnpm-lock.yaml* ./
COPY prisma ./prisma

RUN pnpm i --ignore-scripts --frozen-lockfile
RUN pnpm prisma generate

COPY . .
RUN pnpm run build
RUN pnpm prune --prod --ignore-scripts

FROM node:20.19.6-alpine3.22 AS production

RUN apk add --no-cache libc6-compat

WORKDIR /app

#COPY docker-entrypoint.sh /usr/local/bin/
#RUN chmod +x /usr/local/bin/docker-entrypoint.sh

COPY --from=build /app/dist/prisma.config.js ./
COPY --from=build /app/dist/prisma.config.d.ts ./
COPY --from=build /app/dist/prisma.config.js.map ./

COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
#COPY --from=build /app/prisma ./prisma
COPY --from=build /app/dist/prisma ./prisma
COPY --from=build /app/package*.json ./
COPY --from=build /app/emails ./emails

ENV NODE_ENV=production
EXPOSE 3200

#ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "dist/src/main.js"]