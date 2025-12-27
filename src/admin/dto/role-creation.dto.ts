export interface RoleCreationDto {
  name: string;
  description?: string;
  permissionIds?: number[];
}