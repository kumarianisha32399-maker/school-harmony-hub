import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb/connection";
import { Admission } from "@/models/Admission";
import { requireAuth } from "@/lib/auth/jwt";

type RouteProps = {
  params: Promise<{ id: string }>;
};

export async function GET(req: NextRequest, { params }: RouteProps) {
  try {
    const { errorResponse } = requireAuth(req, ["Admin", "Staff"]);
    if (errorResponse) return errorResponse;

    await connectToDatabase();
    const { id } = await params;

    const admission = await Admission.findById(id);
    if (!admission) {
      return NextResponse.json({ success: false, error: "Admission record not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: admission });
  } catch (err: any) {
    console.error("GET /api/admissions/[id] error:", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: RouteProps) {
  try {
    const { errorResponse } = requireAuth(req, ["Admin", "Staff"]);
    if (errorResponse) return errorResponse;

    await connectToDatabase();
    const { id } = await params;
    const body = await req.json();

    const admission = await Admission.findByIdAndUpdate(id, body, { new: true });
    if (!admission) {
      return NextResponse.json({ success: false, error: "Admission not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: admission });
  } catch (err: any) {
    console.error("PUT /api/admissions/[id] error:", err);
    return NextResponse.json({ success: false, error: "Failed to update admission" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteProps) {
  try {
    const { errorResponse } = requireAuth(req, ["Admin"]);
    if (errorResponse) return errorResponse;

    await connectToDatabase();
    const { id } = await params;

    const admission = await Admission.findByIdAndDelete(id);
    if (!admission) {
      return NextResponse.json({ success: false, error: "Admission not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Admission deleted successfully" });
  } catch (err: any) {
    console.error("DELETE /api/admissions/[id] error:", err);
    return NextResponse.json({ success: false, error: "Failed to delete admission" }, { status: 500 });
  }
}
