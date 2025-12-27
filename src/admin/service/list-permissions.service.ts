import type {Context} from "hono";
import {db} from "../../db/db";
import {permission} from "../../db/schema/rbac-schema";

export const listPermissions = async (c: Context) => {
  const permissions = await db
    .select()
    .from(permission);

  return c.json(permissions, 200);
}