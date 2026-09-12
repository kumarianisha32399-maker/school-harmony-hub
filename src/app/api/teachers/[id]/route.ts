import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb/connection";
import { Teacher } from "@/models/Teacher";
import { requireAuth } from "@/lib/auth/jwt";

type RouteProps = {
  params: Promise<{ id: string }>;
};

export async function GET(req: NextRequest, { params }: RouteProps) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const teacher = await Teacher.findById(id);
    if (!teacher) return NextResponse.json({ success: false, error: "Teacher not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: teacher });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: RouteProps) {
  try {
    const { errorResponse } = requireAuth(req, ["Admin"]);
    if (errorResponse) return errorResponse;

    await connectToDatabase();
    const { id } = await params;
    const body = await req.json();

    const teacher = await Teacher.findByIdAndUpdate(id, body, { new: true });
    if (!teacher) return NextResponse.json({ success: false, error: "Teacher not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: teacher });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: "Failed to update teacher" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteProps) {
  try {
    const { errorResponse } = requireAuth(req, ["Admin"]);
    if (errorResponse) return errorResponse;

    await connectToDatabase();
    const { id } = await params;

    const teacher = await Teacher.findByIdAndDelete(id);
    if (!teacher) return NextResponse.json({ success: false, error: "Teacher not found" }, { status: 404 });
    return NextResponse.json({ success: true, message: "Teacher deleted successfully" });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: "Failed to delete teacher" }, { status: 500 });
  }
}
