import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb/connection";
import { SalaryRecord } from "@/models/SalaryRecord";
import { requireAuth } from "@/lib/auth/jwt";

export async function GET(req: NextRequest) {
  try {
    const { errorResponse } = requireAuth(req, ["Admin"]);
    if (errorResponse) return errorResponse;

    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month") || "";
    const year = searchParams.get("year") ? Number(searchParams.get("year")) : null;

    const query: any = {};
    if (month) query.month = month;
    if (year) query.year = year;

    const salaries = await SalaryRecord.find(query).sort({ year: -1, month: -1, name: 1 });
    return NextResponse.json({ success: true, data: salaries });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: "Failed to fetch payroll" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { errorResponse } = requireAuth(req, ["Admin"]);
    if (errorResponse) return errorResponse;

    await connectToDatabase();
    const body = await req.json();

    const basicSalary = Number(body.basicSalary) || 0;
    const allowances = Number(body.allowances) || 0;
    const deductions = Number(body.deductions) || 0;
    const advance = Number(body.advance) || 0;
    const netSalary = basicSalary + allowances - deductions - advance;

    const salary = await SalaryRecord.findOneAndUpdate(
      { empId: body.empId, month: body.month, year: Number(body.year) || new Date().getFullYear() },
      {
        ...body,
        basicSalary,
        allowances,
        deductions,
        advance,
        netSalary,
      },
      { new: true, upsert: true }
    );

    return NextResponse.json({ success: true, data: salary });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: "Failed to record salary" }, { status: 500 });
  }
}
