import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb/connection";
import { Student } from "@/models/Student";
import { requireAuth } from "@/lib/auth/jwt";

export async function GET(req: NextRequest) {
  try {
    const { errorResponse } = requireAuth(req);
    if (errorResponse) return errorResponse;

    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const className = searchParams.get("className") || "";
    const section = searchParams.get("section") || "";
    const status = searchParams.get("status") || "";

    const query: any = {};
    if (className) query.className = className;
    if (section) query.section = section;
    if (status) query.status = status;

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { admissionNo: { $regex: search, $options: "i" } },
        { mobile: { $regex: search, $options: "i" } },
        { father: { $regex: search, $options: "i" } },
      ];
    }

    const students = await Student.find(query).sort({ className: 1, rollNo: 1, name: 1 });
    return NextResponse.json({ success: true, data: students });
  } catch (err: any) {
    console.error("GET /api/students error:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch students" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { errorResponse } = requireAuth(req, ["Admin", "Staff"]);
    if (errorResponse) return errorResponse;

    await connectToDatabase();
    const body = await req.json();

    if (!body.name || !body.className || !body.section) {
      return NextResponse.json(
        { success: false, error: "Student name, class, and section are required." },
        { status: 400 }
      );
    }

    let admissionNo = body.admissionNo ? body.admissionNo.trim().toUpperCase() : "";
    if (!admissionNo) {
      const count = await Student.countDocuments();
      admissionNo = `HPS-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;
    }

    const existing = await Student.findOne({ admissionNo });
    if (existing) {
      return NextResponse.json(
        { success: false, error: `Student with Admission No ${admissionNo} already exists.` },
        { status: 400 }
      );
    }

    const student = await Student.create({
      ...body,
      admissionNo,
      rollNo: Number(body.rollNo) || 0,
    });

    return NextResponse.json({ success: true, data: student }, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/students error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to create student record" },
      { status: 500 }
    );
  }
}
