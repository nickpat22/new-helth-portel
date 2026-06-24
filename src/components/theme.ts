export const C = {
  primary: "#0A66C2",
  lightBlue: "#EAF4FF",
  accent: "#00B4D8",
  bg: "#F4F7FB",
  text: "#1E293B",
  border: "#D1DDF0",
  success: "#0F6E56",
  successBg: "#E1F5EE",
  danger: "#A32D2D",
  dangerBg: "#FCEBEB",
  warning: "#BA7517",
  muted: "#64748B",
  white: "#FFFFFF",
  rowAlt: "#FAFCFF",
};

export const FONT =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

export const card: React.CSSProperties = {
  background: C.white,
  borderRadius: 16,
  border: `1px solid ${C.border}`,
  boxShadow: "0 4px 18px rgba(15,42,79,0.06)",
  padding: 24,
};

export const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  border: `1px solid ${C.border}`,
  fontSize: 14,
  outline: "none",
  background: C.white,
  color: C.text,
  fontFamily: FONT,
  boxSizing: "border-box",
};

export const btn = (variant: "primary" | "ghost" | "danger" = "primary"): React.CSSProperties => ({
  padding: "10px 18px",
  borderRadius: 8,
  border: variant === "ghost" ? `1px solid ${C.border}` : "none",
  background:
    variant === "primary" ? C.primary : variant === "danger" ? C.danger : C.white,
  color: variant === "ghost" ? C.text : "#fff",
  fontWeight: 600,
  fontSize: 14,
  cursor: "pointer",
  transition: "all .15s",
  fontFamily: FONT,
});
