import {sendEmail} from "../../utils/email.utils.ts";
import type {User, BetterAuthOptions} from "better-auth";

export const userConfig: BetterAuthOptions['user'] = {
  changeEmail: {
    enabled: true,
    sendChangeEmailConfirmation: async ({user, url, token}: {
      user: User;
      url: string;
      token: string;
    }) => {
      void sendEmail(
        user.email,
        "Confirm your email change",
        `Click the link to confirm your email change: ${url}`,
      );
    }
  },
  deleteUser: {
    enabled: true,
    sendDeleteAccountVerification: async ({user, url, token}: {
      user: User;
      url: string;
      token: string;
    }) => {
      void sendEmail(
        user.email,
        "Verify your account deletion",
        `Click the link to confirm account deletion: ${url}`,
      );
    }
  }
};