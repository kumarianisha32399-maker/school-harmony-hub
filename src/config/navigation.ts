import {
  LayoutDashboard, Users, UserPlus, CalendarCheck, Wallet, GraduationCap,
  FileBadge, Briefcase, School, BarChart3, Megaphone, Settings,
} from "lucide-react";

export type NavItem = { label: string; slug: string };
export type NavGroup = {
  label: string;
  icon: any;
  slug?: string;
  items?: NavItem[];
  roles: string[];
};

const ALL = ["Admin", "Teacher", "Accountant", "Staff"];

export const NAV: NavGroup[] = [
  { label: "Dashboard", icon: LayoutDashboard, slug: "dashboard", roles: ALL },
  {
    label: "Students", icon: Users, roles: ["Admin", "Teacher", "Staff"],
    items: [
      { label: "Add Student", slug: "students/add" },
      { label: "Student List", slug: "students" },
      { label: "Promote Student", slug: "students/promote" },
      { label: "Transfer Student", slug: "students/transfer" },
      { label: "Student ID Card", slug: "students/id-card" },
    ],
  },
  {
    label: "Admissions", icon: UserPlus, roles: ["Admin", "Staff"],
    items: [
      { label: "New Admission", slug: "admissions/new" },
      { label: "Admission List", slug: "admissions" },
      { label: "Registration Form", slug: "admissions/form" },
      { label: "Admission Receipt", slug: "admissions/receipt" },
    ],
  },
  {
    label: "Attendance", icon: CalendarCheck, roles: ["Admin", "Teacher", "Staff"],
    items: [
      { label: "Mark Attendance", slug: "attendance/mark" },
      { label: "Daily Attendance", slug: "attendance/daily" },
      { label: "Monthly Attendance", slug: "attendance/monthly" },
      { label: "Student Report", slug: "attendance/student" },
    ],
  },
  {
    label: "Fees", icon: Wallet, roles: ["Admin", "Accountant"],
    items: [
      { label: "Fee Structure", slug: "fees/structure" },
      { label: "Generate Fee", slug: "fees/generate" },
      { label: "Collect Fee", slug: "fees/collect" },
      { label: "Fee Receipt", slug: "fees/receipt" },
      { label: "Pending Fees", slug: "fees/pending" },
      { label: "Fee Defaulters", slug: "fees/defaulters" },
      { label: "Payment History", slug: "fees/payments" },
      { label: "Monthly Collection", slug: "fees/collection" },
    ],
  },
  {
    label: "Examinations", icon: GraduationCap, roles: ["Admin", "Teacher"],
    items: [
      { label: "Create Exam", slug: "exams/create" },
      { label: "Exam Schedule", slug: "exams" },
      { label: "Enter Marks", slug: "exams/marks" },
      { label: "Marks List", slug: "exams/marks-list" },
      { label: "Report Card", slug: "exams/report-card" },
      { label: "Class Result", slug: "exams/class-result" },
    ],
  },
  {
    label: "Certificates", icon: FileBadge, roles: ["Admin", "Staff"],
    items: [
      { label: "Bonafide Certificate", slug: "certificates/bonafide" },
      { label: "Transfer Certificate", slug: "certificates/transfer" },
      { label: "Character Certificate", slug: "certificates/character" },
      { label: "School Leaving", slug: "certificates/leaving" },
      { label: "Study Certificate", slug: "certificates/study" },
      { label: "Fee Certificate", slug: "certificates/fee" },
      { label: "Custom Certificate", slug: "certificates/custom" },
    ],
  },
  {
    label: "Teachers & Staff", icon: Briefcase, roles: ["Admin"],
    items: [
      { label: "Add Teacher", slug: "teachers/add" },
      { label: "Teacher List", slug: "teachers" },
      { label: "Staff List", slug: "staff" },
      { label: "Teacher Attendance", slug: "teachers/attendance" },
      { label: "Salary / Payroll", slug: "payroll" },
    ],
  },
  {
    label: "Academics", icon: School, roles: ["Admin", "Teacher"],
    items: [
      { label: "Classes & Sections", slug: "academics/classes" },
      { label: "Subjects", slug: "academics/subjects" },
      { label: "Assign Teacher", slug: "academics/assign" },
      { label: "Timetable", slug: "academics/timetable" },
    ],
  },
  {
    label: "Reports", icon: BarChart3, roles: ["Admin", "Teacher", "Accountant"],
    items: [
      { label: "Student Report", slug: "reports/students" },
      { label: "Attendance Report", slug: "reports/attendance" },
      { label: "Fee Report", slug: "reports/fees" },
      { label: "Result Report", slug: "reports/results" },
      { label: "Admission Report", slug: "reports/admissions" },
      { label: "Teacher Report", slug: "reports/teachers" },
    ],
  },
  {
    label: "Communication", icon: Megaphone, roles: ["Admin", "Staff", "Teacher"],
    items: [
      { label: "Notices", slug: "notices" },
      { label: "Parent Messages", slug: "notices/messages" },
    ],
  },
  {
    label: "Settings", icon: Settings, roles: ["Admin"],
    items: [
      { label: "School Profile", slug: "settings" },
      { label: "User Management", slug: "settings/users" },
      { label: "Backup / Restore", slug: "settings/backup" },
    ],
  },
];

export function navForRole(role: string) {
  return NAV.filter((g) => g.roles.includes(role));
}

export function canAccess(role: string, slug: string) {
  const groups = navForRole(role);
  return groups.some(
    (g) => g.slug === slug || (g.items || []).some((i) => i.slug === slug) || slug.startsWith("students/profile"),
  );
}
