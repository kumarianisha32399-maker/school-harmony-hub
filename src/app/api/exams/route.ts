import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb/connection";
import { Exam } from "@/models/Exam";
import { requireAuth } from "@/lib/auth/jwt";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const className = searchParams.get("className") || "";
    const session = searchParams.get("session") || "";

    const query: any = {};
    if (className) query.className = className;
    if (session) query.session = session;

    const exams = await Exam.find(query).sort({ startDate: -1 });
    return NextResponse.json({ success: true, data: exams });
  } catch (err: any) {
    console.error("GET /api/exams error:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch exams" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { errorResponse } = requireAuth(req, ["Admin", "Teacher"]);
    if (errorResponse) return errorResponse;

    await connectToDatabase();
    const body = await req.json();

    if (!body.name || !body.className) {
      return NextResponse.json(
        { success: false, error: "Exam name and class name are required." },
        { status: 400 }
      );
    }

    const exam = await Exam.create(body);
    return NextResponse.json({ success: true, data: exam }, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/exams error:", err);
    return NextResponse.json({ success: false, error: "Failed to create exam" }, { status: 500 });
  }
}
