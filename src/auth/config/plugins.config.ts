import {admin as adminPlugin, jwt, magicLink, twoFactor} from "better-auth/plugins";
import {passkey} from "@better-auth/passkey";
import {config} from "../../config/app.config";
import {ac, admin, user} from "../permissions";
import {getAuthoritiesByUserIds} from "../../admin/service/list-users.service";
import type {RoleDto} from "../../admin/dto/role.dto";
import type {PermissionDto} from "../../admin/dto/permission.dto";

import {sendEmail} from "../../utils/email.utils.ts";

export const TwoFactorPlugin =
  twoFactor({
    issuer: "Better Auth Demo",
    totpOptions: {
      digits: 6,
    },
    backupCodeOptions: {
      amount: 10,
      length: 8
    }
  });

export const PasskeyPlugin =
  passkey({
    rpID: config.passkey.rpId,
    rpName: config.passkey.rpName,
    origin: config.auth.trustedOrigin,
  });

export const MagicLinkPlugin =
  magicLink({
    sendMagicLink: async ({email, url}: {
      email: string;
      url: string;
    }) => {
      await sendEmail(
        email,
        "Sign in to your account",
        `Click the link to sign in: ${url}`
      );
    }
  });

export const JwtPlugin =
  jwt({
    jwks: {
      jwksPath: "/.well-known/jwks.json",
      keyPairConfig: {
        alg: "RS256"
      }
    },
    jwt: {
      expirationTime: "3m",
      definePayload: async ({user}: any) => {
        const authorities = await getAuthoritiesByUserIds([user.id]);
        const roles: string[] = authorities[user.id]?.roles
          .map((role: RoleDto): string => role.name) || [];
        const permissions: string[] = authorities[user.id]?.permissions
          .map((permission: PermissionDto): string => permission.code) || [];

        return {
          ...user,
          roles: roles,
          permissions: permissions,
        }
      }
    }
  });

export const AdminPlugin =
  adminPlugin({
    defaultRole: "user",
    allowImpersonatingAdmins: true,
    ac,
    roles: {
      admin,
      user
    },
  })