import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb/connection";
import { Attendance } from "@/models/Attendance";
import { requireAuth } from "@/lib/auth/jwt";

export async function GET(req: NextRequest) {
  try {
    const { errorResponse } = requireAuth(req);
    if (errorResponse) return errorResponse;

    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date") || "";
    const className = searchParams.get("className") || "";
    const section = searchParams.get("section") || "";
    const studentId = searchParams.get("studentId") || "";
    const month = searchParams.get("month") || "";

    const query: any = {};
    if (date) query.date = date;
    if (className) query.className = className;
    if (section) query.section = section;
    if (studentId) query.studentId = studentId;
    if (month) query.date = { $regex: `^${month}` };

    const records = await Attendance.find(query).sort({ date: -1 });
    return NextResponse.json({ success: true, data: records });
  } catch (err: any) {
    console.error("GET /api/attendance error:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch attendance" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { errorResponse } = requireAuth(req, ["Admin", "Teacher", "Staff"]);
    if (errorResponse) return errorResponse;

    await connectToDatabase();
    const body = await req.json();

    // Support single record or array of records
    const records = Array.isArray(body) ? body : [body];

    const bulkOps = records.map((r: any) => ({
      updateOne: {
        filter: { studentId: r.studentId, date: r.date },
        update: {
          $set: {
            studentName: r.studentName || "",
            className: r.className,
            section: r.section,
            status: r.status || "Present",
            remarks: r.remarks || "",
          },
        },
        upsert: true,
      },
    }));

    if (bulkOps.length > 0) {
      await Attendance.bulkWrite(bulkOps);
    }

    return NextResponse.json({
      success: true,
      message: `Successfully marked attendance for ${records.length} records.`,
    });
  } catch (err: any) {
    console.error("POST /api/attendance error:", err);
    return NextResponse.json({ success: false, error: "Failed to save attendance" }, { status: 500 });
  }
}
