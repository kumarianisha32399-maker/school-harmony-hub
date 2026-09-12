import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb/connection";
import { verifyRazorpaySignature } from "@/lib/razorpay";
import { Payment } from "@/models/Payment";
import { StudentFee } from "@/models/StudentFee";
import { Student } from "@/models/Student";
import { requireAuth } from "@/lib/auth/jwt";
import { sendEmail, paymentReceiptEmailTemplate } from "@/lib/smtp";

export async function POST(req: NextRequest) {
  try {
    const { user, errorResponse } = requireAuth(req);
    if (errorResponse) return errorResponse;

    await connectToDatabase();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      studentId,
      invoiceId,
      amount,
    } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { success: false, error: "Incomplete payment verification payload." },
        { status: 400 }
      );
    }

    // 1. Server-side HMAC-SHA256 Signature Verification
    const isValidSignature = verifyRazorpaySignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    });

    if (!isValidSignature) {
      console.error(`🚨 Razorpay Signature Verification Failed for payment ${razorpay_payment_id}`);
      return NextResponse.json(
        { success: false, error: "Payment verification failed: Invalid cryptographic signature." },
        { status: 400 }
      );
    }

    // 2. Idempotency Check: Prevent duplicate payment creation
    const existingPayment = await Payment.findOne({ razorpayPaymentId: razorpay_payment_id });
    if (existingPayment) {
      return NextResponse.json({
        success: true,
        message: "Payment already recorded (idempotent response).",
        data: existingPayment,
      });
    }

    const student = await Student.findById(studentId);
    const count = await Payment.countDocuments();
    const receiptNo = `REC-${new Date().getFullYear()}-${String(count + 1).padStart(5, "0")}`;
    const paymentAmount = Number(amount) || 0;

    // 3. Create Payment record in MongoDB
    const payment = await Payment.create({
      receiptNo,
      invoiceId: invoiceId || "",
      studentId: studentId || student?._id.toString(),
      studentName: student?.name || "",
      admissionNo: student?.admissionNo || "",
      className: student?.className || "",
      amount: paymentAmount,
      date: new Date().toISOString().slice(0, 10),
      mode: "Razorpay",
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      status: "Success",
      collectedBy: user?.name || "Online Razorpay Gateway",
    });

    // 4. Update Invoice in MongoDB
    if (invoiceId) {
      const invoice = await StudentFee.findById(invoiceId);
      if (invoice) {
        invoice.paid = (Number(invoice.paid) || 0) + paymentAmount;
        invoice.pending = Math.max(0, invoice.total - invoice.paid);
        invoice.status = invoice.paid >= invoice.total ? "Paid" : "Partial";
        await invoice.save();
      }
    }

    // 5. Send Receipt Confirmation via SMTP
    if (student?.email) {
      const html = paymentReceiptEmailTemplate(
        student.name,
        receiptNo,
        paymentAmount,
        "Razorpay Online",
        payment.date
      );
      sendEmail({
        to: student.email,
        subject: `Fee Payment Receipt ${receiptNo} — Harmony School ERP`,
        html,
      }).catch((e) => console.error("SMTP receipt send error:", e));
    }

    return NextResponse.json({
      success: true,
      message: "Payment verified and recorded successfully.",
      data: payment,
    });
  } catch (err: any) {
    console.error("Razorpay verification error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Payment verification failed." },
      { status: 500 }
    );
  }
}
