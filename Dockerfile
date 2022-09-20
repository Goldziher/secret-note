FROM node:18-slim as install
WORKDIR /app
RUN apt-get update  \
    && apt-get install -y openssl
COPY package.json pnpm-lock.yaml ./
COPY src src
RUN npm i -g pnpm
RUN pnpm install --frozen-lockfile

FROM install as build
WORKDIR /app
COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src src
COPY prisma prisma
RUN pnpm build

FROM node:18-slim as app
RUN apt-get update  \
    && apt-get install -y openssl  \
    && apt-get clean -y \
    && rm -rf /root/.cache \
    && rm -rf /var/apt/lists/* \
    && rm -rf /var/cache/apt/*
ARG SERVER_PORT=8000
EXPOSE ${SERVER_PORT}
ENV SERVER_PORT=${SERVER_PORT}
ENV NODE_ENV=production
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
RUN npm i -g prisma  \
    && npx prisma migrate deploy  \
    && npx uninstall -g prisma
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs
RUN chown -R nestjs:nodejs ./dist
USER nestjs
CMD ["node", "dist/main"]

