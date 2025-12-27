import "dotenv/config";

export const config = {
  auth: {
    secret: process.env.AUTH_SECRET!,
    trustedOrigin: process.env.TRUSTED_ORIGIN!,
    appName: process.env.APP_NAME || "Better Auth Demo",
    url: process.env.BETTER_AUTH_URL!,
  },
  database: {
    url: process.env.DATABASE_URL!,
  },
  oauth: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    discord: {
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    },
  },
  passkey: {
    rpId: process.env.RP_ID || "localhost",
    rpName: process.env.RP_NAME || "Better Auth Demo App",
  },
  server: {
    port: Number(process.env.PORT) || 3000,
  },
} as const;