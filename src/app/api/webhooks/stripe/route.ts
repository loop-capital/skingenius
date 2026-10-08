import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/utils/supabase/server";
import { stripe } from "@/lib/subscription/stripe";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  if (!webhookSecret) {
    return NextResponse.json(
      { error: "Stripe webhook secret not configured" },
      { status: 500 }
    );
  }

  const payload = await req.text();
  const signature = req.headers.get("stripe-signature") ?? "";

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "Invalid webhook signature", detail: message }, { status: 400 });
  }

  const supabase = await createClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const subscriptionId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription?.id;
        const customerId =
          typeof session.customer === "string"
            ? session.customer
            : session.customer?.id;
        const userId = session.metadata?.supabase_user_id;

        if (!userId || !subscriptionId || !customerId) {
          return NextResponse.json(
            { error: "Missing subscription or customer id" },
            { status: 400 }
          );
        }

        const subscription = await stripe.subscriptions.retrieve(subscriptionId) as Stripe.Subscription;
        const priceId =
          typeof subscription.items.data[0]?.price === "string"
            ? subscription.items.data[0]?.price
            : subscription.items.data[0]?.price?.id;

        await supabase
          .from("profiles")
          .update({
            subscription_tier: "pro",
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            stripe_price_id: priceId ?? null,
            subscription_status: subscription.status,
            // Period dates are populated by the customer.subscription.updated webhook
            subscription_current_period_start: null,
            subscription_current_period_end: null,
            trial_end: subscription.trial_end
              ? new Date(subscription.trial_end * 1000).toISOString()
              : null,
          })
          .eq("id", userId);

        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId =
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer?.id;
        if (!customerId) break;

        const tier: "pro" | "pro_canceling" | "free" =
          subscription.status === "canceled" || subscription.status === "unpaid"
            ? "free"
            : subscription.cancel_at_period_end
              ? "pro_canceling"
              : "pro";

        await supabase
          .from("profiles")
          .update({
            subscription_tier: tier,
            subscription_status: subscription.status,
            trial_end: subscription.trial_end
              ? new Date(subscription.trial_end * 1000).toISOString()
              : null,
          })
          .eq("stripe_customer_id", customerId);

        break;
      }

      default: {
        // Unhandled event type
      }
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "Webhook handler failed", detail: message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
