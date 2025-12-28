generate-db-schema:
    bunx @better-auth/cli generate --output ./src/db/schema/auth-schema.ts

generate-db-migration name:
    bunx drizzle-kit generate --name={{name}}

db-migrate:
    bunx drizzle-kit migrate

db-check:
    bunx drizzle-kit check