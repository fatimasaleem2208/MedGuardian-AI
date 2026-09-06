import { createFileRoute } from "@tanstack/react-router";

import { AppShell } from "@/components/AppShell";
import {
  Disclaimer,
  PageHeader,
  Panel,
  SectionLabel,
} from "@/components/Bits";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — MedGuardian AI" },
      {
        name: "description",
        content:
          "Learn about MedGuardian AI, its purpose, features, and limitations.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <AppShell>
      <PageHeader
        label="About the project"
        title="MedGuardian AI"
        description="An AI-assisted medication safety and health support platform designed to help users understand medicines, reminders, interactions, and health-related information."
      />

      <div className="grid lg:grid-cols-2 gap-4">
        <Panel>
          <SectionLabel>What MedGuardian does</SectionLabel>

          <div className="space-y-3 mt-4 text-sm text-inksoft">
            <p>
              MedGuardian AI helps users manage medicines, review possible
              drug interactions, track medication reminders, analyse uploaded
              health information, and ask medicine-related questions.
            </p>

            <p>
              The AI Assistant uses an external AI model to generate
              educational responses based on the user's questions.
            </p>
          </div>
        </Panel>

        <Panel>
          <SectionLabel>Main features</SectionLabel>

          <ul className="space-y-2 mt-4 text-sm text-inksoft list-disc pl-5">
            <li>Medicine management</li>
            <li>Drug interaction checking</li>
            <li>Medication reminders</li>
            <li>Prescription support</li>
            <li>Lab report support</li>
            <li>AI health assistant</li>
            <li>Medication safety alerts</li>
          </ul>
        </Panel>

        <Panel>
          <SectionLabel>AI technology</SectionLabel>

          <p className="mt-4 text-sm text-inksoft">
            MedGuardian uses AI to help explain medical and medication-related
            information in a simpler and more accessible format. AI-generated
            responses should always be reviewed carefully.
          </p>
        </Panel>

        <Panel>
          <SectionLabel>Project purpose</SectionLabel>

          <p className="mt-4 text-sm text-inksoft">
            This project demonstrates how artificial intelligence can be
            combined with medication-management tools to improve accessibility,
            awareness, and medication safety.
          </p>
        </Panel>
      </div>

      <Disclaimer>
        MedGuardian AI is an educational and demonstration platform. It does
        not replace a doctor, pharmacist, or other qualified healthcare
        professional. Do not use the platform as the sole basis for diagnosis
        or treatment decisions.
      </Disclaimer>
    </AppShell>
  );
}
