import { NextRequest, NextResponse } from "next/server";
import { getStripe, getStripeWebhookSecret } from "@/lib/stripe";
import { getD1Binding } from "@/lib/cloudflare-env";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { v4 as uuidv4 } from "uuid";

export const runtime = "nodejs";

function nowIso() {
  return new Date().toISOString();
}

export async function POST(request: NextRequest) {
  globalThis.__OPENCLAW_CF_CTX__ = await getCloudflareContext({ async: true });

  const stripe = getStripe();
  const webhookSecret = getStripeWebhookSecret();

  if (!stripe || !webhookSecret) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  }

  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const db = getD1Binding();
  if (!db) {
    return NextResponse.json({ error: "DB not available" }, { status: 500 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as any;
      const userId = session.metadata?.userId;
      const planKey = session.metadata?.planKey || "pro_monthly";
      const stripeCustomerId = session.customer;
      const stripeSubscriptionId = session.subscription;

      if (!userId) break;

      // Fetch subscription details
      const sub = await stripe.subscriptions.retrieve(stripeSubscriptionId);
      const periodEnd = new Date((sub as any).current_period_end * 1000).toISOString();
      const periodStart = new Date((sub as any).current_period_start * 1000).toISOString();

      // Upsert subscription
      const existing = await db
        .prepare(`SELECT id FROM subscriptions WHERE user_id = ? LIMIT 1`)
        .bind(userId)
        .first<{ id: string }>();

      if (existing) {
        await db
          .prepare(
            `UPDATE subscriptions SET plan_name = ?, status = 'active', stripe_customer_id = ?, stripe_subscription_id = ?,
             current_period_start = ?, current_period_end = ?, updated_at = ? WHERE id = ?`
          )
          .bind(planKey, stripeCustomerId, stripeSubscriptionId, periodStart, periodEnd, nowIso(), existing.id)
          .run();
      } else {
        await db
          .prepare(
            `INSERT INTO subscriptions (id, user_id, plan_name, status, stripe_customer_id, stripe_subscription_id,
             current_period_start, current_period_end, created_at, updated_at)
             VALUES (?, ?, ?, 'active', ?, ?, ?, ?, ?, ?)`
          )
          .bind(uuidv4(), userId, planKey, stripeCustomerId, stripeSubscriptionId, periodStart, periodEnd, nowIso(), nowIso())
          .run();
      }

      // Update user plan
      await db.prepare(`UPDATE users SET plan = ?, updated_at = ? WHERE id = ?`).bind("pro", nowIso(), userId).run();
      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object as any;
      const stripeSubscriptionId = sub.id;
      const status = sub.status; // active, past_due, canceled, etc.
      const periodEnd = new Date(sub.current_period_end * 1000).toISOString();

      const row = await db
        .prepare(`SELECT id, user_id FROM subscriptions WHERE stripe_subscription_id = ? LIMIT 1`)
        .bind(stripeSubscriptionId)
        .first<{ id: string; user_id: string }>();

      if (row) {
        await db
          .prepare(`UPDATE subscriptions SET status = ?, current_period_end = ?, updated_at = ? WHERE id = ?`)
          .bind(status, periodEnd, nowIso(), row.id)
          .run();

        if (status === "canceled" || status === "unpaid") {
          await db.prepare(`UPDATE users SET plan = 'free', updated_at = ? WHERE id = ?`).bind(nowIso(), row.user_id).run();
        }
      }
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as any;
      const stripeSubscriptionId = sub.id;

      const row = await db
        .prepare(`SELECT id, user_id FROM subscriptions WHERE stripe_subscription_id = ? LIMIT 1`)
        .bind(stripeSubscriptionId)
        .first<{ id: string; user_id: string }>();

      if (row) {
        await db
          .prepare(`UPDATE subscriptions SET status = 'canceled', updated_at = ? WHERE id = ?`)
          .bind(nowIso(), row.id)
          .run();
        await db.prepare(`UPDATE users SET plan = 'free', updated_at = ? WHERE id = ?`).bind(nowIso(), row.user_id).run();
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
