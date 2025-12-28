import {sendEmail} from "../../utils/email.utils.ts";
import type {BetterAuthOptions, User} from "better-auth";

export const emailAndPasswordConfig: Pick<BetterAuthOptions, 'emailAndPassword' | 'emailVerification'> = {
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    resetPasswordTokenExpiresIn: 15 * 60, // 5 minutes
    sendResetPassword: async ({user, url, token}: {
      user: User;
      url: string;
      token: string;
    }, request?: Request) => {
      void sendEmail(
        user.email,
        "Reset your password",
        `Click the link to reset your password: ${url}`,
      );
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({user, url, token}: {
      user: User;
      url: string;
      token: string;
    }, request?: Request) => {
      void sendEmail(
        user.email,
        "Verify your email address",
        `Click the link to verify your email: ${url}`,
      );
    },
  },
};