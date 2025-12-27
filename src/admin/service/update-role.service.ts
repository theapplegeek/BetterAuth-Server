import type {RoleCreationDto} from "../dto/role-creation.dto";
import type {Context} from "hono";
import {db} from "../../db/db";
import {permission, role, rolePermission} from "../../db/schema/rbac-schema";
import {eq} from "drizzle-orm";
import type {RoleDto} from "../dto/role.dto";

export const updateRole = async (c: Context) => {
  const body: RoleCreationDto = await c.req.json();
  const roleId: number = Number(c.req.param("roleId"));

  const roleToUpdate = await db
    .select()
    .from(role)
    .where(eq(role.id, roleId));

  if (roleToUpdate.length === 0) {
    return c.json({message: "Role not found"}, 404);
  }

  for (const id of body.permissionIds || []) {
    const permissions = await db
      .select()
      .from(permission)
      .where(eq(permission.id, id))
      .limit(1);

    if (permissions.length === 0) {
      return c.json({message: "Permission does not exist."}, 400);
    }
  }

  const data = {
    name: body.name ?? roleToUpdate[0].name,
    description: body.description ?? roleToUpdate[0].description,
  }

  try {
    let roleUpdated: RoleDto[] = [];
    await db.transaction(async (tx) => {
      roleUpdated = await tx
        .update(role)
        .set(data)
        .where(eq(role.id, roleId))
        .returning();

      await tx
        .delete(rolePermission)
        .where(eq(rolePermission.roleId, roleId));

      for (const id of body.permissionIds || []) {
        await tx
          .insert(rolePermission)
          .values({
            roleId: roleId,
            permissionId: id,
          });
      }
    });

    return c.json({id: roleUpdated[0].id}, 200);
  } catch (error) {
    return c.json({message: "Error updating role"}, 500);
  }
}