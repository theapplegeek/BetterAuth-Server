import type {Context} from "hono";
import {db} from "../../db/db";
import {role} from "../../db/schema/rbac-schema";
import {eq} from "drizzle-orm";
import type {RoleDto} from "../dto/role.dto";

export const deleteRole = async (c: Context) => {
  const roleId: number = Number(c.req.param("roleId"));

  const roles: RoleDto[] = await db
    .select()
    .from(role)
    .where(eq(role.id, roleId));

  if (roles.length === 0) {
    return c.json({error: "Role not found"}, 404);
  }

  await db
    .delete(role)
    .where(eq(role.id, roleId));

  return c.json({}, 200);
}