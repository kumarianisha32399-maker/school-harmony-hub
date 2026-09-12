import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { connectToDatabase } from "@/lib/mongodb/connection";
import { User } from "@/models/User";
import { sendEmail, passwordResetEmailTemplate } from "@/lib/smtp";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Please enter your registered email address." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      // Return success response to avoid revealing user registration details
      return NextResponse.json({
        success: true,
        message: "If your email is registered with us, you will receive a password reset link shortly.",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    const origin = req.headers.get("origin") || req.nextUrl.origin || "http://localhost:3000";
    const resetUrl = `${origin}/reset-password?token=${resetToken}&email=${encodeURIComponent(user.email)}`;

    const html = passwordResetEmailTemplate(resetUrl, user.name);
    await sendEmail({
      to: user.email,
      subject: "Password Reset Request — Harmony School ERP",
      html,
    });

    return NextResponse.json({
      success: true,
      message: "If your email is registered with us, you will receive a password reset link shortly.",
    });
  } catch (err: any) {
    console.error("Forgot password API error:", err);
    return NextResponse.json(
      { success: false, error: "Unable to send password reset email. Please try again." },
      { status: 500 }
    );
  }
}
