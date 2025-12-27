import {type Context, Hono} from 'hono'
import {config} from "./config/app.config";
import {auth} from "./auth/auth";
import {cors} from "hono/cors";
import adminController from "./admin/controller/admin.controller";

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

// Mount Better Auth handler
app.on(["GET", "POST"], "/api/auth/*", (c: Context) => {
  return auth.handler(c.req.raw);
});

app.route("/api/admin", adminController);

app.get("/health", (c) => c.json({ok: true}));

export default {
  port: config.server.port,
  fetch: app.fetch,
}