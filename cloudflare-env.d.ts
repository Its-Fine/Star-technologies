declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    BUCKET?: R2Bucket;
    ADMIN_TOKEN?: string;
    CRM_WEBHOOK_URL?: string;
    CRM_WEBHOOK_TOKEN?: string;
    USD_RUB_RATE?: string;
    RATE_LIMIT_SALT?: string;
  }
}
