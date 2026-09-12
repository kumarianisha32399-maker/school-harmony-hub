import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb/connection";
import { Exam } from "@/models/Exam";
import { Mark } from "@/models/Mark";
import { requireAuth } from "@/lib/auth/jwt";

type RouteProps = {
  params: Promise<{ id: string }>;
};

export async function GET(req: NextRequest, { params }: RouteProps) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const exam = await Exam.findById(id);
    if (!exam) return NextResponse.json({ success: false, error: "Exam not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: exam });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: RouteProps) {
  try {
    const { errorResponse } = requireAuth(req, ["Admin", "Teacher"]);
    if (errorResponse) return errorResponse;

    await connectToDatabase();
    const { id } = await params;
    const body = await req.json();

    const exam = await Exam.findByIdAndUpdate(id, body, { new: true });
    if (!exam) return NextResponse.json({ success: false, error: "Exam not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: exam });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: "Failed to update exam" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteProps) {
  try {
    const { errorResponse } = requireAuth(req, ["Admin"]);
    if (errorResponse) return errorResponse;

    await connectToDatabase();
    const { id } = await params;

    await Promise.all([Exam.findByIdAndDelete(id), Mark.deleteMany({ examId: id })]);
    return NextResponse.json({ success: true, message: "Exam and associated marks deleted." });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: "Failed to delete exam" }, { status: 500 });
  }
}
