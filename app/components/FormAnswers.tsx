import { A } from "./tokens";
import type { FormDefinition, FormAnswers } from "@/lib/forms/types";

export function FormAnswerList({
  def,
  answers,
}: {
  def: FormDefinition;
  answers: FormAnswers;
}) {
  return (
    <dl style={{ margin: 0, display: "grid", gap: 18 }}>
      {def.questions.map((q) => {
        const value = answers[q.id] ?? "";
        return (
          <div key={q.id}>
            <dt
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 1.2,
                textTransform: "uppercase",
                color: A.muted,
                marginBottom: 6,
              }}
            >
              {q.prompt}
            </dt>
            <dd
              style={{
                margin: 0,
                fontSize: 14,
                color: value ? A.ink : A.muted,
                lineHeight: 1.6,
                whiteSpace: "pre-wrap",
                fontStyle: value ? "normal" : "italic",
              }}
            >
              {value || "—"}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
