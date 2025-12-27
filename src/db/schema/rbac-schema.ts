import {index, integer, pgTable, primaryKey, serial, text, unique, varchar} from "drizzle-orm/pg-core";
import {user} from "./auth-schema";
import {relations} from "drizzle-orm";

export const role = pgTable("role",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", {length: 256}).notNull().notNull(),
    description: varchar("description", {length: 512}),
  },
  (table) => [
    unique("role_name_unique").on(table.name),
  ]
)

export const permission = pgTable("permission",
  {
    id: serial("id").primaryKey(),
    code: varchar("code", {length: 128}).notNull(),
    name: varchar("name", {length: 256}).notNull(),
    description: varchar("description", {length: 512}),
  },
  (table) => [
    unique("permission_name_unique").on(table.name),
    unique("permission_code_unique").on(table.code),
  ]
)

export const userRole = pgTable("user_role",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, {onDelete: "cascade"}),
    roleId: integer("role_id")
      .notNull()
      .references(() => role.id, {onDelete: "cascade"}),
  },
  (table) => [
    primaryKey({name: "user_role_pkey", columns: [table.userId, table.roleId]}),
    index("user_role_user_idx").on(table.userId),
    index("user_role_role_idx").on(table.roleId),
  ]
)

export const rolePermission = pgTable("role_permission",
  {
    roleId: integer("role_id")
      .notNull()
      .references(() => role.id, {onDelete: "cascade"}),
    permissionId: integer("permission_id")
      .notNull()
      .references(() => permission.id, {onDelete: "cascade"}),
  },
  (table) => [
    primaryKey({name: "role_permission_pkey", columns: [table.roleId, table.permissionId]}),
    index("role_permission_role_idx").on(table.roleId),
    index("role_permission_permission_idx").on(table.permissionId),
  ]
)

export const userRoleRelations = relations(userRole, ({one}) => ({
  user: one(user, {
    fields: [userRole.userId],
    references: [user.id]
  }),
  role: one(role, {
      fields: [userRole.roleId],
      references: [role.id]
    }
  ),
}));

export const rolePermissionRelations = relations(rolePermission, ({one}) => ({
  role: one(role, {
      fields: [rolePermission.roleId],
      references: [role.id]
    }
  ),
  permission: one(permission, {
      fields: [rolePermission.permissionId],
      references: [permission.id]
    }
  ),
}));

export const roleRelations = relations(role, ({many}) => ({
  userRoles: many(userRole),
  rolePermissions: many(rolePermission),
}));

export const permissionRelations = relations(permission, ({many}) => ({
  rolePermissions: many(rolePermission),
}));