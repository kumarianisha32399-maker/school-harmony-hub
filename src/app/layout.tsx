import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import "@/styles.css";
import { AppProvider } from "@/context/AppContext";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#4f46e5",
};

export const metadata: Metadata = {
  title: {
    default: "Harmony School ERP — School Management Portal",
    template: "%s | Harmony School ERP",
  },
  description:
    "Complete school management portal: students, admissions, attendance, fees, exams, certificates, payroll and reports.",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Harmony School ERP — School Management Portal",
    description:
      "All-in-one school ERP system for managing admissions, student records, fee collection, attendance, examinations, certificates and staff.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased text-foreground">
        <AppProvider>
          {children}
          <Toaster position="top-right" richColors />
        </AppProvider>
      </body>
    </html>
  );
}
