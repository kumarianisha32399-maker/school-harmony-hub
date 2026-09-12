import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb/connection";
import { Admission } from "@/models/Admission";
import { Student } from "@/models/Student";
import { requireAuth } from "@/lib/auth/jwt";

type RouteProps = {
  params: Promise<{ id: string }>;
};

export async function POST(req: NextRequest, { params }: RouteProps) {
  try {
    const { errorResponse } = requireAuth(req, ["Admin", "Staff"]);
    if (errorResponse) return errorResponse;

    await connectToDatabase();
    const { id } = await params;

    const admission = await Admission.findById(id);
    if (!admission) {
      return NextResponse.json({ success: false, error: "Admission record not found" }, { status: 404 });
    }

    if (admission.status === "Approved") {
      return NextResponse.json(
        { success: false, error: "This admission has already been approved and converted to a student." },
        { status: 400 }
      );
    }

    const count = await Student.countDocuments();
    const admissionNo = `HPS-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;

    const student = await Student.create({
      admissionNo,
      name: admission.name,
      father: admission.father,
      mother: admission.mother,
      dob: admission.dob,
      gender: admission.gender,
      mobile: admission.mobile,
      email: admission.email,
      address: admission.address,
      className: admission.applyingClass,
      section: "A",
      rollNo: count + 1,
      admissionDate: admission.date,
      session: admission.session,
      previousSchool: admission.previousSchool,
      status: "Active",
    });

    admission.status = "Approved";
    await admission.save();

    return NextResponse.json({
      success: true,
      message: `Admission converted to Student successfully with Admission No ${admissionNo}`,
      data: student,
    });
  } catch (err: any) {
    console.error("POST /api/admissions/[id]/convert error:", err);
    return NextResponse.json({ success: false, error: "Failed to convert admission" }, { status: 500 });
  }
}
