import Stripe from "stripe";
import { getEnvValue } from "@/lib/cloudflare-env";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe | null {
  const key = getEnvValue("STRIPE_SECRET_KEY");
  if (!key) return null;
  if (!_stripe) {
    _stripe = new Stripe(key, { apiVersion: "2024-12-18.acacia" as any });
  }
  return _stripe;
}

export function getStripeWebhookSecret(): string | undefined {
  return getEnvValue("STRIPE_WEBHOOK_SECRET");
}

export const PLANS = {
  pro_monthly: {
    name: "Pro Monthly",
    priceId: getEnvValue("STRIPE_PRICE_PRO_MONTHLY") || "",
    dailyLimit: 100,
  },
  pro_yearly: {
    name: "Pro Yearly",
    priceId: getEnvValue("STRIPE_PRICE_PRO_YEARLY") || "",
    dailyLimit: 100,
  },
} as const;

export type PlanKey = keyof typeof PLANS;
