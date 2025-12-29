import type {RoleCreationDto} from "../dto/role-creation.dto";
import {db} from "../../db/db";
import {permission, role, rolePermission} from "../../db/schema/rbac-schema";
import {eq} from "drizzle-orm";
import type {Context} from "hono";
import type {RoleDto} from "../dto/role.dto";

export const createRole = async (c: Context) => {
  const body: RoleCreationDto = c.req.valid("json" as never);

  const roles = await db
    .select()
    .from(role)
    .where(eq(role.name, body.name))
    .limit(1);

  if (roles.length > 0) {
    return c.json({message: "Role already exists."}, 400);
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

  try {
    let result: RoleDto[] = [];
    await db.transaction(async (tx) => {
      result = await tx
        .insert(role)
        .values({
          name: body.name,
          description: body.description
        })
        .returning();

      if (!result || result.length === 0) {
        throw new Error("Role creation failed");
      }

      for (const id of body.permissionIds || []) {
        await tx
          .insert(rolePermission)
          .values({
            roleId: result[0]!.id,
            permissionId: id
          });
      }
    });

    return c.json({id: result[0]!.id}, 200);
  } catch (error) {
    return c.json({message: "Error creating role"}, 500);
  }
}