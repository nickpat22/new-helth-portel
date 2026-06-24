import React, { useState } from "react";
import { C, FONT, btn } from "./theme";
import { Badge, Logo } from "./shared";
import { ROLE_BADGE, signOut } from "../lib/supa";

export type NavItem = { key: string; label: string; icon: string };

export function DashLayout({
  user,
  nav,
  active,
  setActive,
  onLogout,
  children,
}: {
  user: any;
  nav: NavItem[];
  active: string;
  setActive: (k: string) => void;
  onLogout: () => void;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  const W = open ? 240 : 68;
  const dateStr = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const title = nav.find((n) => n.key === active)?.label || "";
  const badgeColor = ROLE_BADGE[user.role] || C.primary;

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: C.bg, fontFamily: FONT, color: C.text }}>
      <aside
        style={{
          width: W,
          transition: "width .2s",
          background: "#fff",
          borderRight: `1px solid ${C.border}`,
          display: "flex",
          flexDirection: "column",
          position: "sticky",
          top: 0,
          height: "100vh",
        }}
      >
        <div style={{ padding: 14, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {open ? <Logo size={18} /> : <div style={{ width: 30, height: 30, borderRadius: 8, background: C.primary, display: "grid", placeItems: "center", color: "#fff", fontWeight: 700 }}>D</div>}
          <button
            onClick={() => setOpen(!open)}
            aria-label="Toggle sidebar"
            style={{ background: "transparent", border: "none", fontSize: 18, cursor: "pointer", color: C.muted }}
          >
            ☰
          </button>
        </div>

        {open && (
          <div style={{ padding: "8px 14px 14px", borderBottom: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{user.name}</div>
            <div style={{ fontSize: 12, color: C.muted, margin: "2px 0 6px" }}>{user.id}</div>
            <Badge color={badgeColor}>{user.role}</Badge>
          </div>
        )}

        <nav style={{ flex: 1, padding: 8, overflowY: "auto" }}>
          {nav.map((n) => {
            const isActive = active === n.key;
            return (
              <button
                key={n.key}
                onClick={() => setActive(n.key)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 12px",
                  margin: "2px 0",
                  background: isActive ? C.lightBlue : "transparent",
                  borderLeft: isActive ? `3px solid ${C.primary}` : "3px solid transparent",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                  color: isActive ? C.primary : C.text,
                  fontWeight: isActive ? 700 : 500,
                  fontSize: 14,
                  textAlign: "left",
                  fontFamily: FONT,
                }}
              >
                <span style={{ fontSize: 18, width: 22, textAlign: "center" }}>{n.icon}</span>
                {open && <span>{n.label}</span>}
              </button>
            );
          })}
        </nav>

        <div style={{ padding: 12, borderTop: `1px solid ${C.border}` }}>
          <button
            onClick={async () => {
              await signOut();
              onLogout();
            }}
            style={{ ...btn("ghost"), width: "100%", color: C.danger, borderColor: "#F2C7C7" }}
          >
            {open ? "⎋ Logout" : "⎋"}
          </button>
        </div>
      </aside>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <header
          style={{
            background: "#fff",
            borderBottom: `1px solid ${C.border}`,
            padding: "14px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{title}</h1>
          <div style={{ fontSize: 13, color: C.muted }}>DocuMed · {dateStr}</div>
        </header>
        <main style={{ padding: 24, flex: 1 }}>{children}</main>
      </div>
    </div>
  );
}
