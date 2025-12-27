import type { Context } from "hono";
import { db } from "../../db/db";
import type { PermissionDto } from "../dto/permission.dto";
import { permission } from "../../db/schema/rbac-schema";
import { eq } from "drizzle-orm";

export const deletePermission = async (c: Context) => {
  const permissionId: number = Number(c.req.param("permissionId"));

  const permissions: PermissionDto[] =
    await db
      .select()
      .from(permission)
      .where(eq(permission.id, permissionId));

  if (permissions.length === 0) {
    return c.json({ message: "Permission not found." }, 404);
  }

  await db
    .delete(permission)
    .where(eq(permission.id, permissionId));

  return c.json({}, 200);
}