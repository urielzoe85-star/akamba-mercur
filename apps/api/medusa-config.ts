import { loadEnv } from "@medusajs/framework/utils";
import { withMercur } from "@mercurjs/core";

loadEnv(process.env.NODE_ENV || "development", process.cwd());

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
const BABANA_ENABLED = process.env.BABANA_FULFILLMENT_ENABLED === "true";

if (
  BABANA_ENABLED &&
  (!process.env.BABANA_API_URL || !process.env.BABANA_API_KEY)
) {
  throw new Error(
    "BABANA_API_URL and BABANA_API_KEY are required when BABANA_FULFILLMENT_ENABLED=true",
  );
}

const secret = (name: "JWT_SECRET" | "COOKIE_SECRET") => {
  const value = process.env[name];

  if (value) return value;
  if (process.env.NODE_ENV === "production") {
    throw new Error(`${name} must be configured in production`);
  }

  return `development-only-${name.toLowerCase()}`;
};

module.exports = withMercur({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: REDIS_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      vendorCors: process.env.VENDOR_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: secret("JWT_SECRET"),
      cookieSecret: secret("COOKIE_SECRET"),
    },
  },
  featureFlags: {
    seller_registration: true,
  },
  modules: [
    ...(BABANA_ENABLED
      ? [
          {
            resolve: "@medusajs/medusa/fulfillment",
            options: {
              providers: [
                {
                  resolve: "@medusajs/medusa/fulfillment-manual",
                  id: "manual",
                },
                {
                  resolve: "./src/providers/babana-fulfillment",
                  id: "babana",
                  options: {
                    api_url: process.env.BABANA_API_URL,
                    api_key: process.env.BABANA_API_KEY,
                  },
                },
              ],
            },
          },
        ]
      : []),
    {
      resolve: "@mercurjs/core/modules/admin-ui",
      options: {
        appDir: "",
        path: "/dashboard",
        disable: true,
      },
    },
    {
      resolve: "@mercurjs/core/modules/vendor-ui",
      options: {
        appDir: "",
        path: "/seller",
        disable: true,
      },
    },
    {
      resolve: "@medusajs/medusa/cache-redis",
      options: { redisUrl: REDIS_URL },
    },
    {
      resolve: "@medusajs/medusa/event-bus-redis",
      options: { redisUrl: REDIS_URL },
    },
    {
      resolve: "@medusajs/medusa/workflow-engine-redis",
      options: { redis: { url: REDIS_URL } },
    },
    {
      resolve: "@medusajs/medusa/locking",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/locking-redis",
            id: "locking-redis",
            is_default: true,
            options: { redisUrl: REDIS_URL },
          },
        ],
      },
    },
    {
      resolve: "@medusajs/medusa/file",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/file-local",
            id: "local",
            options: {
              // The local provider bakes this into every uploaded file URL.
              // It must be the publicly reachable origin in production, or
              // images resolve to localhost and render broken.
              backend_url:
                process.env.FILE_BACKEND_URL || "http://localhost:9000/static",
            },
          },
        ],
      },
    },
  ],
});
