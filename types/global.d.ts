import type { CloudflareLike } from "@/lib/cloudflare-env";

declare global {
  var __OPENCLAW_CF_CTX__: CloudflareLike | undefined;
}

export {};
