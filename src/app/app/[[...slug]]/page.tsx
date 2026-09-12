import { AppShell } from "@/layouts/AppShell";
import type { Metadata } from "next";

type PageProps = {
  params: Promise<{ slug?: string[] }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const path = slug && slug.length ? slug.join("/") : "dashboard";
  const titlePart = path
    .split("/")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, " "))
    .join(" - ");

  return {
    title: `${titlePart} — Harmony School ERP`,
    description: "Manage students, fees, attendance, examinations, certificates and staff from the Harmony School workspace.",
  };
}

export default async function WorkspacePage({ params }: PageProps) {
  const { slug } = await params;
  const currentSlug = slug && slug.length ? slug.join("/") : "dashboard";

  return <AppShell slug={currentSlug} />;
}
