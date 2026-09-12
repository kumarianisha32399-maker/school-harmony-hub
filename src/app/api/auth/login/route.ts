import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb/connection";
import { User } from "@/models/User";
import { comparePassword, hashPassword, signToken } from "@/lib/auth/jwt";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const { username, password, role } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: "Username and password are required." },
        { status: 400 }
      );
    }

    const cleanUsername = username.trim().toLowerCase();
    let user = await User.findOne({
      $or: [{ username: cleanUsername }, { email: cleanUsername }],
    });

    // Auto-create initial admin user if database has no users at all
    if (!user && (cleanUsername === "admin" || cleanUsername === "admin@harmonyschool.edu.in")) {
      const userCount = await User.countDocuments();
      if (userCount === 0) {
        const hashedPassword = await hashPassword("admin123");
        user = await User.create({
          name: "Dr. Neelam Saxena (Admin)",
          username: "admin",
          email: "admin@harmonyschool.edu.in",
          password: hashedPassword,
          role: "Admin",
        });
      }
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid username or password." },
        { status: 401 }
      );
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: "Invalid username or password." },
        { status: 401 }
      );
    }

    if (role && user.role !== role) {
      return NextResponse.json(
        { success: false, error: `These credentials belong to the ${user.role} role.` },
        { status: 403 }
      );
    }

    const authUser = {
      id: user._id.toString(),
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    const token = signToken(authUser);

    const response = NextResponse.json({
      success: true,
      user: authUser,
      token,
    });

    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (err: any) {
    console.error("Login API Error:", err);
    return NextResponse.json(
      { success: false, error: "Authentication failed. Please try again." },
      { status: 500 }
    );
  }
}
