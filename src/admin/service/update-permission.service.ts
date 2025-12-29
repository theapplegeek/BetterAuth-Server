import { db } from "../../db/db";
import type { permissionCreationDto } from "../dto/permission-creation.dto";
import type { Context } from "hono";
import { eq } from "drizzle-orm";
import { permission } from "../../db/schema/rbac-schema";
import type { PermissionDto } from "../dto/permission.dto";

export const updatePermission = async (c: Context) => {
  const body: permissionCreationDto = await c.req.json();
  const permissionId: number = Number(c.req.param("permissionId"));

  const permissionToUpdate =
    await db
      .select()
      .from(permission)
      .where(eq(permission.id, permissionId))
      .limit(1);

  if (!permissionToUpdate || permissionToUpdate.length === 0) {
    return c.json({ message: "Permission not found." }, 404);
  }

  const data = {
    code: body.code ?? permissionToUpdate[0]!.code,
    name: body.name ?? permissionToUpdate[0]!.name,
    description: body.description ?? permissionToUpdate[0]!.description
  }

  let result: PermissionDto[] = [];
  try {
    result =
      await db
        .update(permission)
        .set(data)
        .where(eq(permission.id, permissionId))
        .returning();

    if (!result || result.length === 0) {
      return c.json({ message: "Error updating permission" }, 500);
    }

  } catch (error) {
    return c.json({ message: "Error updating permission" }, 500);
  }

  return c.json({ id: result[0]!.id }, 200);
}