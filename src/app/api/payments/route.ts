import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb/connection";
import { Payment } from "@/models/Payment";
import { StudentFee } from "@/models/StudentFee";
import { Student } from "@/models/Student";
import { requireAuth } from "@/lib/auth/jwt";
import { sendEmail, paymentReceiptEmailTemplate } from "@/lib/smtp";

export async function GET(req: NextRequest) {
  try {
    const { errorResponse } = requireAuth(req, ["Admin", "Accountant", "Staff"]);
    if (errorResponse) return errorResponse;

    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId") || "";
    const mode = searchParams.get("mode") || "";
    const date = searchParams.get("date") || "";

    const query: any = {};
    if (studentId) query.studentId = studentId;
    if (mode) query.mode = mode;
    if (date) query.date = date;

    const payments = await Payment.find(query).sort({ date: -1, createdAt: -1 });
    return NextResponse.json({ success: true, data: payments });
  } catch (err: any) {
    console.error("GET /api/payments error:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch payments" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, errorResponse } = requireAuth(req, ["Admin", "Accountant"]);
    if (errorResponse) return errorResponse;

    await connectToDatabase();
    const body = await req.json();

    if (!body.studentId || !body.amount || Number(body.amount) <= 0) {
      return NextResponse.json(
        { success: false, error: "Student ID and valid payment amount are required." },
        { status: 400 }
      );
    }

    const count = await Payment.countDocuments();
    const receiptNo = body.receiptNo || `REC-${new Date().getFullYear()}-${String(count + 1).padStart(5, "0")}`;

    const student = await Student.findById(body.studentId) || await Student.findOne({ _id: body.studentId });

    const payment = await Payment.create({
      ...body,
      receiptNo,
      studentName: student?.name || body.studentName || "",
      admissionNo: student?.admissionNo || body.admissionNo || "",
      className: student?.className || body.className || "",
      amount: Number(body.amount),
      collectedBy: user?.name || "Admin",
      status: "Success",
    });

    // If invoiceId is provided, update invoice paid and pending balances
    if (body.invoiceId) {
      const invoice = await StudentFee.findById(body.invoiceId);
      if (invoice) {
        invoice.paid = (Number(invoice.paid) || 0) + Number(body.amount);
        invoice.pending = Math.max(0, invoice.total - invoice.paid);
        invoice.status = invoice.paid >= invoice.total ? "Paid" : "Partial";
        await invoice.save();
      }
    }

    // Send confirmation email via SMTP asynchronously if student email is present
    if (student?.email) {
      const html = paymentReceiptEmailTemplate(
        student.name,
        receiptNo,
        Number(body.amount),
        body.mode || "Cash",
        payment.date
      );
      sendEmail({
        to: student.email,
        subject: `Payment Receipt ${receiptNo} — Harmony School ERP`,
        html,
      }).catch((e) => console.error("SMTP error sending payment receipt:", e));
    }

    return NextResponse.json({ success: true, data: payment }, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/payments error:", err);
    return NextResponse.json({ success: false, error: "Failed to record payment" }, { status: 500 });
  }
}
