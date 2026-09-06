import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Logo } from "@/components/Bits";
import { useApp, type Role } from "@/lib/app-store";

const searchSchema = z.object({ mode: z.enum(["login", "signup"]).default("login") });

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Sign in — MedGuardian AI" },
      { name: "description", content: "Sign in or create a MedGuardian AI account to manage your medicines safely." },
      { property: "og:title", content: "Sign in — MedGuardian AI" },
      { property: "og:description", content: "Access your medication safety console." },
    ],
  }),
  component: AuthPage,
});

const credentials = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(80),
  email: z.string().trim().email("Enter a valid email address").max(160),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
});

function AuthPage() {
  const { mode } = Route.useSearch();
  const navigate = useNavigate();
  const { signIn } = useApp();
  const [isSignup, setIsSignup] = useState(mode === "signup");
  const [role, setRole] = useState<Role>("patient");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const schema = isSignup ? credentials : credentials.pick({ email: true, password: true });
    const result = schema.safeParse(isSignup ? form : { email: form.email, password: form.password });
    if (!result.success) {
      const next: Record<string, string> = {};
      for (const issue of result.error.issues) next[String(issue.path[0])] = issue.message;
      setErrors(next);
      return;
    }
    setErrors({});
    signIn(isSignup ? form.name : undefined, form.email, role);
    navigate({ to: role === "professional" ? "/professional" : "/dashboard" });
  }

  return (
    <div className="min-h-screen bg-background grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between p-10 border-r border-ink/10">
        <Logo />
        <div>
          <h2 className="font-sans text-ink text-3xl font-semibold tracking-tight max-w-[18ch] text-balance">
            Smart Medication Safety for Everyone
          </h2>
          <p className="mt-4 font-sans text-inksoft text-sm max-w-[44ch] text-pretty">
            One console for medicine information, interaction checks, prescription and lab explanation, and dose reminders.
          </p>
          <div className="mt-8 flex items-center gap-6 font-mono text-[11px] text-inksoft">
            <span className="flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-safe" />Safe</span>
            <span className="flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-caution" />Caution</span>
            <span className="flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-risk" />High Risk</span>
          </div>
        </div>
        <p className="font-mono text-[10px] text-inksoft/70 max-w-[52ch]">
          Demonstration authentication for a hackathon build. Health information is stored locally on this device only.
        </p>
      </div>

      <div className="flex items-center justify-center p-6">
        <form onSubmit={submit} className="w-full max-w-sm rounded-2xl bg-panel ring-1 ring-ink/10 p-6">
          <div className="lg:hidden mb-6"><Logo /></div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-inksoft">{isSignup ? "Create account" : "Sign in"}</p>
          <h1 className="font-sans text-ink text-xl font-semibold tracking-tight mt-1.5">
            {isSignup ? "Start with MedGuardian AI" : "Welcome back"}
          </h1>

          <div className="mt-5 grid grid-cols-2 gap-2 p-1 rounded-lg bg-panel2 ring-1 ring-ink/10">
            {(["patient", "professional"] as const).map((r) => (
              <button
                type="button"
                key={r}
                onClick={() => setRole(r)}
                className={`py-2 rounded-md font-mono text-[11px] uppercase tracking-wide transition-colors ${
                  role === r ? "bg-brand text-seam" : "text-inksoft hover:text-ink"
                }`}
              >
                {r === "patient" ? "Patient" : "Professional"}
              </button>
            ))}
          </div>

          <div className="mt-5 space-y-3">
            {isSignup && (
              <Field label="Full name" error={errors["name"]}>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  maxLength={80}
                  className="w-full rounded-md bg-panel2 ring-1 ring-ink/10 px-3 py-2 text-sm text-ink outline-none focus:ring-brand/50"
                  placeholder="Amara Khan"
                />
              </Field>
            )}
            <Field label="Email" error={errors["email"]}>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                maxLength={160}
                className="w-full rounded-md bg-panel2 ring-1 ring-ink/10 px-3 py-2 text-sm text-ink outline-none focus:ring-brand/50"
                placeholder="you@example.com"
              />
            </Field>
            <Field label="Password" error={errors["password"]}>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                maxLength={128}
                className="w-full rounded-md bg-panel2 ring-1 ring-ink/10 px-3 py-2 text-sm text-ink outline-none focus:ring-brand/50"
                placeholder="At least 8 characters"
              />
            </Field>
          </div>

          <button type="submit" className="mt-5 w-full py-2.5 rounded-md bg-brand text-seam text-sm font-medium hover:bg-brand/90 transition-colors">
            {isSignup ? "Create account" : "Sign in"}
          </button>

          <button
            type="button"
            onClick={() => setIsSignup((v) => !v)}
            className="mt-3 w-full text-center font-mono text-[11px] text-inksoft hover:text-ink transition-colors"
          >
            {isSignup ? "Already have an account? Sign in" : "New here? Create an account"}
          </button>

          <p className="mt-5 font-mono text-[10px] leading-relaxed text-inksoft/70">
            Demo authentication — no credentials leave your browser. Do not enter a real password.
          </p>
        </form>
      </div>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-inksoft">{label}</span>
      <div className="mt-1.5">{children}</div>
      {error && <span className="mt-1 block font-mono text-[10px] text-risk">{error}</span>}
    </label>
  );
}
