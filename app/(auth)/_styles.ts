import type { CSSProperties } from "react";
import { A } from "@/app/components/tokens";

export const authStyles = {
  heading: {
    fontFamily: A.fontHead,
    fontSize: 30,
    fontWeight: 500,
    color: A.navy,
    letterSpacing: "-0.02em",
    lineHeight: 1.15,
    margin: 0,
  } satisfies CSSProperties,

  subheading: {
    fontFamily: A.fontBody,
    fontSize: 14,
    color: A.muted,
    margin: "10px 0 0",
    lineHeight: 1.5,
  } satisfies CSSProperties,

  form: {
    display: "flex",
    flexDirection: "column",
    gap: 18,
    marginTop: 28,
  } satisfies CSSProperties,

  fieldRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
  } satisfies CSSProperties,

  fieldLabel: {
    display: "block",
    fontFamily: A.fontBody,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: A.muted,
    marginBottom: 6,
  } satisfies CSSProperties,

  input: {
    display: "block",
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 14px",
    background: "#fff",
    border: `1px solid ${A.rule}`,
    borderRadius: 4,
    fontFamily: A.fontBody,
    fontSize: 15,
    color: A.ink,
    outline: "none",
    transition: "border-color 160ms ease, box-shadow 160ms ease",
  } satisfies CSSProperties,

  inputDisabled: {
    background: A.ruleSoft,
    color: A.muted,
    cursor: "not-allowed",
  } satisfies CSSProperties,

  primaryButton: {
    background: A.navy,
    color: "#fff",
    padding: "14px 22px",
    border: "none",
    borderRadius: 4,
    fontFamily: A.fontBody,
    fontWeight: 700,
    fontSize: 14,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    cursor: "pointer",
    transition: "background 160ms ease, transform 160ms ease",
  } satisfies CSSProperties,

  ghostButton: {
    background: "transparent",
    color: A.navy,
    padding: "12px 18px",
    border: `1px solid ${A.rule}`,
    borderRadius: 4,
    fontFamily: A.fontBody,
    fontWeight: 700,
    fontSize: 13,
    letterSpacing: 0.4,
    textTransform: "uppercase",
    cursor: "pointer",
    textDecoration: "none",
    display: "inline-block",
  } satisfies CSSProperties,

  link: {
    color: A.navy,
    fontFamily: A.fontBody,
    fontSize: 13,
    fontWeight: 600,
    textDecoration: "none",
    borderBottom: `2px solid ${A.gold}`,
    paddingBottom: 2,
  } satisfies CSSProperties,

  rowBetween: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
    marginTop: 8,
  } satisfies CSSProperties,

  alertError: {
    background: "rgba(178, 34, 52, 0.06)",
    border: "1px solid rgba(178, 34, 52, 0.18)",
    color: "#7a1620",
    padding: "12px 14px",
    borderRadius: 4,
    fontSize: 13,
    fontFamily: A.fontBody,
    lineHeight: 1.5,
  } satisfies CSSProperties,

  alertInfo: {
    background: "rgba(15, 69, 102, 0.05)",
    border: `1px solid ${A.rule}`,
    color: A.navy,
    padding: "12px 14px",
    borderRadius: 4,
    fontSize: 13,
    fontFamily: A.fontBody,
    lineHeight: 1.5,
  } satisfies CSSProperties,
} as const;
