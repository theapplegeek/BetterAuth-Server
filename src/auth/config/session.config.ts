import type {BetterAuthOptions} from "better-auth";

export const sessionConfig: BetterAuthOptions['session'] = {
  storeSessionInDatabase: true,
  cookieCache: {
    enabled: true,
    maxAge: 60, // Cache duration in seconds (1 minute)
    strategy: "jwe" as const,
  }
};