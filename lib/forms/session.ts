import type { FormDefinition } from "./types";

export const SESSION_FORM: FormDefinition = {
  version: 1,
  title: "Session notes",
  description: "Filled by the mentor during or right after each meeting.",
  questions: [
    { id: "date", prompt: "Date of session", type: "short", required: true },
    { id: "duration", prompt: "Approximate length (minutes)", type: "short" },
    {
      id: "format",
      prompt: "Format",
      type: "select",
      options: ["In person", "Video", "Phone"],
      required: true,
    },
    { id: "topics", prompt: "What did you cover?", type: "long", required: true },
    { id: "wins", prompt: "Wins or progress since last time", type: "long" },
    { id: "concerns", prompt: "Concerns or red flags", type: "long" },
    {
      id: "action_items",
      prompt: "Action items for the student before next session",
      type: "long",
    },
    { id: "next_session", prompt: "Tentative next session date", type: "short" },
    { id: "mentor_notes", prompt: "Anything else for your records or admin", type: "long" },
  ],
};
