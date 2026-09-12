import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

const JWT_SECRET = process.env.AUTH_SECRET || process.env.JWT_SECRET || "harmony_school_jwt_secret_production_key_2025";
const JWT_EXPIRES_IN = "7d";

export type AuthUser = {
  id: string;
  name: string;
  username: string;
  email: string;
  role: "Admin" | "Teacher" | "Accountant" | "Staff";
};

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: AuthUser): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): AuthUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthUser;
  } catch {
    return null;
  }
}

export function getAuthSession(req: NextRequest): AuthUser | null {
  const authHeader = req.headers.get("authorization");
  let token = "";

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else {
    token = req.cookies.get("auth_token")?.value || "";
  }

  if (!token) return null;
  return verifyToken(token);
}

export function requireAuth(
  req: NextRequest,
  allowedRoles?: Array<"Admin" | "Teacher" | "Accountant" | "Staff">
): { user: AuthUser | null; errorResponse: NextResponse | null } {
  const user = getAuthSession(req);

  if (!user) {
    return {
      user: null,
      errorResponse: NextResponse.json(
        { success: false, error: "Unauthorized access. Please log in." },
        { status: 401 }
      ),
    };
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return {
      user: null,
      errorResponse: NextResponse.json(
        { success: false, error: `Access forbidden for role: ${user.role}` },
        { status: 403 }
      ),
    };
  }

  return { user, errorResponse: null };
}
