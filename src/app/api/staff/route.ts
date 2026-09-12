import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb/connection";
import { Staff } from "@/models/Staff";
import { requireAuth } from "@/lib/auth/jwt";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";

    const query: any = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { empId: { $regex: search, $options: "i" } },
        { designation: { $regex: search, $options: "i" } },
        { department: { $regex: search, $options: "i" } },
      ];
    }

    const staff = await Staff.find(query).sort({ name: 1 });
    return NextResponse.json({ success: true, data: staff });
  } catch (err: any) {
    console.error("GET /api/staff error:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch staff" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { errorResponse } = requireAuth(req, ["Admin"]);
    if (errorResponse) return errorResponse;

    await connectToDatabase();
    const body = await req.json();

    if (!body.name) {
      return NextResponse.json({ success: false, error: "Staff member name is required." }, { status: 400 });
    }

    let empId = body.empId ? body.empId.trim().toUpperCase() : "";
    if (!empId) {
      const count = await Staff.countDocuments();
      empId = `STF-${String(count + 1).padStart(3, "0")}`;
    }

    const member = await Staff.create({ ...body, empId });
    return NextResponse.json({ success: true, data: member }, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/staff error:", err);
    return NextResponse.json({ success: false, error: "Failed to add staff" }, { status: 500 });
  }
}
