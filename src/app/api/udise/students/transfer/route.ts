import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb/connection";
import { UdiseStudent } from "@/models/UdiseStudent";
import { Student } from "@/models/Student";
import { requireAuth } from "@/lib/auth/jwt";

export async function POST(req: NextRequest) {
  try {
    const { errorResponse } = requireAuth(req, ["Admin", "Staff"]);
    if (errorResponse) return errorResponse;

    await connectToDatabase();
    const body = await req.json().catch(() => ({}));
    const ids: string[] = body.ids || [];

    // Query unimported records (either specific ids or all unimported)
    let query: Record<string, any> = {};
    if (ids.length > 0) {
      query = { _id: { $in: ids } };
    } else {
      query = { importedToStudents: false };
    }

    const udiseList = await UdiseStudent.find(query);

    if (!udiseList.length) {
      return NextResponse.json({
        success: true,
        count: 0,
        message: "No pending UDISE records found to import.",
        data: [],
      });
    }

    const currentYear = new Date().getFullYear();
    let totalCount = await Student.countDocuments();
    const transferredStudents: any[] = [];
    const transferredIds: any[] = [];

    for (const item of udiseList) {
      let admissionNo = item.admissionNo?.trim() || "";
      if (!admissionNo) {
        totalCount++;
        admissionNo = `ADM${currentYear}${String(totalCount).padStart(4, "0")}`;
      }

      const studentData: Record<string, any> = {
        admissionNo,
        name: item.name,
        className: item.className,
        section: item.section || "A",
        gender: item.gender || "Male",
        penNo: item.penNo || "",
        studentStateCode: item.studentStateCode || "",
        dob: item.dob || "",
        father: item.father || "",
        mother: item.mother || "",
        category: item.socialCategory || "General",
        socialCategory: item.socialCategory || "General",
        minorityGroup: item.minorityGroup || "None",
        bplBeneficiary: item.bplBeneficiary || "No",
        cwsn: item.cwsn || "No",
        isRepeater: item.isRepeater || "No",
        entryStatus: item.entryStatus || "Regular",
        aadhaarNo: item.aadhaarNo || "",
        nameAsPerAadhaar: item.nameAsPerAadhaar || "",
        aadhaarValidationStatus: item.aadhaarValidationStatus || "Pending",
        mobile: item.mobile || "",
        email: item.email || "",
        address: item.address || "",
        city: item.city || "Indore",
        state: item.state || "Madhya Pradesh",
        pin: item.pin || "",
        rollNo: item.rollNo || 0,
        admissionDate: new Date().toISOString().slice(0, 10),
        session: `${currentYear}-${String(currentYear + 1).slice(-2)}`,
        status: "Active",
      };

      // Upsert into main Student collection
      const existing = await Student.findOne({ admissionNo });
      let studentDoc;
      if (existing) {
        studentDoc = await Student.findByIdAndUpdate(
          existing._id,
          { $set: studentData },
          { new: true }
        );
      } else {
        studentDoc = await Student.create(studentData);
      }

      transferredStudents.push(studentDoc);
      transferredIds.push(item._id);
    }

    // Mark UDISE records as imported
    await UdiseStudent.updateMany(
      { _id: { $in: transferredIds } },
      {
        $set: {
          importedToStudents: true,
          importedToStudentsAt: new Date(),
        },
      }
    );

    return NextResponse.json({
      success: true,
      count: transferredStudents.length,
      data: transferredStudents,
      message: `Successfully imported ${transferredStudents.length} student(s) into Student List.`,
    });
  } catch (err: any) {
    console.error("POST /api/udise/students/transfer error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to transfer UDISE records into Student List." },
      { status: 500 }
    );
  }
}
