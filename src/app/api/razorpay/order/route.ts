import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb/connection";
import { createRazorpayOrder } from "@/lib/razorpay";
import { StudentFee } from "@/models/StudentFee";
import { Student } from "@/models/Student";
import { requireAuth } from "@/lib/auth/jwt";

export async function POST(req: NextRequest) {
  try {
    const { errorResponse } = requireAuth(req);
    if (errorResponse) return errorResponse;

    await connectToDatabase();
    const { studentId, invoiceId, amount } = await req.json();

    const paymentAmount = Number(amount);
    if (!studentId || !paymentAmount || paymentAmount <= 0) {
      return NextResponse.json(
        { success: false, error: "Valid studentId and amount are required." },
        { status: 400 }
      );
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return NextResponse.json({ success: false, error: "Student not found." }, { status: 404 });
    }

    // Server-side validation of fee amount if invoiceId is passed
    if (invoiceId) {
      const invoice = await StudentFee.findById(invoiceId);
      if (!invoice) {
        return NextResponse.json({ success: false, error: "Invoice not found." }, { status: 404 });
      }
      if (invoice.pending < paymentAmount) {
        return NextResponse.json(
          {
            success: false,
            error: `Payment amount ₹${paymentAmount} exceeds pending fee ₹${invoice.pending}.`,
          },
          { status: 400 }
        );
      }
    }

    const receiptRef = `rcpt_${Date.now().toString(36)}`;
    const order = await createRazorpayOrder({
      amount: paymentAmount,
      receipt: receiptRef,
      notes: {
        studentId,
        studentName: student.name,
        admissionNo: student.admissionNo,
        invoiceId: invoiceId || "",
      },
    });

    const key_id = (process.env.RAZORPAY_API_KEY || process.env.RAZORPAY_KEY_ID || "").replace(/['"]/g, "").trim();

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount, // in paise
      currency: order.currency,
      keyId: key_id, // Public Key ID safe for client SDK
      student: {
        name: student.name,
        email: student.email,
        mobile: student.mobile,
      },
    });
  } catch (err: any) {
    console.error("Razorpay order creation error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to initiate Razorpay order." },
      { status: 500 }
    );
  }
}
