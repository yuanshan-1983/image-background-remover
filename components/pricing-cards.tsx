"use client";

import { useState } from "react";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    desc: "Perfect for occasional use",
    planKey: null,
    highlight: false,
    features: [
      "5 background removals per day",
      "Standard quality (up to 1024px)",
      "Transparent PNG download",
      "White & custom color backgrounds",
      "Google sign-in",
    ],
  },
  {
    name: "Pro",
    price: "$9.9",
    period: "/month",
    desc: "For power users & small businesses",
    planKey: "pro_monthly",
    highlight: true,
    badge: "Most Popular",
    features: [
      "100 background removals per day",
      "Full HD quality (original resolution)",
      "Batch processing (up to 20 images)",
      "Priority processing speed",
      "All Free features included",
      "Email support",
    ],
  },
  {
    name: "API",
    price: "$0.05",
    period: "/image",
    desc: "For developers & integrations",
    planKey: null,
    highlight: false,
    features: [
      "Pay per image processed",
      "REST API access",
      "Full HD quality output",
      "Webhook notifications",
      "Usage dashboard",
      "Technical support",
    ],
  },
];

export default function PricingCards() {
  const [loading, setLoading] = useState<string | null>(null);

  async function handleCheckout(planKey: string) {
    setLoading(planKey);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planKey }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Failed to create checkout session. Please sign in first.");
        setLoading(null);
      }
    } catch {
      alert("Something went wrong. Please try again.");
      setLoading(null);
    }
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-3">
      {plans.map((plan) => (
        <div
          key={plan.name}
          className={`relative rounded-2xl border bg-white p-6 shadow-sm transition sm:p-8 ${
            plan.highlight ? "border-blue-500 shadow-lg ring-1 ring-blue-500" : "border-gray-200"
          }`}
        >
          {plan.badge && (
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-4 py-1 text-xs font-bold text-white">
              {plan.badge}
            </span>
          )}
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
            <div className="mt-3">
              <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
              <span className="text-sm text-gray-500">{plan.period}</span>
            </div>
            <p className="mt-2 text-sm text-gray-500">{plan.desc}</p>
          </div>

          <ul className="mt-6 space-y-3">
            {plan.features.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="mt-0.5 text-green-500">✓</span>
                {f}
              </li>
            ))}
          </ul>

          <div className="mt-8">
            {plan.planKey ? (
              <button
                type="button"
                onClick={() => handleCheckout(plan.planKey!)}
                disabled={loading === plan.planKey}
                className={`flex w-full items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition ${
                  plan.highlight
                    ? "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400"
                    : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {loading === plan.planKey ? "Redirecting..." : "Subscribe to Pro"}
              </button>
            ) : plan.name === "Free" ? (
              <a
                href="/api/auth/google/start"
                className="flex w-full items-center justify-center rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Get started
              </a>
            ) : (
              <span className="flex w-full items-center justify-center rounded-xl border border-gray-300 bg-gray-50 px-5 py-3 text-sm font-semibold text-gray-400">
                Coming soon
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
