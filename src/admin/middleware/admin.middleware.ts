import {auth} from "../../auth/auth";
import type {Context, Next} from "hono";

export const requireSession = async (c: Context, next: Next) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session?.user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  c.set("user", session.user);
  await next();
};

export const requireRole = (role: string) => {
  return async (c: Context, next: Next) => {
    const user: any = c.get("user");

    const roles: string = (user.role as string);

    if (!roles.includes(role)) {
      return c.json({ error: "Forbidden" }, 403);
    }

    await next();
  };
};