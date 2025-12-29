import * as v from 'valibot'

export interface UserCreationDto {
  name: string;
  email: string;
  emailVerified?: boolean;
  password: string;
  image?: string;
  role: "user" | "admin" | ("user" | "admin")[];
  roleIds: number[];
}

export const userCreationDtoSchema = v.object({
  name: v.pipe(v.string(), v.trim()),
  email: v.pipe(
    v.string(),
    v.trim(),
    v.email("Email is not valid"),
  ),
  emailVerified: v.optional(v.boolean(), false),
  password: v.pipe(
    v.string(),
    v.minLength(8, "Password must be at least 8 characters long"),
    v.regex(/[A-Z]/, "Password must contain at least one uppercase letter"),
    v.regex(/[a-z]/, "Password must contain at least one lowercase letter"),
    v.regex(/[0-9]/, "Password must contain at least one number"),
    v.regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
    v.trim(),
  ),
  image: v.optional(v.pipe(v.string(), v.url("Image must be a valid URL"))),
  role: v.union([
    v.literal("user"),
    v.literal("admin"),
    v.array(v.union([v.literal("user"), v.literal("admin")]))
  ], "Role is required"),
  roleIds: v.optional(v.array(v.number()), [])
})

export const userUpdateDtoSchema = v.partial(
  v.omit(userCreationDtoSchema, ["password"])
);
