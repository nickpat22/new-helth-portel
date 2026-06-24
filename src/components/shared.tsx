import React from "react";
import { C, FONT, inputStyle } from "./theme";

export function Logo({ size = 22 }: { size?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div
        style={{
          width: size + 12,
          height: size + 12,
          borderRadius: 8,
          background: C.primary,
          display: "grid",
          placeItems: "center",
          color: "#fff",
          fontWeight: 700,
        }}
        aria-hidden
      >
        <svg width={size - 2} height={size - 2} viewBox="0 0 24 24" fill="none">
          <path
            d="M10 3h4v7h7v4h-7v7h-4v-7H3v-4h7z"
            fill="currentColor"
          />
        </svg>
      </div>
      <span style={{ color: C.primary, fontWeight: 800, fontSize: size, letterSpacing: -0.3 }}>
        DocuMed
      </span>
    </div>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label style={{ display: "block", marginBottom: 14 }}>
      <div
        style={{
          fontSize: 11,
          letterSpacing: 0.6,
          textTransform: "uppercase",
          color: C.muted,
          marginBottom: 6,
          fontWeight: 600,
        }}
      >
        {label}
      </div>
      {children}
    </label>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} style={{ ...inputStyle, ...(props.style || {}) }} />;
}
export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      style={{ ...inputStyle, minHeight: 90, resize: "vertical", ...(props.style || {}) }}
    />
  );
}
export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} style={{ ...inputStyle, ...(props.style || {}) }} />;
}

export function Msg({ kind, children }: { kind: "ok" | "err"; children: React.ReactNode }) {
  const ok = kind === "ok";
  return (
    <div
      role="status"
      style={{
        background: ok ? C.successBg : C.dangerBg,
        color: ok ? C.success : C.danger,
        border: `1px solid ${ok ? "#BCE6D6" : "#F2C7C7"}`,
        padding: "10px 12px",
        borderRadius: 8,
        fontSize: 14,
        marginBottom: 12,
        fontWeight: 500,
      }}
    >
      {ok ? "✅ " : "⚠️ "}
      {children}
    </div>
  );
}

export function Spinner({ text = "Loading…", full = false }: { text?: string; full?: boolean }) {
  const inner = (
    <div style={{ display: "flex", alignItems: "center", gap: 12, color: C.muted, fontFamily: FONT }}>
      <span
        style={{
          width: 18,
          height: 18,
          borderRadius: "50%",
          border: `2px solid ${C.border}`,
          borderTopColor: C.primary,
          display: "inline-block",
          animation: "documed-spin 0.9s linear infinite",
        }}
      />
      <span style={{ fontSize: 14 }}>{text}</span>
    </div>
  );
  if (!full) return inner;
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(244,247,251,0.7)",
        display: "grid",
        placeItems: "center",
        zIndex: 50,
      }}
    >
      {inner}
    </div>
  );
}

export function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: string;
  label: string;
  value: number | string;
  color: string;
}) {
  return (
    <div
      style={{
        background: "#fff",
        border: `1px solid ${C.border}`,
        borderRadius: 16,
        padding: 20,
        display: "flex",
        alignItems: "center",
        gap: 16,
        boxShadow: "0 2px 10px rgba(15,42,79,0.04)",
      }}
    >
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 12,
          background: color + "22",
          color,
          display: "grid",
          placeItems: "center",
          fontSize: 24,
        }}
      >
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 12, color: C.muted, textTransform: "uppercase", letterSpacing: 0.5 }}>
          {label}
        </div>
        <div style={{ fontSize: 28, fontWeight: 700, color: C.text }}>{value}</div>
      </div>
    </div>
  );
}

export function DataTable({
  cols,
  rows,
  empty = "No records yet.",
}: {
  cols: string[];
  rows: (string | number | React.ReactNode)[][];
  empty?: string;
}) {
  return (
    <div
      style={{
        border: `1px solid ${C.border}`,
        borderRadius: 10,
        overflow: "auto",
        background: "#fff",
      }}
    >
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
        <thead>
          <tr style={{ background: C.lightBlue }}>
            {cols.map((c) => (
              <th
                key={c}
                style={{
                  textAlign: "left",
                  padding: "10px 14px",
                  fontSize: 11,
                  letterSpacing: 0.5,
                  textTransform: "uppercase",
                  color: C.primary,
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                }}
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={cols.length}
                style={{ padding: 20, textAlign: "center", color: C.muted }}
              >
                {empty}
              </td>
            </tr>
          ) : (
            rows.map((r, i) => (
              <tr key={i} style={{ background: i % 2 ? C.rowAlt : "#fff" }}>
                {r.map((cell, j) => (
                  <td
                    key={j}
                    style={{
                      padding: "10px 14px",
                      borderTop: `1px solid ${C.border}`,
                      color: C.text,
                      verticalAlign: "top",
                    }}
                  >
                    {cell as any}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export function Badge({ children, color = C.primary }: { children: React.ReactNode; color?: string }) {
  return (
    <span
      style={{
        background: color + "22",
        color,
        padding: "3px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        display: "inline-block",
      }}
    >
      {children}
    </span>
  );
}
