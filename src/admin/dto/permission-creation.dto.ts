import * as v from 'valibot';

export interface permissionCreationDto {
  code: string;
  name: string;
  description?: string;
}

export const permissionCreationDtoSchema = v.object({
  code: v.pipe(v.string(), v.trim()),
  name: v.pipe(v.string(), v.trim()),
  description: v.optional(v.pipe(v.string(), v.trim())),
});