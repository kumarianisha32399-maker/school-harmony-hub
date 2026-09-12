# School Harmony Hub

https://github.com/vicky0700018/school-harmony-hub-7abf8a67

copy this repo

initial prompt

Build a complete, modern, professional and fully functional **School Management Portal / School ERP** using ONLY:

* React

* Vite

* Tailwind CSS

Do NOT use Next.js.

Do NOT use plain HTML/CSS/Vanilla JavaScript architecture.

Do NOT use unnecessary frameworks or backend technologies.

Use React components, React hooks, Context/API-style service layers and reusable components throughout the application.

For the frontend demo version, use **LocalStorage** for persistent data. Do NOT use Firebase, Supabase, MySQL, MongoDB or any external database.

The application must be fully responsive and should feel like a real commercial School ERP/SaaS product, not a basic demo.

## 1. APPLICATION ARCHITECTURE

Create a clean modular React + Vite architecture such as:

src/

* components/

* layouts/

* pages/

* modules/

* hooks/

* context/

* services/

* utils/

* data/

* types/

* assets/

Use reusable components for:

* Sidebar

* Topbar

* Dashboard Cards

* Data Tables

* Search

* Filters

* Pagination

* Modal

* Forms

* Confirmation Dialog

* Toast Notifications

* Dropdowns

* Tabs

* Document Preview

* A4 Document Layout

* Print controls

Create a centralized LocalStorage service so it can later be replaced with Firebase, Supabase, MySQL or a Node.js API without rewriting the UI.

## 2. LOGIN SYSTEM

Create a professional login page containing:

* School logo

* School name

* Username / Email

* Password

* Show/Hide Password

* Login button

* Remember Me

* Forgot Password

* Demo credentials

* Role-based login

Roles:

* Admin

* Teacher

* Accountant

* Staff

After login, display the appropriate dashboard and permissions based on the selected role.

Use demo credentials and make login actually functional.

## 3. ADMIN DASHBOARD

Create a polished SaaS-style dashboard with:

* Total Students

* Total Teachers

* Total Staff

* Total Classes

* Today's Attendance

* Pending Fees

* Fees Collected

* Upcoming Exams

* Recent Admissions

* Recent Payments

Add charts for:

* Monthly Fee Collection

* Student Attendance

* Class-wise Student Strength

* Exam Performance

Use a clean card-based layout with icons, trend indicators and realistic demo data.

## 4. SIDEBAR NAVIGATION

Create a collapsible responsive sidebar.

Main navigation:

Dashboard

Students

* Add Student

* Student List

* Student Profile

* Promote Student

* Transfer Student

* Student ID Card

Admissions

* New Admission

* Admission List

* Registration Form

* Admission Receipt

Attendance

* Mark Attendance

* Daily Attendance

* Monthly Attendance

* Student Attendance Report

Fees

* Fee Structure

* Generate Fee

* Collect Fee

* Fee Receipt

* Pending Fees

* Fee Defaulters

* Payment History

* Monthly Collection Report

Examinations

* Create Exam

* Exam Schedule

* Enter Marks

* Marks List

* Generate Marksheet

* Report Card

* Class Result

* Student Result

Certificates & Documents

* Bonafide Certificate

* Transfer Certificate

* Character Certificate

* School Leaving Certificate

* Study Certificate

* Fee Certificate

* Admission Letter

* Experience Certificate

* Custom Certificate

Teachers & Staff

* Add Teacher

* Teacher List

* Staff List

* Teacher Attendance

* Staff Attendance

* Salary / Payroll

Classes & Academics

* Classes

* Sections

* Subjects

* Assign Teacher

* Timetable

* Academic Session

Reports

* Student Report

* Attendance Report

* Fee Report

* Result Report

* Admission Report

* Teacher Report

Communication

* Notices

* Announcements

* SMS/WhatsApp-ready Messages

* Parent Communication

Settings

* School Profile

* Logo

* Principal Details

* Academic Session

* Classes & Sections

* Fee Settings

* Certificate Settings

* User Management

* Backup / Restore

Sidebar should support:

* Collapse/expand

* Mobile drawer

* Active menu state

* Nested navigation

* Icons

* Smooth animations

## 5. STUDENT MANAGEMENT

Create complete student management.

Student fields:

* Admission Number

* Student Name

* Father's Name

* Mother's Name

* Date of Birth

* Gender

* Mobile Number

* Email

* Address

* Class

* Section

* Roll Number

* Admission Date

* Academic Session

* Category

* Blood Group

* Student Photo

* Parent/Guardian Details

Student List must support:

* Search

* Filter

* Sort

* Pagination

* Add

* Edit

* Delete

* View

* Print

* Export

Student Profile should contain tabs:

* Personal Information

* Parent Information

* Attendance

* Fees

* Examination Results

* Documents

* Certificates

* Payment History

All student data must persist using LocalStorage.

Include at least **20 realistic demo students**.

## 6. STUDENT ID CARD GENERATOR

Create a professional ID Card Generator.

Include:

* School Logo

* School Name

* School Address

* Student Photo

* Student Name

* Father's Name

* Admission Number

* Class

* Section

* Roll Number

* DOB

* Contact Number

* Blood Group

* Academic Session

* QR Code

Features:

* Select Student

* Generate ID Card

* Front/Back design

* Preview

* Print

* Download PDF

Create a realistic school ID card design.

## 7. FEE MANAGEMENT

Create complete Fee Management.

Fee heads:

* Admission Fee

* Tuition Fee

* Annual Fee

* Exam Fee

* Transport Fee

* Computer Fee

* Activity Fee

* Other Charges

Support:

* Monthly

* Quarterly

* Yearly

Fee generation must support:

* Select Student

* Select Month

* Select Fee Heads

* Automatic Total

* Discount

* Late Fee

* Previous Balance

* Amount Paid

* Remaining Amount

* Payment Mode

Payment modes:

* Cash

* UPI

* Card

* Bank Transfer

* Cheque

After payment, generate a professional Fee Receipt.

Receipt must contain:

* School Logo

* School Name

* Address

* Receipt Number

* Date

* Student Name

* Admission Number

* Class

* Fee Details

* Amount

* Discount

* Total

* Amount Paid

* Balance

* Payment Mode

* Received By

* Authorized Signature

Buttons:

* Save

* Generate Receipt

* Preview

* Print

* Download PDF

* Reset

## 8. FEE DEFAULTER SYSTEM

Create Fee Defaulters page.

Columns:

* Student Name

* Admission Number

* Class

* Parent Name

* Mobile

* Total Fee

* Paid

* Pending

* Due Date

Filters:

* Class

* Section

* Month

* Pending Amount

Actions:

* View Student

* Print

* Export

* Generate Reminder Message

Generate a WhatsApp/SMS-ready reminder message from the student's fee data.

## 9. EXAM MANAGEMENT

Create complete examination management.

Admin can:

* Create Examination

* Add Subjects

* Set Maximum Marks

* Set Passing Marks

* Enter Marks

* Edit Marks

* Calculate Total

* Calculate Percentage

* Calculate Grade

* Calculate Position/Rank

Exam types:

* Unit Test

* Periodic Test

* Half Yearly

* Pre-Board

* Annual Examination

* Custom Examination

Use automatic calculations.

## 10. MARKSHEET / REPORT CARD

Create a professional A4 Report Card / Marksheet generator.

Header:

* School Logo

* School Name

* School Address

* REPORT CARD / MARKSHEET

* Academic Session

Student details:

* Student Photo

* Student Name

* Father's Name

* Mother's Name

* Admission Number

* Class

* Section

* Roll Number

* Date of Birth

Marks table:

Subject | Max Marks | Marks Obtained | Grade

Automatically calculate:

* Total Marks

* Obtained Marks

* Percentage

* Grade

* PASS / FAIL

* Position

Additional sections:

* Attendance

* Class Teacher Remarks

* Principal Remarks

Signature section:

* Class Teacher Signature

* Principal Signature

* Parent Signature

* School Stamp

Features:

* Preview

* Print A4

* Download PDF

* Generate Individual Marksheet

* Generate Class-wise Marksheets

## 11. BONAFIDE CERTIFICATE

Create A4 Bonafide Certificate Generator.

Automatically populate student data.

Include:

* School Logo

* School Name

* Address

* Certificate Number

* Date

* Student Name

* Father's/Mother's Name

* Class

* Admission Number

* Academic Session

* Date of Birth

* Formal Bonafide Statement

* Principal Signature

* School Stamp

Actions:

* Generate

* Preview

* Print

* Download PDF

## 12. TRANSFER CERTIFICATE

Create professional A4 Transfer Certificate Generator.

Fields:

* TC Number

* Admission Number

* Student Name

* Father's Name

* Mother's Name

* Date of Birth

* Date of Admission

* Class at Admission

* Current Class

* Last Attendance Date

* Reason for Leaving

* Conduct

* Subjects

* Result

* Fees Paid / Pending

* Date of Issue

Make it print-ready.

## 13. CHARACTER CERTIFICATE

Create Character Certificate Generator.

Include:

* Certificate Number

* Student Name

* Father's Name

* Class

* Admission Number

* Academic Session

* Character / Conduct

* Date

* Principal Signature

* School Stamp

Use a professional school document layout.

## 14. ADMISSION / REGISTRATION FORM

Create professional A4 printable Admission Form.

Sections:

STUDENT DETAILS

* Student Name

* DOB

* Gender

* Blood Group

* Aadhaar/ID Optional

* Previous School

PARENT DETAILS

* Father's Name

* Mother's Name

* Guardian Name

* Mobile

* Email

* Occupation

ADDRESS

* Full Address

* City

* State

* PIN Code

ACADEMIC DETAILS

* Applying For Class

* Previous Class

* Previous School

* Academic Session

DOCUMENT CHECKLIST:

☐ Birth Certificate

☐ Address Proof

☐ Previous School Certificate

☐ Photograph

☐ ID Proof

☐ Other

Bottom:

* Parent/Guardian Signature

* Office Use

* Principal Signature

Add Preview, Print and PDF functionality.

## 15. NOTICE MANAGEMENT

Create Notice Management.

Admin can:

* Create Notice

* Edit Notice

* Delete Notice

* Publish Notice

* Print Notice

Fields:

* Notice Title

* Description

* Date

* Target Audience

* Status

Dashboard should display recent notices.

## 16. TEACHER MANAGEMENT

Teacher fields:

* Employee ID

* Name

* Father's/Husband's Name

* DOB

* Mobile

* Email

* Address

* Qualification

* Subject

* Joining Date

* Salary

* Photo

Features:

* Add

* Edit

* Delete

* View Profile

* Teacher Attendance

* Assigned Classes

* Assigned Subjects

* Salary Records

Include multiple realistic demo teachers.

## 17. STAFF / PAYROLL

Staff fields:

* Employee ID

* Name

* Designation

* Department

* Joining Date

* Salary

* Bank Details

* Contact Details

Salary system:

* Basic Salary

* Allowances

* Deductions

* Advance

* Net Salary

* Payment Date

Automatically calculate Net Salary.

Generate professional Salary Slip with:

* Employee details

* Salary breakdown

* Net salary

* Payment date

* Authorized signature

## 18. ATTENDANCE

Create Attendance Management.

Select:

* Class

* Section

* Date

Student status:

* Present

* Absent

* Late

* Leave

Automatically calculate:

* Present Count

* Absent Count

* Attendance %

* Monthly Attendance

Attendance must appear inside Student Profile and Marksheet.

## 19. TIMETABLE

Create Timetable Management.

Fields:

* Class

* Section

* Day

* Period

* Subject

* Teacher

* Start Time

* End Time

Display timetable in a professional grid/table.

Allow:

* Add

* Edit

* Delete

* Filter

* Print

## 20. REPORTS

Create printable reports:

* Student List

* Class-wise Student List

* Attendance Report

* Fee Collection Report

* Pending Fee Report

* Defaulter Report

* Exam Result Report

* Class Performance

* Teacher Report

* Admission Report

Every report should have:

* Filters

* Search

* Date range where applicable

* Print

* Export

* Pagination

## 21. SCHOOL SETTINGS

Create School Profile settings:

* School Name

* Logo

* Address

* Phone

* Email

* Website

* Affiliation

* School Code

* Principal Name

* Academic Session

All generated documents must automatically use these settings.

Store settings in LocalStorage.

## 22. GLOBAL SEARCH

Create a global search in the top navigation.

Search by:

* Student Name

* Admission Number

* Father Name

* Mobile Number

* Class

* Roll Number

Search results should quickly open the corresponding Student Profile.

## 23. LOCAL STORAGE

Use LocalStorage for:

* Students

* Teachers

* Staff

* Fees

* Payments

* Attendance

* Exams

* Marks

* Notices

* Admissions

* Timetable

* Classes

* Sections

* Subjects

* School Settings

* Users

Create reusable storage utilities.

Provide demo seed data on first application load.

Do not lose data after browser refresh.

## 24. DOCUMENT SYSTEM

Create a reusable A4 document component.

All documents must use:

* A4 dimensions

* Proper margins

* School Logo

* School Name

* School Address

* Document Title

* Borders

* Tables

* Signature Areas

* Stamp Area

Documents:

* Fee Receipt

* Marksheet

* Report Card

* Bonafide Certificate

* Transfer Certificate

* Character Certificate

* Admission Form

* Salary Slip

* ID Card

Every document should support:

Preview → Print → Download PDF

Use browser print functionality and a lightweight PDF library only where genuinely necessary.

## 25. UI / UX

The UI must look like a premium commercial School ERP.

Use:

* Modern professional sidebar

* Top navigation

* Responsive design

* Dashboard cards

* Data tables

* Forms

* Modals

* Toast notifications

* Confirmation dialogs

* Search

* Filters

* Pagination

* Empty states

* Loading states

* Dark/Light mode

* Mobile responsive layouts

* Smooth animations

* Clean typography

* Consistent spacing

* Professional icons

Do NOT make it look like a basic HTML project.

Use a professional school/SaaS visual language with a clean primary color, neutral backgrounds and excellent contrast.

## 26. FUNCTIONALITY

Every visible button must work.

Do NOT create fake buttons.

Implement:

* Add

* Edit

* Delete

* Search

* Filter

* Save

* Update

* Print

* Preview

* Generate

* Download

* Reset

* Cancel

* View

* Export

* Pagination

* Sorting

Use confirmation dialogs before destructive actions.

Use toast notifications after successful operations.

## 27. DEMO DATA

Pre-populate the application with realistic data:

* At least 20 students

* Multiple classes

* Multiple sections

* Multiple subjects

* Multiple teachers

* Staff members

* Fee records

* Payment records

* Attendance records

* Examination records

* Marks

* Notices

* Timetable records

The dashboard should look populated immediately after first launch.

## 28. ROLE PERMISSIONS

Admin:

* Full access

Teacher:

* Dashboard

* Students

* Attendance

* Examinations

* Timetable

* Relevant reports

Accountant:

* Dashboard

* Fees

* Payments

* Fee Reports

* Salary/Payroll where permitted

Staff:

* Dashboard

* Students

* Admissions

* Attendance

* Notices

* Assigned modules

Hide unauthorized sidebar modules based on role.

## 29. RESPONSIVE DESIGN

Desktop:

* Full sidebar

* Spacious dashboard

* Multi-column cards

Tablet:

* Collapsible sidebar

* Responsive tables

Mobile:

* Sidebar drawer

* Mobile-friendly cards

* Horizontally scrollable tables where required

* Responsive forms

* Mobile-friendly modals

* Touch-friendly controls

Ensure there are no broken layouts or horizontal overflow problems.

## 30. IMPORTANT IMPLEMENTATION RULES

* Use React components instead of duplicated markup.

* Use reusable form components.

* Use reusable table components.

* Use reusable document components.

* Use reusable modal components.

* Keep business logic separate from UI.

* Keep LocalStorage logic separate from pages.

* Use clean naming conventions.

* Avoid unnecessary dependencies.

* Do not use a backend.

* Do not use a database.

* Do not use Next.js.

* Do not use TypeScript unless absolutely required; prefer JavaScript/JSX.

* Use Vite.

* Use Tailwind CSS.

## 31. FINAL DELIVERY REQUIREMENT

Build the complete working School Management Portal.

Do not only create a dashboard mockup.

The final application must have:

1. Functional login

2. Role-based dashboards

3. Working sidebar navigation

4. Functional Student Management

5. Functional Admission Management

6. Functional Attendance

7. Functional Fee Management

8. Functional Fee Receipt

9. Functional Fee Defaulter system

10. Functional Exam Management

11. Functional Marksheet

12. Functional Report Card

13. Functional ID Card Generator

14. Functional Bonafide Certificate

15. Functional Transfer Certificate

16. Functional Character Certificate

17. Functional Teacher Management

18. Functional Staff Management

19. Functional Payroll

20. Functional Timetable

21. Functional Notice Management

22. Functional Reports

23. Functional School Settings

24. Global Search

25. LocalStorage persistence

26. Print functionality

27. PDF download functionality

28. Responsive mobile design

29. Dark/Light mode

30. Realistic demo data

Before finishing, verify that every navigation item opens the correct page, every form can save/update data, delete actions work, LocalStorage persists data after refresh, calculations are correct, and all document generators produce professional A4/print-ready documents.

The final result should feel like a **real commercial School ERP / School Management Software ready to demonstrate to a school owner.**

Done in this session: all the shared files from your repo are now in place (login page, dashboard, students, admissions, attendance, examinations/report card, fees), the certificates section (bonafide, transfer, character, leaving, study, fee, custom) is fully built, and teachers/staff/payroll with salary slips is built. I also fixed the strict settings that were blocking the build.

Still remaining before the app will run: the linking file that connects each menu item to its screen, plus timetable/classes/subjects, reports, notices and settings pages. Ask me to continue and I'll finish those next.

clone the repo and work still remaining before the app will run continue

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/969d3c76-d5f6-4448-94b0-2e2b1208429a).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
