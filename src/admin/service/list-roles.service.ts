import {db} from "../../db/db";
import {permission, role, rolePermission} from "../../db/schema/rbac-schema";
import type {RoleDto} from "../dto/role.dto";
import {eq} from "drizzle-orm";
import type {Context} from "hono";

export const listRoles = async (c: Context) => {
  const roles: RoleDto[] = await db
    .select()
    .from(role);

  return c.json(roles, 200);
}

export const listRolesWithPermissions = async (c: Context) => {
  const roles: RoleDto[] = await db
    .select()
    .from(role)

  for (let role of roles) {
    (role as RoleDto).permissions = await db
      .select({
        id: permission.id,
        code: permission.code,
        name: permission.name,
        description: permission.description
      })
      .from(rolePermission)
      .innerJoin(permission, eq(rolePermission.permissionId, permission.id))
      .where(eq(rolePermission.roleId, role.id));
  }

  return c.json(roles, 200);
}