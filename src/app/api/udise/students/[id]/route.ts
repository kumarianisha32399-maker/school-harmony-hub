import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb/connection";
import { UdiseStudent } from "@/models/UdiseStudent";
import { requireAuth } from "@/lib/auth/jwt";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { errorResponse } = requireAuth(req, ["Admin", "Staff"]);
    if (errorResponse) return errorResponse;

    const { id } = await params;
    await connectToDatabase();
    const body = await req.json();

    const updated = await UdiseStudent.findByIdAndUpdate(id, { $set: body }, { new: true });
    if (!updated) {
      return NextResponse.json({ success: false, error: "Record not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { errorResponse } = requireAuth(req, ["Admin", "Staff"]);
    if (errorResponse) return errorResponse;

    const { id } = await params;
    await connectToDatabase();
    const deleted = await UdiseStudent.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: "Record not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "UDISE record deleted" });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
