import type {Context} from "hono";
import {auth} from "../../auth/auth";
import type {UserWithRole} from "better-auth/plugins";
import {db} from "../../db/db";
import {permission, role, rolePermission, userRole} from "../../db/schema/rbac-schema";
import {eq, inArray} from "drizzle-orm";
import type {RoleDto} from "../dto/role.dto";
import type {PermissionDto} from "../dto/permission.dto";

export const listUsers = async (c: Context) => {
  const query: Record<string, string> = c.req.query();

  let result: {
    users: UserWithRole[]
    total: number
    limit: number | undefined
    offset: number | undefined
  } | {
    users: never[]
    total: number
  } = await auth.api.listUsers({
    query: query,
    headers: c.req.header()
  });

  const userIds: string[] = result.users.map((u: UserWithRole): string => u.id);
  const authorities = await getAuthoritiesByUserIds(userIds);

  const usersWithRolesAndPermissions = result.users.map(user => ({
    ...user,
    roles: authorities[user.id]?.roles ?? [],
    permissions: authorities[user.id]?.permissions ?? [],
  }));

  return c.json({
    ...result,
    users: usersWithRolesAndPermissions,
  });
}

export const getAuthoritiesByUserIds = async (userIds: string[]) => {
  const [roles, permissions] = await Promise.all([
    getRolesByUserIds(userIds),
    getPermissionsByUserIds(userIds),
  ]);

  return userIds.reduce<Record<string, {
    roles: RoleDto[];
    permissions: PermissionDto[];
  }>>((acc, userId) => {
    acc[userId] = {
      roles: roles[userId] ?? [],
      permissions: permissions[userId] ?? [],
    };
    return acc;
  }, {});
}

const getRolesByUserIds = async (userIds: string[]): Promise<Record<string, RoleDto[]>> => {
  if (userIds.length === 0) return {};

  const rows: { userId: string, role: RoleDto }[] = await db
    .select({
      userId: userRole.userId,
      role: role
    })
    .from(userRole)
    .innerJoin(role, eq(userRole.roleId, role.id))
    .where(inArray(userRole.userId, userIds));

  return rows.reduce<Record<string, RoleDto[]>>((acc, row) => {
    const key: string = row.userId;

    if (!acc[key]) acc[key] = [];

    acc[key].push(row.role);

    return acc;
  }, {});
}

const getPermissionsByUserIds = async (userIds: string[]) => {
  if (userIds.length === 0) return {};

  const rows: { userId: string, permission: PermissionDto }[] = await db
    .select({
      userId: userRole.userId,
      permission: permission
    })
    .from(userRole)
    .innerJoin(role, eq(userRole.roleId, role.id))
    .innerJoin(rolePermission, eq(rolePermission.roleId, role.id))
    .innerJoin(permission, eq(rolePermission.permissionId, permission.id))
    .where(inArray(userRole.userId, userIds));

  // group + deduplicate
  return rows.reduce<Record<string, PermissionDto[]>>((acc, row) => {
    const key: string = row.userId;
    if (!acc[key]) acc[key] = [];

    // deduplicate
    if (!acc[key].some(p => p.id === row.permission.id)) {
      acc[key].push(row.permission);
    }

    return acc;
  }, {});
}
