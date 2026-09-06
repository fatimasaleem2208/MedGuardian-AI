import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";

import { AppShell } from "@/components/AppShell";
import {
  Disclaimer,
  PageHeader,
  Panel,
  SectionLabel,
  SeverityPill,
} from "@/components/Bits";
import { buildTodaySchedule, useApp } from "@/lib/app-store";
import { buildSafetyAlerts } from "@/lib/safety";

export const Route = createFileRoute("/safety")({
  head: () => ({
    meta: [
      { title: "Safety Center — MedGuardian AI" },
      {
        name: "description",
        content:
          "Review medication interactions, allergy conflicts, duplicate therapy, and other medication safety alerts.",
      },
    ],
  }),
  component: SafetyPage,
});

function SafetyPage() {
  const { profile, reminders, doseLog } = useApp();

  const schedule = useMemo(
    () => buildTodaySchedule(reminders, doseLog, new Date()),
    [reminders, doseLog],
  );

  const alerts = useMemo(
    () => buildSafetyAlerts(reminders, profile.allergies, schedule),
    [reminders, profile.allergies, schedule],
  );

  const highRisk = alerts.filter((alert) => alert.level === "risk").length;
  const caution = alerts.filter((alert) => alert.level === "caution").length;
  const safe = alerts.filter((alert) => alert.level === "safe").length;

  return (
    <AppShell>
      <PageHeader
        label="Medication safety"
        title="Safety Center"
        description="Review possible medicine interactions, duplicate therapy, allergy conflicts, and missed-dose alerts."
      />

      <div className="grid sm:grid-cols-3 gap-3 mb-4">
        <Panel>
          <SectionLabel>High risk</SectionLabel>
          <p className="font-sans text-2xl font-semibold text-risk mt-2">
            {highRisk}
          </p>
        </Panel>

        <Panel>
          <SectionLabel>Caution</SectionLabel>
          <p className="font-sans text-2xl font-semibold text-caution mt-2">
            {caution}
          </p>
        </Panel>

        <Panel>
          <SectionLabel>Safe</SectionLabel>
          <p className="font-sans text-2xl font-semibold text-safe mt-2">
            {safe}
          </p>
        </Panel>
      </div>

      <Panel>
        <SectionLabel>Current safety alerts</SectionLabel>

        <div className="space-y-3 mt-4">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="rounded-lg bg-background ring-1 ring-ink/10 p-4 flex items-start justify-between gap-4"
            >
              <div>
                <p className="font-sans text-sm font-medium text-ink">
                  {alert.title}
                </p>

                <p className="font-mono text-[11px] text-inksoft mt-1">
                  {alert.detail}
                </p>
              </div>

              <SeverityPill severity={alert.level}>
                {alert.level === "risk"
                  ? "High Risk"
                  : alert.level === "caution"
                    ? "Caution"
                    : "Safe"}
              </SeverityPill>
            </div>
          ))}
        </div>
      </Panel>

      <Disclaimer>
        Safety alerts are educational screening results only. Do not start,
        stop, or change a medicine without advice from a qualified healthcare
        professional.
      </Disclaimer>
    </AppShell>
  );
}
