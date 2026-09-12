"use client";

import { useState } from "react";
import {
  Building2,
  Database,
  Download,
  Plus,
  Save,
  Shield,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/context/AppContext";
import { api } from "@/services/api";
import {
  FormModal,
  PageHeader,
  Panel,
  SelectField,
  TextField,
  useConfirm,
} from "@/components/common/Ui";
import { ImageUpload } from "@/components/common/ImageUpload";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/common/DataTable";
import { Badge } from "@/modules/shared";

export function SchoolProfile() {
  const { settings, saveSettings } = useApp();
  const [form, setForm] = useState({ ...settings });

  const setField = (k: string, v: any) => setForm((prev: any) => ({ ...prev, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveSettings(form);
    toast.success("School profile updated successfully in MongoDB!");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="School Profile & Settings"
        subtitle="Configure institution identity, letterhead headers, session, and affiliations."
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <Panel
          title="Basic Information"
          actions={
            <Button type="submit" size="sm" className="gap-2">
              <Save className="size-4" /> Save Changes
            </Button>
          }
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <TextField
              label="School Name"
              value={form.name}
              onChange={(v) => setField("name", v)}
              required
            />
            <TextField
              label="Tagline / Motto"
              value={form.tagline}
              onChange={(v) => setField("tagline", v)}
            />
            <TextField
              label="School Code"
              value={form.code}
              onChange={(v) => setField("code", v)}
              required
            />
            <TextField
              label="Affiliation Details"
              value={form.affiliation}
              onChange={(v) => setField("affiliation", v)}
            />
            <TextField
              label="Principal Name"
              value={form.principal}
              onChange={(v) => setField("principal", v)}
            />
            <TextField
              label="Current Academic Session"
              value={form.session}
              onChange={(v) => setField("session", v)}
            />
          </div>
        </Panel>

        <Panel title="Contact & Address (Used in Letterhead and Receipts)">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="sm:col-span-2 lg:col-span-3">
              <TextField
                label="Full Address"
                value={form.address}
                onChange={(v) => setField("address", v)}
              />
            </div>
            <TextField
              label="Phone Number"
              value={form.phone}
              onChange={(v) => setField("phone", v)}
            />
            <TextField
              label="Email Address"
              value={form.email}
              onChange={(v) => setField("email", v)}
              type="email"
            />
            <TextField
              label="Official Website"
              value={form.website}
              onChange={(v) => setField("website", v)}
            />
          </div>
        </Panel>

        <Panel title="Branding & School Logo (Cloudinary Upload)">
          <div className="grid gap-4 sm:grid-cols-2">
            <ImageUpload
              label="School Logo"
              value={form.logo}
              onChange={(url) => setField("logo", url)}
              folder="school_logo"
            />
            <div className="flex items-center gap-4 rounded-xl border border-dashed border-border p-4">
              <div className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground border border-border">
                {form.logo ? (
                  <img
                    src={form.logo}
                    alt="Logo Preview"
                    className="size-full rounded-xl object-contain"
                  />
                ) : (
                  <Building2 className="size-8" />
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                <p className="font-semibold text-foreground">Live Letterhead Logo</p>
                <p>
                  This logo is automatically rendered on all A4 report cards, marks-sheets, student ID cards, transfer certificates, and fee receipts.
                </p>
              </div>
            </div>
          </div>
        </Panel>

        <div className="flex justify-end">
          <Button type="submit" size="lg" className="gap-2">
            <Save className="size-4" /> Save Profile Settings
          </Button>
        </div>
      </form>
    </div>
  );
}

const ROLES = ["Admin", "Teacher", "Accountant", "Staff"];

export function UserManagement() {
  const { users, add, update, remove } = useApp();
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({
    name: "",
    username: "",
    password: "",
    role: "Teacher",
    email: "",
  });
  const { confirm, dialog } = useConfirm();

  const openAdd = () => {
    setEditing(null);
    setForm({
      name: "",
      username: "",
      password: "",
      role: "Teacher",
      email: "",
    });
    setModal(true);
  };

  const openEdit = (u: any) => {
    setEditing(u);
    setForm({
      name: u.name || "",
      username: u.username || "",
      password: "", // Keep blank unless updating
      role: u.role || "Teacher",
      email: u.email || "",
    });
    setModal(true);
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.username.trim() || (!editing && !form.password.trim())) {
      toast.error("Please fill in Name, Username, and Password.");
      return;
    }

    if (editing) {
      await update("users", editing.id || editing._id, form);
      toast.success("User updated successfully in MongoDB!");
    } else {
      await add("users", form);
      toast.success("New user account created in MongoDB!");
    }
    setModal(false);
  };

  const columns: Column[] = [
    {
      key: "name",
      label: "User Name",
      render: (r) => (
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
            {r.name?.charAt(0) || "U"}
          </div>
          <div>
            <p className="font-semibold">{r.name}</p>
            <p className="text-xs text-muted-foreground">{r.email || "No email"}</p>
          </div>
        </div>
      ),
    },
    { key: "username", label: "Username" },
    {
      key: "role",
      label: "Role",
      render: (r) => {
        const tone =
          r.role === "Admin"
            ? "red"
            : r.role === "Teacher"
            ? "blue"
            : r.role === "Accountant"
            ? "green"
            : "muted";
        return <Badge tone={tone}>{r.role}</Badge>;
      },
    },
    {
      key: "actions",
      label: "Actions",
      sortable: false,
      render: (r) => (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => openEdit(r)}>
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:bg-destructive/10"
            onClick={() =>
              confirm(`Are you sure you want to delete user "${r.name}"?`, async () => {
                await remove("users", r.id || r._id);
                toast.success("User deleted.");
              })
            }
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        subtitle="Manage portal access and role permissions for administrators, faculty, and staff."
        actions={
          <Button onClick={openAdd} className="gap-2">
            <Plus className="size-4" /> Add User
          </Button>
        }
      />

      <Panel>
        <DataTable
          columns={columns}
          rows={users}
          searchKeys={["name", "username", "email", "role"]}
          exportName="users_list"
          emptyMessage="No user accounts found."
        />
      </Panel>

      <FormModal
        open={modal}
        onOpenChange={setModal}
        title={editing ? "Edit User Account" : "Create New User Account"}
        onSubmit={handleSubmit}
        submitLabel={editing ? "Update User" : "Create User"}
      >
        <TextField
          label="Full Name"
          value={form.name}
          onChange={(v) => setForm((p) => ({ ...p, name: v }))}
          required
        />
        <TextField
          label="Username"
          value={form.username}
          onChange={(v) => setForm((p) => ({ ...p, username: v }))}
          required
        />
        <TextField
          label={editing ? "New Password (leave blank to keep current)" : "Password"}
          type="password"
          value={form.password}
          onChange={(v) => setForm((p) => ({ ...p, password: v }))}
          required={!editing}
        />
        <TextField
          label="Email Address"
          type="email"
          value={form.email}
          onChange={(v) => setForm((p) => ({ ...p, email: v }))}
        />
        <SelectField
          label="System Role"
          value={form.role}
          onChange={(v) => setForm((p) => ({ ...p, role: v }))}
          options={ROLES}
        />
      </FormModal>

      {dialog}
    </div>
  );
}

export function BackupRestore() {
  const { students, teachers, staff, invoices, payments, attendance, exams, marks, notices, timetable, settings } = useApp();

  const handleExport = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      school: settings?.name,
      students,
      teachers,
      staff,
      invoices,
      payments,
      attendance,
      exams,
      marks,
      notices,
      timetable,
      settings,
    };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `harmony_school_database_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("MongoDB database snapshot exported successfully!");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Backup & Export"
        subtitle="Export local database records into a portable JSON snapshot."
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Panel title="Export Database Snapshot">
          <div className="space-y-4">
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Download className="size-6" />
            </div>
            <div>
              <h3 className="font-semibold">Download Full Database Snapshot</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Exports live database records (students, fees, attendance, examinations, staff, notices, and settings) into a structured JSON file for archiving.
              </p>
            </div>
            <Button onClick={handleExport} className="w-full gap-2">
              <Download className="size-4" /> Export JSON Snapshot
            </Button>
          </div>
        </Panel>

        <Panel title="Database Health & Connection">
          <div className="space-y-4">
            <div className="flex size-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
              <Database className="size-6" />
            </div>
            <div>
              <h3 className="font-semibold">MongoDB Atlas Primary Source</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Connected to production MongoDB cluster. Real-time write-ahead logging and document transactions are managed directly through Next.js route handlers.
              </p>
            </div>
            <div className="rounded-lg bg-muted/40 p-3 text-xs space-y-1">
              <p className="font-medium text-foreground">Status: <span className="text-emerald-600 font-semibold">Active & Synced</span></p>
              <p className="text-muted-foreground">Single Source of Truth: MongoDB Atlas</p>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
