import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useApp } from "@/context/AppContext";
import { PageHeader, Panel, SelectField, TextField } from "@/components/common/Ui";
import { A4Document, DocToolbar, Field, SignRow } from "@/components/common/A4Document";
import { feeSummary, attendanceSummary, useStudentOptions } from "@/modules/shared";
import { fmtDate, inr, today } from "@/utils/helpers";

function useCertificateState(prefix: string) {
  const { students } = useApp();
  const options = useStudentOptions();
  const [studentId, setStudentId] = useState(students[0]?.id ?? "");
  const [certNo, setCertNo] = useState(`${prefix}/${new Date().getFullYear()}/001`);
  const [date, setDate] = useState(today());
  const student = useMemo(() => students.find((s: any) => s.id === studentId), [students, studentId]);
  return { options, studentId, setStudentId, certNo, setCertNo, date, setDate, student };
}

function StudentPicker({
  options,
  studentId,
  setStudentId,
  certNo,
  setCertNo,
  date,
  setDate,
  numberLabel = "Certificate No.",
  extra,
}: any) {
  return (
    <Panel title="Certificate details">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <SelectField label="Student" value={studentId} onChange={setStudentId} options={options} />
        <TextField label={numberLabel} value={certNo} onChange={setCertNo} />
        <TextField label="Date of Issue" type="date" value={date} onChange={setDate} />
        {extra}
      </div>
    </Panel>
  );
}

function Missing() {
  return (
    <Panel>
      <p className="text-sm text-muted-foreground">Select a student to generate this certificate.</p>
    </Panel>
  );
}

export function BonafideCertificate() {
  const st = useCertificateState("BON");
  const { settings } = useApp();
  return (
    <>
      <PageHeader title="Bonafide Certificate" subtitle="Auto-filled from student records, print-ready on A4." />
      <div className="space-y-6">
        <StudentPicker {...st} />
        {!st.student ? (
          <Missing />
        ) : (
          <>
            <DocToolbar docId="doc-bonafide" />
            <A4Document id="doc-bonafide" title="Bonafide Certificate">
              <div className="flex justify-between text-[11px] font-semibold">
                <span>Certificate No: {st.certNo}</span>
                <span>Date: {fmtDate(st.date)}</span>
              </div>
              <p className="mt-8 text-justify text-[13px] leading-8">
                This is to certify that <b>{st.student.name}</b>, son/daughter of{" "}
                <b>{st.student.father}</b> and <b>{st.student.mother}</b>, bearing Admission Number{" "}
                <b>{st.student.admissionNo}</b>, is a bonafide student of this school. He/She is
                currently studying in Class <b>{st.student.className}</b> Section{" "}
                <b>{st.student.section}</b> during the academic session <b>{settings.session}</b>. As
                per the school records, his/her date of birth is <b>{fmtDate(st.student.dob)}</b>.
              </p>
              <p className="mt-4 text-justify text-[13px] leading-8">
                His/Her conduct and character during the period of study have been found to be
                satisfactory. This certificate is issued on request for official purposes.
              </p>
              <div className="mt-8 space-y-1">
                <Field label="Roll Number" value={st.student.rollNo} />
                <Field label="Date of Admission" value={fmtDate(st.student.admissionDate)} />
                <Field label="Category" value={st.student.category} />
              </div>
              <SignRow items={["School Stamp", "Class Teacher", `Principal (${settings.principal})`]} />
            </A4Document>
          </>
        )}
      </div>
    </>
  );
}

export function TransferCertificate() {
  const st = useCertificateState("TC");
  const { settings, invoices, subjects } = useApp();
  const [reason, setReason] = useState("Parent relocation to another city");
  const [conduct, setConduct] = useState("Good");
  const [lastDate, setLastDate] = useState(today());
  const fees = st.student ? feeSummary(invoices, st.student.id) : null;
  return (
    <>
      <PageHeader title="Transfer Certificate" subtitle="School Leaving / Transfer Certificate in official format." />
      <div className="space-y-6">
        <StudentPicker
          {...st}
          numberLabel="TC Number"
          extra={
            <>
              <TextField label="Last Date of Attendance" type="date" value={lastDate} onChange={setLastDate} />
              <TextField label="Reason for Leaving" value={reason} onChange={setReason} />
              <SelectField
                label="Conduct"
                value={conduct}
                onChange={setConduct}
                options={["Excellent", "Very Good", "Good", "Satisfactory"]}
              />
            </>
          }
        />
        {!st.student ? (
          <Missing />
        ) : (
          <>
            <DocToolbar docId="doc-tc" />
            <A4Document id="doc-tc" title="Transfer Certificate">
              <div className="flex justify-between text-[11px] font-semibold">
                <span>TC No: {st.certNo}</span>
                <span>Date of Issue: {fmtDate(st.date)}</span>
              </div>
              <div className="mt-6 space-y-1">
                <Field label="Admission Number" value={st.student.admissionNo} />
                <Field label="Name of Student" value={st.student.name} />
                <Field label="Father's Name" value={st.student.father} />
                <Field label="Mother's Name" value={st.student.mother} />
                <Field label="Date of Birth" value={fmtDate(st.student.dob)} />
                <Field label="Date of Admission" value={fmtDate(st.student.admissionDate)} />
                <Field label="Class at Admission" value={st.student.className} />
                <Field label="Class Last Studied" value={`${st.student.className} - ${st.student.section}`} />
                <Field label="Academic Session" value={settings.session} />
                <Field label="Last Date of Attendance" value={fmtDate(lastDate)} />
                <Field label="Subjects Studied" value={subjects.map((s: any) => s.name).join(", ")} />
                <Field label="Result" value="Promoted to next class" />
                <Field label="Conduct" value={conduct} />
                <Field label="Reason for Leaving" value={reason} />
                <Field
                  label="Fees Status"
                  value={
                    fees && fees.pending > 0
                      ? `Pending ${inr(fees.pending)} of ${inr(fees.total)}`
                      : "All dues cleared"
                  }
                />
              </div>
              <p className="mt-6 text-[12px]">
                Certified that the above particulars have been checked with the School Register and
                found correct.
              </p>
              <SignRow items={["Prepared By", "Checked By", "School Stamp", `Principal`]} />
            </A4Document>
          </>
        )}
      </div>
    </>
  );
}

export function CharacterCertificate() {
  const st = useCertificateState("CHR");
  const { settings } = useApp();
  const [conduct, setConduct] = useState("Excellent");
  return (
    <>
      <PageHeader title="Character Certificate" subtitle="Conduct certificate on official letterhead." />
      <div className="space-y-6">
        <StudentPicker
          {...st}
          extra={
            <SelectField
              label="Character / Conduct"
              value={conduct}
              onChange={setConduct}
              options={["Excellent", "Very Good", "Good", "Satisfactory"]}
            />
          }
        />
        {!st.student ? (
          <Missing />
        ) : (
          <>
            <DocToolbar docId="doc-char" />
            <A4Document id="doc-char" title="Character Certificate">
              <div className="flex justify-between text-[11px] font-semibold">
                <span>Certificate No: {st.certNo}</span>
                <span>Date: {fmtDate(st.date)}</span>
              </div>
              <p className="mt-10 text-justify text-[13px] leading-8">
                This is to certify that <b>{st.student.name}</b>, son/daughter of{" "}
                <b>{st.student.father}</b>, Admission Number <b>{st.student.admissionNo}</b>, was a
                student of Class <b>{st.student.className}-{st.student.section}</b> of this
                institution during the academic session <b>{settings.session}</b>.
              </p>
              <p className="mt-4 text-justify text-[13px] leading-8">
                To the best of my knowledge, his/her character and conduct during the period of
                study were found <b>{conduct}</b>. He/She was never involved in any activity
                prejudicial to the discipline of the school. I wish him/her success in all future
                endeavours.
              </p>
              <SignRow items={["School Stamp", "Class Teacher", `Principal (${settings.principal})`]} />
            </A4Document>
          </>
        )}
      </div>
    </>
  );
}

export function LeavingCertificate() {
  const st = useCertificateState("SLC");
  const { settings } = useApp();
  const [lastDate, setLastDate] = useState(today());
  return (
    <>
      <PageHeader title="School Leaving Certificate" subtitle="Issued when a student leaves the school." />
      <div className="space-y-6">
        <StudentPicker
          {...st}
          extra={<TextField label="Last Date of Attendance" type="date" value={lastDate} onChange={setLastDate} />}
        />
        {!st.student ? (
          <Missing />
        ) : (
          <>
            <DocToolbar docId="doc-slc" />
            <A4Document id="doc-slc" title="School Leaving Certificate">
              <div className="flex justify-between text-[11px] font-semibold">
                <span>Certificate No: {st.certNo}</span>
                <span>Date: {fmtDate(st.date)}</span>
              </div>
              <p className="mt-8 text-justify text-[13px] leading-8">
                This is to certify that <b>{st.student.name}</b>, son/daughter of{" "}
                <b>{st.student.father}</b>, Admission Number <b>{st.student.admissionNo}</b>, has
                left this school after completing studies in Class{" "}
                <b>{st.student.className}-{st.student.section}</b>. His/Her last date of attendance
                was <b>{fmtDate(lastDate)}</b> in the academic session <b>{settings.session}</b>.
              </p>
              <div className="mt-6 space-y-1">
                <Field label="Date of Birth" value={fmtDate(st.student.dob)} />
                <Field label="Date of Admission" value={fmtDate(st.student.admissionDate)} />
                <Field label="Conduct" value="Good" />
              </div>
              <SignRow items={["School Stamp", "Office Clerk", "Principal"]} />
            </A4Document>
          </>
        )}
      </div>
    </>
  );
}

export function StudyCertificate() {
  const st = useCertificateState("STC");
  const { settings, attendance } = useApp();
  const att = st.student ? attendanceSummary(attendance, st.student.id) : null;
  return (
    <>
      <PageHeader title="Study Certificate" subtitle="Confirms the period of study with attendance." />
      <div className="space-y-6">
        <StudentPicker {...st} />
        {!st.student ? (
          <Missing />
        ) : (
          <>
            <DocToolbar docId="doc-study" />
            <A4Document id="doc-study" title="Study Certificate">
              <div className="flex justify-between text-[11px] font-semibold">
                <span>Certificate No: {st.certNo}</span>
                <span>Date: {fmtDate(st.date)}</span>
              </div>
              <p className="mt-10 text-justify text-[13px] leading-8">
                This is to certify that <b>{st.student.name}</b>, son/daughter of{" "}
                <b>{st.student.father}</b>, has been studying in this school in Class{" "}
                <b>{st.student.className}-{st.student.section}</b> during the academic session{" "}
                <b>{settings.session}</b>. His/Her overall attendance recorded in the school
                register is <b>{att?.pct ?? 0}%</b> ({att?.present ?? 0} of {att?.total ?? 0} working
                days).
              </p>
              <p className="mt-4 text-[13px] leading-8">
                This certificate is issued on the request of the parent/guardian for official use.
              </p>
              <SignRow items={["School Stamp", "Class Teacher", "Principal"]} />
            </A4Document>
          </>
        )}
      </div>
    </>
  );
}

export function FeeCertificate() {
  const st = useCertificateState("FEE");
  const { invoices, payments, settings } = useApp();
  const fees = st.student ? feeSummary(invoices, st.student.id) : null;
  const paidRows = payments.filter((p: any) => p.studentId === st.studentId);
  return (
    <>
      <PageHeader title="Fee Certificate" subtitle="Statement of fees paid during the session." />
      <div className="space-y-6">
        <StudentPicker {...st} />
        {!st.student ? (
          <Missing />
        ) : (
          <>
            <DocToolbar docId="doc-fee-cert" />
            <A4Document id="doc-fee-cert" title="Fee Certificate">
              <div className="flex justify-between text-[11px] font-semibold">
                <span>Certificate No: {st.certNo}</span>
                <span>Date: {fmtDate(st.date)}</span>
              </div>
              <p className="mt-6 text-justify text-[13px] leading-8">
                This is to certify that <b>{st.student.name}</b>, son/daughter of{" "}
                <b>{st.student.father}</b>, Class <b>{st.student.className}-{st.student.section}</b>,
                Admission Number <b>{st.student.admissionNo}</b>, has paid the following fees to the
                school during the academic session <b>{settings.session}</b>.
              </p>
              <table className="mt-6 w-full border-collapse text-[12px]">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="border border-slate-800 px-2 py-1 text-left">Receipt No</th>
                    <th className="border border-slate-800 px-2 py-1 text-left">Date</th>
                    <th className="border border-slate-800 px-2 py-1 text-left">Mode</th>
                    <th className="border border-slate-800 px-2 py-1 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {paidRows.map((p: any) => (
                    <tr key={p.id}>
                      <td className="border border-slate-800 px-2 py-1">{p.receiptNo}</td>
                      <td className="border border-slate-800 px-2 py-1">{fmtDate(p.date)}</td>
                      <td className="border border-slate-800 px-2 py-1">{p.mode}</td>
                      <td className="border border-slate-800 px-2 py-1 text-right">{inr(p.amount)}</td>
                    </tr>
                  ))}
                  <tr className="font-bold">
                    <td className="border border-slate-800 px-2 py-1" colSpan={3}>
                      Total Paid
                    </td>
                    <td className="border border-slate-800 px-2 py-1 text-right">{inr(fees?.paid || 0)}</td>
                  </tr>
                  <tr className="font-bold">
                    <td className="border border-slate-800 px-2 py-1" colSpan={3}>
                      Balance Pending
                    </td>
                    <td className="border border-slate-800 px-2 py-1 text-right">{inr(fees?.pending || 0)}</td>
                  </tr>
                </tbody>
              </table>
              <SignRow items={["Accountant", "School Stamp", "Principal"]} />
            </A4Document>
          </>
        )}
      </div>
    </>
  );
}

export function CustomCertificate() {
  const st = useCertificateState("CUS");
  const [title, setTitle] = useState("Certificate of Appreciation");
  const [body, setBody] = useState(
    "is hereby awarded this certificate in recognition of outstanding performance, sincerity and exemplary conduct demonstrated throughout the academic session.",
  );
  return (
    <>
      <PageHeader
        title="Custom Certificate"
        subtitle="Write your own certificate text on the school letterhead."
        actions={undefined}
      />
      <div className="space-y-6">
        <StudentPicker {...st} extra={<TextField label="Certificate Title" value={title} onChange={setTitle} />} />
        <Panel title="Certificate body">
          <textarea
            className="min-h-32 w-full rounded-lg border border-input bg-background p-3 text-sm"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          <button
            type="button"
            className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            onClick={() => toast.success("Certificate content updated")}
          >
            Apply text
          </button>
        </Panel>
        {!st.student ? (
          <Missing />
        ) : (
          <>
            <DocToolbar docId="doc-custom" />
            <A4Document id="doc-custom" title={title}>
              <div className="flex justify-between text-[11px] font-semibold">
                <span>Certificate No: {st.certNo}</span>
                <span>Date: {fmtDate(st.date)}</span>
              </div>
              <p className="mt-14 text-center text-[13px]">This certificate is proudly presented to</p>
              <p className="mt-3 text-center text-2xl font-black uppercase tracking-wide">{st.student.name}</p>
              <p className="mt-1 text-center text-[12px]">
                Class {st.student.className}-{st.student.section} • Admission No {st.student.admissionNo}
              </p>
              <p className="mx-auto mt-6 max-w-[150mm] text-center text-[13px] leading-8">{body}</p>
              <SignRow items={["Class Teacher", "School Stamp", "Principal"]} />
            </A4Document>
          </>
        )}
      </div>
    </>
  );
}

export function AdmissionLetter() {
  const st = useCertificateState("ADM");
  const { settings } = useApp();
  const [reportDate, setReportDate] = useState(today());
  return (
    <>
      <PageHeader title="Admission Letter" subtitle="Official confirmation of admission, ready to print on A4." />
      <div className="space-y-6">
        <StudentPicker
          {...st}
          numberLabel="Letter No."
          extra={<TextField label="Date to Report" type="date" value={reportDate} onChange={setReportDate} />}
        />
        {!st.student ? (
          <Missing />
        ) : (
          <>
            <DocToolbar docId="doc-admission-letter" fileName={`admission-letter-${st.student.admissionNo}`} />
            <A4Document id="doc-admission-letter" title="Admission Letter">
              <div className="flex justify-between text-[11px] font-semibold">
                <span>Letter No: {st.certNo}</span>
                <span>Date: {fmtDate(st.date)}</span>
              </div>
              <p className="mt-8 text-[13px] font-semibold">
                To,<br />
                {st.student.father}<br />
                {st.student.address}
              </p>
              <p className="mt-6 text-justify text-[13px] leading-8">
                Dear Parent / Guardian, we are pleased to inform you that <b>{st.student.name}</b> has been
                granted admission to <b>Class {st.student.className}</b>, Section{" "}
                <b>{st.student.section}</b> at {settings['name']} for the academic session{" "}
                <b>{settings['session']}</b>. The admission number allotted is{" "}
                <b>{st.student.admissionNo}</b> and the roll number is <b>{st.student.rollNo}</b>.
              </p>
              <p className="mt-4 text-justify text-[13px] leading-8">
                The student is required to report to the school office on <b>{fmtDate(reportDate)}</b> along with
                the original documents, the fee acknowledgement and two passport size photographs. Classes will
                follow the school timetable and the code of conduct shared in the school handbook.
              </p>
              <div className="mt-8 space-y-1">
                <Field label="Date of Birth" value={fmtDate(st.student.dob)} />
                <Field label="Date of Admission" value={fmtDate(st.student.admissionDate)} />
                <Field label="Contact Number" value={st.student.mobile} />
              </div>
              <SignRow items={["School Stamp", "Admission In-charge", `Principal (${settings['principal']})`]} />
            </A4Document>
          </>
        )}
      </div>
    </>
  );
}

export function ExperienceCertificate() {
  const { teachers, staff, settings } = useApp();
  const people = useMemo(() => [...teachers, ...staff], [teachers, staff]);
  const [empId, setEmpId] = useState(people[0]?.id ?? "");
  const [certNo, setCertNo] = useState(`EXP/${new Date().getFullYear()}/001`);
  const [date, setDate] = useState(today());
  const [tillDate, setTillDate] = useState(today());
  const [conduct, setConduct] = useState("Excellent");
  const p = people.find((x: any) => x.id === empId);

  return (
    <>
      <PageHeader title="Experience Certificate" subtitle="Service certificate for teaching and non-teaching employees." />
      <div className="space-y-6">
        <Panel title="Certificate details">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <SelectField
              label="Employee"
              value={empId}
              onChange={setEmpId}
              options={people.map((x: any) => ({ value: x.id, label: `${x.name} — ${x.designation || x.subject}` }))}
            />
            <TextField label="Certificate No." value={certNo} onChange={setCertNo} />
            <TextField label="Date of Issue" type="date" value={date} onChange={setDate} />
            <TextField label="Served Till" type="date" value={tillDate} onChange={setTillDate} />
            <SelectField
              label="Conduct"
              value={conduct}
              onChange={setConduct}
              options={["Excellent", "Very Good", "Good", "Satisfactory"]}
            />
          </div>
        </Panel>
        {!p ? (
          <Panel>
            <p className="text-sm text-muted-foreground">Add a teacher or staff member first.</p>
          </Panel>
        ) : (
          <>
            <DocToolbar docId="doc-experience" fileName={`experience-${p.empId}`} />
            <A4Document id="doc-experience" title="Experience Certificate">
              <div className="flex justify-between text-[11px] font-semibold">
                <span>Certificate No: {certNo}</span>
                <span>Date: {fmtDate(date)}</span>
              </div>
              <p className="mt-8 text-justify text-[13px] leading-8">
                This is to certify that <b>{p.name}</b> (Employee ID <b>{p.empId}</b>) has served{" "}
                {settings['name']} as <b>{p.designation || `${p.subject} Teacher`}</b> from{" "}
                <b>{fmtDate(p.joiningDate)}</b> to <b>{fmtDate(tillDate)}</b>.
              </p>
              <p className="mt-4 text-justify text-[13px] leading-8">
                During this period, his/her work was found to be sincere and professional, and conduct was{" "}
                <b>{conduct}</b>. We wish him/her success in all future endeavours.
              </p>
              <div className="mt-8 space-y-1">
                <Field label="Department" value={p.department || "Academics"} />
                <Field label="Qualification" value={p.qualification || "—"} />
                <Field label="Contact" value={p.mobile} />
              </div>
              <SignRow items={["School Stamp", "Administrator", `Principal (${settings['principal']})`]} />
            </A4Document>
          </>
        )}
      </div>
    </>
  );
}
