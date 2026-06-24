import React, { useState, useEffect, useRef } from "react";
import { C, btn, card, FONT } from "./theme";
import { Input, Spinner } from "./shared";
import { supabase } from "../lib/supa";

// Chatbot UI overlay inside the Patient Dashboard
export function PatientChatbot({ patientId }: { patientId: string }) {
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState("");
  const [history, setHistory] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) loadHistory();
  }, [open]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, busy]);

  async function loadHistory() {
    const { data } = await supabase
      .from("chat_history")
      .select("*")
      .eq("patient_id", patientId)
      .order("created_at", { ascending: true });
    if (data) setHistory(data);
  }

  async function sendMsg(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!msg.trim() || busy) return;

    const userMsg = msg.trim();
    setMsg("");
    setBusy(true);

    // Optimistically add user msg
    const tempId = Date.now().toString();
    setHistory((h) => [...h, { id: tempId, message: userMsg, response: null }]);

    try {
      // 1. Send to AI API (Gemini format)
      const API_KEY = import.meta.env.VITE_AI_API_KEY || "";
      
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            ...history.map((h) => [
              { role: "user", parts: [{ text: h.message }] },
              { role: "model", parts: [{ text: h.response || "" }] },
            ]).flat().filter(m => m.parts[0].text),
            { role: "user", parts: [{ text: "SYSTEM INSTRUCTION: You are an informational health assistant for patients. You can explain diseases, reports, medical terms, lab values, give health education, explain prescriptions, and offer lifestyle suggestions. CRITICAL RULES: Never prescribe medicines. Never recommend dosages. Never replace doctors. Always include a disclaimer that you are an informational assistant and cannot prescribe medications or provide medical treatment. \n\nPATIENT MESSAGE: " + userMsg }] },
          ],
        }),
      });

      let aiResponseText = "Sorry, I could not process that request right now.";
      
      if (res.ok) {
        const data = await res.json();
        aiResponseText = data.candidates?.[0]?.content?.parts?.[0]?.text || aiResponseText;
      } else {
        const errText = await res.text();
        console.warn("AI API Error:", errText);
        throw new Error(errText);
      }

      // 2. Save to database
      const { data: inserted, error } = await supabase
        .from("chat_history")
        .insert({
          patient_id: patientId,
          message: userMsg,
          response: aiResponseText,
        })
        .select()
        .single();

      if (error) throw error;

      // Update UI
      setHistory((h) => h.map((item) => (item.id === tempId ? inserted : item)));
    } catch (err: any) {
      console.error(err);
      const errMsg = err?.message || err?.toString() || "Unknown error";
      setHistory((h) => h.map((item) => (item.id === tempId ? { ...item, response: `Error: ${errMsg}` } : item)));
    } finally {
      setBusy(false);
    }
  }

  async function clearChat() {
    if (!confirm("Are you sure you want to clear your chat history?")) return;
    await supabase.from("chat_history").delete().eq("patient_id", patientId);
    setHistory([]);
  }

  function exportChat() {
    const text = history.map((h) => `You: ${h.message}\nAssistant: ${h.response}\n\n`).join("");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "chat_history.txt";
    a.click();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          width: 60,
          height: 60,
          borderRadius: 30,
          background: C.primary,
          color: "#fff",
          border: "none",
          boxShadow: "0 8px 24px rgba(10,102,194,0.3)",
          cursor: "pointer",
          fontSize: 28,
          display: "grid",
          placeItems: "center",
          zIndex: 9999,
          transition: "transform 0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        💬
      </button>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        width: 380,
        height: 560,
        background: "#fff",
        borderRadius: 16,
        boxShadow: "0 12px 48px rgba(0,0,0,0.15)",
        display: "flex",
        flexDirection: "column",
        zIndex: 9999,
        border: `1px solid ${C.border}`,
        overflow: "hidden",
        fontFamily: FONT,
      }}
    >
      {/* Header */}
      <div style={{ background: C.primary, color: "#fff", padding: "16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontWeight: 600, fontSize: 16 }}>AI Health Assistant</div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={clearChat} title="Clear Chat" style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.7)", cursor: "pointer", fontSize: 16 }}>🗑️</button>
          <button onClick={exportChat} title="Export Chat" style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.7)", cursor: "pointer", fontSize: 16 }}>💾</button>
          <button onClick={() => setOpen(false)} style={{ background: "transparent", border: "none", color: "#fff", cursor: "pointer", fontSize: 20, marginLeft: 8 }}>×</button>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: 16, background: C.bg, display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 8, padding: 12, fontSize: 13, color: C.muted }}>
          <strong>Disclaimer:</strong> I am an informational assistant and cannot prescribe medications or provide medical treatment. Always consult your doctor for medical advice.
        </div>
        
        {history.map((h, i) => (
          <React.Fragment key={h.id || i}>
            {/* User */}
            <div style={{ alignSelf: "flex-end", background: C.lightBlue, color: C.text, padding: "10px 14px", borderRadius: "16px 16px 0 16px", maxWidth: "80%", fontSize: 14 }}>
              {h.message}
            </div>
            {/* Assistant */}
            {h.response && (
              <div style={{ alignSelf: "flex-start", background: "#fff", border: `1px solid ${C.border}`, color: C.text, padding: "10px 14px", borderRadius: "16px 16px 16px 0", maxWidth: "85%", fontSize: 14, whiteSpace: "pre-wrap" }}>
                {h.response}
              </div>
            )}
          </React.Fragment>
        ))}
        {busy && (
          <div style={{ alignSelf: "flex-start", background: "#fff", border: `1px solid ${C.border}`, padding: "10px 14px", borderRadius: "16px 16px 16px 0" }}>
            <Spinner />
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMsg} style={{ padding: 12, background: "#fff", borderTop: `1px solid ${C.border}`, display: "flex", gap: 8 }}>
        <input
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          placeholder="Ask a health question..."
          style={{ flex: 1, padding: "10px 14px", borderRadius: 20, border: `1px solid ${C.border}`, outline: "none", fontFamily: FONT }}
          disabled={busy}
        />
        <button
          type="submit"
          disabled={busy || !msg.trim()}
          style={{
            background: msg.trim() && !busy ? C.primary : C.border,
            color: "#fff",
            border: "none",
            borderRadius: 20,
            padding: "0 18px",
            cursor: msg.trim() && !busy ? "pointer" : "default",
            fontWeight: 600,
            transition: "background 0.2s"
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
}
