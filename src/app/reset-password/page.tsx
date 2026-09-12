"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, KeyRound, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  searchParams: Promise<{ token?: string; email?: string }>;
};

export default function ResetPasswordPage({ searchParams }: Props) {
  const router = useRouter();
  const { token = "", email = "" } = use(searchParams);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token || !email) {
      toast.error("Invalid or missing password reset token.");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.auth.resetPassword({
        token,
        email,
        password,
      });

      if (res.success) {
        toast.success(res.message || "Password reset successful! Please log in.");
        setTimeout(() => router.push("/"), 1500);
      } else {
        toast.error(res.error || "Failed to reset password.");
      }
    } catch {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-lg">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
            <GraduationCap className="size-7" />
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground">
            Set New Password
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Enter a new password for account <strong>{email || "your account"}</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="pass">New Password</Label>
            <Input
              id="pass"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cpass">Confirm New Password</Label>
            <Input
              id="cpass"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              required
            />
          </div>

          <Button type="submit" className="w-full gap-2" disabled={loading}>
            {loading ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
            Update Password
          </Button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="text-xs font-medium text-primary hover:underline"
            >
              Back to Login
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
