import { A } from "./tokens";
import { authStyles as s } from "@/app/(auth)/_styles";
import type { FormDefinition, FormAnswers } from "@/lib/forms/types";

export function FormRenderer({
  def,
  existing,
  action,
  submitLabel,
  textareaRows = 3,
}: {
  def: FormDefinition;
  existing: FormAnswers | null;
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
  textareaRows?: number;
}) {
  return (
    <form
      action={action}
      style={{
        background: "#fff",
        border: `1px solid ${A.rule}`,
        borderRadius: 6,
        padding: 32,
        display: "flex",
        flexDirection: "column",
        gap: 22,
        boxShadow: "0 12px 32px -28px rgba(15, 69, 102, 0.2)",
      }}
    >
      <header>
        <h2
          style={{
            margin: 0,
            fontFamily: A.fontHead,
            fontSize: 22,
            fontWeight: 500,
            color: A.navy,
            letterSpacing: "-0.01em",
          }}
        >
          {def.title}
        </h2>
        {def.description && (
          <p
            style={{
              margin: "8px 0 0",
              fontSize: 13,
              color: A.muted,
              lineHeight: 1.6,
            }}
          >
            {def.description}
          </p>
        )}
      </header>

      {def.questions.map((q, i) => (
        <div key={q.id}>
          <label htmlFor={`f_${def.title}_${q.id}`} style={s.fieldLabel}>
            <span style={{ color: A.gold, marginRight: 6 }}>Q{i + 1}.</span>{" "}
            {q.prompt}
            {q.required && <span style={{ color: "#b22234" }}> *</span>}
          </label>
          {q.type === "long" ? (
            <textarea
              id={`f_${def.title}_${q.id}`}
              name={q.id}
              rows={textareaRows}
              required={!!q.required}
              defaultValue={existing?.[q.id] ?? ""}
              style={{
                ...s.input,
                resize: "vertical",
                fontFamily: A.fontBody,
              }}
            />
          ) : q.type === "select" ? (
            <select
              id={`f_${def.title}_${q.id}`}
              name={q.id}
              required={!!q.required}
              defaultValue={existing?.[q.id] ?? ""}
              style={s.input}
            >
              <option value="">—</option>
              {q.options?.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          ) : (
            <input
              id={`f_${def.title}_${q.id}`}
              name={q.id}
              required={!!q.required}
              defaultValue={existing?.[q.id] ?? ""}
              style={s.input}
            />
          )}
        </div>
      ))}

      <div style={{ marginTop: 4 }}>
        <button type="submit" style={s.primaryButton}>
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
