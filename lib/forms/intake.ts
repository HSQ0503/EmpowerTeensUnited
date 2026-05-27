import type { FormDefinition } from "./types";

export const INTAKE_FORM: FormDefinition = {
  version: 1,
  title: "Student intake",
  description:
    "Filled by the student before their first mentorship session. Mentors and admins see all answers.",
  questions: [
    { id: "name_pref", prompt: "What name do you go by?", type: "short", required: true },
    { id: "grade", prompt: "What grade are you in?", type: "short", required: true },
    { id: "school", prompt: "What school do you attend?", type: "short", required: true },
    { id: "strengths", prompt: "What are three of your biggest strengths?", type: "long", required: true },
    { id: "challenges", prompt: "What are three things you find challenging right now?", type: "long", required: true },
    { id: "passions", prompt: "What activities make you lose track of time?", type: "long" },
    { id: "career_idea", prompt: "If you had to pick a career today, what would it be and why?", type: "long" },
    { id: "college", prompt: "Are you thinking about college? If yes, which ones?", type: "long" },
    { id: "support_system", prompt: "Who do you turn to when things get hard?", type: "long" },
    { id: "stress", prompt: "How do you typically handle stress?", type: "long" },
    { id: "goal_1yr", prompt: "What's one goal you have for the next year?", type: "long", required: true },
    { id: "goal_5yr", prompt: "Where do you see yourself in 5 years?", type: "long" },
    { id: "mentor_help", prompt: "What's one thing you hope a mentor can help you with?", type: "long", required: true },
    { id: "scared_of", prompt: "What's something you're afraid of about the future?", type: "long" },
    { id: "proud_of", prompt: "What's something you're proud of?", type: "long" },
    { id: "family", prompt: "How would you describe your family?", type: "long" },
    { id: "free_time", prompt: "What do you do in your free time?", type: "long" },
    { id: "role_model", prompt: "Who's a role model for you and why?", type: "long" },
    { id: "describe_self_3", prompt: "Describe yourself in three words.", type: "short" },
    { id: "anything_else", prompt: "Anything else you want your mentor to know before meeting?", type: "long" },
  ],
};
