import type { ReactNode } from "react";
import { canAccess } from "@/config/navigation";
import { EmptyState } from "@/components/common/Ui";
import { PageHeader } from "@/components/common/Ui";
import { Dashboard } from "@/modules/Dashboard";
import {
  AddStudent,
  IdCard,
  PromoteStudent,
  StudentList,
  StudentProfile,
  TransferStudent,
} from "@/modules/Students";
import {
  AdmissionList,
  AdmissionReceipt,
  NewAdmission,
  RegistrationForm,
} from "@/modules/Admissions";
import {
  DailyAttendance,
  MarkAttendance,
  MonthlyAttendance,
  StudentAttendanceReport,
} from "@/modules/Attendance";
import {
  CollectFee,
  FeeDefaulters,
  FeeReceipt,
  FeeStructure,
  GenerateFee,
  MonthlyCollection,
  PaymentHistory,
  PendingFees,
} from "@/modules/Fees";
import {
  ClassResult,
  CreateExam,
  EnterMarks,
  ExamSchedule,
  MarksList,
  ReportCard,
  StudentResult,
} from "@/modules/Exams";
import {
  BonafideCertificate,
  CharacterCertificate,
  CustomCertificate,
  AdmissionLetter,
  FeeCertificate,
  ExperienceCertificate,
  LeavingCertificate,
  StudyCertificate,
  TransferCertificate,
} from "@/modules/Certificates";
import {
  AddTeacher,
  Payroll,
  StaffList,
  TeacherAttendance,
  TeacherList,
} from "@/modules/Staff";
import { AssignTeacher, ClassesSections, Subjects, Timetable } from "@/modules/Academics";
import {
  AdmissionReport,
  AttendanceReport,
  FeeReport,
  ResultReport,
  StudentReport,
  TeacherReport,
} from "@/modules/Reports";
import { Announcements, Notices, ParentMessages } from "@/modules/Communication";
import { BackupRestore, CertificateSettings, FeeSettings, SchoolProfile, UserManagement } from "@/modules/Settings";
import { StaffAttendance } from "@/modules/Staff";

/**
 * Single source of truth mapping a sidebar slug to the screen it renders.
 * Adding a page = add an entry here plus an item in src/config/navigation.ts.
 */
const ROUTES: Record<string, () => ReactNode> = {
  dashboard: () => <Dashboard />,

  students: () => <StudentList />,
  "students/add": () => <AddStudent />,
  "students/promote": () => <PromoteStudent />,
  "students/transfer": () => <TransferStudent />,
  "students/id-card": () => <IdCard />,

  admissions: () => <AdmissionList />,
  "admissions/new": () => <NewAdmission />,
  "admissions/form": () => <RegistrationForm />,
  "admissions/receipt": () => <AdmissionReceipt />,

  "attendance/mark": () => <MarkAttendance />,
  "attendance/daily": () => <DailyAttendance />,
  "attendance/monthly": () => <MonthlyAttendance />,
  "attendance/student": () => <StudentAttendanceReport />,

  "fees/structure": () => <FeeStructure />,
  "fees/generate": () => <GenerateFee />,
  "fees/collect": () => <CollectFee />,
  "fees/receipt": () => <FeeReceipt />,
  "fees/pending": () => <PendingFees />,
  "fees/defaulters": () => <FeeDefaulters />,
  "fees/payments": () => <PaymentHistory />,
  "fees/collection": () => <MonthlyCollection />,

  exams: () => <ExamSchedule />,
  "exams/create": () => <CreateExam />,
  "exams/marks": () => <EnterMarks />,
  "exams/marks-list": () => <MarksList />,
  "exams/report-card": () => <ReportCard />,
  "exams/class-result": () => <ClassResult />,
  "exams/student-result": () => <StudentResult />,

  "certificates/bonafide": () => <BonafideCertificate />,
  "certificates/transfer": () => <TransferCertificate />,
  "certificates/character": () => <CharacterCertificate />,
  "certificates/leaving": () => <LeavingCertificate />,
  "certificates/study": () => <StudyCertificate />,
  "certificates/fee": () => <FeeCertificate />,
  "certificates/admission-letter": () => <AdmissionLetter />,
  "certificates/experience": () => <ExperienceCertificate />,
  "certificates/custom": () => <CustomCertificate />,

  teachers: () => <TeacherList />,
  "teachers/add": () => <AddTeacher />,
  "teachers/attendance": () => <TeacherAttendance />,
  staff: () => <StaffList />,
  "staff/attendance": () => <StaffAttendance />,
  payroll: () => <Payroll />,

  "academics/classes": () => <ClassesSections />,
  "academics/subjects": () => <Subjects />,
  "academics/assign": () => <AssignTeacher />,
  "academics/timetable": () => <Timetable />,

  "reports/students": () => <StudentReport />,
  "reports/attendance": () => <AttendanceReport />,
  "reports/fees": () => <FeeReport />,
  "reports/results": () => <ResultReport />,
  "reports/admissions": () => <AdmissionReport />,
  "reports/teachers": () => <TeacherReport />,

  notices: () => <Notices />,
  "notices/announcements": () => <Announcements />,
  "notices/messages": () => <ParentMessages />,

  settings: () => <SchoolProfile />,
  "settings/fees": () => <FeeSettings />,
  "settings/certificates": () => <CertificateSettings />,
  "settings/users": () => <UserManagement />,
  "settings/backup": () => <BackupRestore />,
};

function Notice({ title, message }: { title: string; message: string }) {
  return (
    <div>
      <PageHeader title={title} />
      <EmptyState message={message} />
    </div>
  );
}

export function resolveModule(slug: string, role: string): ReactNode {
  const clean = slug.replace(/^\/+|\/+$/g, "") || "dashboard";

  if (clean.startsWith("students/profile/")) {
    if (!canAccess(role, clean))
      return <Notice title="Not available" message={`The ${role} role cannot open student profiles.`} />;
    return <StudentProfile id={clean.split("/")[2]} />;
  }

  const factory = ROUTES[clean];
  if (!factory)
    return (
      <Notice
        title="Page not found"
        message="This screen doesn't exist. Pick a section from the sidebar to continue."
      />
    );

  if (!canAccess(role, clean))
    return (
      <Notice
        title="Access restricted"
        message={`The ${role} role doesn't have permission to open this section.`}
      />
    );

  return factory();
}
