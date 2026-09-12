"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api } from "@/services/api";
import { CLASSES, DEFAULT_SETTINGS, SECTIONS, SUBJECTS } from "@/data/seed";
import { toast } from "sonner";

type AnyRow = Record<string, any>;

type Collections = {
  students: AnyRow[];
  teachers: AnyRow[];
  staff: AnyRow[];
  invoices: AnyRow[];
  payments: AnyRow[];
  attendance: AnyRow[];
  exams: AnyRow[];
  marks: AnyRow[];
  notices: AnyRow[];
  admissions: AnyRow[];
  timetable: AnyRow[];
  certificates: AnyRow[];
  classes: string[];
  sections: string[];
  subjects: AnyRow[];
  users: AnyRow[];
  salaries: AnyRow[];
};

type User = { id: string; name: string; username: string; role: string; email: string };

type Ctx = Collections & {
  settings: AnyRow;
  user: User | null;
  ready: boolean;
  theme: "light" | "dark";
  toggleTheme: () => void;
  login: (username: string, password: string, role: string, remember: boolean) => Promise<string | null>;
  logout: () => Promise<void>;
  saveSettings: (s: AnyRow) => Promise<void>;
  add: (key: keyof Collections, row: AnyRow, prefix?: string) => Promise<AnyRow>;
  update: (key: keyof Collections, id: string, patch: AnyRow) => Promise<void>;
  remove: (key: keyof Collections, id: string) => Promise<void>;
  replace: (key: keyof Collections, rows: AnyRow[]) => void;
  refreshData: () => Promise<void>;
};

const AppContext = createContext<Ctx | null>(null);

const EMPTY: Collections = {
  students: [],
  teachers: [],
  staff: [],
  invoices: [],
  payments: [],
  attendance: [],
  exams: [],
  marks: [],
  notices: [],
  admissions: [],
  timetable: [],
  certificates: [],
  classes: CLASSES,
  sections: SECTIONS,
  subjects: SUBJECTS,
  users: [],
  salaries: [],
};

function normalizeRows(rows: any[]): any[] {
  if (!Array.isArray(rows)) return [];
  return rows.map((r) => {
    if (!r) return r;
    const id = r.id || (r._id ? String(r._id) : undefined);
    return { ...r, id };
  });
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Collections>(EMPTY);
  const [settings, setSettings] = useState<AnyRow>(DEFAULT_SETTINGS);
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Load all live collections from MongoDB
  const loadAll = useCallback(async () => {
    try {
      const [
        studentsRes,
        teachersRes,
        staffRes,
        feesRes,
        paymentsRes,
        attendanceRes,
        examsRes,
        marksRes,
        noticesRes,
        admissionsRes,
        classesRes,
        subjectsRes,
        timetableRes,
        settingsRes,
        usersRes,
        payrollRes,
      ] = await Promise.all([
        api.students.getAll().catch(() => ({ success: false, data: [] })),
        api.teachers.getAll().catch(() => ({ success: false, data: [] })),
        api.staff.getAll().catch(() => ({ success: false, data: [] })),
        api.fees.getAll().catch(() => ({ success: false, data: [] })),
        api.payments.getAll().catch(() => ({ success: false, data: [] })),
        api.attendance.getAll().catch(() => ({ success: false, data: [] })),
        api.exams.getAll().catch(() => ({ success: false, data: [] })),
        api.marks.getAll().catch(() => ({ success: false, data: [] })),
        api.notices.getAll().catch(() => ({ success: false, data: [] })),
        api.admissions.getAll().catch(() => ({ success: false, data: [] })),
        api.academics.getClasses().catch(() => ({ success: false, data: [] })),
        api.academics.getSubjects().catch(() => ({ success: false, data: [] })),
        api.academics.getTimetable().catch(() => ({ success: false, data: [] })),
        api.settings.get().catch(() => ({ success: false, data: null })),
        api.users.getAll().catch(() => ({ success: false, data: [] })),
        api.payroll.getAll().catch(() => ({ success: false, data: [] })),
      ]);

      const classList =
        classesRes.success && classesRes.data && classesRes.data.length > 0
          ? classesRes.data.map((c: any) => c.name)
          : CLASSES;

      const subjectList =
        subjectsRes.success && subjectsRes.data && subjectsRes.data.length > 0
          ? normalizeRows(subjectsRes.data)
          : SUBJECTS;

      setData({
        students: normalizeRows(studentsRes.data || []),
        teachers: normalizeRows(teachersRes.data || []),
        staff: normalizeRows(staffRes.data || []),
        invoices: normalizeRows(feesRes.data || []),
        payments: normalizeRows(paymentsRes.data || []),
        attendance: normalizeRows(attendanceRes.data || []),
        exams: normalizeRows(examsRes.data || []),
        marks: normalizeRows(marksRes.data || []),
        notices: normalizeRows(noticesRes.data || []),
        admissions: normalizeRows(admissionsRes.data || []),
        timetable: normalizeRows(timetableRes.data || []),
        certificates: [],
        classes: classList,
        sections: SECTIONS,
        subjects: subjectList,
        users: normalizeRows(usersRes.data || []),
        salaries: normalizeRows(payrollRes.data || []),
      });

      if (settingsRes.success && settingsRes.data) {
        setSettings(settingsRes.data);
      }
    } catch (err) {
      console.error("Error loading MongoDB collections:", err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    async function init() {
      // 1. Check current authenticated session
      const authRes = await api.auth.me().catch(() => null);
      if (authRes?.success && authRes.user) {
        setUser(authRes.user);
      }

      // 2. Fetch live database data
      await loadAll();

      // 3. Theme initialization (local preference)
      const storedTheme = (typeof window !== "undefined" && window.localStorage.getItem("sms:theme")) as
        | "light"
        | "dark"
        | null;
      const initialTheme = storedTheme || "light";
      setTheme(initialTheme);
      if (typeof document !== "undefined") {
        document.documentElement.classList.toggle("dark", initialTheme === "dark");
      }

      setReady(true);
    }
    init();
  }, [loadAll]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "light" ? "dark" : "light";
      if (typeof window !== "undefined") {
        window.localStorage.setItem("sms:theme", next);
      }
      if (typeof document !== "undefined") {
        document.documentElement.classList.toggle("dark", next === "dark");
      }
      return next;
    });
  }, []);

  const login: Ctx["login"] = useCallback(
    async (username, password, role, remember) => {
      try {
        const res = await api.auth.login({ username, password, role });
        if (!res.success || !res.user) {
          return res.error || "Invalid username or password.";
        }
        setUser(res.user);
        if (remember && typeof window !== "undefined") {
          window.localStorage.setItem("remember", username);
        }
        // Refresh collections upon login
        loadAll();
        return null;
      } catch (err: any) {
        return err.message || "Failed to log in.";
      }
    },
    [loadAll]
  );

  const logout = useCallback(async () => {
    try {
      await api.auth.logout();
    } finally {
      setUser(null);
    }
  }, []);

  const saveSettings = useCallback(async (s: AnyRow) => {
    try {
      const res = await api.settings.update(s);
      if (res.success && res.data) {
        setSettings(res.data);
      }
    } catch (err) {
      console.error("Failed to save settings:", err);
    }
  }, []);

  // Universal add to MongoDB
  const add: Ctx["add"] = useCallback(
    async (key, row, prefix = "row") => {
      try {
        let res: any;
        switch (key) {
          case "students":
            res = await api.students.create(row);
            break;
          case "teachers":
            res = await api.teachers.create(row);
            break;
          case "staff":
            res = await api.staff.create(row);
            break;
          case "admissions":
            res = await api.admissions.create(row);
            break;
          case "invoices":
            res = await api.fees.create(row);
            break;
          case "payments":
            res = await api.payments.create(row);
            break;
          case "exams":
            res = await api.exams.create(row);
            break;
          case "notices":
            res = await api.notices.create(row);
            break;
          case "certificates":
            res = await api.certificates.create(row);
            break;
          case "salaries":
            res = await api.payroll.save(row);
            break;
          case "users":
            res = await api.users.create(row);
            break;
          case "attendance":
            res = await api.attendance.mark([row]);
            break;
          case "marks":
            res = await api.marks.save([row]);
            break;
          case "timetable":
            res = await api.academics.saveTimetable([row]);
            break;
          default:
            res = { success: true, data: row };
        }

        const createdItem = res?.data ? { ...res.data, id: res.data.id || String(res.data._id) } : row;

        setData((prev) => ({
          ...prev,
          [key]: [createdItem, ...(prev[key] || [])],
        }));

        return createdItem;
      } catch (err: any) {
        toast.error(`Error saving ${String(key)}: ${err.message}`);
        return row;
      }
    },
    []
  );

  // Universal update to MongoDB
  const update: Ctx["update"] = useCallback(
    async (key, id, patch) => {
      try {
        // Optimistic update
        setData((prev) => ({
          ...prev,
          [key]: (prev[key] || []).map((r: any) =>
            typeof r === "object" && r !== null && (r.id === id || r._id === id)
              ? { ...r, ...patch }
              : r
          ),
        }));

        switch (key) {
          case "students":
            await api.students.update(id, patch);
            break;
          case "teachers":
            await api.teachers.update(id, patch);
            break;
          case "staff":
            await api.staff.update(id, patch);
            break;
          case "admissions":
            await api.admissions.update(id, patch);
            break;
          case "invoices":
            await api.fees.update(id, patch);
            break;
          case "exams":
            await api.exams.update(id, patch);
            break;
          case "users":
            await api.users.update(id, patch);
            break;
          case "salaries":
            await api.payroll.save(patch);
            break;
          default:
            break;
        }
      } catch (err: any) {
        toast.error(`Error updating record: ${err.message}`);
      }
    },
    []
  );

  // Universal delete from MongoDB
  const remove: Ctx["remove"] = useCallback(
    async (key, id) => {
      try {
        // Optimistic removal
        setData((prev) => ({
          ...prev,
          [key]: (prev[key] || []).filter((r: any) =>
            typeof r === "object" && r !== null ? r.id !== id && r._id !== id : true
          ),
        }));

        switch (key) {
          case "students":
            await api.students.delete(id);
            break;
          case "teachers":
            await api.teachers.delete(id);
            break;
          case "staff":
            await api.staff.delete(id);
            break;
          case "admissions":
            await api.admissions.delete(id);
            break;
          case "invoices":
            await api.fees.delete(id);
            break;
          case "exams":
            await api.exams.delete(id);
            break;
          case "users":
            await api.users.delete(id);
            break;
          default:
            break;
        }
      } catch (err: any) {
        toast.error(`Error deleting record: ${err.message}`);
      }
    },
    []
  );

  const replace: Ctx["replace"] = useCallback((key, rows) => {
    setData((d) => ({ ...d, [key]: rows }) as Collections);
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      ...data,
      settings,
      user,
      ready,
      theme,
      toggleTheme,
      login,
      logout,
      saveSettings,
      add,
      update,
      remove,
      replace,
      refreshData: loadAll,
    }),
    [data, settings, user, ready, theme, toggleTheme, login, logout, saveSettings, add, update, remove, replace, loadAll]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
