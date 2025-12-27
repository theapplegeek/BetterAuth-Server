generate-db-schema:
    bun x @better-auth/cli generate --output ./src/db/schema/auth-schema.ts

generate-db-migration name:
    bun x drizzle-kit generate --name={{name}}

db-migrate:
    bun x drizzle-kit migrate

db-check:
    bun x drizzle-kit check