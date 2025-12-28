FROM oven/bun:1.3.5-alpine AS builder
WORKDIR /app
COPY package.json .
COPY bun.lock .
RUN bun install --production
COPY . .
RUN bun run build

FROM oven/bun:1.3.5-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/node_modules /app/migration/node_modules
COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/drizzle /app/migration/drizzle
COPY --from=builder /app/src/db /app/migration/src/db
COPY --from=builder /app/drizzle.config.ts /app/migration/drizzle.config.ts
COPY --from=builder /app/run.sh /app/run.sh
EXPOSE 3000
CMD ["sh", "./run.sh"]