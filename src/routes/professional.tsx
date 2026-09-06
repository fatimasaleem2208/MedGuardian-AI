import { createFileRoute, Link } from "@tanstack/react-router";

import { AppShell } from "@/components/AppShell";
import {
  PageHeader,
  Panel,
  SectionLabel,
} from "@/components/Bits";

export const Route = createFileRoute("/professional")({
  head: () => ({
    meta: [
      { title: "Professional Dashboard — MedGuardian AI" },
      {
        name: "description",
        content:
          "Healthcare professional dashboard for medication safety and patient support.",
      },
    ],
  }),
  component: ProfessionalDashboard,
});

function ProfessionalDashboard() {
  return (
    <AppShell>
      <PageHeader
        label="Healthcare professional"
        title="Professional Dashboard"
        description="Access medication safety tools, interaction checks, prescriptions, and clinical support features."
      />

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link to="/interactions">
          <Panel className="h-full cursor-pointer hover:ring-ink/20">
            <SectionLabel>Drug interactions</SectionLabel>
            <p className="mt-3 text-sm text-inksoft">
              Check medicines for possible interactions and safety concerns.
            </p>
          </Panel>
        </Link>

        <Link to="/prescription">
          <Panel className="h-full cursor-pointer hover:ring-ink/20">
            <SectionLabel>Prescriptions</SectionLabel>
            <p className="mt-3 text-sm text-inksoft">
              Review and analyse prescription information.
            </p>
          </Panel>
        </Link>

        <Link to="/lab-reports">
          <Panel className="h-full cursor-pointer hover:ring-ink/20">
            <SectionLabel>Lab reports</SectionLabel>
            <p className="mt-3 text-sm text-inksoft">
              Review uploaded laboratory report information.
            </p>
          </Panel>
        </Link>

        <Link to="/medicines">
          <Panel className="h-full cursor-pointer hover:ring-ink/20">
            <SectionLabel>Medicine database</SectionLabel>
            <p className="mt-3 text-sm text-inksoft">
              Search medicine information and safety details.
            </p>
          </Panel>
        </Link>

        <Link to="/assistant">
          <Panel className="h-full cursor-pointer hover:ring-ink/20">
            <SectionLabel>AI Assistant</SectionLabel>
            <p className="mt-3 text-sm text-inksoft">
              Ask medication and health-information questions.
            </p>
          </Panel>
        </Link>

        <Link to="/safety">
          <Panel className="h-full cursor-pointer hover:ring-ink/20">
            <SectionLabel>Safety Center</SectionLabel>
            <p className="mt-3 text-sm text-inksoft">
              Review medication safety alerts and risk information.
            </p>
          </Panel>
        </Link>
      </div>
    </AppShell>
  );
}
