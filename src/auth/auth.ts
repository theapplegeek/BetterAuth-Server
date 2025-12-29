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
  ],
  hooks: hooksConfig,
});