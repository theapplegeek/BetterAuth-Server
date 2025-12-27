import "dotenv/config";
import {betterAuth} from "better-auth/minimal";
import {drizzleAdapter} from "better-auth/adapters/drizzle";
import {admin as adminPlugin, jwt, magicLink, twoFactor, type UserWithRole} from "better-auth/plugins";
import {passkey} from "@better-auth/passkey";
import {db} from "../db/db";
import * as schema from "../db/schema/auth-schema";
import {ac, admin, user} from "./permissions";
import {createAuthMiddleware} from "better-auth/api";

async function sendEmail(to: string, subject: string, html: string) {
  // TODO: plug in nodemailer/resend here
  console.log("SEND EMAIL", {to, subject, html});
}

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema
  }),
  trustedOrigins: [process.env.TRUSTED_ORIGIN!],
  appName: process.env.APP_NAME || "Better Auth Demo",
  secret: process.env.AUTH_SECRET,

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
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      accessType: "offline",
      prompt: "select_account consent",
    },
    discord: {
      clientId: process.env.DISCORD_CLIENT_ID as string,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
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
      rpID: process.env.RP_ID || "localhost",
      rpName: process.env.RP_NAME || "Better Auth Demo App",
      origin: process.env.TRUSTED_ORIGIN || "http://localhost:4200",
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