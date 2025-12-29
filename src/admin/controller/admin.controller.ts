import {Hono} from "hono";
import {requireRole, requireSession} from "../middleware/admin.middleware";
import {listUsers} from "../service/list-users.service";
import {createUser} from "../service/create-user.service";
import {listRoles, listRolesWithPermissions} from "../service/list-roles.service";
import {updateUser} from "../service/update-user.service";
import {createRole} from "../service/create-role.service";
import {updateRole} from "../service/update-role.service";
import {deleteRole} from "../service/delete-role.service";
import {listPermissions} from "../service/list-permissions.service";
import {createPermission} from "../service/create-permission.service";
import {updatePermission} from "../service/update-permission.service";
import {deletePermission} from "../service/delete-permission.service";
import {sValidator} from "@hono/standard-validator";
import {userCreationDtoSchema, userUpdateDtoSchema} from "../dto/user-creation.dto.ts";
import {roleCreationDtoSchema} from "../dto/role-creation.dto.ts";
import {permissionCreationDtoSchema} from "../dto/permission-creation.dto.ts";
import * as v from "valibot";

const adminController = new Hono();

adminController.use("*", requireSession);
adminController.use("*", requireRole("admin"));

adminController.get("/user", listUsers);
adminController.post("/user",
  sValidator("json", userCreationDtoSchema),
  createUser);
adminController.put("/user/:userId",
  sValidator("json", userUpdateDtoSchema),
  updateUser);

adminController.get("/role", listRoles);
adminController.get("/role/permissions", listRolesWithPermissions);
adminController.post("/role",
  sValidator("json", roleCreationDtoSchema),
  createRole);
adminController.put("/role/:roleId",
  sValidator("param", v.object({roleId: v.pipe(v.string(), v.toNumber())})),
  sValidator("json", roleCreationDtoSchema),
  updateRole);
adminController.delete("/role/:roleId", deleteRole);

adminController.get("/permission", listPermissions);
adminController.post("/permission",
  sValidator("json", permissionCreationDtoSchema),
  createPermission);
adminController.put("/permission/:permissionId",
  sValidator("param", v.object({permissionId: v.pipe(v.string(), v.toNumber())})),
  sValidator("json", permissionCreationDtoSchema),
  updatePermission);
adminController.delete("/permission/:permissionId", deletePermission);

export default adminController;