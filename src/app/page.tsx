"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, GraduationCap, Loader2, Mail, Send, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useApp } from "@/context/AppContext";
import { api } from "@/services/api";

const ROLES = ["Admin", "Teacher", "Accountant", "Staff"];
const DEMO: Record<string, { u: string; p: string }> = {
  Admin: { u: "admin", p: "admin123" },
  Teacher: { u: "teacher", p: "teacher123" },
  Accountant: { u: "accountant", p: "account123" },
  Staff: { u: "staff", p: "staff123" },
};

export default function LoginPage() {
  const { login, user, ready, settings } = useApp();
  const router = useRouter();
  const [role, setRole] = useState("Admin");
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState(false);

  // Forgot password modal state
  const [forgotModal, setForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotBusy, setForgotBusy] = useState(false);

  useEffect(() => {
    if (ready && user) {
      router.push("/app/dashboard");
    }
  }, [ready, user, router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const err = await login(username.trim(), password, role, remember);
    setBusy(false);
    if (err) {
      toast.error(err);
      return;
    }
    toast.success(`Welcome back, ${role}!`);
    router.push("/app/dashboard");
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      toast.error("Please enter your registered email address.");
      return;
    }

    setForgotBusy(true);
    try {
      const res = await api.auth.forgotPassword(forgotEmail);
      if (res.success) {
        toast.success(res.message || "Password reset email sent! Check your inbox.");
        setForgotModal(false);
        setForgotEmail("");
      } else {
        toast.error(res.error || "Failed to send password reset email.");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setForgotBusy(false);
    }
  };

  const selectDemoRole = (r: string) => {
    setRole(r);
    setUsername(DEMO[r].u);
    setPassword(DEMO[r].p);
  };

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="relative hidden flex-col justify-between bg-sidebar p-12 text-sidebar-foreground lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground shadow-md">
            <GraduationCap className="size-6" />
          </div>
          <div>
            <p className="text-lg font-bold leading-tight">{settings?.name || "Harmony Public School"}</p>
            <p className="text-xs opacity-70">{settings?.tagline || "Knowledge • Discipline • Excellence"}</p>
          </div>
        </div>

        <div className="max-w-md space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-sidebar-border bg-sidebar-accent/50 px-3 py-1 text-xs font-medium text-sidebar-primary-foreground">
            <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
            MongoDB Connected ERP
          </div>
          <h2 className="text-4xl font-bold leading-tight">
            One unified portal for every part of your school.
          </h2>
          <p className="text-sm opacity-80 leading-relaxed">
            Admissions, attendance, fee collection, examinations, certificates and payroll —
            managed from a single modern dashboard with print-ready A4 documents.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            {[
              ["24+", "Students"],
              ["8", "Teachers"],
              ["13", "Classes"],
            ].map(([n, l]) => (
              <div key={l} className="rounded-xl bg-sidebar-accent/60 border border-sidebar-border/50 px-3 py-4 backdrop-blur">
                <p className="text-2xl font-bold">{n}</p>
                <p className="text-[11px] uppercase tracking-wider opacity-70">{l}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs opacity-60 border-t border-sidebar-border pt-4">
          <p>{settings?.affiliation || "CBSE Affiliation No. 1030412"}</p>
          <p>School Code: {settings?.code || "HPS-1042"}</p>
        </div>
      </section>

      <section className="flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <GraduationCap className="size-6" />
            </div>
            <div>
              <p className="text-base font-bold leading-tight">{settings?.name || "Harmony Public School"}</p>
              <p className="text-xs text-muted-foreground">{settings?.tagline || "Knowledge • Discipline • Excellence"}</p>
            </div>
          </div>

          <h1 className="text-2xl font-bold tracking-tight">Sign in to your portal</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Select a role to autofill demo credentials, or type your login details.
          </p>

          <div className="mt-6 grid grid-cols-4 gap-2">
            {ROLES.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => selectDemoRole(r)}
                className={`rounded-lg border px-2 py-2 text-xs font-semibold transition-all ${
                  role === r
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:bg-muted"
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="u">Username or Email</Label>
              <Input
                id="u"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username or email"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p">Password</Label>
              <div className="relative">
                <Input
                  id="p"
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
                  aria-label={show ? "Hide password" : "Show password"}
                >
                  {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                <Checkbox checked={remember} onCheckedChange={(v) => setRemember(Boolean(v))} />
                Remember me
              </label>
              <button
                type="button"
                onClick={() => setForgotModal(true)}
                className="text-sm font-medium text-primary hover:underline"
              >
                Forgot password?
              </button>
            </div>

            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
              Sign in as {role}
            </Button>
          </form>

          <div className="mt-6 rounded-xl border border-dashed border-border bg-card/60 p-4 text-xs">
            <p className="mb-2 font-semibold uppercase tracking-wider text-muted-foreground">
              Demo Credentials (MongoDB Backed)
            </p>
            <div className="grid gap-1.5 sm:grid-cols-2">
              {ROLES.map((r) => (
                <p key={r} className="text-muted-foreground">
                  <span className="font-semibold text-foreground">{r}:</span> {DEMO[r].u} /{" "}
                  {DEMO[r].p}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Forgot Password Modal */}
      <Dialog open={forgotModal} onOpenChange={setForgotModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="size-5 text-primary" /> Reset Password
            </DialogTitle>
            <DialogDescription>
              Enter your registered email address and we&apos;ll send you a password reset link via SMTP.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleForgotPassword} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="femail">Registered Email</Label>
              <Input
                id="femail"
                type="email"
                placeholder="e.g. admin@harmonyschool.edu.in"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                required
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setForgotModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={forgotBusy} className="gap-2">
                {forgotBusy ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                Send Reset Link
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}
