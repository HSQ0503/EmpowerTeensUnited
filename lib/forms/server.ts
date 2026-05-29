import type { FormDefinition, FormAnswers } from "./types";

// Pull each defined answer out of the submitted form, trimmed. Questions not in
// the definition are ignored, so a crafted POST can't inject extra keys.
export function readAnswers(formData: FormData, def: FormDefinition): FormAnswers {
  const answers: FormAnswers = {};
  for (const q of def.questions) {
    answers[q.id] = String(formData.get(q.id) ?? "").trim();
  }
  return answers;
}

// Server-side mirror of the HTML `required` attribute — the form attribute is
// trivially bypassed by a direct POST, so every action re-checks.
export function hasMissingRequired(def: FormDefinition, answers: FormAnswers): boolean {
  return def.questions.some((q) => q.required && !answers[q.id]);
}
