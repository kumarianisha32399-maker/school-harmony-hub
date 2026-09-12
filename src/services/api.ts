import { toast } from "sonner";

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ success: boolean; data?: T; error?: string; [key: string]: any }> {
    try {
      const headers = new Headers(options.headers || {});
      if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
        headers.set("Content-Type", "application/json");
      }

      const res = await fetch(endpoint, {
        ...options,
        headers,
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        const errorMsg = json.error || `Request failed with status ${res.status}`;
        return { success: false, error: errorMsg };
      }

      return json;
    } catch (err: any) {
      console.error(`API Client Error [${endpoint}]:`, err);
      return { success: false, error: err.message || "Network error. Please try again." };
    }
  }

  // Auth
  auth = {
    login: (body: any) =>
      this.request<{ user: any; token: string }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    me: () => this.request<{ user: any }>("/api/auth/me"),
    logout: () => this.request("/api/auth/logout", { method: "POST" }),
    forgotPassword: (email: string) =>
      this.request("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      }),
    resetPassword: (payload: any) =>
      this.request("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  };

  // Students
  students = {
    getAll: (params?: Record<string, string>) => {
      const qs = params ? `?${new URLSearchParams(params).toString()}` : "";
      return this.request<any[]>(`/api/students${qs}`);
    },
    getById: (id: string) => this.request<any>(`/api/students/${id}`),
    create: (data: any) =>
      this.request<any>("/api/students", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      this.request<any>(`/api/students/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      this.request(`/api/students/${id}`, {
        method: "DELETE",
      }),
  };

  // Admissions
  admissions = {
    getAll: (params?: Record<string, string>) => {
      const qs = params ? `?${new URLSearchParams(params).toString()}` : "";
      return this.request<any[]>(`/api/admissions${qs}`);
    },
    create: (data: any) =>
      this.request<any>("/api/admissions", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      this.request<any>(`/api/admissions/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      this.request(`/api/admissions/${id}`, {
        method: "DELETE",
      }),
    convert: (id: string) =>
      this.request<any>(`/api/admissions/${id}/convert`, {
        method: "POST",
      }),
  };

  // Teachers
  teachers = {
    getAll: (params?: Record<string, string>) => {
      const qs = params ? `?${new URLSearchParams(params).toString()}` : "";
      return this.request<any[]>(`/api/teachers${qs}`);
    },
    create: (data: any) =>
      this.request<any>("/api/teachers", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      this.request<any>(`/api/teachers/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      this.request(`/api/teachers/${id}`, {
        method: "DELETE",
      }),
  };

  // Staff
  staff = {
    getAll: (params?: Record<string, string>) => {
      const qs = params ? `?${new URLSearchParams(params).toString()}` : "";
      return this.request<any[]>(`/api/staff${qs}`);
    },
    create: (data: any) =>
      this.request<any>("/api/staff", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      this.request<any>(`/api/staff/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      this.request(`/api/staff/${id}`, {
        method: "DELETE",
      }),
  };

  // Attendance
  attendance = {
    getAll: (params?: Record<string, string>) => {
      const qs = params ? `?${new URLSearchParams(params).toString()}` : "";
      return this.request<any[]>(`/api/attendance${qs}`);
    },
    mark: (records: any[]) =>
      this.request("/api/attendance", {
        method: "POST",
        body: JSON.stringify(records),
      }),
    getTeacher: (params?: Record<string, string>) => {
      const qs = params ? `?${new URLSearchParams(params).toString()}` : "";
      return this.request<any[]>(`/api/attendance/teacher${qs}`);
    },
    markTeacher: (records: any[]) =>
      this.request("/api/attendance/teacher", {
        method: "POST",
        body: JSON.stringify(records),
      }),
  };

  // Fees
  fees = {
    getAll: (params?: Record<string, string>) => {
      const qs = params ? `?${new URLSearchParams(params).toString()}` : "";
      return this.request<any[]>(`/api/fees${qs}`);
    },
    create: (data: any) =>
      this.request<any>("/api/fees", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    generateBulk: (className: string, month: string, dueDate?: string) =>
      this.request("/api/fees", {
        method: "POST",
        body: JSON.stringify({ bulk: true, className, month, dueDate }),
      }),
    update: (id: string, data: any) =>
      this.request<any>(`/api/fees/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      this.request(`/api/fees/${id}`, {
        method: "DELETE",
      }),
    getStructures: () => this.request<any[]>("/api/fees/structures"),
    saveStructure: (data: any) =>
      this.request<any>("/api/fees/structures", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  };

  // Payments
  payments = {
    getAll: (params?: Record<string, string>) => {
      const qs = params ? `?${new URLSearchParams(params).toString()}` : "";
      return this.request<any[]>(`/api/payments${qs}`);
    },
    create: (data: any) =>
      this.request<any>("/api/payments", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  };

  // Razorpay
  razorpay = {
    createOrder: (payload: { studentId: string; invoiceId?: string; amount: number }) =>
      this.request<{ orderId: string; amount: number; currency: string; keyId: string; student: any }>(
        "/api/razorpay/order",
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      ),
    verifyPayment: (payload: {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
      studentId: string;
      invoiceId?: string;
      amount: number;
    }) =>
      this.request<any>("/api/razorpay/verify", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  };

  // Exams & Marks
  exams = {
    getAll: (params?: Record<string, string>) => {
      const qs = params ? `?${new URLSearchParams(params).toString()}` : "";
      return this.request<any[]>(`/api/exams${qs}`);
    },
    create: (data: any) =>
      this.request<any>("/api/exams", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      this.request<any>(`/api/exams/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      this.request(`/api/exams/${id}`, {
        method: "DELETE",
      }),
  };

  marks = {
    getAll: (params?: Record<string, string>) => {
      const qs = params ? `?${new URLSearchParams(params).toString()}` : "";
      return this.request<any[]>(`/api/marks${qs}`);
    },
    save: (records: any[]) =>
      this.request("/api/marks", {
        method: "POST",
        body: JSON.stringify(records),
      }),
  };

  // Certificates
  certificates = {
    getAll: (params?: Record<string, string>) => {
      const qs = params ? `?${new URLSearchParams(params).toString()}` : "";
      return this.request<any[]>(`/api/certificates${qs}`);
    },
    create: (data: any) =>
      this.request<any>("/api/certificates", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  };

  // Academics
  academics = {
    getClasses: () => this.request<any[]>("/api/academics/classes"),
    saveClass: (data: any) =>
      this.request("/api/academics/classes", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    getSubjects: () => this.request<any[]>("/api/academics/subjects"),
    saveSubject: (data: any) =>
      this.request("/api/academics/subjects", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    getTimetable: (params?: Record<string, string>) => {
      const qs = params ? `?${new URLSearchParams(params).toString()}` : "";
      return this.request<any[]>(`/api/timetable${qs}`);
    },
    saveTimetable: (records: any[]) =>
      this.request("/api/timetable", {
        method: "POST",
        body: JSON.stringify(records),
      }),
  };

  // Payroll
  payroll = {
    getAll: (params?: Record<string, string>) => {
      const qs = params ? `?${new URLSearchParams(params).toString()}` : "";
      return this.request<any[]>(`/api/payroll${qs}`);
    },
    save: (data: any) =>
      this.request<any>("/api/payroll", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  };

  // Notices
  notices = {
    getAll: (params?: Record<string, string>) => {
      const qs = params ? `?${new URLSearchParams(params).toString()}` : "";
      return this.request<any[]>(`/api/notices${qs}`);
    },
    create: (data: any) =>
      this.request<any>("/api/notices", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  };

  // Settings
  settings = {
    get: () => this.request<any>("/api/settings"),
    update: (data: any) =>
      this.request<any>("/api/settings", {
        method: "PUT",
        body: JSON.stringify(data),
      }),
  };

  // Users
  users = {
    getAll: () => this.request<any[]>("/api/users"),
    create: (data: any) =>
      this.request<any>("/api/users", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      this.request<any>(`/api/users/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      this.request(`/api/users/${id}`, {
        method: "DELETE",
      }),
  };

  // File Upload (Cloudinary)
  upload = {
    uploadFile: async (file: File, folder = "school_erp") => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      return this.request<{ url: string; publicId: string }>("/api/upload", {
        method: "POST",
        body: formData,
      });
    },
  };

  // Dashboard Stats
  dashboard = {
    getStats: () => this.request<any>("/api/dashboard/stats"),
  };

  // Seed
  seed = {
    run: () => this.request("/api/seed", { method: "POST" }),
  };
}

export const api = new ApiClient();
