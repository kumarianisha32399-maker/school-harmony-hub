import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb/connection";
import { Admission } from "@/models/Admission";
import { requireAuth } from "@/lib/auth/jwt";

export async function GET(req: NextRequest) {
  try {
    const { errorResponse } = requireAuth(req, ["Admin", "Staff"]);
    if (errorResponse) return errorResponse;

    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";

    const query: any = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { regNo: { $regex: search, $options: "i" } },
        { mobile: { $regex: search, $options: "i" } },
      ];
    }

    const admissions = await Admission.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: admissions });
  } catch (err: any) {
    console.error("GET /api/admissions error:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch admissions" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();

    if (!body.name || !body.applyingClass) {
      return NextResponse.json(
        { success: false, error: "Applicant name and applying class are required." },
        { status: 400 }
      );
    }

    let regNo = body.regNo ? body.regNo.trim().toUpperCase() : "";
    if (!regNo) {
      const count = await Admission.countDocuments();
      regNo = `REG-${new Date().getFullYear()}-${5000 + count + 1}`;
    }

    const admission = await Admission.create({
      ...body,
      regNo,
      status: body.status || "Pending",
      fee: Number(body.fee) || 5000,
    });

    return NextResponse.json({ success: true, data: admission }, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/admissions error:", err);
    return NextResponse.json({ success: false, error: err.message || "Failed to create admission" }, { status: 500 });
  }
}
