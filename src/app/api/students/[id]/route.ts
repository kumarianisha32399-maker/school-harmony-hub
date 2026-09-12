import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb/connection";
import { Student } from "@/models/Student";
import { Attendance } from "@/models/Attendance";
import { StudentFee } from "@/models/StudentFee";
import { Payment } from "@/models/Payment";
import { Mark } from "@/models/Mark";
import { Certificate } from "@/models/Certificate";
import { requireAuth } from "@/lib/auth/jwt";
import mongoose from "mongoose";

type RouteProps = {
  params: Promise<{ id: string }>;
};

export async function GET(req: NextRequest, { params }: RouteProps) {
  try {
    const { errorResponse } = requireAuth(req);
    if (errorResponse) return errorResponse;

    await connectToDatabase();
    const { id } = await params;

    let student = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      student = await Student.findById(id);
    }
    if (!student) {
      student = await Student.findOne({ $or: [{ admissionNo: id.toUpperCase() }, { _id: id }] });
    }

    if (!student) {
      return NextResponse.json({ success: false, error: "Student not found" }, { status: 404 });
    }

    const studentIdStr = student._id.toString();

    // Fetch related records
    const [attendance, fees, payments, marks, certificates] = await Promise.all([
      Attendance.find({ studentId: studentIdStr }).sort({ date: -1 }),
      StudentFee.find({ studentId: studentIdStr }).sort({ month: -1 }),
      Payment.find({ studentId: studentIdStr }).sort({ date: -1 }),
      Mark.find({ studentId: studentIdStr }),
      Certificate.find({ studentId: studentIdStr }).sort({ date: -1 }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        ...student.toObject(),
        attendance,
        fees,
        payments,
        marks,
        certificates,
      },
    });
  } catch (err: any) {
    console.error("GET /api/students/[id] error:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch student details" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: RouteProps) {
  try {
    const { errorResponse } = requireAuth(req, ["Admin", "Staff"]);
    if (errorResponse) return errorResponse;

    await connectToDatabase();
    const { id } = await params;
    const body = await req.json();

    let student = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      student = await Student.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    } else {
      student = await Student.findOneAndUpdate(
        { $or: [{ admissionNo: id.toUpperCase() }, { _id: id }] },
        body,
        { new: true, runValidators: true }
      );
    }

    if (!student) {
      return NextResponse.json({ success: false, error: "Student not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: student });
  } catch (err: any) {
    console.error("PUT /api/students/[id] error:", err);
    return NextResponse.json({ success: false, error: "Failed to update student" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteProps) {
  try {
    const { errorResponse } = requireAuth(req, ["Admin"]);
    if (errorResponse) return errorResponse;

    await connectToDatabase();
    const { id } = await params;

    let deleted = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      deleted = await Student.findByIdAndDelete(id);
    } else {
      deleted = await Student.findOneAndDelete({ $or: [{ admissionNo: id.toUpperCase() }, { _id: id }] });
    }

    if (!deleted) {
      return NextResponse.json({ success: false, error: "Student not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Student deleted successfully" });
  } catch (err: any) {
    console.error("DELETE /api/students/[id] error:", err);
    return NextResponse.json({ success: false, error: "Failed to delete student" }, { status: 500 });
  }
}
