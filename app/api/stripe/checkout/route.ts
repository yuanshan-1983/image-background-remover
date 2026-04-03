import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/session";
import { getStripe, PLANS, PlanKey } from "@/lib/stripe";
import { getD1Binding } from "@/lib/cloudflare-env";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const session = await requireSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: "Stripe is not configured" }, { status: 500 });
  }

  const body = await request.json().catch(() => ({}));
  const planKey = body.plan as PlanKey;
  const plan = PLANS[planKey];

  if (!plan || !plan.priceId) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const user = session.user as any;
  const email = user.email as string;
  const userId = user.id as string;

  // Check if user already has a stripe customer id
  const db = getD1Binding();
  let stripeCustomerId: string | null = null;

  if (db) {
    const sub = await db
      .prepare(`SELECT stripe_customer_id FROM subscriptions WHERE user_id = ? LIMIT 1`)
      .bind(userId)
      .first<{ stripe_customer_id: string | null }>();
    stripeCustomerId = sub?.stripe_customer_id ?? null;
  }

  // Create or reuse customer
  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email,
      metadata: { userId },
    });
    stripeCustomerId = customer.id;
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: stripeCustomerId,
    mode: "subscription",
    line_items: [{ price: plan.priceId, quantity: 1 }],
    success_url: `https://imagebackgroundremover.club/dashboard?upgraded=true`,
    cancel_url: `https://imagebackgroundremover.club/pricing`,
    metadata: { userId, planKey },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
