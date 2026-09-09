import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/layouts/AppShell";

export const Route = createFileRoute("/app/$")({
  head: () => ({
    meta: [
      { title: "Workspace — Harmony School ERP" },
      {
        name: "description",
        content:
          "Manage students, fees, attendance, examinations, certificates and staff from the Harmony School workspace.",
      },
      { property: "og:title", content: "Workspace — Harmony School ERP" },
      {
        property: "og:description",
        content: "The Harmony School management workspace.",
      },
    ],
  }),
  component: Workspace,
});

function Workspace() {
  const { _splat } = Route.useParams();
  return <AppShell slug={_splat || "dashboard"} />;
}
