import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb/connection";
import { FeeStructure } from "@/models/FeeStructure";
import { requireAuth } from "@/lib/auth/jwt";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const structures = await FeeStructure.find().sort({ className: 1 });
    return NextResponse.json({ success: true, data: structures });
  } catch (err: any) {
    console.error("GET /api/fees/structures error:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch fee structures" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { errorResponse } = requireAuth(req, ["Admin", "Accountant"]);
    if (errorResponse) return errorResponse;

    await connectToDatabase();
    const body = await req.json();

    if (!body.className || !body.heads) {
      return NextResponse.json(
        { success: false, error: "Class name and fee heads are required." },
        { status: 400 }
      );
    }

    const totalAnnual = (body.heads || []).reduce((a: number, b: any) => a + Number(b.amount || 0), 0);

    const structure = await FeeStructure.findOneAndUpdate(
      { className: body.className, session: body.session || "2025-26" },
      { ...body, totalAnnual },
      { new: true, upsert: true }
    );

    return NextResponse.json({ success: true, data: structure });
  } catch (err: any) {
    console.error("POST /api/fees/structures error:", err);
    return NextResponse.json({ success: false, error: "Failed to save fee structure" }, { status: 500 });
  }
}
