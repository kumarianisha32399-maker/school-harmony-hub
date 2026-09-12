import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb/connection";
import { AcademicClass } from "@/models/AcademicClass";
import { requireAuth } from "@/lib/auth/jwt";

export async function GET() {
  try {
    await connectToDatabase();
    const classes = await AcademicClass.find().sort({ order: 1, name: 1 });
    return NextResponse.json({ success: true, data: classes });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: "Failed to fetch classes" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { errorResponse } = requireAuth(req, ["Admin"]);
    if (errorResponse) return errorResponse;

    await connectToDatabase();
    const body = await req.json();

    if (!body.name) {
      return NextResponse.json({ success: false, error: "Class name is required." }, { status: 400 });
    }

    const cls = await AcademicClass.findOneAndUpdate(
      { name: body.name.trim() },
      { ...body, name: body.name.trim() },
      { new: true, upsert: true }
    );

    return NextResponse.json({ success: true, data: cls });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: "Failed to save class" }, { status: 500 });
  }
}
