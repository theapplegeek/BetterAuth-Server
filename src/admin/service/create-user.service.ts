import type {Context} from "hono";
import type {UserCreationDto} from "../dto/user-creation.dto";
import {auth} from "../../auth/auth";
import type {UserWithRole} from "better-auth/plugins";
import {db} from "../../db/db";
import {role, userRole} from "../../db/schema/rbac-schema";
import {eq} from "drizzle-orm";
import {config} from "../../config/app.config";

export const createUser = async (c: Context) => {
  const body: UserCreationDto = c.req.valid("json" as never);

  if (body.roleIds) {
    for (const id of body.roleIds) {
      const result = await db
        .select()
        .from(role)
        .where(eq(role.id, id))
        .limit(1);

      if (result.length === 0) {
        return c.json({message: "Role does not exist."}, 400);
      }
    }
  }

  let result: { user: UserWithRole } | undefined;

  try {
    result = await auth.api.createUser({
      body: {
        name: body.name,
        email: body.email,
        password: body.password,
        role: body.role,
        data: {
          emailVerified: body.emailVerified,
          image: body.image,
        }
      }
    });

    await db.transaction(async (tx) => {
      await tx
        .insert(userRole)
        .values(body.roleIds.map((id: number) => {
          return {
            userId: result!.user.id,
            roleId: id
          }
        }));
    });

    if (body.emailVerified && result.user.emailVerified === false) {
      await auth.api.sendVerificationEmail({
        body: {
          email: result.user.email,
          callbackURL: `${config.auth.trustedOrigin}/auth/sign-in`
        }
      });
    }

    return c.json({userId: result.user.id}, 200);
  } catch (error: any) {
    console.error(error);

    if (error.statusCode && error.body) {
      return c.json(error.body, error.statusCode);
    }

    if (result && result.user && result.user.id) {
      await auth.api.removeUser({
        body: {
          userId: result.user.id
        },
        headers: c.req.header()
      })
    }

    return c.json({message: "Internal server error"}, 500);
  }
}