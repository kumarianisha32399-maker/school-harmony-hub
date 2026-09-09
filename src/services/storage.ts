// Centralized persistence layer. Swap this file to move from LocalStorage
// to an API/database without touching any UI code.

const PREFIX = "sms:";

export const KEYS = {
  students: "students",
  teachers: "teachers",
  staff: "staff",
  invoices: "invoices",
  payments: "payments",
  attendance: "attendance",
  exams: "exams",
  marks: "marks",
  notices: "notices",
  admissions: "admissions",
  timetable: "timetable",
  classes: "classes",
  sections: "sections",
  subjects: "subjects",
  settings: "settings",
  users: "users",
  session: "session",
  theme: "theme",
  seeded: "seeded",
  salaries: "salaries",
  certificates: "certificates",
  staffAttendance: "staffAttendance",
} as const;

const isBrowser = () => typeof window !== "undefined";

export const storage = {
  get<T>(key: string, fallback: T): T {
    if (!isBrowser()) return fallback;
    try {
      const raw = window.localStorage.getItem(PREFIX + key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  },
  set<T>(key: string, value: T) {
    if (!isBrowser()) return;
    try {
      window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch {
      /* quota */
    }
  },
  remove(key: string) {
    if (!isBrowser()) return;
    window.localStorage.removeItem(PREFIX + key);
  },
  clearAll() {
    if (!isBrowser()) return;
    Object.keys(window.localStorage)
      .filter((k) => k.startsWith(PREFIX))
      .forEach((k) => window.localStorage.removeItem(k));
  },
  exportAll() {
    const out: Record<string, unknown> = {};
    Object.values(KEYS).forEach((k) => {
      out[k] = storage.get(k, null);
    });
    return out;
  },
  importAll(data: Record<string, unknown>) {
    Object.entries(data).forEach(([k, v]) => {
      if (v !== null && v !== undefined) storage.set(k, v);
    });
  },
};

export const uid = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
