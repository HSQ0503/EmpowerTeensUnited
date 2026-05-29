"use client";

import { useState, type CSSProperties } from "react";
import { A } from "@/app/components/tokens";

type QuestionType = "short" | "long";

type Question = {
  id: string;
  prompt: string;
  type: QuestionType;
};

type Props = {
  name: string;
  defaultValue?: unknown;
};

function genId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return "q_" + crypto.randomUUID().slice(0, 8);
  }
  return "q_" + Math.random().toString(36).slice(2, 10);
}

function normalize(raw: unknown): Question[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((q): q is Record<string, unknown> => !!q && typeof q === "object")
    .map((q) => ({
      id: typeof q.id === "string" && q.id ? q.id : genId(),
      prompt: typeof q.prompt === "string" ? q.prompt : "",
      type: q.type === "long" ? "long" : "short",
    }));
}

export function QuestionBuilder({ name, defaultValue }: Props) {
  const [questions, setQuestions] = useState<Question[]>(() =>
    normalize(defaultValue),
  );

  function update(id: string, patch: Partial<Question>) {
    setQuestions((qs) => qs.map((q) => (q.id === id ? { ...q, ...patch } : q)));
  }

  function add() {
    setQuestions((qs) => [...qs, { id: genId(), prompt: "", type: "short" }]);
  }

  function remove(id: string) {
    setQuestions((qs) => qs.filter((q) => q.id !== id));
  }

  function move(index: number, dir: -1 | 1) {
    setQuestions((qs) => {
      const next = [...qs];
      const target = index + dir;
      if (target < 0 || target >= next.length) return qs;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  // Students only ever see questions with a real prompt — drop blanks on save.
  const serialized = JSON.stringify(
    questions.filter((q) => q.prompt.trim().length > 0),
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {questions.length === 0 ? (
        <div
          style={{
            border: `1px dashed ${A.rule}`,
            borderRadius: 6,
            padding: "24px 20px",
            textAlign: "center",
            color: A.muted,
            fontSize: 14,
            lineHeight: 1.5,
          }}
        >
          No questions yet. Add a reflection prompt for students to answer this
          week.
        </div>
      ) : (
        questions.map((q, i) => (
          <div
            key={q.id}
            style={{
              border: `1px solid ${A.rule}`,
              borderRadius: 6,
              padding: 16,
              background: A.paper,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: 1.2,
                  textTransform: "uppercase",
                  color: A.gold,
                }}
              >
                Question {i + 1}
              </span>
              <div style={{ display: "flex", gap: 4 }}>
                <IconButton
                  label="Move question up"
                  disabled={i === 0}
                  onClick={() => move(i, -1)}
                >
                  <ArrowUp />
                </IconButton>
                <IconButton
                  label="Move question down"
                  disabled={i === questions.length - 1}
                  onClick={() => move(i, 1)}
                >
                  <ArrowDown />
                </IconButton>
                <IconButton
                  label="Delete question"
                  danger
                  onClick={() => remove(q.id)}
                >
                  <Trash />
                </IconButton>
              </div>
            </div>

            <input
              aria-label={`Question ${i + 1} prompt`}
              value={q.prompt}
              onChange={(e) => update(q.id, { prompt: e.target.value })}
              placeholder="e.g. What was the most important thing you learned this week?"
              style={inputStyle}
            />

            <div style={{ display: "flex", gap: 8 }}>
              <TypeToggle
                active={q.type === "short"}
                onClick={() => update(q.id, { type: "short" })}
              >
                Short answer
              </TypeToggle>
              <TypeToggle
                active={q.type === "long"}
                onClick={() => update(q.id, { type: "long" })}
              >
                Paragraph
              </TypeToggle>
            </div>
          </div>
        ))
      )}

      <button type="button" onClick={add} style={addButtonStyle}>
        + Add question
      </button>

      <input type="hidden" name={name} value={serialized} />
    </div>
  );
}

function TypeToggle({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      style={{
        flex: 1,
        padding: "9px 12px",
        borderRadius: 4,
        border: `1px solid ${active ? A.navy : A.rule}`,
        background: active ? A.navy : "#fff",
        color: active ? "#fff" : A.body,
        fontFamily: A.fontBody,
        fontWeight: 600,
        fontSize: 13,
        cursor: "pointer",
        transition: "background 200ms, color 200ms, border-color 200ms",
      }}
    >
      {children}
    </button>
  );
}

function IconButton({
  label,
  onClick,
  disabled,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      style={{
        width: 32,
        height: 32,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 4,
        border: `1px solid ${A.rule}`,
        background: "#fff",
        color: disabled ? A.rule : danger ? "#b22234" : A.navy,
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.5 : 1,
        padding: 0,
      }}
    >
      {children}
    </button>
  );
}

const inputStyle: CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 4,
  border: `1px solid ${A.rule}`,
  background: "#fff",
  fontFamily: A.fontBody,
  fontSize: 14,
  color: A.ink,
  boxSizing: "border-box",
};

const addButtonStyle: CSSProperties = {
  alignSelf: "flex-start",
  padding: "10px 16px",
  borderRadius: 4,
  border: `1px dashed ${A.navy}`,
  background: "#fff",
  color: A.navy,
  fontFamily: A.fontBody,
  fontWeight: 700,
  fontSize: 13,
  letterSpacing: 0.4,
  cursor: "pointer",
};

function ArrowUp() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 19V5M12 5l-6 6M12 5l6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowDown() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 5v14M12 19l6-6M12 19l-6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Trash() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
