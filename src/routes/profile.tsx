import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { AppShell } from "@/components/AppShell";
import {
  Disclaimer,
  PageHeader,
  Panel,
  SectionLabel,
} from "@/components/Bits";
import { useApp, type Role } from "@/lib/app-store";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile & Settings — MedGuardian AI" },
      {
        name: "description",
        content: "Manage your MediGuardian profile and account settings.",
      },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { profile, updateProfile } = useApp();

  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [age, setAge] = useState(profile.age);
  const [gender, setGender] = useState(profile.gender);
  const [allergies, setAllergies] = useState(profile.allergies.join(", "));
  const [medicalHistory, setMedicalHistory] = useState(
    profile.medicalHistory,
  );
  const [emergencyContact, setEmergencyContact] = useState(
    profile.emergencyContact,
  );
  const [role, setRole] = useState<Role>(profile.role);

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setName(profile.name);
    setEmail(profile.email);
    setAge(profile.age);
    setGender(profile.gender);
    setAllergies(profile.allergies.join(", "));
    setMedicalHistory(profile.medicalHistory);
    setEmergencyContact(profile.emergencyContact);
    setRole(profile.role);
  }, [profile]);

  function saveProfile() {
    updateProfile({
      name: name.trim(),
      email: email.trim(),
      age: age.trim(),
      gender: gender.trim(),
      allergies: allergies
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      medicalHistory: medicalHistory.trim(),
      emergencyContact: emergencyContact.trim(),
      role,
    });

    setSaved(true);

    window.setTimeout(() => {
      setSaved(false);
    }, 2500);
  }

  return (
    <AppShell>
      <PageHeader
        label="Account"
        title="Profile & Settings"
        description="Manage your personal information and MediGuardian account preferences."
      />

      <div className="grid lg:grid-cols-[1.4fr_0.8fr] gap-4">
        <Panel>
          <SectionLabel>Personal information</SectionLabel>

          <div className="grid sm:grid-cols-2 gap-4 mt-5">
            <Field label="Full name">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg bg-background ring-1 ring-ink/10 px-3 py-2.5 text-sm text-ink outline-none focus:ring-brand/50"
                placeholder="Enter your full name"
              />
            </Field>

            <Field label="Email">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg bg-background ring-1 ring-ink/10 px-3 py-2.5 text-sm text-ink outline-none focus:ring-brand/50"
                placeholder="you@example.com"
              />
            </Field>

            <Field label="Age">
              <input
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full rounded-lg bg-background ring-1 ring-ink/10 px-3 py-2.5 text-sm text-ink outline-none focus:ring-brand/50"
                placeholder="Age"
              />
            </Field>

            <Field label="Gender">
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full rounded-lg bg-background ring-1 ring-ink/10 px-3 py-2.5 text-sm text-ink outline-none focus:ring-brand/50"
              >
                <option value="">Prefer not to say</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </Field>
          </div>

          <div className="mt-4">
            <Field label="Allergies">
              <input
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                className="w-full rounded-lg bg-background ring-1 ring-ink/10 px-3 py-2.5 text-sm text-ink outline-none focus:ring-brand/50"
                placeholder="Example: Penicillin, Aspirin"
              />
              <p className="font-mono text-[10px] text-inksoft mt-1.5">
                Separate multiple allergies with commas.
              </p>
            </Field>
          </div>

          <div className="mt-4">
            <Field label="Medical history">
              <textarea
                value={medicalHistory}
                onChange={(e) => setMedicalHistory(e.target.value)}
                className="w-full rounded-lg bg-background ring-1 ring-ink/10 px-3 py-2.5 text-sm text-ink outline-none focus:ring-brand/50 min-h-28 resize-y"
                placeholder="Enter relevant medical history"
              />
            </Field>
          </div>

          <div className="mt-4">
            <Field label="Emergency contact">
              <input
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                className="w-full rounded-lg bg-background ring-1 ring-ink/10 px-3 py-2.5 text-sm text-ink outline-none focus:ring-brand/50"
                placeholder="Name — phone number"
              />
            </Field>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={saveProfile}
              className="px-4 py-2 rounded-lg bg-brand text-white font-sans text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Save changes
            </button>

            {saved && (
              <span className="font-mono text-xs text-safe">
                Profile saved successfully
              </span>
            )}
          </div>
        </Panel>

        <div className="space-y-4">
          <Panel>
            <SectionLabel>Account type</SectionLabel>

            <p className="text-sm text-inksoft mt-3">
              Select how you are using MediGuardian.
            </p>

            <div className="space-y-2 mt-4">
              <RoleButton
                selected={role === "patient"}
                onClick={() => setRole("patient")}
                title="Patient"
                description="Manage your own medicines and health information."
              />

              <RoleButton
                selected={role === "professional"}
                onClick={() => setRole("professional")}
                title="Healthcare professional"
                description="Access professional medication-support tools."
              />

              <RoleButton
                selected={role === "admin"}
                onClick={() => setRole("admin")}
                title="Administrator"
                description="Administrative access for the demo platform."
              />
            </div>
          </Panel>

          <Panel>
            <SectionLabel>Profile summary</SectionLabel>

            <div className="space-y-3 mt-4 text-sm">
              <SummaryRow label="Name" value={profile.name || "Not provided"} />
              <SummaryRow
                label="Email"
                value={profile.email || "Not provided"}
              />
              <SummaryRow
                label="Role"
                value={formatRole(profile.role)}
              />
              <SummaryRow
                label="Allergies"
                value={
                  profile.allergies.length
                    ? profile.allergies.join(", ")
                    : "None recorded"
                }
              />
            </div>
          </Panel>

          <Panel>
            <SectionLabel>Data & privacy</SectionLabel>

            <p className="mt-3 text-sm text-inksoft">
              This version of MediGuardian stores profile information locally
              in your browser for demonstration purposes.
            </p>
          </Panel>
        </div>
      </div>

      <Disclaimer>
        Keep your medication and allergy information accurate. MediGuardian is
        an educational support tool and does not replace advice from a doctor,
        pharmacist, or other qualified healthcare professional.
      </Disclaimer>
    </AppShell>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-inksoft">
        {label}
      </span>

      <div className="mt-2">{children}</div>
    </label>
  );
}

function RoleButton({
  selected,
  onClick,
  title,
  description,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  description: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left rounded-lg p-3 ring-1 transition-colors ${
        selected
          ? "bg-brand/10 ring-brand/40"
          : "bg-background ring-ink/10 hover:ring-ink/20"
      }`}
    >
      <p className="font-sans text-sm font-medium text-ink">{title}</p>
      <p className="font-mono text-[10px] text-inksoft mt-1">
        {description}
      </p>
    </button>
  );
}

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-ink/10 pb-2">
      <span className="text-inksoft">{label}</span>
      <span className="text-ink text-right">{value}</span>
    </div>
  );
}

function formatRole(role: Role) {
  if (role === "professional") return "Healthcare Professional";
  if (role === "admin") return "Administrator";
  return "Patient";
}
