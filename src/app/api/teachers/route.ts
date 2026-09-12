import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb/connection";
import { Teacher } from "@/models/Teacher";
import { requireAuth } from "@/lib/auth/jwt";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";

    const query: any = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { empId: { $regex: search, $options: "i" } },
        { subject: { $regex: search, $options: "i" } },
        { mobile: { $regex: search, $options: "i" } },
      ];
    }

    const teachers = await Teacher.find(query).sort({ name: 1 });
    return NextResponse.json({ success: true, data: teachers });
  } catch (err: any) {
    console.error("GET /api/teachers error:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch teachers" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { errorResponse } = requireAuth(req, ["Admin"]);
    if (errorResponse) return errorResponse;

    await connectToDatabase();
    const body = await req.json();

    if (!body.name || !body.subject) {
      return NextResponse.json(
        { success: false, error: "Teacher name and primary subject are required." },
        { status: 400 }
      );
    }

    let empId = body.empId ? body.empId.trim().toUpperCase() : "";
    if (!empId) {
      const count = await Teacher.countDocuments();
      empId = `TCH-${String(count + 1).padStart(3, "0")}`;
    }

    const teacher = await Teacher.create({
      ...body,
      empId,
    });

    return NextResponse.json({ success: true, data: teacher }, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/teachers error:", err);
    return NextResponse.json({ success: false, error: "Failed to add teacher" }, { status: 500 });
  }
}
