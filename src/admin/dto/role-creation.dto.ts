import * as v from 'valibot';

export interface RoleCreationDto {
  name: string;
  description?: string;
  permissionIds?: number[];
}

export const roleCreationDtoSchema = v.object({
  name: v.pipe(v.string(), v.trim()),
  description: v.optional(v.pipe(v.string(), v.trim())),
  permissionIds: v.optional(v.array(v.number()), []),
});