import type {PermissionDto} from "./permission.dto";

export interface RoleDto {
  id: number;
  name: string;
  description: string | null;
  permissions?: PermissionDto[];
}