import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb/connection";
import { StudentFee } from "@/models/StudentFee";
import { requireAuth } from "@/lib/auth/jwt";

type RouteProps = {
  params: Promise<{ id: string }>;
};

export async function GET(req: NextRequest, { params }: RouteProps) {
  try {
    const { errorResponse } = requireAuth(req, ["Admin", "Accountant"]);
    if (errorResponse) return errorResponse;

    await connectToDatabase();
    const { id } = await params;

    const fee = await StudentFee.findById(id);
    if (!fee) {
      return NextResponse.json({ success: false, error: "Fee invoice not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: fee });
  } catch (err: any) {
    console.error("GET /api/fees/[id] error:", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: RouteProps) {
  try {
    const { errorResponse } = requireAuth(req, ["Admin", "Accountant"]);
    if (errorResponse) return errorResponse;

    await connectToDatabase();
    const { id } = await params;
    const body = await req.json();

    const fee = await StudentFee.findByIdAndUpdate(id, body, { new: true });
    if (!fee) {
      return NextResponse.json({ success: false, error: "Fee invoice not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: fee });
  } catch (err: any) {
    console.error("PUT /api/fees/[id] error:", err);
    return NextResponse.json({ success: false, error: "Failed to update fee invoice" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteProps) {
  try {
    const { errorResponse } = requireAuth(req, ["Admin"]);
    if (errorResponse) return errorResponse;

    await connectToDatabase();
    const { id } = await params;

    const fee = await StudentFee.findByIdAndDelete(id);
    if (!fee) {
      return NextResponse.json({ success: false, error: "Fee invoice not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Fee invoice deleted successfully" });
  } catch (err: any) {
    console.error("DELETE /api/fees/[id] error:", err);
    return NextResponse.json({ success: false, error: "Failed to delete invoice" }, { status: 500 });
  }
}
