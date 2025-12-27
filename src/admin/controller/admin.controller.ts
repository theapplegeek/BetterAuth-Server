import { Hono } from "hono";
import { requireRole, requireSession } from "../middleware/admin.middleware";
import { listUsers } from "../service/list-users.service";
import { createUser } from "../service/create-user.service";
import { listRoles, listRolesWithPermissions } from "../service/list-roles.service";
import { updateUser } from "../service/update-user.service";
import { createRole } from "../service/create-role.service";
import { updateRole } from "../service/update-role.service";
import { deleteRole } from "../service/delete-role.service";
import { listPermissions } from "../service/list-permissions.service";
import { createPermission } from "../service/create-permission.service";
import { updatePermission } from "../service/update-permission.service";
import { deletePermission } from "../service/delete-permission.service";

const adminController = new Hono();

adminController.use("*", requireSession);
adminController.use("*", requireRole("admin"));

adminController.get("/user", listUsers);
adminController.post("/user", createUser)
adminController.put("/user/:userId", updateUser)

adminController.get("/role", listRoles);
adminController.get("/role/permissions", listRolesWithPermissions);
adminController.post("/role", createRole);
adminController.put("/role/:roleId", updateRole);
adminController.delete("/role/:roleId", deleteRole);

adminController.get("/permission", listPermissions);
adminController.post("/permission", createPermission);
adminController.put("/permission/:permissionId", updatePermission);
adminController.delete("/permission/:permissionId", deletePermission);

export default adminController;