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
COPY --from=builder /app/dist /app/dist
EXPOSE 3000
CMD ["bun", "run", "dist/index.js"]
