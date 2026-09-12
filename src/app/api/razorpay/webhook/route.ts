import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb/connection";
import { verifyRazorpayWebhookSignature } from "@/lib/razorpay";
import { Payment } from "@/models/Payment";
import { StudentFee } from "@/models/StudentFee";
import { Student } from "@/models/Student";
import { sendEmail, paymentReceiptEmailTemplate } from "@/lib/smtp";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature") || "";

    // 1. Verify Webhook Signature
    const isValid = verifyRazorpayWebhookSignature({
      rawBody,
      signature,
    });

    if (!isValid) {
      console.error("🚨 Razorpay Webhook Invalid Signature rejected.");
      return NextResponse.json({ success: false, error: "Invalid webhook signature." }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    await connectToDatabase();

    // 2. Handle payment.captured event
    if (event.event === "payment.captured" || event.event === "order.paid") {
      const paymentEntity = event.payload?.payment?.entity;
      const orderEntity = event.payload?.order?.entity;

      const razorpayPaymentId = paymentEntity?.id;
      const razorpayOrderId = paymentEntity?.order_id || orderEntity?.id;
      const amount = (paymentEntity?.amount || orderEntity?.amount_paid || 0) / 100; // paise to INR
      const notes = paymentEntity?.notes || orderEntity?.notes || {};

      const studentId = notes.studentId;
      const invoiceId = notes.invoiceId;

      if (razorpayPaymentId) {
        // Idempotency: Check if this payment was already recorded
        const existing = await Payment.findOne({ razorpayPaymentId });
        if (!existing && studentId) {
          const student = await Student.findById(studentId);
          const count = await Payment.countDocuments();
          const receiptNo = `REC-${new Date().getFullYear()}-${String(count + 1).padStart(5, "0")}`;

          const payment = await Payment.create({
            receiptNo,
            invoiceId: invoiceId || "",
            studentId,
            studentName: student?.name || notes.studentName || "",
            admissionNo: student?.admissionNo || notes.admissionNo || "",
            className: student?.className || "",
            amount,
            date: new Date().toISOString().slice(0, 10),
            mode: "Razorpay",
            razorpayOrderId,
            razorpayPaymentId,
            status: "Success",
            collectedBy: "Razorpay Webhook",
          });

          if (invoiceId) {
            const invoice = await StudentFee.findById(invoiceId);
            if (invoice) {
              invoice.paid = (Number(invoice.paid) || 0) + amount;
              invoice.pending = Math.max(0, invoice.total - invoice.paid);
              invoice.status = invoice.paid >= invoice.total ? "Paid" : "Partial";
              await invoice.save();
            }
          }

          if (student?.email) {
            const html = paymentReceiptEmailTemplate(
              student.name,
              receiptNo,
              amount,
              "Razorpay Online",
              payment.date
            );
            sendEmail({
              to: student.email,
              subject: `Fee Payment Receipt ${receiptNo} — Harmony School ERP`,
              html,
            }).catch((e) => console.error("SMTP error sending webhook receipt:", e));
          }
        }
      }
    }

    return NextResponse.json({ success: true, received: true });
  } catch (err: any) {
    console.error("Razorpay webhook processing error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
