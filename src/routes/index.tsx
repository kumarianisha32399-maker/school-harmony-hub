import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Eye, EyeOff, GraduationCap, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useApp } from "@/context/AppContext";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sign in — Harmony School ERP" },
      {
        name: "description",
        content:
          "Sign in to the Harmony School management portal as admin, teacher, accountant or office staff.",
      },
      { property: "og:title", content: "Sign in — Harmony School ERP" },
      {
        property: "og:description",
        content: "Role based login for the Harmony School management portal.",
      },
    ],
  }),
  component: LoginPage,
});

const ROLES = ["Admin", "Teacher", "Accountant", "Staff"];
const DEMO: Record<string, { u: string; p: string }> = {
  Admin: { u: "admin", p: "admin123" },
  Teacher: { u: "teacher", p: "teacher123" },
  Accountant: { u: "accountant", p: "account123" },
  Staff: { u: "staff", p: "staff123" },
};

function LoginPage() {
  const { login, user, ready, settings } = useApp();
  const navigate = useNavigate();
  const [role, setRole] = useState("Admin");
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (ready && user) navigate({ to: "/app/$", params: { _splat: "dashboard" } });
  }, [ready, user, navigate]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const err = login(username.trim(), password, role, remember);
    setBusy(false);
    if (err) {
      toast.error(err);
      return;
    }
    toast.success(`Welcome back, ${role}`);
    navigate({ to: "/app/$", params: { _splat: "dashboard" } });
  };

  const useDemo = (r: string) => {
    setRole(r);
    setUsername(DEMO[r].u);
    setPassword(DEMO[r].p);
  };

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="relative hidden flex-col justify-between bg-sidebar p-12 text-sidebar-foreground lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
            <GraduationCap className="size-6" />
          </div>
          <div>
            <p className="text-lg font-bold leading-tight">{settings.name}</p>
            <p className="text-xs opacity-70">{settings.tagline}</p>
          </div>
        </div>

        <div className="max-w-md">
          <h2 className="text-4xl font-bold leading-tight">
            One portal for every part of your school.
          </h2>
          <p className="mt-4 text-sm opacity-80">
            Admissions, attendance, fee collection, examinations, certificates and payroll —
            managed from a single dashboard with print-ready documents.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            {[
              ["24", "Students"],
              ["8", "Teachers"],
              ["13", "Classes"],
            ].map(([n, l]) => (
              <div key={l} className="rounded-xl bg-sidebar-accent px-3 py-4">
                <p className="text-2xl font-bold">{n}</p>
                <p className="text-[11px] uppercase tracking-wide opacity-70">{l}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs opacity-60">
          {settings.affiliation} • School Code {settings.code}
        </p>
      </section>

      <section className="flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <GraduationCap className="size-6" />
            </div>
            <div>
              <p className="text-base font-bold leading-tight">{settings.name}</p>
              <p className="text-xs text-muted-foreground">{settings.tagline}</p>
            </div>
          </div>

          <h1 className="text-2xl font-bold tracking-tight">Sign in to your portal</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose your role and continue with the demo credentials.
          </p>

          <div className="mt-6 grid grid-cols-4 gap-2">
            {ROLES.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => useDemo(r)}
                className={`rounded-lg border px-2 py-2 text-xs font-semibold transition-colors ${
                  role === r
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:border-primary/50"
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="u">Username or email</Label>
              <Input id="u" value={username} onChange={(e) => setUsername(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p">Password</Label>
              <div className="relative">
                <Input
                  id="p"
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <Checkbox checked={remember} onCheckedChange={(v) => setRemember(Boolean(v))} />
                Remember me
              </label>
              <button
                type="button"
                onClick={() =>
                  toast.info("Contact the school administrator to reset your password.")
                }
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

          <div className="mt-6 rounded-xl border border-dashed border-border bg-card p-4 text-xs">
            <p className="mb-2 font-semibold uppercase tracking-wide text-muted-foreground">
              Demo credentials
            </p>
            <div className="grid gap-1 sm:grid-cols-2">
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
    </main>
  );
}
