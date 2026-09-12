import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb/connection";
import { Timetable } from "@/models/Timetable";
import { requireAuth } from "@/lib/auth/jwt";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const className = searchParams.get("className") || "";
    const section = searchParams.get("section") || "";
    const day = searchParams.get("day") || "";

    const query: any = {};
    if (className) query.className = className;
    if (section) query.section = section;
    if (day) query.day = day;

    const rows = await Timetable.find(query).sort({ day: 1, period: 1 });
    return NextResponse.json({ success: true, data: rows });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: "Failed to fetch timetable" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { errorResponse } = requireAuth(req, ["Admin", "Teacher"]);
    if (errorResponse) return errorResponse;

    await connectToDatabase();
    const body = await req.json();

    const items = Array.isArray(body) ? body : [body];

    const bulkOps = items.map((t: any) => ({
      updateOne: {
        filter: {
          className: t.className,
          section: t.section,
          day: t.day,
          period: Number(t.period),
        },
        update: {
          $set: {
            subject: t.subject,
            teacher: t.teacher || "",
            startTime: t.startTime || "09:00",
            endTime: t.endTime || "09:45",
          },
        },
        upsert: true,
      },
    }));

    if (bulkOps.length > 0) {
      await Timetable.bulkWrite(bulkOps);
    }

    return NextResponse.json({ success: true, message: "Timetable updated." });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: "Failed to save timetable" }, { status: 500 });
  }
}
