import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb/connection";
import { SchoolSettings } from "@/models/SchoolSettings";
import { requireAuth } from "@/lib/auth/jwt";

export async function GET() {
  try {
    await connectToDatabase();
    let settings = await SchoolSettings.findOne();
    if (!settings) {
      settings = await SchoolSettings.create({});
    }
    return NextResponse.json({ success: true, data: settings });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { errorResponse } = requireAuth(req, ["Admin"]);
    if (errorResponse) return errorResponse;

    await connectToDatabase();
    const body = await req.json();

    let settings = await SchoolSettings.findOne();
    if (settings) {
      Object.assign(settings, body);
      await settings.save();
    } else {
      settings = await SchoolSettings.create(body);
    }

    return NextResponse.json({ success: true, data: settings });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: "Failed to update settings" }, { status: 500 });
  }
}
