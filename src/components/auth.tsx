import React, { useState } from "react";
import { C, FONT, btn, card } from "./theme";
import { Field, Input, Logo, Msg, Select, Spinner } from "./shared";
import { ROLE_PREFIX, idToEmail, supabase } from "../lib/supa";

const ROLES = [
  { name: "Patient", icon: "🧑‍⚕️", desc: "Access your health records, reports & prescriptions" },
  { name: "Doctor", icon: "👨‍⚕️", desc: "Manage patient diagnoses, prescriptions & lab requests" },
  { name: "Laboratory Staff", icon: "🔬", desc: "Upload and manage patient laboratory test reports" },
  { name: "Medical Records Staff", icon: "🗂️", desc: "Manage and archive institutional medical documents" },
] as const;

type Stage =
  | { name: "welcome" }
  | { name: "choice"; role: string }
  | { name: "register"; role: string }
  | { name: "created"; role: string; userId: string }
  | { name: "login"; role: string };

export function AuthFlow({ onLoggedIn }: { onLoggedIn: () => void | Promise<void> }) {
  const [stage, setStage] = useState<Stage>({ name: "welcome" });

  return (
    <div
      style={{
        minHeight: "100vh",
        background: `linear-gradient(135deg, ${C.bg} 0%, ${C.lightBlue} 100%)`,
        fontFamily: FONT,
        color: C.text,
      }}
    >
      <header style={{ padding: "20px 28px" }}>
        <Logo />
      </header>
      <main style={{ maxWidth: 1080, margin: "0 auto", padding: "12px 24px 60px" }}>
        {stage.name === "welcome" && <Welcome onPick={(role) => setStage({ name: "choice", role })} />}
        {stage.name === "choice" && (
          <AuthChoice
            role={stage.role}
            onRegister={() => setStage({ name: "register", role: stage.role })}
            onLogin={() => setStage({ name: "login", role: stage.role })}
            onBack={() => setStage({ name: "welcome" })}
          />
        )}
        {stage.name === "register" && (
          <RegisterForm
            role={stage.role}
            onBack={() => setStage({ name: "choice", role: stage.role })}
            onCreated={(userId) => setStage({ name: "created", role: stage.role, userId })}
          />
        )}
        {stage.name === "created" && (
          <RegistrationComplete
            role={stage.role}
            userId={stage.userId}
            onContinue={() => setStage({ name: "login", role: stage.role })}
          />
        )}
        {stage.name === "login" && (
          <LoginForm
            role={stage.role}
            onBack={() => setStage({ name: "choice", role: stage.role })}
            onLoggedIn={onLoggedIn}
          />
        )}
      </main>
      <footer style={{ textAlign: "center", padding: "12px 20px 28px", color: C.muted, fontSize: 13 }}>
        ☁️ Secured by Lovable Cloud · Works across all devices
      </footer>
    </div>
  );
}

function Welcome({ onPick }: { onPick: (role: string) => void }) {
  return (
    <>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <h1 style={{ fontSize: 36, margin: "8px 0 6px", fontWeight: 800, letterSpacing: -0.5 }}>
          Welcome to DocuMed
        </h1>
        <p style={{ color: C.muted, fontSize: 16, margin: 0 }}>
          Secure Digital Health Record Platform
        </p>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 18,
        }}
      >
        {ROLES.map((r) => (
          <RoleCard key={r.name} role={r} onContinue={() => onPick(r.name)} />
        ))}
      </div>
    </>
  );
}

function RoleCard({ role, onContinue }: { role: (typeof ROLES)[number]; onContinue: () => void }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        ...card,
        cursor: "pointer",
        transform: hover ? "translateY(-4px)" : "none",
        boxShadow: hover ? "0 14px 32px rgba(10,102,194,0.18)" : card.boxShadow,
        transition: "all .2s",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
      onClick={onContinue}
    >
      <div style={{ fontSize: 36 }}>{role.icon}</div>
      <h3 style={{ margin: 0, fontSize: 18 }}>{role.name}</h3>
      <p style={{ margin: 0, color: C.muted, fontSize: 14, flex: 1 }}>{role.desc}</p>
      <button style={btn("primary")} onClick={onContinue}>
        Continue →
      </button>
    </div>
  );
}

function AuthChoice({
  role,
  onRegister,
  onLogin,
  onBack,
}: {
  role: string;
  onRegister: () => void;
  onLogin: () => void;
  onBack: () => void;
}) {
  return (
    <div style={{ maxWidth: 760, margin: "0 auto" }}>
      <h2 style={{ textAlign: "center", marginTop: 0 }}>{role} · Account Access</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 18 }}>
        <BigChoiceCard icon="📋" title="Register" desc="First-time registration — create your account" onClick={onRegister} />
        <BigChoiceCard icon="🔑" title="Sign In" desc="Existing user — sign in from any device" onClick={onLogin} />
      </div>
      <div style={{ textAlign: "center", marginTop: 22 }}>
        <button style={btn("ghost")} onClick={onBack}>
          ← Back
        </button>
      </div>
    </div>
  );
}

function BigChoiceCard({
  icon,
  title,
  desc,
  onClick,
}: {
  icon: string;
  title: string;
  desc: string;
  onClick: () => void;
}) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        ...card,
        textAlign: "left",
        cursor: "pointer",
        transform: hover ? "translateY(-3px)" : "none",
        boxShadow: hover ? "0 14px 32px rgba(10,102,194,0.18)" : card.boxShadow,
        transition: "all .2s",
        fontFamily: FONT,
        color: C.text,
      }}
    >
      <div style={{ fontSize: 36, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>{title}</div>
      <div style={{ color: C.muted, fontSize: 14 }}>{desc}</div>
    </button>
  );
}

function fieldsForRole(role: string) {
  switch (role) {
    case "Patient":
      return ["name", "mobile", "dob", "gender", "address"];
    case "Doctor":
      return ["name", "reg_number", "hospital", "mobile", "email"];
    case "Laboratory Staff":
      return ["name", "lab_name", "mobile"];
    case "Medical Records Staff":
      return ["name", "org", "mobile"];
    default:
      return [];
  }
}

const LABELS: Record<string, string> = {
  name: "Full Name",
  mobile: "Mobile Number",
  dob: "Date of Birth",
  gender: "Gender",
  address: "Residential Address",
  reg_number: "Medical Registration Number",
  hospital: "Hospital / Institution",
  email: "Email Address",
  lab_name: "Laboratory Name",
  org: "Organisation / Hospital",
};

function RegisterForm({
  role,
  onBack,
  onCreated,
}: {
  role: string;
  onBack: () => void;
  onCreated: (userId: string) => void;
}) {
  const [form, setForm] = useState<Record<string, string>>({});
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const fields = fieldsForRole(role);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    for (const f of fields) {
      if (!form[f] || !form[f].trim()) {
        setErr(`Please fill: ${LABELS[f]}`);
        return;
      }
    }
    if (pw.length < 8) return setErr("Password must be at least 8 characters.");
    if (pw !== pw2) return setErr("Passwords do not match.");
    setBusy(true);
    try {
      const roleKeyMap: Record<string, string> = {
        Patient: "patient",
        Doctor: "doctor",
        "Laboratory Staff": "lab",
        "Medical Records Staff": "mrs",
      };

      // 1. Pre-allocate the sequential ID so we can build the stable email
      const { data: nextNum, error: rpcErr } = await supabase.rpc(
        "get_next_id",
        { role_key: roleKeyMap[role] }
      );
      if (rpcErr) throw new Error(`Could not allocate ID: ${rpcErr.message}`);

      const displayId = `${ROLE_PREFIX[role]}${nextNum}`;
      const syntheticEmail = idToEmail(displayId);

      // 2. Sign up — pass display_id in metadata so the trigger can use it directly
      const { data: authData, error: authErr } = await supabase.auth.signUp({
        email: syntheticEmail,
        password: pw,
        options: {
          data: {
            display_id: displayId,   // trigger reads this to skip minting
            role: role,
            name: form.name,
            mobile: form.mobile || null,
            dob: form.dob || null,
            gender: form.gender || null,
            address: form.address || null,
            reg_number: form.reg_number || null,
            hospital: form.hospital || null,
            email: form.email || null,
            lab_name: form.lab_name || null,
            org: form.org || null,
          }
        }
      });
      if (authErr) throw authErr;
      if (!authData.user) throw new Error("Could not create account");

      onCreated(displayId);
    } catch (e: any) {
      setErr(e?.message || "Could not create account.");
    } finally {
      setBusy(false);
    }
  }


  return (
    <div style={{ maxWidth: 560, margin: "0 auto" }}>
      <h2 style={{ marginTop: 0 }}>Register · {role}</h2>
      <div style={card}>
        {err && <Msg kind="err">{err}</Msg>}
        <form onSubmit={submit}>
          {fields.map((f) => (
            <Field key={f} label={LABELS[f]}>
              {f === "gender" ? (
                <Select value={form[f] || ""} onChange={(e) => setForm({ ...form, [f]: e.target.value })}>
                  <option value="">Select…</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </Select>
              ) : (
                <Input
                  type={f === "dob" ? "date" : f === "email" ? "email" : "text"}
                  value={form[f] || ""}
                  onChange={(e) => setForm({ ...form, [f]: e.target.value })}
                />
              )}
            </Field>
          ))}
          <Field label="Password (min 8 characters)">
            <Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} />
          </Field>
          <Field label="Confirm Password">
            <Input type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} />
          </Field>
          <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
            <button type="button" style={btn("ghost")} onClick={onBack} disabled={busy}>
              ← Back
            </button>
            <button type="submit" style={{ ...btn("primary"), flex: 1 }} disabled={busy}>
              {busy ? "Creating account…" : "Create Account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function RegistrationComplete({
  role,
  userId,
  onContinue,
}: {
  role: string;
  userId: string;
  onContinue: () => void;
}) {
  return (
    <div style={{ maxWidth: 480, margin: "0 auto" }}>
      <h2 style={{ marginTop: 0 }}>Account Created</h2>
      <div style={card}>
        <div
          style={{
            background: C.lightBlue,
            border: `1px solid ${C.border}`,
            borderRadius: 12,
            padding: 16,
            marginBottom: 18,
            textAlign: "center",
          }}
        >
          <div style={{ color: C.muted, fontSize: 13 }}>Your {role} ID</div>
          <div style={{ color: C.primary, fontSize: 28, fontWeight: 800, letterSpacing: 1 }}>{userId}</div>
          <div style={{ color: C.muted, fontSize: 12, marginTop: 6 }}>
            Save this ID — use it with your password to sign in from any device.
          </div>
        </div>
        <button style={{ ...btn("primary"), width: "100%" }} onClick={onContinue}>
          Continue to Sign In →
        </button>
      </div>
    </div>
  );
}

function LoginForm({
  role,
  onBack,
  onLoggedIn,
}: {
  role: string;
  onBack: () => void;
  onLoggedIn: () => void | Promise<void>;
}) {
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    if (!id || !pw) return setErr("Please enter your ID and password.");
    setBusy(true);
    try {
      const displayId = id.trim().toUpperCase();
      const email = idToEmail(displayId);
      const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
      if (error) {
        setErr("Incorrect ID or password.");
        return;
      }
      // Verify role matches (defensive — RLS will block wrong-role access either way)
      const { data: profile } = await supabase
        .from("users")
        .select("role")
        .eq("id", displayId)
        .maybeSingle();
      if (profile && (profile as any).role !== role) {
        await supabase.auth.signOut();
        setErr(`This ID is registered as ${(profile as any).role}, not ${role}.`);
        return;
      }
      await onLoggedIn();
    } catch (e: any) {
      setErr(e?.message || "Could not sign in.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ maxWidth: 440, margin: "0 auto" }}>
      <h2 style={{ marginTop: 0 }}>Sign In · {role}</h2>
      <div style={card}>
        {err && <Msg kind="err">{err}</Msg>}
        <form onSubmit={submit}>
          <Field label={`${role} ID`}>
            <Input
              placeholder={`${ROLE_PREFIX[role]}1001`}
              value={id}
              onChange={(e) => setId(e.target.value)}
            />
          </Field>
          <Field label="Password">
            <Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} />
          </Field>
          <div style={{ display: "flex", gap: 10 }}>
            <button type="button" style={btn("ghost")} onClick={onBack} disabled={busy}>
              ← Back
            </button>
            <button type="submit" style={{ ...btn("primary"), flex: 1 }} disabled={busy}>
              {busy ? "Signing in…" : "Sign In"}
            </button>
          </div>
        </form>
        {busy && <div style={{ marginTop: 12 }}><Spinner /></div>}
      </div>
    </div>
  );
}
