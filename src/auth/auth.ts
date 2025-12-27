import "dotenv/config";
import {betterAuth} from "better-auth/minimal";
import {drizzleAdapter} from "better-auth/adapters/drizzle";
import {admin as adminPlugin, jwt, magicLink, twoFactor, type UserWithRole} from "better-auth/plugins";
import {passkey} from "@better-auth/passkey";
import {db} from "../db/db";
import * as schema from "../db/schema/auth-schema";
import {ac, admin, user} from "./permissions";
import {createAuthMiddleware} from "better-auth/api";
import {config} from "../config/app.config";
import {RoleDto} from "../admin/dto/role.dto";
import {getAuthoritiesByUserIds} from "../admin/service/list-users.service";
import {PermissionDto} from "../admin/dto/permission.dto";

async function sendEmail(to: string, subject: string, html: string) {
  // TODO: plug in nodemailer/resend here
  console.log("SEND EMAIL", {to, subject, html});
}

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema
  }),
  trustedOrigins: [config.auth.trustedOrigin],
  appName: config.auth.appName,
  secret: config.auth.secret,

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    resetPasswordTokenExpiresIn: 15 * 60, // 5 minutes
    sendResetPassword: async ({user, url, token}, request) => {
      void sendEmail(
        user.email,
        "Reset your password",
        `Click the link to reset your password: ${url}`,
      );
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({user, url, token}, request) => {
      void sendEmail(
        user.email,
        "Verify your email address",
        `Click the link to verify your email: ${url}`,
      );
    },
  },
  session: {
    storeSessionInDatabase: true,
    cookieCache: {
      enabled: true,
      maxAge: 60, // Cache duration in seconds (1 minute)
      strategy: "jwe",
    }
  },
  socialProviders: {
    google: {
      clientId: config.oauth.google.clientId,
      clientSecret: config.oauth.google.clientSecret,
      accessType: "offline",
      prompt: "select_account consent",
    },
    discord: {
      clientId: config.oauth.discord.clientId,
      clientSecret: config.oauth.discord.clientSecret,
      scope: ["identify", "email", "openid"],
    }
  },
  account: {
    encryptOAuthTokens: true,
    accountLinking: {
      enabled: true,
      updateUserInfoOnLink: true,
      allowDifferentEmails: true,
    }
  },
  user: {
    changeEmail: {
      enabled: true,
      sendChangeEmailConfirmation: async ({user, url, token}) => {
        void sendEmail(
          user.email,
          "Confirm your email change",
          `Click the link to confirm your email change: ${url}`,
        );
      }
    },
    deleteUser: {
      enabled: true,
      sendDeleteAccountVerification: async ({user, url, token}) => {
        void sendEmail(
          user.email,
          "Verify your account deletion",
          `Click the link to confirm account deletion: ${url}`,
        );
      }
    }
  },
  plugins: [
    twoFactor({
      issuer: "Better Auth Demo",
      totpOptions: {
        digits: 6,
      },
      backupCodeOptions: {
        amount: 10,
        length: 8
      }
    }),
    passkey({
      rpID: config.passkey.rpId,
      rpName: config.passkey.rpName,
      origin: config.auth.trustedOrigin,
    }),
    magicLink({
      sendMagicLink: async ({email, url}) => {
        await sendEmail(
          email,
          "Sign in to your account",
          `Click the link to sign in: ${url}`
        );
      }
    }),
    jwt({
      jwks: {
        jwksPath: "/.well-known/jwks.json",
        keyPairConfig: {
          alg: "RS256"
        }
      },
      jwt: {
        expirationTime: "3m",
        definePayload: async ({user}) => {
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
    }),
    adminPlugin({
      defaultRole: "user",
      allowImpersonatingAdmins: true,
      ac,
      roles: {
        admin,
        user
      },
    })
  ],
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      if (ctx.path.startsWith("/admin/ban-user")) {
        const response: {user: UserWithRole} = ctx.context.returned as any;
        if (response && response.user.email) {
          const email: string = response.user.email;
          void sendEmail(
            email,
            "Account Banned",
            `Your account has been banned by the administrator. If you believe this is a mistake, please contact support.`
          );
        }
      }
    }),
  },
});