import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb/connection";
import { Staff } from "@/models/Staff";
import { requireAuth } from "@/lib/auth/jwt";

type RouteProps = {
  params: Promise<{ id: string }>;
};

export async function GET(req: NextRequest, { params }: RouteProps) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const staff = await Staff.findById(id);
    if (!staff) return NextResponse.json({ success: false, error: "Staff not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: staff });
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

    const staff = await Staff.findByIdAndUpdate(id, body, { new: true });
    if (!staff) return NextResponse.json({ success: false, error: "Staff not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: staff });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: "Failed to update staff" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteProps) {
  try {
    const { errorResponse } = requireAuth(req, ["Admin"]);
    if (errorResponse) return errorResponse;

    await connectToDatabase();
    const { id } = await params;

    const staff = await Staff.findByIdAndDelete(id);
    if (!staff) return NextResponse.json({ success: false, error: "Staff not found" }, { status: 404 });
    return NextResponse.json({ success: true, message: "Staff deleted successfully" });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: "Failed to delete staff" }, { status: 500 });
  }
}
