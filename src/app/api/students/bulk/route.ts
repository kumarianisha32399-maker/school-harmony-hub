import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb/connection";
import { Student } from "@/models/Student";
import { requireAuth } from "@/lib/auth/jwt";

export async function POST(req: NextRequest) {
  try {
    const { errorResponse } = requireAuth(req, ["Admin", "Staff"]);
    if (errorResponse) return errorResponse;

    await connectToDatabase();
    const body = await req.json();
    const rawList: any[] = Array.isArray(body) ? body : body.students || [];

    if (!rawList.length) {
      return NextResponse.json(
        { success: false, error: "No student records provided for import." },
        { status: 400 }
      );
    }

    const currentYear = new Date().getFullYear();
    let totalCount = await Student.countDocuments();

    const inserted: any[] = [];
    const updated: any[] = [];
    const errors: { row: number; name?: string; error: string }[] = [];

    const seenAdmissionNos = new Set<string>();

    for (let i = 0; i < rawList.length; i++) {
      const row = rawList[i];
      const rowNum = i + 1;

      const name = String(row.name || "").trim();
      const className = String(row.className || "").trim();
      const section = String(row.section || "A").trim();

      if (!name) {
        errors.push({ row: rowNum, error: "Missing required Student Name." });
        continue;
      }
      if (!className) {
        errors.push({ row: rowNum, name, error: "Missing required Class." });
        continue;
      }

      let admissionNo = String(row.admissionNo || "").trim().toUpperCase();
      if (!admissionNo) {
        totalCount++;
        admissionNo = `ADM${currentYear}${String(totalCount).padStart(4, "0")}`;
      }

      // If duplicate within the same batch, append sequence
      if (seenAdmissionNos.has(admissionNo)) {
        totalCount++;
        admissionNo = `${admissionNo}-${totalCount}`;
      }
      seenAdmissionNos.add(admissionNo);

      const studentData: Record<string, any> = {
        admissionNo,
        name,
        className,
        section: section || "A",
        gender: String(row.gender || "Male").trim(),
        penNo: String(row.penNo || "").trim(),
        studentStateCode: String(row.studentStateCode || "").trim(),
        dob: String(row.dob || "").trim(),
        father: String(row.father || row.fatherName || "").trim(),
        mother: String(row.mother || row.motherName || "").trim(),
        category: String(row.socialCategory || row.category || "General").trim(),
        socialCategory: String(row.socialCategory || row.category || "General").trim(),
        minorityGroup: String(row.minorityGroup || "None").trim(),
        bplBeneficiary: String(row.bplBeneficiary || "No").trim(),
        cwsn: String(row.cwsn || "No").trim(),
        isRepeater: String(row.isRepeater || "No").trim(),
        entryStatus: String(row.entryStatus || "Regular").trim(),
        aadhaarNo: String(row.aadhaarNo || "").trim(),
        nameAsPerAadhaar: String(row.nameAsPerAadhaar || "").trim(),
        aadhaarValidationStatus: String(row.aadhaarValidationStatus || "Pending").trim(),
        mobile: String(row.mobile || "").trim(),
        email: String(row.email || "").trim(),
        address: String(row.address || "").trim(),
        city: String(row.city || "").trim(),
        state: String(row.state || "").trim(),
        pin: String(row.pin || "").trim(),
        rollNo: Number(row.rollNo) || 0,
        admissionDate: String(row.admissionDate || new Date().toISOString().slice(0, 10)),
        session: String(row.session || `${currentYear}-${String(currentYear + 1).slice(-2)}`),
        status: String(row.status || "Active").trim(),
      };

      try {
        const existing = await Student.findOne({ admissionNo });
        if (existing) {
          const updatedDoc = await Student.findByIdAndUpdate(existing._id, { $set: studentData }, { new: true });
          updated.push(updatedDoc);
        } else {
          const newDoc = await Student.create(studentData);
          inserted.push(newDoc);
        }
      } catch (saveErr: any) {
        console.error(`Error saving student row ${rowNum}:`, saveErr);
        errors.push({ row: rowNum, name, error: saveErr.message || "Database write error" });
      }
    }

    const allProcessed = [...inserted, ...updated];

    return NextResponse.json({
      success: true,
      data: allProcessed,
      count: allProcessed.length,
      insertedCount: inserted.length,
      updatedCount: updated.length,
      errorCount: errors.length,
      errors,
    });
  } catch (err: any) {
    console.error("POST /api/students/bulk error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to process bulk student import." },
      { status: 500 }
    );
  }
}
