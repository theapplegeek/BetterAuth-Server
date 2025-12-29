import type { Context } from "hono";
import type { permissionCreationDto } from "../dto/permission-creation.dto";
import { eq, or } from "drizzle-orm";
import { db } from "../../db/db";
import { permission } from "../../db/schema/rbac-schema";

export const createPermission = async (c: Context) => {
  const body: permissionCreationDto = c.req.valid("json" as never);

  const permissions =
    await db
      .select()
      .from(permission)
      .where(or(
        eq(permission.code, body.code),
        eq(permission.name, body.name)
      )).limit(1);

  if (permissions.length > 0) {
    return c.json({ message: "Permission already exists." }, 400);
  }

  try {
    const result =
      await db
        .insert(permission)
        .values({
          code: body.code,
          name: body.name,
          description: body.description
        }).returning();

    if (!result || result.length === 0) {
      return c.json({ message: "Error creating permission" }, 500);
    }

    return c.json({ id: result[0]!.id }, 200);
  } catch (error) {
    return c.json({ message: "Error creating permission" }, 500);
  }
}