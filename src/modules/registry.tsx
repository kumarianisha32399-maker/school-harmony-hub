"use client";

import type { ReactNode } from "react";
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
} from "@/modules/Exams";
import {
  BonafideCertificate,
  CharacterCertificate,
  CustomCertificate,
  FeeCertificate,
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
import {
  AssignTeacher,
  ClassesSections,
  Subjects,
  Timetable,
} from "@/modules/Academics";
import {
  AdmissionReport,
  AttendanceReport,
  FeeReport,
  ResultReport,
  StudentReport,
  TeacherReport,
} from "@/modules/Reports";
import { Notices, ParentMessages } from "@/modules/Communication";
import { BackupRestore, SchoolProfile, UserManagement } from "@/modules/Settings";
import { canAccess } from "@/config/navigation";

export function resolveModule(slug: string, role = "Admin"): ReactNode | null {
  // Normalize slug
  const cleanSlug = slug.replace(/^\/+|\/+$/g, "");

  // Check access permission
  if (!canAccess(role, cleanSlug)) {
    return null;
  }

  // Handle dynamic student profile route
  if (cleanSlug.startsWith("students/profile/")) {
    const id = cleanSlug.replace("students/profile/", "");
    return <StudentProfile id={id} />;
  }

  switch (cleanSlug) {
    case "dashboard":
      return <Dashboard />;

    // Students
    case "students":
      return <StudentList />;
    case "students/add":
      return <AddStudent />;
    case "students/promote":
      return <PromoteStudent />;
    case "students/transfer":
      return <TransferStudent />;
    case "students/id-card":
      return <IdCard />;

    // Admissions
    case "admissions":
      return <AdmissionList />;
    case "admissions/new":
      return <NewAdmission />;
    case "admissions/form":
      return <RegistrationForm />;
    case "admissions/receipt":
      return <AdmissionReceipt />;

    // Attendance
    case "attendance/mark":
      return <MarkAttendance />;
    case "attendance/daily":
      return <DailyAttendance />;
    case "attendance/monthly":
      return <MonthlyAttendance />;
    case "attendance/student":
      return <AttendanceReport />;

    // Fees
    case "fees/structure":
      return <FeeStructure />;
    case "fees/generate":
      return <GenerateFee />;
    case "fees/collect":
      return <CollectFee />;
    case "fees/receipt":
      return <FeeReceipt />;
    case "fees/pending":
      return <PendingFees />;
    case "fees/defaulters":
      return <FeeDefaulters />;
    case "fees/payments":
      return <PaymentHistory />;
    case "fees/collection":
      return <MonthlyCollection />;

    // Exams
    case "exams":
      return <ExamSchedule />;
    case "exams/create":
      return <CreateExam />;
    case "exams/marks":
      return <EnterMarks />;
    case "exams/marks-list":
      return <MarksList />;
    case "exams/report-card":
      return <ReportCard />;
    case "exams/class-result":
      return <ClassResult />;

    // Certificates
    case "certificates/bonafide":
      return <BonafideCertificate />;
    case "certificates/transfer":
      return <TransferCertificate />;
    case "certificates/character":
      return <CharacterCertificate />;
    case "certificates/leaving":
      return <LeavingCertificate />;
    case "certificates/study":
      return <StudyCertificate />;
    case "certificates/fee":
      return <FeeCertificate />;
    case "certificates/custom":
      return <CustomCertificate />;

    // Teachers & Staff
    case "teachers":
      return <TeacherList />;
    case "teachers/add":
      return <AddTeacher />;
    case "staff":
      return <StaffList />;
    case "teachers/attendance":
      return <TeacherAttendance />;
    case "payroll":
      return <Payroll />;

    // Academics
    case "academics/classes":
      return <ClassesSections />;
    case "academics/subjects":
      return <Subjects />;
    case "academics/assign":
      return <AssignTeacher />;
    case "academics/timetable":
      return <Timetable />;

    // Reports
    case "reports/students":
      return <StudentReport />;
    case "reports/attendance":
      return <AttendanceReport />;
    case "reports/fees":
      return <FeeReport />;
    case "reports/results":
      return <ResultReport />;
    case "reports/admissions":
      return <AdmissionReport />;
    case "reports/teachers":
      return <TeacherReport />;

    // Communication
    case "notices":
      return <Notices />;
    case "notices/messages":
      return <ParentMessages />;

    // Settings
    case "settings":
      return <SchoolProfile />;
    case "settings/users":
      return <UserManagement />;
    case "settings/backup":
      return <BackupRestore />;

    default:
      return null;
  }
}
