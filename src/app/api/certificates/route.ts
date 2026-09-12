import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb/connection";
import { Certificate } from "@/models/Certificate";
import { Student } from "@/models/Student";
import { requireAuth } from "@/lib/auth/jwt";

export async function GET(req: NextRequest) {
  try {
    const { errorResponse } = requireAuth(req, ["Admin", "Staff"]);
    if (errorResponse) return errorResponse;

    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId") || "";
    const type = searchParams.get("type") || "";

    const query: any = {};
    if (studentId) query.studentId = studentId;
    if (type) query.type = type;

    const certs = await Certificate.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: certs });
  } catch (err: any) {
    console.error("GET /api/certificates error:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch certificates" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, errorResponse } = requireAuth(req, ["Admin", "Staff"]);
    if (errorResponse) return errorResponse;

    await connectToDatabase();
    const body = await req.json();

    if (!body.type || !body.studentId) {
      return NextResponse.json(
        { success: false, error: "Certificate type and studentId are required." },
        { status: 400 }
      );
    }

    const student = await Student.findById(body.studentId);
    const count = await Certificate.countDocuments({ type: body.type });
    const prefix = body.type.slice(0, 3).toUpperCase();
    const certNo = body.certNo || `${prefix}-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;

    const cert = await Certificate.create({
      ...body,
      certNo,
      studentName: student?.name || body.studentName || "",
      admissionNo: student?.admissionNo || body.admissionNo || "",
      className: student?.className || body.className || "",
      fatherName: student?.father || body.fatherName || "",
      issuedBy: user?.name || "Principal",
    });

    return NextResponse.json({ success: true, data: cert }, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/certificates error:", err);
    return NextResponse.json({ success: false, error: "Failed to issue certificate" }, { status: 500 });
  }
}
