import "dotenv/config";
import {betterAuth} from "better-auth/minimal";
import {config} from "../config/app.config";
import {databaseConfig} from "./config/database.config";
import {sessionConfig} from "./config/session.config";
import {socialProvidersConfig} from "./config/social-providers.config";
import {accountConfig} from "./config/account.config";
import {userConfig} from "./config/user.config";
import {pluginsConfig} from "./config/plugins.config";
import {hooksConfig} from "./config/hooks.config";
import {emailAndPasswordConfig} from "./config/email-and-password.config.ts";

export const auth = betterAuth({
  database: databaseConfig,
  trustedOrigins: [config.auth.trustedOrigin],
  appName: config.auth.appName,
  secret: config.auth.secret,
  ...emailAndPasswordConfig,
  session: sessionConfig,
  socialProviders: socialProvidersConfig,
  account: accountConfig,
  user: userConfig,
  plugins: pluginsConfig,
  hooks: hooksConfig,
});