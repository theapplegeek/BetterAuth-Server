import type {BetterAuthOptions} from "better-auth";

export const accountConfig: BetterAuthOptions['account'] = {
  encryptOAuthTokens: true,
  accountLinking: {
    enabled: true,
    updateUserInfoOnLink: true,
    allowDifferentEmails: true,
  }
};