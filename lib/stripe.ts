import Stripe from "stripe";

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not configured in environment variables.");
  }
  return new Stripe(key, {
    apiVersion: "2025-02-24.acacia",
    typescript: true,
  });
}

export const STRIPE_PRICES = {
  PRO: process.env.STRIPE_PRO_PRICE_ID ?? "",
  ENTERPRISE: process.env.STRIPE_ENTERPRISE_PRICE_ID ?? "",
};
