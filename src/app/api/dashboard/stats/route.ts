import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb/connection";
import { Student } from "@/models/Student";
import { Teacher } from "@/models/Teacher";
import { Staff } from "@/models/Staff";
import { AcademicClass } from "@/models/AcademicClass";
import { Attendance } from "@/models/Attendance";
import { StudentFee } from "@/models/StudentFee";
import { Payment } from "@/models/Payment";
import { Exam } from "@/models/Exam";
import { Admission } from "@/models/Admission";
import { Notice } from "@/models/Notice";
import { requireAuth } from "@/lib/auth/jwt";

export async function GET(req: NextRequest) {
  try {
    const { errorResponse } = requireAuth(req);
    if (errorResponse) return errorResponse;

    await connectToDatabase();
    const today = new Date().toISOString().slice(0, 10);

    const [
      totalStudents,
      totalTeachers,
      totalStaff,
      totalClasses,
      todayAttendance,
      recentPayments,
      recentAdmissions,
      recentNotices,
      upcomingExams,
      feeInvoices,
    ] = await Promise.all([
      Student.countDocuments({ status: "Active" }),
      Teacher.countDocuments({ status: "Active" }),
      Staff.countDocuments({ status: "Active" }),
      AcademicClass.countDocuments(),
      Attendance.find({ date: today }),
      Payment.find().sort({ createdAt: -1 }).limit(5),
      Admission.find().sort({ createdAt: -1 }).limit(5),
      Notice.find({ published: true }).sort({ date: -1 }).limit(5),
      Exam.find({ startDate: { $gte: today } }).sort({ startDate: 1 }).limit(5),
      StudentFee.find(),
    ]);

    const totalInvoiced = feeInvoices.reduce((a, b) => a + Number(b.total || 0), 0);
    const totalCollected = feeInvoices.reduce((a, b) => a + Number(b.paid || 0), 0);
    const totalPending = Math.max(0, totalInvoiced - totalCollected);

    const presentCount = todayAttendance.filter((a) => a.status === "Present" || a.status === "Late").length;
    const attendancePct = totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0;

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalStudents,
          totalTeachers,
          totalStaff,
          totalClasses,
          todayAttendancePct: attendancePct,
          totalInvoiced,
          totalCollected,
          totalPending,
        },
        recentPayments,
        recentAdmissions,
        recentNotices,
        upcomingExams,
      },
    });
  } catch (err: any) {
    console.error("GET /api/dashboard/stats error:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch dashboard stats" }, { status: 500 });
  }
}
