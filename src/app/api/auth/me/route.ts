import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth/jwt";
import { connectToDatabase } from "@/lib/mongodb/connection";
import { User } from "@/models/User";

export async function GET(req: NextRequest) {
  try {
    const session = getAuthSession(req);
    if (!session) {
      return NextResponse.json({ success: false, user: null }, { status: 401 });
    }

    await connectToDatabase();
    const user = await User.findById(session.id).select("-password");
    if (!user) {
      return NextResponse.json({ success: false, user: null }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err: any) {
    console.error("Auth me error:", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
