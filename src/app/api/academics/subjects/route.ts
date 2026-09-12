import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb/connection";
import { Subject } from "@/models/Subject";
import { requireAuth } from "@/lib/auth/jwt";

export async function GET() {
  try {
    await connectToDatabase();
    const subjects = await Subject.find().sort({ name: 1 });
    return NextResponse.json({ success: true, data: subjects });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: "Failed to fetch subjects" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { errorResponse } = requireAuth(req, ["Admin", "Teacher"]);
    if (errorResponse) return errorResponse;

    await connectToDatabase();
    const body = await req.json();

    if (!body.name || !body.code) {
      return NextResponse.json({ success: false, error: "Subject name and code are required." }, { status: 400 });
    }

    const sub = await Subject.findOneAndUpdate(
      { code: body.code.trim().toUpperCase() },
      { ...body, name: body.name.trim(), code: body.code.trim().toUpperCase() },
      { new: true, upsert: true }
    );

    return NextResponse.json({ success: true, data: sub });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: "Failed to save subject" }, { status: 500 });
  }
}
