import type { FormDefinition } from "./types";

export const HS_PLAN_FORM: FormDefinition = {
  version: 1,
  title: "My high-school plan",
  description:
    "Filled by the student near the end of the mentorship. Capstone document.",
  questions: [
    {
      id: "north_star",
      prompt: "What's your north-star goal (life or career) for the next 5 years?",
      type: "long",
      required: true,
    },
    {
      id: "this_year",
      prompt: "What are 3 things you'll accomplish this academic year?",
      type: "long",
      required: true,
    },
    { id: "courses", prompt: "What courses are you planning to take next year?", type: "long" },
    {
      id: "activities",
      prompt: "What activities, clubs, or service work will you do?",
      type: "long",
    },
    { id: "summer", prompt: "What's your plan for next summer?", type: "long" },
    { id: "college_path", prompt: "What's your college / post-HS plan?", type: "long" },
    { id: "people", prompt: "Who will you ask for help along the way?", type: "long" },
    {
      id: "biggest_risk",
      prompt: "What's the biggest risk to this plan and how will you handle it?",
      type: "long",
    },
    {
      id: "thank_you",
      prompt: "Anything you want to tell your mentor or the ETU team?",
      type: "long",
    },
  ],
};
