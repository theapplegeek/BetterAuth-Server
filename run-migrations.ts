import pg from "pg";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { drizzle } from "drizzle-orm/node-postgres";

const LOCK_ID = 38585733;

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  console.log("Connecting to database...");
  await client.connect();

  console.log(`Acquiring advisory lock (${LOCK_ID})...`);
  await client.query("SELECT pg_advisory_lock($1)", [LOCK_ID]);
  console.log("Advisory lock acquired");

  try {
    const db = drizzle(client);

    console.log("Running migrations...");
    await migrate(db, {
      migrationsFolder: "./drizzle",
    });
    console.log("Migrations completed");
  } finally {
    console.log("Releasing advisory lock...");
    await client.query("SELECT pg_advisory_unlock($1)", [LOCK_ID]);
    await client.end();
    console.log("Lock released");
  }
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});