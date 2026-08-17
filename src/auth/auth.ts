import "dotenv/config";
import {betterAuth} from "better-auth";
import {config} from "../config/app.config";
import {databaseConfig} from "./config/database.config";
import {sessionConfig} from "./config/session.config";
import {socialProvidersConfig} from "./config/social-providers.config";
import {accountConfig} from "./config/account.config";
import {userConfig} from "./config/user.config";
import {hooksConfig} from "./config/hooks.config";
import {emailAndPasswordConfig} from "./config/email-and-password.config.ts";
import {AdminPlugin, JwtPlugin, MagicLinkPlugin, PasskeyPlugin, TwoFactorPlugin} from "./config/plugins.config.ts";
import {customSession} from "better-auth/plugins";
import {getAuthoritiesByUserIds} from "../admin/service/list-users.service.ts";
import type {RoleDto} from "../admin/dto/role.dto.ts";
import type {PermissionDto} from "../admin/dto/permission.dto.ts";

export const auth = betterAuth({
  database: databaseConfig,
  trustedOrigins: [config.auth.trustedOrigin],
  appName: config.auth.appName,
  secret: config.auth.secret,
  emailAndPassword: emailAndPasswordConfig.emailAndPassword,
  emailVerification: emailAndPasswordConfig.emailVerification,
  session: sessionConfig,
  socialProviders: socialProvidersConfig,
  account: accountConfig,
  user: userConfig,
  plugins: [
    TwoFactorPlugin,
    PasskeyPlugin,
    MagicLinkPlugin,
    JwtPlugin,
    AdminPlugin,
    customSession(async ({ user, session }) => {
      const authorities = await getAuthoritiesByUserIds([user.id]);
      const roles: string[] = authorities[user.id]?.roles
        .map((role: RoleDto): string => role.name) || [];
      const permissions: string[] = authorities[user.id]?.permissions
        .map((permission: PermissionDto): string => permission.code) || [];

      return {
        user: {
          ...user,
          roles: roles,
          permissions: permissions
        },
        session
      };
    }),
  ],
  hooks: hooksConfig,
  advanced: {
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
    },
  }
});