import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb/connection";
import { Mark } from "@/models/Mark";
import { Student } from "@/models/Student";
import { requireAuth } from "@/lib/auth/jwt";

function calculateGrade(pct: number) {
  if (pct >= 91) return "A1";
  if (pct >= 81) return "A2";
  if (pct >= 71) return "B1";
  if (pct >= 61) return "B2";
  if (pct >= 51) return "C1";
  if (pct >= 41) return "C2";
  if (pct >= 33) return "D";
  return "E";
}

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const examId = searchParams.get("examId") || "";
    const studentId = searchParams.get("studentId") || "";

    const query: any = {};
    if (examId) query.examId = examId;
    if (studentId) query.studentId = studentId;

    const marks = await Mark.find(query);
    return NextResponse.json({ success: true, data: marks });
  } catch (err: any) {
    console.error("GET /api/marks error:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch marks" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { errorResponse } = requireAuth(req, ["Admin", "Teacher"]);
    if (errorResponse) return errorResponse;

    await connectToDatabase();
    const body = await req.json();

    const items = Array.isArray(body) ? body : [body];

    const bulkOps = await Promise.all(
      items.map(async (m: any) => {
        const student = await Student.findById(m.studentId);
        const maxMarks = Number(m.maxMarks) || 100;
        const obtainedMarks = Number(m.obtainedMarks) || 0;
        const pct = maxMarks > 0 ? (obtainedMarks / maxMarks) * 100 : 0;
        const grade = m.grade || calculateGrade(pct);

        return {
          updateOne: {
            filter: {
              examId: m.examId,
              studentId: m.studentId,
              subject: m.subject,
            },
            update: {
              $set: {
                studentName: student?.name || m.studentName || "",
                className: student?.className || m.className || "",
                maxMarks,
                obtainedMarks,
                grade,
              },
            },
            upsert: true,
          },
        };
      })
    );

    if (bulkOps.length > 0) {
      await Mark.bulkWrite(bulkOps);
    }

    return NextResponse.json({
      success: true,
      message: `Marks recorded for ${items.length} records.`,
    });
  } catch (err: any) {
    console.error("POST /api/marks error:", err);
    return NextResponse.json({ success: false, error: "Failed to record marks" }, { status: 500 });
  }
}
