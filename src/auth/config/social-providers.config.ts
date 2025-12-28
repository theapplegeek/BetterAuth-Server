import {config} from "../../config/app.config";
import type {SocialProviders} from "better-auth";

export const socialProvidersConfig: SocialProviders = {
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
};