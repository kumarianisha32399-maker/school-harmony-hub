import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb/connection";
import {
  User,
  Student,
  Teacher,
  Staff,
  AcademicClass,
  Subject,
  FeeStructure,
  StudentFee,
  Payment,
  Attendance,
  Exam,
  Mark,
  Notice,
  Timetable,
  SchoolSettings,
} from "@/models";
import { hashPassword, getAuthSession } from "@/lib/auth/jwt";
import {
  buildStudents,
  buildTeachers,
  buildStaff,
  buildFees,
  buildAttendance,
  buildExams,
  buildMarks,
  buildNotices,
  buildTimetable,
  CLASSES,
  SECTIONS,
  SUBJECTS,
  DEFAULT_SETTINGS,
  USERS,
} from "@/data/seed";

export async function POST(req: NextRequest) {
  try {
    const isDev = process.env.NODE_ENV === "development";
    const session = getAuthSession(req);

    // CRITICAL CORRECTION #3: Security enforcement
    // Allow seed ONLY if in development OR if called by an authenticated Admin
    if (!isDev && (!session || session.role !== "Admin")) {
      return NextResponse.json(
        {
          success: false,
          error: "Forbidden: Seeding is restricted to development environment or authorized Admin.",
        },
        { status: 403 }
      );
    }

    await connectToDatabase();

    // 1. Seed Users (with hashed passwords)
    for (const u of USERS) {
      const existing = await User.findOne({ username: u.username });
      if (!existing) {
        const hashedPassword = await hashPassword(u.password);
        await User.create({
          name: u.name,
          username: u.username,
          email: u.email,
          password: hashedPassword,
          role: u.role as any,
        });
      }
    }

    // 2. Seed Academic Classes & Sections
    for (let i = 0; i < CLASSES.length; i++) {
      const clsName = CLASSES[i];
      await AcademicClass.findOneAndUpdate(
        { name: clsName },
        { name: clsName, order: i + 1, sections: SECTIONS },
        { upsert: true }
      );
    }

    // 3. Seed Subjects
    for (const s of SUBJECTS) {
      await Subject.findOneAndUpdate(
        { code: s.code },
        { name: s.name, code: s.code, type: "Theory" },
        { upsert: true }
      );
    }

    // 4. Seed School Settings
    const existingSettings = await SchoolSettings.findOne();
    if (!existingSettings) {
      await SchoolSettings.create(DEFAULT_SETTINGS);
    }

    // 5. Seed Students (if empty)
    const studentCount = await Student.countDocuments();
    let seededStudents: any[] = [];
    if (studentCount === 0) {
      const demoStudents = buildStudents();
      seededStudents = await Student.insertMany(demoStudents as any);
    } else {
      seededStudents = await Student.find().limit(24);
    }

    // 6. Seed Teachers
    const teacherCount = await Teacher.countDocuments();
    if (teacherCount === 0) {
      const demoTeachers = buildTeachers().map((t) => ({
        ...t,
        empId: t.id ? t.id.replace("tch-", "TCH-00") : `TCH-${Math.floor(100 + Math.random() * 900)}`,
      }));
      await Teacher.insertMany(demoTeachers as any);
    }

    // 7. Seed Staff
    const staffCount = await Staff.countDocuments();
    if (staffCount === 0) {
      const demoStaff = buildStaff().map((st) => ({
        ...st,
        empId: st.id ? st.id.replace("stf-", "STF-00") : `STF-${Math.floor(100 + Math.random() * 900)}`,
      }));
      await Staff.insertMany(demoStaff as any);
    }

    // 8. Seed Fees & Invoices
    const feeCount = await StudentFee.countDocuments();
    if (feeCount === 0 && seededStudents.length > 0) {
      const { invoices, payments } = buildFees(seededStudents as any);
      if (invoices.length > 0) {
        await StudentFee.insertMany(
          invoices.map((inv) => ({
            invoiceNo: inv.invoiceNo || `INV-2025-${Math.floor(10000 + Math.random() * 90000)}`,
            studentId: inv.studentId,
            studentName: inv.studentName || "",
            className: inv.className || "",
            section: inv.section || "A",
            admissionNo: inv.admissionNo || "",
            month: inv.month,
            session: inv.session || "2025-26",
            items: inv.items || [{ head: "Tuition Fee", amount: 2500 }],
            lateFee: inv.lateFee || 0,
            discount: inv.discount || 0,
            total: inv.total || 2500,
            paid: inv.paid || 0,
            pending: inv.pending || 0,
            status: inv.status || "Pending",
            dueDate: inv.dueDate || "2025-05-15",
          }))
        );
      }

      if (payments.length > 0) {
        await Payment.insertMany(
          payments.map((p) => ({
            receiptNo: p.receiptNo || `REC-2025-${Math.floor(10000 + Math.random() * 90000)}`,
            invoiceId: p.invoiceId || "",
            studentId: p.studentId,
            amount: p.amount,
            date: p.date,
            mode: p.mode || "Cash",
            status: "Success",
            collectedBy: "Admin",
          }))
        );
      }
    }

    // 9. Seed Attendance
    const attCount = await Attendance.countDocuments();
    if (attCount === 0 && seededStudents.length > 0) {
      const demoAtt = buildAttendance(seededStudents as any);
      if (demoAtt.length > 0) {
        await Attendance.insertMany(demoAtt as any, { ordered: false }).catch(() => {});
      }
    }

    // 10. Seed Exams & Marks
    const examCount = await Exam.countDocuments();
    if (examCount === 0) {
      const demoExams = buildExams();
      await Exam.insertMany(demoExams as any);
    }

    const marksCount = await Mark.countDocuments();
    if (marksCount === 0 && seededStudents.length > 0) {
      const demoMarks = buildMarks(seededStudents as any);
      if (demoMarks.length > 0) {
        await Mark.insertMany(demoMarks as any, { ordered: false }).catch(() => {});
      }
    }

    // 11. Seed Notices
    const noticeCount = await Notice.countDocuments();
    if (noticeCount === 0) {
      const demoNotices = buildNotices();
      await Notice.insertMany(demoNotices as any);
    }

    // 12. Seed Timetable
    const ttCount = await Timetable.countDocuments();
    if (ttCount === 0) {
      const demoTt = buildTimetable();
      await Timetable.insertMany(demoTt as any);
    }

    return NextResponse.json({
      success: true,
      message: "MongoDB database successfully seeded with initial verified ERP records.",
    });
  } catch (err: any) {
    console.error("Database seed error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to seed database." },
      { status: 500 }
    );
  }
}
