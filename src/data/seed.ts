// Demo seed data for the School ERP. Generated once on first load.

export type Student = {
  id: string;
  admissionNo: string;
  name: string;
  father: string;
  mother: string;
  dob: string;
  gender: string;
  mobile: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pin: string;
  className: string;
  section: string;
  rollNo: number;
  admissionDate: string;
  session: string;
  category: string;
  bloodGroup: string;
  photo: string;
  guardian: string;
  occupation: string;
  previousSchool: string;
  status: string;
};

const FIRST = [
  "Aarav", "Ananya", "Vihaan", "Diya", "Aditya", "Ishita", "Kabir", "Meera",
  "Rohan", "Saanvi", "Arjun", "Kavya", "Dhruv", "Priya", "Yash", "Riya",
  "Nikhil", "Tanvi", "Karan", "Neha", "Manav", "Sneha", "Ayaan", "Pooja",
];
const LAST = ["Sharma", "Verma", "Patel", "Iyer", "Reddy", "Nair", "Gupta", "Singh", "Joshi", "Mehta"];
const FATHERS = ["Rajesh", "Suresh", "Anil", "Vikram", "Deepak", "Mahesh", "Sanjay", "Ramesh"];
const MOTHERS = ["Sunita", "Kavita", "Rekha", "Anita", "Shobha", "Geeta", "Meenal", "Lata"];

export const CLASSES = ["Nursery", "LKG", "UKG", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
export const SECTIONS = ["A", "B", "C"];
export const SUBJECTS = [
  { id: "sub1", name: "English", code: "ENG" },
  { id: "sub2", name: "Hindi", code: "HIN" },
  { id: "sub3", name: "Mathematics", code: "MAT" },
  { id: "sub4", name: "Science", code: "SCI" },
  { id: "sub5", name: "Social Science", code: "SST" },
  { id: "sub6", name: "Computer", code: "COM" },
];
export const SESSION = "2025-26";
export const BLOOD = ["A+", "B+", "O+", "AB+", "A-", "O-"];
export const CATEGORY = ["General", "OBC", "SC", "ST", "EWS"];

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length];
}

export function buildStudents(): Student[] {
  const list: Student[] = [];
  for (let i = 0; i < 24; i++) {
    const first = pick(FIRST, i);
    const last = pick(LAST, i * 3 + 1);
    const cls = pick(CLASSES.slice(3), i);
    const sec = pick(SECTIONS, i);
    const father = `${pick(FATHERS, i + 2)} ${last}`;
    list.push({
      id: `stu-${i + 1}`,
      admissionNo: `ADM${2025000 + i + 1}`,
      name: `${first} ${last}`,
      father,
      mother: `${pick(MOTHERS, i + 5)} ${last}`,
      dob: `20${11 + (i % 6)}-0${(i % 9) + 1}-1${i % 9}`,
      gender: i % 2 === 0 ? "Male" : "Female",
      mobile: `9${(800000000 + i * 137911).toString().slice(0, 9)}`,
      email: `${first.toLowerCase()}.${last.toLowerCase()}@example.com`,
      address: `${10 + i}, ${pick(["Green Park", "Model Town", "Civil Lines", "Ashok Nagar"], i)}`,
      city: pick(["Indore", "Bhopal", "Pune", "Jaipur"], i),
      state: pick(["Madhya Pradesh", "Maharashtra", "Rajasthan"], i),
      pin: `4520${(i % 9) + 1}1`,
      className: cls,
      section: sec,
      rollNo: (i % 12) + 1,
      admissionDate: `2025-04-${String((i % 25) + 1).padStart(2, "0")}`,
      session: SESSION,
      category: pick(CATEGORY, i),
      bloodGroup: pick(BLOOD, i),
      photo: "",
      guardian: father,
      occupation: pick(["Business", "Service", "Farmer", "Doctor", "Engineer"], i),
      previousSchool: i % 3 === 0 ? "Little Angels School" : "—",
      status: "Active",
    });
  }
  return list;
}

export function buildTeachers() {
  const names = [
    "Sunita Rao", "Alok Mishra", "Priyanka Desai", "Rakesh Kulkarni", "Nisha Bhatt",
    "Vivek Chauhan", "Shalini Kapoor", "Manoj Tiwari",
  ];
  return names.map((n, i) => ({
    id: `tch-${i + 1}`,
    empId: `EMP-T${100 + i}`,
    name: n,
    father: `${pick(FATHERS, i)} ${n.split(" ")[1]}`,
    dob: `198${i % 9}-0${(i % 9) + 1}-15`,
    mobile: `98${(76500000 + i * 4211).toString().slice(0, 8)}`,
    email: `${n.split(" ")[0].toLowerCase()}@school.edu`,
    address: `${20 + i}, Teacher Colony`,
    qualification: pick(["M.Sc, B.Ed", "M.A, B.Ed", "B.Tech, B.Ed", "M.Com, B.Ed"], i),
    subject: pick(SUBJECTS, i).name,
    classTeacherOf: `${pick(CLASSES.slice(3), i)}-${pick(SECTIONS, i)}`,
    joiningDate: `20${18 + (i % 6)}-06-01`,
    salary: 32000 + i * 1500,
    photo: "",
  }));
}

export function buildStaff() {
  const rows = [
    ["Ravi Yadav", "Accountant", "Accounts"],
    ["Kiran Sahu", "Office Clerk", "Administration"],
    ["Mohan Lal", "Librarian", "Library"],
    ["Sarita Devi", "Lab Assistant", "Science"],
    ["Imran Khan", "Driver", "Transport"],
    ["Geeta Bai", "Housekeeping", "Support"],
  ];
  return rows.map((r, i) => ({
    id: `stf-${i + 1}`,
    empId: `EMP-S${200 + i}`,
    name: r[0],
    designation: r[1],
    department: r[2],
    joiningDate: `20${19 + (i % 5)}-07-10`,
    salary: 16000 + i * 2200,
    bank: `HDFC ••••${4000 + i}`,
    mobile: `97${(65400000 + i * 3311).toString().slice(0, 8)}`,
    email: `${r[0].split(" ")[0].toLowerCase()}@school.edu`,
  }));
}

export function buildFees(students: Student[]) {
  const heads = ["Tuition Fee", "Exam Fee", "Computer Fee", "Activity Fee"];
  const months = ["April", "May", "June", "July", "August"];
  const invoices: any[] = [];
  const payments: any[] = [];
  students.forEach((s, i) => {
    months.forEach((m, mi) => {
      const items = heads.map((h, hi) => ({
        head: h,
        amount: h === "Tuition Fee" ? 2500 : 300 + hi * 100,
      }));
      const total = items.reduce((a, b) => a + b.amount, 0);
      const paid = (i + mi) % 4 === 0 ? 0 : total;
      const id = `inv-${s.id}-${mi}`;
      invoices.push({
        id,
        studentId: s.id,
        month: m,
        session: SESSION,
        items,
        discount: 0,
        lateFee: paid === 0 && mi < 3 ? 100 : 0,
        total,
        paid,
        dueDate: `2025-${String(4 + mi).padStart(2, "0")}-10`,
        status: paid >= total ? "Paid" : "Pending",
      });
      if (paid > 0) {
        payments.push({
          id: `pay-${s.id}-${mi}`,
          receiptNo: `RCP${1000 + invoices.length}`,
          invoiceId: id,
          studentId: s.id,
          date: `2025-${String(4 + mi).padStart(2, "0")}-08`,
          amount: paid,
          mode: pick(["Cash", "UPI", "Card", "Bank Transfer"], i + mi),
          receivedBy: "Ravi Yadav",
        });
      }
    });
  });
  return { invoices, payments };
}

export function buildAttendance(students: Student[]) {
  const rows: any[] = [];
  for (let d = 1; d <= 24; d++) {
    const date = `2025-08-${String(d).padStart(2, "0")}`;
    students.forEach((s, i) => {
      const r = (i * 7 + d * 3) % 20;
      rows.push({
        id: `att-${s.id}-${d}`,
        studentId: s.id,
        date,
        status: r === 0 ? "Absent" : r === 1 ? "Late" : r === 2 ? "Leave" : "Present",
      });
    });
  }
  return rows;
}

export function buildExams() {
  return [
    { id: "exm-1", name: "Unit Test I", type: "Unit Test", session: SESSION, startDate: "2025-07-10", endDate: "2025-07-15", maxMarks: 25, passMarks: 9, status: "Completed" },
    { id: "exm-2", name: "Half Yearly", type: "Half Yearly", session: SESSION, startDate: "2025-09-18", endDate: "2025-09-28", maxMarks: 100, passMarks: 33, status: "Completed" },
    { id: "exm-3", name: "Pre-Board", type: "Pre-Board", session: SESSION, startDate: "2025-12-05", endDate: "2025-12-15", maxMarks: 100, passMarks: 33, status: "Scheduled" },
    { id: "exm-4", name: "Annual Examination", type: "Annual Examination", session: SESSION, startDate: "2026-03-02", endDate: "2026-03-18", maxMarks: 100, passMarks: 33, status: "Scheduled" },
  ];
}

export function buildMarks(students: Student[]) {
  const rows: any[] = [];
  students.forEach((s, i) => {
    SUBJECTS.forEach((sub, j) => {
      rows.push({
        id: `mrk-exm-2-${s.id}-${sub.id}`,
        examId: "exm-2",
        studentId: s.id,
        subjectId: sub.id,
        maxMarks: 100,
        marks: 45 + ((i * 13 + j * 7) % 50),
      });
    });
  });
  return rows;
}

export function buildNotices() {
  return [
    { id: "not-1", title: "Annual Sports Day", description: "Annual Sports Day will be held on 12 December. All students must report by 8:00 AM in sports uniform.", date: "2025-11-28", audience: "All", status: "Published" },
    { id: "not-2", title: "Half Yearly Result Declaration", description: "Report cards will be distributed to parents during the PTM on Saturday.", date: "2025-10-04", audience: "Parents", status: "Published" },
    { id: "not-3", title: "Staff Meeting", description: "All teaching staff are requested to attend the review meeting in the conference hall at 3 PM.", date: "2025-09-20", audience: "Teachers", status: "Published" },
    { id: "not-4", title: "Fee Submission Reminder", description: "Kindly clear pending dues before the 10th of the month to avoid late fee charges.", date: "2025-09-02", audience: "Parents", status: "Draft" },
  ];
}

export function buildTimetable() {
  const rows: any[] = [];
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const teachers = buildTeachers();
  days.forEach((day, di) => {
    for (let p = 1; p <= 6; p++) {
      const sub = pick(SUBJECTS, di + p);
      rows.push({
        id: `tt-${di}-${p}`,
        className: "X",
        section: "A",
        day,
        period: p,
        subject: sub.name,
        teacher: pick(teachers, di + p).name,
        startTime: `${String(8 + p).padStart(2, "0")}:00`,
        endTime: `${String(8 + p).padStart(2, "0")}:45`,
      });
    }
  });
  return rows;
}

export function buildAdmissions(students: Student[]) {
  return students.slice(0, 8).map((s, i) => ({
    id: `adm-${i + 1}`,
    regNo: `REG${5000 + i}`,
    name: s.name,
    father: s.father,
    mother: s.mother,
    dob: s.dob,
    gender: s.gender,
    mobile: s.mobile,
    email: s.email,
    address: s.address,
    applyingClass: s.className,
    previousSchool: s.previousSchool,
    session: SESSION,
    date: s.admissionDate,
    status: i % 4 === 0 ? "Pending" : "Approved",
    fee: 5000,
  }));
}

export const DEFAULT_SETTINGS = {
  name: "Harmony Public School",
  tagline: "Knowledge • Discipline • Excellence",
  address: "18 Ring Road, Vijay Nagar, Indore, Madhya Pradesh 452010",
  phone: "+91 731 400 1180",
  email: "office@harmonyschool.edu.in",
  website: "www.harmonyschool.edu.in",
  affiliation: "CBSE Affiliation No. 1030412",
  code: "HPS-1042",
  principal: "Dr. Neelam Saxena",
  session: SESSION,
  logo: "",
};

export const USERS = [
  { id: "usr-1", name: "Neelam Saxena", username: "admin", password: "admin123", role: "Admin", email: "admin@harmonyschool.edu.in" },
  { id: "usr-2", name: "Sunita Rao", username: "teacher", password: "teacher123", role: "Teacher", email: "teacher@harmonyschool.edu.in" },
  { id: "usr-3", name: "Ravi Yadav", username: "accountant", password: "account123", role: "Accountant", email: "accounts@harmonyschool.edu.in" },
  { id: "usr-4", name: "Kiran Sahu", username: "staff", password: "staff123", role: "Staff", email: "staff@harmonyschool.edu.in" },
];
