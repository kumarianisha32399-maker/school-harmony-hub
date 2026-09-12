import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb/connection";
import { TeacherAttendance } from "@/models/TeacherAttendance";
import { requireAuth } from "@/lib/auth/jwt";

export async function GET(req: NextRequest) {
  try {
    const { errorResponse } = requireAuth(req, ["Admin"]);
    if (errorResponse) return errorResponse;

    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date") || "";
    const teacherId = searchParams.get("teacherId") || "";

    const query: any = {};
    if (date) query.date = date;
    if (teacherId) query.teacherId = teacherId;

    const records = await TeacherAttendance.find(query).sort({ date: -1 });
    return NextResponse.json({ success: true, data: records });
  } catch (err: any) {
    console.error("GET /api/attendance/teacher error:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch teacher attendance" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { errorResponse } = requireAuth(req, ["Admin"]);
    if (errorResponse) return errorResponse;

    await connectToDatabase();
    const body = await req.json();
    const records = Array.isArray(body) ? body : [body];

    const bulkOps = records.map((r: any) => ({
      updateOne: {
        filter: { teacherId: r.teacherId, date: r.date },
        update: {
          $set: {
            teacherName: r.teacherName || "",
            status: r.status || "Present",
            remarks: r.remarks || "",
          },
        },
        upsert: true,
      },
    }));

    if (bulkOps.length > 0) {
      await TeacherAttendance.bulkWrite(bulkOps);
    }

    return NextResponse.json({ success: true, message: "Teacher attendance recorded." });
  } catch (err: any) {
    console.error("POST /api/attendance/teacher error:", err);
    return NextResponse.json({ success: false, error: "Failed to save teacher attendance" }, { status: 500 });
  }
}
