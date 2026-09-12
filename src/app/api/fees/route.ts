import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb/connection";
import { StudentFee } from "@/models/StudentFee";
import { Student } from "@/models/Student";
import { FeeStructure } from "@/models/FeeStructure";
import { requireAuth } from "@/lib/auth/jwt";

export async function GET(req: NextRequest) {
  try {
    const { errorResponse } = requireAuth(req, ["Admin", "Accountant", "Staff"]);
    if (errorResponse) return errorResponse;

    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId") || "";
    const month = searchParams.get("month") || "";
    const className = searchParams.get("className") || "";
    const status = searchParams.get("status") || "";

    const query: any = {};
    if (studentId) query.studentId = studentId;
    if (month) query.month = month;
    if (className) query.className = className;
    if (status) query.status = status;

    const invoices = await StudentFee.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: invoices });
  } catch (err: any) {
    console.error("GET /api/fees error:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch fee records" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { errorResponse } = requireAuth(req, ["Admin", "Accountant"]);
    if (errorResponse) return errorResponse;

    await connectToDatabase();
    const body = await req.json();

    // Mode 1: Bulk generate for a class
    if (body.bulk && body.className && body.month) {
      const students = await Student.find({ className: body.className, status: "Active" });
      const feeStruct = await FeeStructure.findOne({ className: body.className });

      const heads = feeStruct?.heads?.map((h) => ({ head: h.head, amount: h.amount })) || [
        { head: "Tuition Fee", amount: 2500 },
        { head: "Activity Fee", amount: 300 },
      ];

      const totalHeadAmount = heads.reduce((a, b) => a + Number(b.amount || 0), 0);
      const dueDate = body.dueDate || `${new Date().toISOString().slice(0, 7)}-15`;

      const count = await StudentFee.countDocuments();
      let createdCount = 0;

      for (let i = 0; i < students.length; i++) {
        const st = students[i];
        const studentId = st._id.toString();

        // Check if invoice already exists for this student & month
        const exists = await StudentFee.findOne({
          studentId,
          month: body.month,
          session: body.session || "2025-26",
        });

        if (!exists) {
          const invoiceNo = `INV-${new Date().getFullYear()}-${String(count + createdCount + 1).padStart(5, "0")}`;
          await StudentFee.create({
            invoiceNo,
            studentId,
            studentName: st.name,
            className: st.className,
            section: st.section,
            admissionNo: st.admissionNo,
            month: body.month,
            session: body.session || "2025-26",
            items: heads,
            lateFee: 0,
            discount: 0,
            total: totalHeadAmount,
            paid: 0,
            pending: totalHeadAmount,
            status: "Pending",
            dueDate,
          });
          createdCount++;
        }
      }

      return NextResponse.json({
        success: true,
        message: `Generated ${createdCount} invoices for Class ${body.className} (${body.month}).`,
      });
    }

    // Mode 2: Single invoice creation
    if (!body.studentId || !body.month || !body.items) {
      return NextResponse.json(
        { success: false, error: "studentId, month, and items are required." },
        { status: 400 }
      );
    }

    const itemsTotal = (body.items || []).reduce((a: number, b: any) => a + Number(b.amount || 0), 0);
    const lateFee = Number(body.lateFee) || 0;
    const discount = Number(body.discount) || 0;
    const total = itemsTotal + lateFee - discount;
    const paid = Number(body.paid) || 0;
    const pending = Math.max(0, total - paid);
    const status = paid >= total ? "Paid" : paid > 0 ? "Partial" : "Pending";

    const count = await StudentFee.countDocuments();
    const invoiceNo = body.invoiceNo || `INV-${new Date().getFullYear()}-${String(count + 1).padStart(5, "0")}`;

    const invoice = await StudentFee.create({
      ...body,
      invoiceNo,
      total,
      paid,
      pending,
      status,
    });

    return NextResponse.json({ success: true, data: invoice }, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/fees error:", err);
    return NextResponse.json({ success: false, error: "Failed to generate fee invoice" }, { status: 500 });
  }
}
