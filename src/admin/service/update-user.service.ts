import type {Context} from "hono";
import {auth} from "../../auth/auth";
import {db} from "../../db/db";
import {user} from "../../db/schema/auth-schema";
import {eq} from "drizzle-orm";
import type {UserWithRole} from "better-auth/plugins";
import {role, userRole} from "../../db/schema/rbac-schema";
import type {UserCreationDto} from "../dto/user-creation.dto";
import {config} from "../../config/app.config";

export const updateUser = async (c: Context) => {
  const userId: string = c.req.param("userId");
  const body: UserCreationDto = await c.req.json();

  const users = await db.select()
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  if (users.length === 0) {
    return c.json({message: "User not found."}, 404);
  }

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

  const userToUpdate: UserWithRole = (users[0] as unknown) as UserWithRole;

  const emailChanged: boolean = !!body.email && body.email !== userToUpdate.email;
  const emailVerified: boolean = body.emailVerified ?? !emailChanged;
  const data: any = {
    name: body.name ?? userToUpdate.name,
    email: body.email ?? userToUpdate.email,
    emailVerified: emailVerified,
    image: body.image ?? userToUpdate.image,
    role: body.role ?? userToUpdate.role,
  }

  try {
    const userUpdated: UserWithRole = await auth.api.adminUpdateUser({
      body: {
        userId: userId,
        data: data,
      },
      headers: c.req.header()
    });

    await db.transaction(async (tx) => {
      await tx
        .delete(userRole)
        .where(eq(userRole.userId, userId));

      if (body.roleIds) {
        await tx
          .insert(userRole)
          .values(body.roleIds!.map((id: number) => {
            return {
              userId: userId,
              roleId: id
            }
          }));
      }
    });

    if (emailChanged && !emailVerified) {
      await auth.api.sendVerificationEmail({
        body: {
          email: userUpdated.email,
          callbackURL: `${config.auth.trustedOrigin}/auth/sign-in`
        }
      });
    }

    return c.json({userId: userUpdated.id}, 200);
  } catch (error: any) {
    if (error.statusCode && error.body) {
      return c.json({message: "User update failed"}, error.statusCode);
    }

    console.error(error);
    return c.json({message: "Internal server error"}, 500);
  }
}