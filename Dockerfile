FROM node:20.19.6-alpine3.22 AS build

RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@10.13.1 --activate

WORKDIR /app

COPY package*.json .

RUN pnpm i --ignore-scripts

COPY . .

RUN pnpm prisma generate
RUN pnpm run build

FROM node:20.19.6-alpine3.22 AS production

RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@10.13.1 --activate

WORKDIR /app

COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/package*.json ./

RUN pnpm i --prod --ignore-scripts

ENV NODE_ENV=production

CMD [ "node", "dist/main.js" ]

EXPOSE 3200