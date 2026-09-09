import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ChevronDown,
  GraduationCap,
  LogOut,
  Menu,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Sun,
  X,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { navForRole } from "@/config/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingState } from "@/components/common/Ui";
import { initials } from "@/utils/helpers";
import { resolveModule } from "@/modules/registry";

export function AppShell({ slug }: { slug: string }) {
  const { user, ready, logout, theme, toggleTheme, settings, students } = useApp();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [open, setOpen] = useState<string[]>([]);
  const [query, setQuery] = useState("");

  const groups = useMemo(() => navForRole(user?.role || "Admin"), [user]);

  useEffect(() => {
    if (ready && !user) navigate({ to: "/" });
  }, [ready, user, navigate]);

  useEffect(() => {
    setMobileOpen(false);
    const parent = groups.find((g) => (g.items || []).some((i) => slug.startsWith(i.slug)));
    if (parent) setOpen((o) => (o.includes(parent.label) ? o : [...o, parent.label]));
  }, [slug, groups]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    return students
      .filter((s: any) =>
        [s.name, s.admissionNo, s.father, s.mobile, s.className, String(s.rollNo)].some((v) =>
          String(v ?? "").toLowerCase().includes(q),
        ),
      )
      .slice(0, 6);
  }, [query, students]);

  if (!ready) return <LoadingState />;
  if (!user) return null;

  const mod = resolveModule(slug, user.role);

  const goto = (s: string) => navigate({ to: "/app/$", params: { _splat: s } });

  const sidebar = (
    <nav className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 shrink-0 items-center gap-3 border-b border-sidebar-border px-4">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
          <GraduationCap className="size-5" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">{settings.name}</p>
            <p className="truncate text-[11px] opacity-70">Session {settings.session}</p>
          </div>
        )}
        <button
          className="ml-auto rounded p-1 opacity-70 hover:opacity-100 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
        >
          <X className="size-5" />
        </button>
      </div>

      <div className="flex-1 space-y-1 overflow-y-auto px-2 py-3">
        {groups.map((g) => {
          const Icon = g.icon;
          const isOpen = open.includes(g.label);
          const active =
            g.slug === slug || (g.items || []).some((i) => slug === i.slug || slug.startsWith(i.slug + "/"));
          return (
            <div key={g.label}>
              <button
                type="button"
                onClick={() => {
                  if (g.slug) goto(g.slug);
                  else setOpen((o) => (isOpen ? o.filter((x) => x !== g.label) : [...o, g.label]));
                }}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
                title={collapsed ? g.label : undefined}
              >
                <Icon className="size-4 shrink-0" />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left">{g.label}</span>
                    {g.items && (
                      <ChevronDown
                        className={`size-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                      />
                    )}
                  </>
                )}
              </button>
              {!collapsed && g.items && isOpen && (
                <div className="mt-1 space-y-0.5 border-l border-sidebar-border pl-3 duration-200 animate-in slide-in-from-top-1">
                  {g.items.map((i) => (
                    <button
                      key={i.slug}
                      type="button"
                      onClick={() => goto(i.slug)}
                      className={`block w-full rounded-md px-3 py-1.5 text-left text-[13px] transition-colors ${
                        slug === i.slug
                          ? "bg-sidebar-accent font-semibold text-sidebar-accent-foreground"
                          : "opacity-75 hover:bg-sidebar-accent hover:opacity-100"
                      }`}
                    >
                      {i.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="shrink-0 border-t border-sidebar-border p-3">
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className="hidden w-full items-center gap-3 rounded-lg px-3 py-2 text-sm opacity-75 hover:bg-sidebar-accent hover:opacity-100 lg:flex"
        >
          {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
          {!collapsed && "Collapse"}
        </button>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-background">
      <aside
        className={`fixed inset-y-0 left-0 z-40 hidden transition-[width] duration-200 lg:block ${
          collapsed ? "w-[72px]" : "w-64"
        }`}
      >
        {sidebar}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 duration-200 animate-in slide-in-from-left">
            {sidebar}
          </div>
        </div>
      )}

      <div className={`transition-[padding] duration-200 ${collapsed ? "lg:pl-[72px]" : "lg:pl-64"}`}>
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-card/90 px-4 backdrop-blur print:hidden">
          <button
            className="rounded-lg p-2 hover:bg-muted lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </button>

          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search students, admission no, mobile…"
              className="pl-9"
            />
            {results.length > 0 && (
              <div className="absolute left-0 right-0 top-12 z-40 overflow-hidden rounded-xl border border-border bg-popover shadow-lg">
                {results.map((s: any) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setQuery("");
                      goto(`students/profile/${s.id}`);
                    }}
                    className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-muted"
                  >
                    <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {initials(s.name)}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">{s.name}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {s.admissionNo} • {s.className}-{s.section} • {s.mobile}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
              {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </Button>
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold leading-tight">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.role}</p>
            </div>
            <span className="flex size-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
              {initials(user.name)}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                logout();
                navigate({ to: "/" });
              }}
              aria-label="Sign out"
            >
              <LogOut className="size-4" />
            </Button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1400px] p-4 sm:p-6">
          {mod ?? (
            <div className="flex flex-col items-center gap-3 py-24 text-center">
              <h2 className="text-xl font-semibold">Page not available</h2>
              <p className="text-sm text-muted-foreground">
                This module doesn't exist or your role has no access to it.
              </p>
              <Link
                to="/app/$"
                params={{ _splat: "dashboard" }}
                className="text-sm font-medium text-primary hover:underline"
              >
                Back to dashboard
              </Link>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
