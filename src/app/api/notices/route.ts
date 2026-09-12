import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb/connection";
import { Notice } from "@/models/Notice";
import { requireAuth } from "@/lib/auth/jwt";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const audience = searchParams.get("audience") || "";

    const query: any = { published: true };
    if (audience && audience !== "All") {
      query.audience = { $in: [audience, "All"] };
    }

    const notices = await Notice.find(query).sort({ date: -1, createdAt: -1 });
    return NextResponse.json({ success: true, data: notices });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: "Failed to fetch notices" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, errorResponse } = requireAuth(req, ["Admin", "Teacher", "Staff"]);
    if (errorResponse) return errorResponse;

    await connectToDatabase();
    const body = await req.json();

    if (!body.title || !body.description) {
      return NextResponse.json({ success: false, error: "Title and description are required." }, { status: 400 });
    }

    const notice = await Notice.create({
      ...body,
      createdBy: user?.name || "Admin",
    });

    return NextResponse.json({ success: true, data: notice }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: "Failed to publish notice" }, { status: 500 });
  }
}
