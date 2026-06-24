import React, { useEffect, useState } from "react";
import { C, btn, card } from "./theme";
import { Badge, DataTable, Field, Input, Msg, Select, Spinner, StatCard, Textarea } from "./shared";
import { DashLayout, NavItem } from "./DashLayout";
import { ROLE_BADGE, supabase, idToEmail, newId } from "../lib/supa";
import { PatientChatbot } from "./PatientChatbot";
import { ScanDocument } from "./ScanDocument";

function fmtDate(s?: string | null) {
  if (!s) return "—";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function ProfileView({ user, onLogout }: { user: any; onLogout?: () => void }) {
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  // Delete account state
  const [deleting, setDeleting] = useState(false);
  const [delPw, setDelPw] = useState("");
  const [delErr, setDelErr] = useState("");

  // States for all editable fields
  const [name, setName] = useState(user.name || "");
  const [mobile, setMobile] = useState(user.mobile || "");
  const [dob, setDob] = useState(user.dob || "");
  const [gender, setGender] = useState(user.gender || "");
  const [address, setAddress] = useState(user.address || "");
  const [regNumber, setRegNumber] = useState(user.reg_number || "");
  const [hospital, setHospital] = useState(user.hospital || "");
  const [email, setEmail] = useState(user.email || "");
  const [labName, setLabName] = useState(user.lab_name || "");
  const [org, setOrg] = useState(user.org || "");

  const initials = (name || "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s: string) => s[0]?.toUpperCase())
    .join("");
  const color = ROLE_BADGE[user.role] || C.primary;

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setBusy(true);
    try {
      const updates: any = {
        name,
        mobile: mobile || null,
        dob: dob || null,
        gender: gender || null,
        address: address || null,
        reg_number: regNumber || null,
        hospital: hospital || null,
        email: email || null,
        lab_name: labName || null,
        org: org || null,
      };
      const { error } = await supabase
        .from("users")
        .update(updates)
        .eq("id", user.id);
      if (error) throw error;
      setMsg({ kind: "ok", text: "Profile updated successfully! Reloading..." });
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (e: any) {
      setMsg({ kind: "err", text: e.message || "Failed to update profile." });
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteAccount(e: React.FormEvent) {
    e.preventDefault();
    setDelErr("");
    if (!delPw) return setDelErr("Please enter your password.");
    setBusy(true);
    try {
      const { data: realEmail } = await supabase.rpc("get_email_from_id", { display_id: user.id });
      const emailToLogin = realEmail || idToEmail(user.id);

      const { error: pwErr } = await supabase.auth.signInWithPassword({ email: emailToLogin, password: delPw });
      if (pwErr) {
        setDelErr("Incorrect password.");
        setBusy(false);
        return;
      }

      if (user.role === "Laboratory Staff" || user.role === "Medical Records Staff" || user.role === "Doctor") {
        const { data: scans } = await supabase.from("document_scans").select("file_path").eq("uploaded_by", user.id).not("file_path", "is", null);
        if (scans && scans.length > 0) {
          const paths = scans.map((s: any) => s.file_path);
          await supabase.storage.from("medical-files").remove(paths);
        }
      }

      const { error: rpcErr } = await supabase.rpc("delete_own_account");
      if (rpcErr) throw rpcErr;
      
      await supabase.auth.signOut();
      if (onLogout) onLogout();
      window.location.reload();
    } catch (e: any) {
      setDelErr(e.message || "Failed to delete account.");
      setBusy(false);
    }
  }


  const renderField = (label: string, value: string, setter: (v: string) => void, type = "text", options?: string[]) => {
    if (!editing) {
      return (
        <div key={label}>
          <div style={{ fontSize: 11, textTransform: "uppercase", color: C.muted, letterSpacing: 0.5 }}>{label}</div>
          <div style={{ fontSize: 14, marginTop: 4 }}>{value || "—"}</div>
        </div>
      );
    }

    return (
      <div key={label} style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 11, textTransform: "uppercase", color: C.muted, letterSpacing: 0.5, marginBottom: 4 }}>{label}</div>
        {options ? (
          <Select value={value} onChange={(e) => setter(e.target.value)} style={{ width: "100%" }}>
            <option value="">Select…</option>
            {options.map((o) => <option key={o} value={o}>{o}</option>)}
          </Select>
        ) : (
          <Input type={type} value={value} onChange={(e) => setter(e.target.value)} />
        )}
      </div>
    );
  };

  return (
    <div style={{ ...card, maxWidth: 640 }}>
      {msg && <Msg kind={msg.kind}>{msg.text}</Msg>}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 18 }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: color + "22",
            color,
            display: "grid",
            placeItems: "center",
            fontSize: 24,
            fontWeight: 800,
          }}
        >
          {initials}
        </div>
        <div style={{ flex: 1 }}>
          {editing ? (
            <Field label="Full Name">
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
          ) : (
            <div style={{ fontSize: 20, fontWeight: 700 }}>{name}</div>
          )}
          <div style={{ marginTop: 4 }}>
            <Badge color={color}>{user.id}</Badge>
          </div>
        </div>
      </div>

      <form onSubmit={save}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14, marginBottom: 18 }}>
          {user.role === "Patient" && [
            renderField("Date of Birth", dob, setDob, "date"),
            renderField("Gender", gender, setGender, "text", ["Male", "Female", "Other"]),
            renderField("Mobile", mobile, setMobile),
            renderField("Address", address, setAddress),
          ]}
          {user.role === "Doctor" && [
            renderField("Registration No.", regNumber, setRegNumber),
            renderField("Hospital", hospital, setHospital),
            renderField("Mobile", mobile, setMobile),
            renderField("Email", email, setEmail, "email"),
          ]}
          {user.role === "Laboratory Staff" && [
            renderField("Laboratory", labName, setLabName),
            renderField("Mobile", mobile, setMobile),
          ]}
          {user.role === "Medical Records Staff" && [
            renderField("Organisation", org, setOrg),
            renderField("Mobile", mobile, setMobile),
          ]}
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          {editing ? (
            <>
              <button type="button" style={btn("ghost")} onClick={() => { setEditing(false); setMsg(null); }} disabled={busy}>
                Cancel
              </button>
              <button type="submit" style={{ ...btn("primary"), flex: 1 }} disabled={busy}>
                {busy ? "Saving…" : "Save Changes"}
              </button>
            </>
          ) : (
            <button type="button" style={{ ...btn("primary"), width: "100%" }} onClick={() => setEditing(true)}>
              ✏️ Edit Profile
            </button>
          )}
        </div>
      </form>

      {!editing && (
        <div style={{ marginTop: 40, paddingTop: 20, borderTop: `1px solid ${C.border}` }}>
          <h3 style={{ color: "#d32f2f", margin: "0 0 10px", fontSize: 16 }}>Danger Zone</h3>
          {!deleting ? (
            <button 
              style={{ ...btn("ghost"), color: "#d32f2f", borderColor: "#ffcdd2", background: "#ffebee", width: "100%" }}
              onClick={() => setDeleting(true)}
            >
              Delete Account
            </button>
          ) : (
            <form onSubmit={handleDeleteAccount} style={{ background: "#ffebee", padding: 16, borderRadius: 8, border: "1px solid #ffcdd2" }}>
              <p style={{ margin: "0 0 12px", color: "#c62828", fontSize: 14 }}>
                <strong>Warning:</strong> This will permanently delete your profile, messages, records owned by you, and your login account. This cannot be undone.
              </p>
              {delErr && <Msg kind="err">{delErr}</Msg>}
              <Field label="Confirm Password to Delete">
                <Input type="password" value={delPw} onChange={e => setDelPw(e.target.value)} required />
              </Field>
              <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                <button type="button" style={btn("ghost")} onClick={() => { setDeleting(false); setDelErr(""); setDelPw(""); }} disabled={busy}>
                  Cancel
                </button>
                <button type="submit" style={{ ...btn("primary"), background: "#d32f2f", borderColor: "#d32f2f", flex: 1 }} disabled={busy}>
                  {busy ? "Deleting…" : "Permanently Delete"}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 style={{ fontSize: 16, margin: "20px 0 10px" }}>{children}</h2>;
}

// ============== PATIENT ==============
export function PatientDashboard({ user, onLogout }: { user: any; onLogout: () => void }) {
  const [active, setActive] = useState("dashboard");
  const [diag, setDiag] = useState<any[]>([]);
  const [labs, setLabs] = useState<any[]>([]);
  const [rx, setRx] = useState<any[]>([]);
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancel = false;
    (async () => {
      setLoading(true);
      const [d, l, r, m] = await Promise.all([
        (supabase as any).from("diagnoses").select("*").eq("patient_id", user.id).order("created_at", { ascending: false }),
        (supabase as any).from("lab_reports").select("*").eq("patient_id", user.id).order("created_at", { ascending: false }),
        (supabase as any).from("prescriptions").select("*").eq("patient_id", user.id).order("created_at", { ascending: false }),
        (supabase as any).from("medical_docs").select("*").eq("patient_id", user.id).order("created_at", { ascending: false }),
      ]);
      if (cancel) return;
      setDiag(d.data || []);
      setLabs(l.data || []);
      setRx(r.data || []);
      setDocs(m.data || []);
      setLoading(false);
    })();
    return () => { cancel = true; };
  }, [user.id]);

  const nav: NavItem[] = [
    { key: "dashboard", icon: "🏠", label: "Dashboard" },
    { key: "records", icon: "📋", label: "My Records" },
    { key: "labs", icon: "🔬", label: "Lab Reports" },
    { key: "rx", icon: "💊", label: "Prescriptions" },
    { key: "profile", icon: "👤", label: "Profile" },
  ];

  return (
    <DashLayout user={user} nav={nav} active={active} setActive={setActive} onLogout={onLogout}>
      {loading ? (
        <Spinner />
      ) : active === "dashboard" ? (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 16 }}>
            <StatCard icon="🩺" label="Diagnoses" value={diag.length} color={C.primary} />
            <StatCard icon="🔬" label="Lab Reports" value={labs.length} color={C.accent} />
            <StatCard icon="💊" label="Prescriptions" value={rx.length} color={C.success} />
          </div>
          <SectionTitle>Recent Diagnoses</SectionTitle>
          <DataTable
            cols={["Diagnosis", "Date", "Treatment"]}
            rows={diag.slice(0, 5).map((d) => [d.title || "—", fmtDate(d.created_at), d.treatment || "—"])}
          />
          <SectionTitle>Recent Lab Reports</SectionTitle>
          <DataTable
            cols={["Test Name", "Date", "Status"]}
            rows={labs.slice(0, 5).map((l) => [l.test_name || "—", fmtDate(l.test_date || l.created_at), <Badge key={l.id} color={C.success}>{l.status || "Completed"}</Badge>])}
          />
        </>
      ) : active === "records" ? (
        <>
          <SectionTitle>Diagnosis History</SectionTitle>
          <DataTable
            cols={["Diagnosis", "Symptoms", "Findings", "Treatment", "Date"]}
            rows={diag.map((d) => [d.title || "—", d.symptoms || "—", d.findings || "—", d.treatment || "—", fmtDate(d.created_at)])}
          />
          <SectionTitle>Medical Documents</SectionTitle>
          <DataTable
            cols={["Document Type", "Date", "Notes"]}
            rows={docs.map((d) => [d.doc_type || "—", fmtDate(d.doc_date || d.created_at), d.notes || "—"])}
          />
        </>
      ) : active === "labs" ? (
        <DataTable
          cols={["ID", "Test Name", "Date", "Status", "Result Summary"]}
          rows={labs.map((l) => [l.id, l.test_name || "—", fmtDate(l.test_date || l.created_at), <Badge key={l.id} color={C.success}>{l.status || "Completed"}</Badge>, l.summary || "—"])}
        />
      ) : active === "rx" ? (
        <DataTable
          cols={["ID", "Diagnosis", "Medications", "Date"]}
          rows={rx.map((r) => [r.id, r.diagnosis || "—", r.drugs || "—", fmtDate(r.created_at)])}
        />
      ) : (
        <ProfileView user={user} onLogout={onLogout} />
      )}
      <PatientChatbot patientId={user.id} />
    </DashLayout>
  );
}

// ============== DOCTOR ==============
export function DoctorDashboard({ user, onLogout }: { user: any; onLogout: () => void }) {
  const [active, setActive] = useState("search");
  const nav: NavItem[] = [
    { key: "search", icon: "🔍", label: "Patient Search" },
    { key: "diag", icon: "🩺", label: "Add Diagnosis" },
    { key: "rx", icon: "💊", label: "Add Prescription" },
    { key: "scan", icon: "📄", label: "Scan Document" },
    { key: "profile", icon: "👤", label: "Profile" },
  ];

  return (
    <DashLayout user={user} nav={nav} active={active} setActive={setActive} onLogout={onLogout}>
      {active === "search" && <PatientSearch showDocs={false} />}
      {active === "diag" && <AddDiagnosis doctorId={user.id} />}
      {active === "rx" && <AddPrescription doctorId={user.id} />}
      {active === "scan" && <ScanDocument uploaderId={user.id} uploaderRole={user.role} />}
      {active === "profile" && <ProfileView user={user} onLogout={onLogout} />}
    </DashLayout>
  );
}

function PatientSearch({ showDocs }: { showDocs: boolean }) {
  const [pid, setPid] = useState("");
  const [patient, setPatient] = useState<any>(null);
  const [diag, setDiag] = useState<any[]>([]);
  const [labs, setLabs] = useState<any[]>([]);
  const [rx, setRx] = useState<any[]>([]);
  const [docs, setDocs] = useState<any[]>([]);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function search(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setPatient(null);
    if (!pid.trim()) return;
    setBusy(true);
    try {
      const id = pid.trim().toUpperCase();
      const { data, error } = await (supabase as any).from("users").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      if (!data) {
        setErr("No user found with that ID.");
        return;
      }
      if (data.role !== "Patient") {
        setErr(`ID ${id} belongs to a ${data.role}, not a Patient.`);
        return;
      }
      setPatient(data);
      const [d, l, r, m] = await Promise.all([
        (supabase as any).from("diagnoses").select("*").eq("patient_id", id).order("created_at", { ascending: false }),
        (supabase as any).from("lab_reports").select("*").eq("patient_id", id).order("created_at", { ascending: false }),
        (supabase as any).from("prescriptions").select("*").eq("patient_id", id).order("created_at", { ascending: false }),
        (supabase as any).from("medical_docs").select("*").eq("patient_id", id).order("created_at", { ascending: false }),
      ]);
      setDiag(d.data || []);
      setLabs(l.data || []);
      setRx(r.data || []);
      setDocs(m.data || []);
    } catch (e: any) {
      setErr(e.message || "Search failed.");
    } finally {
      setBusy(false);
    }
  }

  async function deleteRecord(table: string, id: string, file_path?: string) {
    if (!confirm("Are you sure you want to delete this record?")) return;
    setBusy(true);
    try {
      if (file_path) {
        await supabase.storage.from("medical-files").remove([file_path]);
      }
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
      setErr("");
      alert("Record deleted successfully.");
      // Refresh search
      search(new Event("submit") as any);
    } catch (e: any) {
      setErr(e.message || "Failed to delete record.");
    } finally {
      setBusy(false);
    }
  }

  const delBtn = (table: string, id: string, file_path?: string) => (
    <button style={{ ...btn("ghost"), color: "#d32f2f", padding: "4px 8px", fontSize: 12 }} onClick={() => deleteRecord(table, id, file_path)}>Delete</button>
  );

  return (
    <>
      <form onSubmit={search} style={{ ...card, display: "flex", gap: 10, alignItems: "flex-end", maxWidth: 560 }}>
        <div style={{ flex: 1 }}>
          <Field label="Patient ID">
            <Input placeholder="PAT1001" value={pid} onChange={(e) => setPid(e.target.value)} />
          </Field>
        </div>
        <button style={btn("primary")} disabled={busy}>
          {busy ? "Searching…" : "Search"}
        </button>
      </form>
      {err && <div style={{ marginTop: 14 }}><Msg kind="err">{err}</Msg></div>}
      {patient && (
        <>
          <div style={{ ...card, marginTop: 18 }}>
            <h3 style={{ marginTop: 0 }}>{patient.name} <Badge color={C.primary}>{patient.id}</Badge></h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12, marginTop: 8 }}>
              <Info label="Gender" value={patient.gender || "—"} />
              <Info label="Date of Birth" value={patient.dob || "—"} />
              <Info label="Mobile" value={patient.mobile || "—"} />
              <Info label="Address" value={patient.address || "—"} />
            </div>
          </div>
          <SectionTitle>Diagnoses</SectionTitle>
          <DataTable cols={["Diagnosis", "Symptoms", "Treatment", "Date", ""]} rows={diag.map((d) => [d.title, d.symptoms, d.treatment, fmtDate(d.created_at), delBtn('diagnoses', d.id)])} />
          <SectionTitle>Lab Reports</SectionTitle>
          <DataTable cols={["Test", "Date", "Status", "Summary", ""]} rows={labs.map((l) => [l.test_name, fmtDate(l.test_date || l.created_at), <Badge key={l.id} color={C.success}>{l.status || "Completed"}</Badge>, l.summary, delBtn('lab_reports', l.id)])} />
          <SectionTitle>Prescriptions</SectionTitle>
          <DataTable cols={["Diagnosis", "Medications", "Date", ""]} rows={rx.map((r) => [r.diagnosis, r.drugs, fmtDate(r.created_at), delBtn('prescriptions', r.id)])} />
          {showDocs && (
            <>
              <SectionTitle>Medical Documents</SectionTitle>
              <DataTable cols={["Type", "Date", "Notes", ""]} rows={docs.map((d) => [d.doc_type, fmtDate(d.doc_date || d.created_at), d.notes, delBtn('medical_docs', d.id, d.file_path)])} />
            </>
          )}
        </>
      )}
    </>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 11, textTransform: "uppercase", color: C.muted, letterSpacing: 0.5 }}>{label}</div>
      <div style={{ fontSize: 14, marginTop: 4 }}>{value}</div>
    </div>
  );
}

function newId(prefix: string) {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

function AddDiagnosis({ doctorId }: { doctorId: string }) {
  const [f, setF] = useState({ patient_id: "", title: "", symptoms: "", findings: "", treatment: "" });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (!f.patient_id || !f.title) return setMsg({ kind: "err", text: "Patient ID and Title are required." });
    setBusy(true);
    try {
      const pid = f.patient_id.trim().toUpperCase();
      const pat = await (supabase as any).from("users").select("id,role").eq("id", pid).maybeSingle();
      if (!pat.data || pat.data.role !== "Patient") throw new Error(`Patient ID ${pid} not found.`);
      const { error } = await (supabase as any).from("diagnoses").insert({
        id: newId("DG"),
        patient_id: pid,
        doctor_id: doctorId,
        title: f.title,
        symptoms: f.symptoms,
        findings: f.findings,
        treatment: f.treatment,
      });
      if (error) throw error;
      setMsg({ kind: "ok", text: `Diagnosis saved for ${pid}.` });
      setF({ patient_id: "", title: "", symptoms: "", findings: "", treatment: "" });
    } catch (e: any) {
      setMsg({ kind: "err", text: e.message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ ...card, maxWidth: 640 }}>
      {msg && <Msg kind={msg.kind}>{msg.text}</Msg>}
      <form onSubmit={submit}>
        <Field label="Patient ID"><Input value={f.patient_id} onChange={(e) => setF({ ...f, patient_id: e.target.value })} placeholder="PAT1001" /></Field>
        <Field label="Diagnosis Title"><Input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></Field>
        <Field label="Presenting Symptoms"><Textarea value={f.symptoms} onChange={(e) => setF({ ...f, symptoms: e.target.value })} /></Field>
        <Field label="Clinical Findings"><Textarea value={f.findings} onChange={(e) => setF({ ...f, findings: e.target.value })} /></Field>
        <Field label="Treatment Plan"><Textarea value={f.treatment} onChange={(e) => setF({ ...f, treatment: e.target.value })} /></Field>
        <button style={{ ...btn("primary"), width: "100%" }} disabled={busy}>{busy ? "Saving…" : "Save Diagnosis"}</button>
      </form>
    </div>
  );
}

function AddPrescription({ doctorId }: { doctorId: string }) {
  const [f, setF] = useState({ patient_id: "", diagnosis: "", drugs: "" });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (!f.patient_id || !f.drugs) return setMsg({ kind: "err", text: "Patient ID and Medications are required." });
    setBusy(true);
    try {
      const pid = f.patient_id.trim().toUpperCase();
      const pat = await (supabase as any).from("users").select("id,role").eq("id", pid).maybeSingle();
      if (!pat.data || pat.data.role !== "Patient") throw new Error(`Patient ID ${pid} not found.`);
      const { error } = await (supabase as any).from("prescriptions").insert({
        id: newId("RX"),
        patient_id: pid,
        doctor_id: doctorId,
        diagnosis: f.diagnosis,
        drugs: f.drugs,
      });
      if (error) throw error;
      setMsg({ kind: "ok", text: `Prescription issued for ${pid}.` });
      setF({ patient_id: "", diagnosis: "", drugs: "" });
    } catch (e: any) {
      setMsg({ kind: "err", text: e.message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ ...card, maxWidth: 640 }}>
      {msg && <Msg kind={msg.kind}>{msg.text}</Msg>}
      <form onSubmit={submit}>
        <Field label="Patient ID"><Input value={f.patient_id} onChange={(e) => setF({ ...f, patient_id: e.target.value })} placeholder="PAT1001" /></Field>
        <Field label="Diagnosis / Indication"><Input value={f.diagnosis} onChange={(e) => setF({ ...f, diagnosis: e.target.value })} /></Field>
        <Field label="Medications & Dosage"><Textarea value={f.drugs} onChange={(e) => setF({ ...f, drugs: e.target.value })} placeholder="e.g. Amoxicillin 500mg, 1 tab TDS x 5 days" /></Field>
        <button style={{ ...btn("primary"), width: "100%" }} disabled={busy}>{busy ? "Issuing…" : "Issue Prescription"}</button>
      </form>
    </div>
  );
}

// ============== LAB ==============
export function LabDashboard({ user, onLogout }: { user: any; onLogout: () => void }) {
  const [active, setActive] = useState("upload");
  const nav: NavItem[] = [
    { key: "upload", icon: "📤", label: "Upload Report" },
    { key: "submitted", icon: "📋", label: "Submitted Reports" },
    { key: "scan", icon: "📄", label: "Scan Document" },
    { key: "profile", icon: "👤", label: "Profile" },
  ];
  return (
    <DashLayout user={user} nav={nav} active={active} setActive={setActive} onLogout={onLogout}>
      {active === "upload" && <UploadLabReport labId={user.id} />}
      {active === "submitted" && <SubmittedLabReports labId={user.id} />}
      {active === "scan" && <ScanDocument uploaderId={user.id} uploaderRole={user.role} />}
      {active === "profile" && <ProfileView user={user} onLogout={onLogout} />}
    </DashLayout>
  );
}

function UploadLabReport({ labId }: { labId: string }) {
  const [f, setF] = useState({ patient_id: "", test_name: "", test_date: "", summary: "" });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (!f.patient_id || !f.test_name) return setMsg({ kind: "err", text: "Patient ID and Test Name are required." });
    setBusy(true);
    try {
      const pid = f.patient_id.trim().toUpperCase();
      const pat = await (supabase as any).from("users").select("id,role").eq("id", pid).maybeSingle();
      if (!pat.data || pat.data.role !== "Patient") throw new Error(`Patient ID ${pid} not found.`);
      const { error } = await (supabase as any).from("lab_reports").insert({
        id: newId("LR"),
        patient_id: pid,
        lab_id: labId,
        test_name: f.test_name,
        test_date: f.test_date || null,
        summary: f.summary,
        status: "Completed",
      });
      if (error) throw error;
      setMsg({ kind: "ok", text: `Report uploaded for ${pid}.` });
      setF({ patient_id: "", test_name: "", test_date: "", summary: "" });
    } catch (e: any) {
      setMsg({ kind: "err", text: e.message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ ...card, maxWidth: 640 }}>
      {msg && <Msg kind={msg.kind}>{msg.text}</Msg>}
      <form onSubmit={submit}>
        <Field label="Patient ID"><Input value={f.patient_id} onChange={(e) => setF({ ...f, patient_id: e.target.value })} placeholder="PAT1001" /></Field>
        <Field label="Test Name"><Input value={f.test_name} onChange={(e) => setF({ ...f, test_name: e.target.value })} /></Field>
        <Field label="Test Date"><Input type="date" value={f.test_date} onChange={(e) => setF({ ...f, test_date: e.target.value })} /></Field>
        <Field label="Result Summary"><Textarea value={f.summary} onChange={(e) => setF({ ...f, summary: e.target.value })} /></Field>
        <button style={{ ...btn("primary"), width: "100%" }} disabled={busy}>{busy ? "Submitting…" : "Submit Report"}</button>
      </form>
    </div>
  );
}

function SubmittedLabReports({ labId }: { labId: string }) {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      const { data } = await (supabase as any).from("lab_reports").select("*").eq("lab_id", labId).order("created_at", { ascending: false });
      setRows(data || []);
      setLoading(false);
    })();
  }, [labId]);
  if (loading) return <Spinner />;
  return (
    <DataTable
      cols={["ID", "Patient ID", "Test Name", "Date", "Status"]}
      rows={rows.map((r) => [r.id, r.patient_id, r.test_name, fmtDate(r.test_date || r.created_at), <Badge key={r.id} color={C.success}>{r.status || "Completed"}</Badge>])}
    />
  );
}

// ============== MRS ==============
export function MRSDashboard({ user, onLogout }: { user: any; onLogout: () => void }) {
  const [active, setActive] = useState("search");
  const nav: NavItem[] = [
    { key: "search", icon: "🔍", label: "Patient Search" },
    { key: "upload", icon: "📤", label: "Upload Document" },
    { key: "scan", icon: "📄", label: "Scan Document" },
    { key: "profile", icon: "👤", label: "Profile" },
  ];
  return (
    <DashLayout user={user} nav={nav} active={active} setActive={setActive} onLogout={onLogout}>
      {active === "search" && <PatientSearch showDocs />}
      {active === "upload" && <UploadDoc staffId={user.id} />}
      {active === "scan" && <ScanDocument uploaderId={user.id} uploaderRole={user.role} />}
      {active === "profile" && <ProfileView user={user} onLogout={onLogout} />}
    </DashLayout>
  );
}

const DOC_TYPES = [
  "Discharge Summary",
  "Admission Record",
  "Surgical Notes",
  "Referral Letter",
  "Immunisation Record",
  "Previous Hospital Records",
  "Insurance Document",
  "Consent Form",
];

function UploadDoc({ staffId }: { staffId: string }) {
  const [f, setF] = useState({ patient_id: "", doc_type: "", doc_date: "", notes: "" });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (!f.patient_id || !f.doc_type) return setMsg({ kind: "err", text: "Patient ID and Document Type are required." });
    setBusy(true);
    try {
      const pid = f.patient_id.trim().toUpperCase();
      const pat = await (supabase as any).from("users").select("id,role").eq("id", pid).maybeSingle();
      if (!pat.data || pat.data.role !== "Patient") throw new Error(`Patient ID ${pid} not found.`);
      const { error } = await (supabase as any).from("medical_docs").insert({
        id: newId("MD"),
        patient_id: pid,
        staff_id: staffId,
        doc_type: f.doc_type,
        doc_date: f.doc_date || null,
        notes: f.notes,
      });
      if (error) throw error;
      setMsg({ kind: "ok", text: `Document archived for ${pid}.` });
      setF({ patient_id: "", doc_type: "", doc_date: "", notes: "" });
    } catch (e: any) {
      setMsg({ kind: "err", text: e.message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ ...card, maxWidth: 640 }}>
      {msg && <Msg kind={msg.kind}>{msg.text}</Msg>}
      <form onSubmit={submit}>
        <Field label="Patient ID"><Input value={f.patient_id} onChange={(e) => setF({ ...f, patient_id: e.target.value })} placeholder="PAT1001" /></Field>
        <Field label="Document Type">
          <Select value={f.doc_type} onChange={(e) => setF({ ...f, doc_type: e.target.value })}>
            <option value="">Select…</option>
            {DOC_TYPES.map((t) => <option key={t}>{t}</option>)}
          </Select>
        </Field>
        <Field label="Document Date"><Input type="date" value={f.doc_date} onChange={(e) => setF({ ...f, doc_date: e.target.value })} /></Field>
        <Field label="Notes / Remarks"><Textarea value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} /></Field>
        <button style={{ ...btn("primary"), width: "100%" }} disabled={busy}>{busy ? "Uploading…" : "Upload Document"}</button>
      </form>
    </div>
  );
}
