import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { KEYS, storage, uid } from "@/services/storage";
import {
  buildAdmissions,
  buildAttendance,
  buildExams,
  buildFees,
  buildMarks,
  buildNotices,
  buildStaff,
  buildStudents,
  buildTeachers,
  buildTimetable,
  CLASSES,
  DEFAULT_SETTINGS,
  SECTIONS,
  SUBJECTS,
  USERS,
} from "@/data/seed";

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
  classes: string[];
  sections: string[];
  subjects: AnyRow[];
  users: AnyRow[];
  salaries: AnyRow[];
  staffAttendance: AnyRow[];
};

type User = { id: string; name: string; username: string; role: string; email: string };

type Ctx = Collections & {
  settings: AnyRow;
  user: User | null;
  ready: boolean;
  theme: "light" | "dark";
  toggleTheme: () => void;
  login: (username: string, password: string, role: string, remember: boolean) => string | null;
  logout: () => void;
  saveSettings: (s: AnyRow) => void;
  add: (key: keyof Collections, row: AnyRow, prefix?: string) => AnyRow;
  update: (key: keyof Collections, id: string, patch: AnyRow) => void;
  remove: (key: keyof Collections, id: string) => void;
  replace: (key: keyof Collections, rows: AnyRow[]) => void;
  resetDemoData: () => void;
};

const AppContext = createContext<Ctx | null>(null);

function seedAll() {
  const students = buildStudents();
  const teachers = buildTeachers();
  const staff = buildStaff();
  const { invoices, payments } = buildFees(students);
  storage.set(KEYS.students, students);
  storage.set(KEYS.teachers, teachers);
  storage.set(KEYS.staff, staff);
  storage.set(KEYS.invoices, invoices);
  storage.set(KEYS.payments, payments);
  storage.set(KEYS.attendance, buildAttendance(students));
  storage.set(KEYS.exams, buildExams());
  storage.set(KEYS.marks, buildMarks(students));
  storage.set(KEYS.notices, buildNotices());
  storage.set(KEYS.admissions, buildAdmissions(students));
  storage.set(KEYS.timetable, buildTimetable());
  storage.set(KEYS.classes, CLASSES);
  storage.set(KEYS.sections, SECTIONS);
  storage.set(KEYS.subjects, SUBJECTS);
  storage.set(KEYS.settings, DEFAULT_SETTINGS);
  storage.set(KEYS.users, USERS);
  storage.set(KEYS.salaries, []);
  storage.set(KEYS.staffAttendance, []);
  storage.set(KEYS.seeded, true);
}

const EMPTY: Collections = {
  students: [], teachers: [], staff: [], invoices: [], payments: [], attendance: [],
  exams: [], marks: [], notices: [], admissions: [], timetable: [], staffAttendance: [],
  classes: CLASSES, sections: SECTIONS, subjects: SUBJECTS, users: USERS, salaries: [],
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Collections>(EMPTY);
  const [settings, setSettings] = useState<AnyRow>(DEFAULT_SETTINGS);
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const loadAll = useCallback(() => {
    setData({
      students: storage.get(KEYS.students, [] as AnyRow[]),
      teachers: storage.get(KEYS.teachers, [] as AnyRow[]),
      staff: storage.get(KEYS.staff, [] as AnyRow[]),
      invoices: storage.get(KEYS.invoices, [] as AnyRow[]),
      payments: storage.get(KEYS.payments, [] as AnyRow[]),
      attendance: storage.get(KEYS.attendance, [] as AnyRow[]),
      exams: storage.get(KEYS.exams, [] as AnyRow[]),
      marks: storage.get(KEYS.marks, [] as AnyRow[]),
      notices: storage.get(KEYS.notices, [] as AnyRow[]),
      admissions: storage.get(KEYS.admissions, [] as AnyRow[]),
      timetable: storage.get(KEYS.timetable, [] as AnyRow[]),
      classes: storage.get(KEYS.classes, CLASSES),
      sections: storage.get(KEYS.sections, SECTIONS),
      subjects: storage.get(KEYS.subjects, SUBJECTS as AnyRow[]),
      users: storage.get(KEYS.users, USERS as AnyRow[]),
      salaries: storage.get(KEYS.salaries, [] as AnyRow[]),
      staffAttendance: storage.get(KEYS.staffAttendance, [] as AnyRow[]),
    });
    setSettings(storage.get(KEYS.settings, DEFAULT_SETTINGS));
  }, []);

  useEffect(() => {
    if (!storage.get(KEYS.seeded, false)) seedAll();
    loadAll();
    setUser(storage.get<User | null>(KEYS.session, null));
    const t = storage.get<"light" | "dark">(KEYS.theme, "light");
    setTheme(t);
    document.documentElement.classList.toggle("dark", t === "dark");
    setReady(true);
  }, [loadAll]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "light" ? "dark" : "light";
      storage.set(KEYS.theme, next);
      document.documentElement.classList.toggle("dark", next === "dark");
      return next;
    });
  }, []);

  const login: Ctx["login"] = useCallback((username, password, role, remember) => {
    const users = storage.get(KEYS.users, USERS as AnyRow[]);
    const found = users.find(
      (u) => (u.username === username.trim() || u.email === username.trim()) && u.password === password,
    );
    if (!found) return "Invalid username or password.";
    if (found.role !== role) return `These credentials belong to the ${found.role} role.`;
    const session = { id: found.id, name: found.name, username: found.username, role: found.role, email: found.email };
    setUser(session);
    storage.set(KEYS.session, session);
    if (remember) storage.set("remember", username);
    else storage.remove("remember");
    return null;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    storage.remove(KEYS.session);
  }, []);

  const persist = useCallback((key: keyof Collections, rows: AnyRow[]) => {
    storage.set(key as string, rows);
    setData((d) => ({ ...d, [key]: rows }) as Collections);
  }, []);

  const add: Ctx["add"] = useCallback(
    (key, row, prefix = "row") => {
      const rows = storage.get(key as string, [] as AnyRow[]);
      const item = { id: row.id || uid(prefix), ...row };
      persist(key, [item, ...rows]);
      return item;
    },
    [persist],
  );

  const update: Ctx["update"] = useCallback(
    (key, id, patch) => {
      const rows = storage.get(key as string, [] as AnyRow[]);
      persist(key, rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    },
    [persist],
  );

  const remove: Ctx["remove"] = useCallback(
    (key, id) => {
      const rows = storage.get(key as string, [] as AnyRow[]);
      persist(key, rows.filter((r) => r.id !== id));
    },
    [persist],
  );

  const replace: Ctx["replace"] = useCallback((key, rows) => persist(key, rows), [persist]);

  const saveSettings = useCallback((s: AnyRow) => {
    storage.set(KEYS.settings, s);
    setSettings(s);
  }, []);

  const resetDemoData = useCallback(() => {
    seedAll();
    loadAll();
  }, [loadAll]);

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
      resetDemoData,
    }),
    [data, settings, user, ready, theme, toggleTheme, login, logout, saveSettings, add, update, remove, replace, resetDemoData],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
