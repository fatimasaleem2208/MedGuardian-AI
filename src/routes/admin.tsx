import { createFileRoute, Link } from "@tanstack/react-router";

import { AppShell } from "@/components/AppShell";
import {
  PageHeader,
  Panel,
  SectionLabel,
} from "@/components/Bits";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — MedGuardian AI" },
      {
        name: "description",
        content: "Administrative dashboard for MedGuardian AI.",
      },
    ],
  }),
  component: AdminDashboard,
});

function AdminDashboard() {
  return (
    <AppShell>
      <PageHeader
        label="Administration"
        title="Admin Dashboard"
        description="Manage and review the main MedGuardian AI modules."
      />

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link to="/dashboard">
          <Panel className="h-full cursor-pointer hover:ring-ink/20">
            <SectionLabel>User Dashboard</SectionLabel>
            <p className="mt-3 text-sm text-inksoft">
              Open the main user dashboard.
            </p>
          </Panel>
        </Link>

        <Link to="/medicines">
          <Panel className="h-full cursor-pointer hover:ring-ink/20">
            <SectionLabel>Medicines</SectionLabel>
            <p className="mt-3 text-sm text-inksoft">
              Review medicine information and medication tools.
            </p>
          </Panel>
        </Link>

        <Link to="/interactions">
          <Panel className="h-full cursor-pointer hover:ring-ink/20">
            <SectionLabel>Interactions</SectionLabel>
            <p className="mt-3 text-sm text-inksoft">
              Access drug-interaction checking tools.
            </p>
          </Panel>
        </Link>

        <Link to="/safety">
          <Panel className="h-full cursor-pointer hover:ring-ink/20">
            <SectionLabel>Safety Center</SectionLabel>
            <p className="mt-3 text-sm text-inksoft">
              Review medication safety alerts.
            </p>
          </Panel>
        </Link>

        <Link to="/assistant">
          <Panel className="h-full cursor-pointer hover:ring-ink/20">
            <SectionLabel>AI Assistant</SectionLabel>
            <p className="mt-3 text-sm text-inksoft">
              Test the Groq-powered AI assistant.
            </p>
          </Panel>
        </Link>

        <Link to="/about">
          <Panel className="h-full cursor-pointer hover:ring-ink/20">
            <SectionLabel>About</SectionLabel>
            <p className="mt-3 text-sm text-inksoft">
              Review information about the project.
            </p>
          </Panel>
        </Link>
      </div>
    </AppShell>
  );
}
