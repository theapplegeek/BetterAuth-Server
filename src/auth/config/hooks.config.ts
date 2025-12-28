import {createAuthMiddleware} from "better-auth/api";
import type {UserWithRole} from "better-auth/plugins";
import type {BetterAuthOptions} from "better-auth";

import {sendEmail} from "../../utils/email.utils.ts";

export const hooksConfig: BetterAuthOptions['hooks'] = {
  after: createAuthMiddleware(async (ctx: any) => {
    if (ctx.path.startsWith("/admin/ban-user")) {
      const response: { user: UserWithRole } = ctx.context.returned as any;
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
};