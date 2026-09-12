import Razorpay from "razorpay";
import crypto from "crypto";

const key_id = (process.env.RAZORPAY_API_KEY || process.env.RAZORPAY_KEY_ID || "").replace(/['"]/g, "").trim();
const key_secret = (process.env.RAZORPAY_API_SECRET || process.env.RAZORPAY_KEY_SECRET || "").replace(/['"]/g, "").trim();

let razorpayInstance: Razorpay | null = null;

export function getRazorpayClient(): Razorpay {
  if (!razorpayInstance) {
    if (!key_id || !key_secret) {
      console.warn("⚠️ Warning: Razorpay credentials missing in environment variables.");
    }
    razorpayInstance = new Razorpay({
      key_id,
      key_secret,
    });
  }
  return razorpayInstance;
}

export async function createRazorpayOrder({
  amount,
  receipt,
  notes = {},
}: {
  amount: number; // in INR
  receipt: string;
  notes?: Record<string, string>;
}) {
  const rzp = getRazorpayClient();
  const options = {
    amount: Math.round(amount * 100), // convert to paise
    currency: "INR",
    receipt,
    notes,
  };

  return rzp.orders.create(options);
}

/**
 * Server-side HMAC-SHA256 signature verification for client checkout callback
 */
export function verifyRazorpaySignature({
  orderId,
  paymentId,
  signature,
}: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  if (!orderId || !paymentId || !signature || !key_secret) return false;

  const generatedSignature = crypto
    .createHmac("sha256", key_secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  return generatedSignature === signature;
}

/**
 * Server-side Razorpay Webhook signature verification
 */
export function verifyRazorpayWebhookSignature({
  rawBody,
  signature,
  webhookSecret,
}: {
  rawBody: string;
  signature: string;
  webhookSecret?: string;
}): boolean {
  const secret = webhookSecret || process.env.RAZORPAY_WEBHOOK_SECRET || key_secret;
  if (!rawBody || !signature || !secret) return false;

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  return expectedSignature === signature;
}
