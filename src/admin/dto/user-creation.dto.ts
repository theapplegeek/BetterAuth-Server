export interface UserCreationDto {
  name: string;
  email: string;
  emailVerified?: boolean;
  password: string;
  image?: string;
  role: "user" | "admin" | ("user" | "admin")[];
  roleIds: number[];
}