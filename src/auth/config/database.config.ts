import {drizzleAdapter} from "better-auth/adapters/drizzle";
import {db} from "../../db/db";
import * as schema from "../../db/schema/auth-schema";
import type {BetterAuthOptions} from "better-auth";

export const databaseConfig: BetterAuthOptions["database"] = drizzleAdapter(db, {
  provider: "pg",
  schema
});