import * as XLSX from "xlsx";

export interface ParsedStudentRow {
  admissionNo: string;
  className: string;
  section: string;
  name: string;
  gender: string;
  penNo: string;
  studentStateCode: string;
  dob: string;
  father: string;
  mother: string;
  socialCategory: string;
  minorityGroup: string;
  bplBeneficiary: string;
  cwsn: string;
  isRepeater: string;
  entryStatus: string;
  aadhaarNo: string;
  nameAsPerAadhaar: string;
  aadhaarValidationStatus: string;
  mobile?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  pin?: string;
  rollNo?: number;
  // Validation flags
  _rawRowIndex: number;
  _isValid: boolean;
  _errors: string[];
  _nameMismatch: boolean;
}

export interface ParseResult {
  sheetNames: string[];
  activeSheet: string;
  rows: ParsedStudentRow[];
}

export const STUDENT_IMPORT_COLUMNS = [
  "Admission Number",
  "Class",
  "Section",
  "Name",
  "Gender",
  "PEN no",
  "Student State Code",
  "DOB",
  "Father Name",
  "Mother Name",
  "Social Category",
  "Minority Group",
  "BPL beneficiary",
  "CWSN",
  "Is Repeater",
  "Entry Status",
  "AADHAAR No",
  "Name As per AADHAAR",
  "AADHAAR Validation Status",
];

export const SAMPLE_STUDENTS_DATA = [
  {
    "Admission Number": "ADM2025101",
    Class: "V",
    Section: "A",
    Name: "Aarav Sharma",
    Gender: "Male",
    "PEN no": "20250001234",
    "Student State Code": "MP-IND-9871",
    DOB: "2015-05-12",
    "Father Name": "Rajesh Sharma",
    "Mother Name": "Sunita Sharma",
    "Social Category": "General",
    "Minority Group": "None",
    "BPL beneficiary": "No",
    CWSN: "No",
    "Is Repeater": "No",
    "Entry Status": "Regular",
    "AADHAAR No": "987654321012",
    "Name As per AADHAAR": "Aarav Sharma",
    "AADHAAR Validation Status": "Verified",
  },
  {
    "Admission Number": "ADM2025102",
    Class: "V",
    Section: "A",
    Name: "Ananya Patel",
    Gender: "Female",
    "PEN no": "20250001235",
    "Student State Code": "MP-IND-9872",
    DOB: "2015-08-24",
    "Father Name": "Vikram Patel",
    "Mother Name": "Meena Patel",
    "Social Category": "OBC",
    "Minority Group": "None",
    "BPL beneficiary": "No",
    CWSN: "No",
    "Is Repeater": "No",
    "Entry Status": "Regular",
    "AADHAAR No": "876543210987",
    "Name As per AADHAAR": "Ananya V Patel",
    "AADHAAR Validation Status": "Pending",
  },
  {
    "Admission Number": "ADM2025103",
    Class: "VI",
    Section: "B",
    Name: "Mohd Zaid Khan",
    Gender: "Male",
    "PEN no": "20250001236",
    "Student State Code": "MP-IND-9873",
    DOB: "2014-11-03",
    "Father Name": "Imran Khan",
    "Mother Name": "Farida Khan",
    "Social Category": "General",
    "Minority Group": "Muslim",
    "BPL beneficiary": "Yes",
    CWSN: "No",
    "Is Repeater": "No",
    "Entry Status": "New Admission",
    "AADHAAR No": "765432109876",
    "Name As per AADHAAR": "Mohd Zaid Khan",
    "AADHAAR Validation Status": "Verified",
  },
];

/**
 * Normalizes string keys to lowercase alphanumeric tokens for robust column header matching
 */
function cleanKey(k: string): string {
  return String(k || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

/**
 * Clean numeric IDs and big numbers from Excel (e.g. Aadhaar, PEN, Phone)
 * to avoid scientific notation (9.87654E+11) or trailing .0
 */
function cleanBigNumberString(val: any): string {
  if (val === null || val === undefined) return "";
  if (typeof val === "number") {
    if (Number.isInteger(val)) {
      return val.toLocaleString("fullwide", { useGrouping: false });
    }
    // If floating point representation of an integer (e.g. 987654321012.0)
    if (Math.floor(val) === val) {
      return Math.floor(val).toLocaleString("fullwide", { useGrouping: false });
    }
    return String(val);
  }
  let s = String(val).trim();
  // If string contains scientific notation like 9.87654E+11 or 9.87654e+11
  if (/^[+-]?\d+(\.\d+)?[eE][+-]?\d+$/.test(s)) {
    const num = Number(s);
    if (!Number.isNaN(num)) {
      return num.toLocaleString("fullwide", { useGrouping: false });
    }
  }
  // Strip trailing .0 if present
  if (/^\d+\.0$/.test(s)) {
    s = s.slice(0, -2);
  }
  return s;
}

/**
 * Cleans Aadhaar numbers by removing hyphens and spaces
 */
function cleanAadhaar(val: any): string {
  const s = cleanBigNumberString(val).replace(/[-\s]/g, "");
  return s;
}

/**
 * Standardize DOB into YYYY-MM-DD string handling Excel dates, timestamps, and string formats
 */
function formatExcelDob(val: any): string {
  if (!val) return "";
  if (val instanceof Date) {
    return val.toISOString().slice(0, 10);
  }

  // If number (Excel date serial number)
  if (typeof val === "number" && val > 1000) {
    try {
      const dateObj = XLSX.SSF.parse_date_code(val);
      if (dateObj && dateObj.y && dateObj.m && dateObj.d) {
        const y = String(dateObj.y);
        const m = String(dateObj.m).padStart(2, "0");
        const d = String(dateObj.d).padStart(2, "0");
        return `${y}-${m}-${d}`;
      }
    } catch {
      // fallback
    }
  }

  const s = String(val).trim();

  // Check if DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
  const ddmmyyyyMatch = s.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);
  if (ddmmyyyyMatch) {
    const [, d, m, y] = ddmmyyyyMatch;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }

  // Check if YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    return s;
  }

  // Attempt Date parse
  const parsed = new Date(s);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }
  return s;
}

/**
 * Checks if the student's entered name differs from their Name As Per AADHAAR
 */
export function hasAadhaarNameMismatch(name?: string, nameAsPerAadhaar?: string): boolean {
  if (!name || !nameAsPerAadhaar) return false;
  const n1 = name.trim().toLowerCase().replace(/\s+/g, " ");
  const n2 = nameAsPerAadhaar.trim().toLowerCase().replace(/\s+/g, " ");
  return n1 !== "" && n2 !== "" && n1 !== n2;
}

/**
 * Parses a sheet into student rows, automatically finding the header row
 */
function parseSheetRows(sheet: XLSX.WorkSheet): ParsedStudentRow[] {
  // First, convert sheet to raw 2D array of values
  const matrix: any[][] = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: "",
    raw: false,
  });

  if (!matrix || matrix.length === 0) {
    return [];
  }

  // Find the row that contains headers like "Name", "Class", "Admission", etc.
  let headerRowIndex = 0;
  let maxMatchedHeaders = 0;

  for (let r = 0; r < Math.min(matrix.length, 15); r++) {
    const row = matrix[r];
    if (!Array.isArray(row)) continue;

    let matched = 0;
    row.forEach((cell) => {
      const k = cleanKey(String(cell));
      if (
        k.includes("name") ||
        k.includes("class") ||
        k.includes("admission") ||
        k.includes("pen") ||
        k.includes("aadhaar") ||
        k.includes("dob") ||
        k.includes("gender") ||
        k.includes("father")
      ) {
        matched++;
      }
    });

    if (matched > maxMatchedHeaders) {
      maxMatchedHeaders = matched;
      headerRowIndex = r;
    }
  }

  // If header row found, parse rows from headerRowIndex
  const headers = (matrix[headerRowIndex] || []).map((h) => String(h || "").trim());
  const dataRows = matrix.slice(headerRowIndex + 1);

  const rawRows: Record<string, any>[] = [];
  dataRows.forEach((row) => {
    if (!Array.isArray(row)) return;
    // Check if row is not completely empty
    const hasValue = row.some((c) => String(c ?? "").trim() !== "");
    if (!hasValue) return;

    const rowObj: Record<string, any> = {};
    headers.forEach((h, idx) => {
      if (h) {
        rowObj[h] = row[idx] ?? "";
      } else {
        rowObj[`col_${idx}`] = row[idx] ?? "";
      }
    });
    rawRows.push(rowObj);
  });

  return rawRows.map((raw, idx) => {
    const lookup: Record<string, any> = {};
    Object.keys(raw).forEach((origKey) => {
      lookup[cleanKey(origKey)] = raw[origKey];
    });

    const admissionNo = cleanBigNumberString(
      lookup[cleanKey("Admission Number")] ||
      lookup[cleanKey("Admission No")] ||
      lookup[cleanKey("Adm No")] ||
      lookup[cleanKey("admissionNo")] ||
      lookup[cleanKey("admission_number")] ||
      lookup[cleanKey("Admission")] ||
      ""
    ).trim();

    const className = String(
      lookup[cleanKey("Class")] ||
      lookup[cleanKey("className")] ||
      lookup[cleanKey("Grade")] ||
      lookup[cleanKey("Standard")] ||
      ""
    ).trim();

    const section = String(
      lookup[cleanKey("Section")] ||
      lookup[cleanKey("section")] ||
      lookup[cleanKey("Sec")] ||
      "A"
    ).trim();

    const name = String(
      lookup[cleanKey("Name")] ||
      lookup[cleanKey("Student Name")] ||
      lookup[cleanKey("name")] ||
      lookup[cleanKey("student_name")] ||
      ""
    ).trim();

    const gender = String(
      lookup[cleanKey("Gender")] ||
      lookup[cleanKey("gender")] ||
      lookup[cleanKey("Sex")] ||
      "Male"
    ).trim();

    const penNo = cleanBigNumberString(
      lookup[cleanKey("PEN no")] ||
      lookup[cleanKey("PEN Number")] ||
      lookup[cleanKey("penNo")] ||
      lookup[cleanKey("pen")] ||
      lookup[cleanKey("pen_number")] ||
      lookup[cleanKey("Permanent Education Number")] ||
      ""
    ).trim();

    const studentStateCode = cleanBigNumberString(
      lookup[cleanKey("Student State Code")] ||
      lookup[cleanKey("State Code")] ||
      lookup[cleanKey("studentStateCode")] ||
      lookup[cleanKey("state_code")] ||
      ""
    ).trim();

    const rawDob =
      lookup[cleanKey("DOB")] ||
      lookup[cleanKey("Date of Birth")] ||
      lookup[cleanKey("dob")] ||
      lookup[cleanKey("birth_date")] ||
      "";
    const dob = formatExcelDob(rawDob);

    const father = String(
      lookup[cleanKey("Father Name")] ||
      lookup[cleanKey("Father's Name")] ||
      lookup[cleanKey("father")] ||
      lookup[cleanKey("father_name")] ||
      ""
    ).trim();

    const mother = String(
      lookup[cleanKey("Mother Name")] ||
      lookup[cleanKey("Mother's Name")] ||
      lookup[cleanKey("mother")] ||
      lookup[cleanKey("mother_name")] ||
      ""
    ).trim();

    const socialCategory = String(
      lookup[cleanKey("Social Category")] ||
      lookup[cleanKey("Category")] ||
      lookup[cleanKey("socialCategory")] ||
      lookup[cleanKey("social_category")] ||
      lookup[cleanKey("Caste Category")] ||
      "General"
    ).trim();

    const minorityGroup = String(
      lookup[cleanKey("Minority Group")] ||
      lookup[cleanKey("Minority")] ||
      lookup[cleanKey("minorityGroup")] ||
      lookup[cleanKey("minority_group")] ||
      "None"
    ).trim();

    const bplBeneficiary = String(
      lookup[cleanKey("BPL beneficiary")] ||
      lookup[cleanKey("BPL")] ||
      lookup[cleanKey("bplBeneficiary")] ||
      lookup[cleanKey("is_bpl")] ||
      "No"
    ).trim();

    const cwsn = String(
      lookup[cleanKey("CWSN")] ||
      lookup[cleanKey("Special Needs")] ||
      lookup[cleanKey("cwsn")] ||
      lookup[cleanKey("disability")] ||
      "No"
    ).trim();

    const isRepeater = String(
      lookup[cleanKey("Is Repeater")] ||
      lookup[cleanKey("Repeater")] ||
      lookup[cleanKey("isRepeater")] ||
      lookup[cleanKey("is_repeater")] ||
      "No"
    ).trim();

    const entryStatus = String(
      lookup[cleanKey("Entry Status")] ||
      lookup[cleanKey("entryStatus")] ||
      lookup[cleanKey("Admission Status")] ||
      lookup[cleanKey("entry_status")] ||
      "Regular"
    ).trim();

    const aadhaarNo = cleanAadhaar(
      lookup[cleanKey("AADHAAR No")] ||
      lookup[cleanKey("Aadhaar Number")] ||
      lookup[cleanKey("Aadhar No")] ||
      lookup[cleanKey("Aadhar Number")] ||
      lookup[cleanKey("aadhaarNo")] ||
      lookup[cleanKey("aadhar_no")] ||
      lookup[cleanKey("UID")] ||
      ""
    );

    const nameAsPerAadhaar = String(
      lookup[cleanKey("Name As per AADHAAR")] ||
      lookup[cleanKey("Name As Per Aadhar")] ||
      lookup[cleanKey("Aadhaar Name")] ||
      lookup[cleanKey("Aadhar Name")] ||
      lookup[cleanKey("nameAsPerAadhaar")] ||
      lookup[cleanKey("name_as_per_aadhaar")] ||
      ""
    ).trim();

    const aadhaarValidationStatus = String(
      lookup[cleanKey("AADHAAR Validation Status")] ||
      lookup[cleanKey("Aadhaar Status")] ||
      lookup[cleanKey("Aadhar Validation Status")] ||
      lookup[cleanKey("aadhaarValidationStatus")] ||
      lookup[cleanKey("aadhaar_status")] ||
      "Pending"
    ).trim();

    const mobile = cleanBigNumberString(
      lookup[cleanKey("Mobile")] ||
      lookup[cleanKey("Mobile Number")] ||
      lookup[cleanKey("Phone")] ||
      lookup[cleanKey("Contact")] ||
      ""
    ).trim();

    const email = String(
      lookup[cleanKey("Email")] ||
      lookup[cleanKey("Email Address")] ||
      ""
    ).trim();

    const address = String(
      lookup[cleanKey("Address")] ||
      lookup[cleanKey("Residential Address")] ||
      ""
    ).trim();

    const rollNo = Number(
      lookup[cleanKey("Roll Number")] ||
      lookup[cleanKey("Roll No")] ||
      lookup[cleanKey("Roll")] ||
      0
    ) || 0;

    const errors: string[] = [];
    if (!name) errors.push("Missing Student Name");
    if (!className) errors.push("Missing Class");

    const nameMismatch = hasAadhaarNameMismatch(name, nameAsPerAadhaar);

    return {
      admissionNo,
      className,
      section,
      name,
      gender,
      penNo,
      studentStateCode,
      dob,
      father,
      mother,
      socialCategory,
      minorityGroup,
      bplBeneficiary,
      cwsn,
      isRepeater,
      entryStatus,
      aadhaarNo,
      nameAsPerAadhaar,
      aadhaarValidationStatus,
      mobile,
      email,
      address,
      rollNo,
      _rawRowIndex: idx + 1,
      _isValid: errors.length === 0,
      _errors: errors,
      _nameMismatch: nameMismatch,
    };
  });
}

/**
 * Parses all types of Excel & Spreadsheet files:
 * .xlsx, .xls, .xlsm, .xlsb, .csv, .tsv, .ods, .fods, .xml, .txt
 */
export async function parseStudentExcel(file: File, sheetIndexOrName?: number | string): Promise<ParseResult> {
  const buffer = await file.arrayBuffer();

  let workbook: XLSX.WorkBook;
  try {
    workbook = XLSX.read(buffer, {
      type: "array",
      cellDates: true,
      raw: false,
      dense: false,
      WTF: false,
    });
  } catch (err: any) {
    // If binary read fails on text/csv/tsv, try decoding string
    try {
      const textDecoder = new TextDecoder("utf-8");
      const text = textDecoder.decode(buffer);
      workbook = XLSX.read(text, { type: "string", raw: false });
    } catch {
      throw new Error(`Unable to read file '${file.name}'. Please ensure it is a valid Excel (.xlsx, .xls, .xlsm, .xlsb), CSV, or ODS spreadsheet.`);
    }
  }

  const sheetNames = workbook.SheetNames;
  if (!sheetNames || sheetNames.length === 0) {
    throw new Error("The uploaded Excel workbook contains no sheets.");
  }

  // Determine which sheet to parse
  let targetSheetName = sheetNames[0];

  if (typeof sheetIndexOrName === "string" && sheetNames.includes(sheetIndexOrName)) {
    targetSheetName = sheetIndexOrName;
  } else if (typeof sheetIndexOrName === "number" && sheetIndexOrName >= 0 && sheetIndexOrName < sheetNames.length) {
    targetSheetName = sheetNames[sheetIndexOrName];
  } else {
    // Find the sheet with the most rows
    let bestSheet = sheetNames[0];
    let maxRows = 0;
    sheetNames.forEach((sName) => {
      const sh = workbook.Sheets[sName];
      if (sh && sh["!ref"]) {
        const range = XLSX.utils.decode_range(sh["!ref"]);
        const rowCount = range.e.r - range.s.r + 1;
        if (rowCount > maxRows) {
          maxRows = rowCount;
          bestSheet = sName;
        }
      }
    });
    targetSheetName = bestSheet;
  }

  const sheet = workbook.Sheets[targetSheetName];
  if (!sheet) {
    throw new Error(`Sheet '${targetSheetName}' not found in workbook.`);
  }

  const rows = parseSheetRows(sheet);

  if (!rows || rows.length === 0) {
    throw new Error(`No student records found in sheet '${targetSheetName}'. Please check your column headers and data.`);
  }

  return {
    sheetNames,
    activeSheet: targetSheetName,
    rows,
  };
}

/**
 * Downloads a pre-formatted sample Excel workbook with all 19 required columns
 */
export function downloadStudentImportTemplate(format: "xlsx" | "csv" = "xlsx") {
  const ws = XLSX.utils.json_to_sheet(SAMPLE_STUDENTS_DATA, {
    header: STUDENT_IMPORT_COLUMNS,
  });

  // Adjust column widths
  ws["!cols"] = STUDENT_IMPORT_COLUMNS.map((col) => ({
    wch: Math.max(col.length + 4, 15),
  }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Student_Import_Template");

  if (format === "csv") {
    XLSX.writeFile(wb, "Student_Import_Template.csv", { bookType: "csv" });
  } else {
    XLSX.writeFile(wb, "Student_Import_Template.xlsx", { bookType: "xlsx" });
  }
}

/**
 * Exports full student list with all 19 official UDISE columns
 */
export function exportStudentsToExcel(students: any[], filename = "UDISE_Student_List.xlsx") {
  const formattedRows = students.map((s) => ({
    "Admission Number": s.admissionNo || "",
    Class: s.className || "",
    Section: s.section || "",
    Name: s.name || "",
    Gender: s.gender || "Male",
    "PEN no": s.penNo || "",
    "Student State Code": s.studentStateCode || "",
    DOB: s.dob || "",
    "Father Name": s.father || "",
    "Mother Name": s.mother || "",
    "Social Category": s.socialCategory || s.category || "General",
    "Minority Group": s.minorityGroup || "None",
    "BPL beneficiary": s.bplBeneficiary || "No",
    CWSN: s.cwsn || "No",
    "Is Repeater": s.isRepeater || "No",
    "Entry Status": s.entryStatus || "Regular",
    "AADHAAR No": s.aadhaarNo || "",
    "Name As per AADHAAR": s.nameAsPerAadhaar || "",
    "AADHAAR Validation Status": s.aadhaarValidationStatus || "Pending",
  }));

  const ws = XLSX.utils.json_to_sheet(formattedRows, {
    header: STUDENT_IMPORT_COLUMNS,
  });

  ws["!cols"] = STUDENT_IMPORT_COLUMNS.map((col) => ({
    wch: Math.max(col.length + 4, 15),
  }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "UDISE_Students");
  XLSX.writeFile(wb, filename);
}

