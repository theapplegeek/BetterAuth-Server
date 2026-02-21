import {type Context, Hono} from 'hono'
import {config} from "./config/app.config";
import {auth} from "./auth/auth";
import {cors} from "hono/cors";
import adminController from "./admin/controller/admin.controller";
import {toNeutralChangeEmailResponse} from "./auth/change-email-response";

const app = new Hono()

app.use(
  "/api/*",
  cors({
    origin: config.auth.trustedOrigin,
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    maxAge: 600,
    credentials: true
  })
);

// Mount BetterAuth handler
app.on(["GET", "POST"], "/api/auth/*", async (c: Context) => {
  const response = await auth.handler(c.req.raw);
  return toNeutralChangeEmailResponse(c.req.path, response);
});

app.route("/api/admin", adminController);

app.get("/health", (c) => c.json({ok: true}));

export default {
  port: config.server.port,
  fetch: app.fetch,
}
