import { describe, it, expect } from "vitest";
import { INTAKE_FORM } from "@/lib/forms/intake";
import { SESSION_FORM } from "@/lib/forms/session";
import { HS_PLAN_FORM } from "@/lib/forms/hs-plan";

const ALL_FORMS = [INTAKE_FORM, SESSION_FORM, HS_PLAN_FORM];

describe("form definitions", () => {
  it("intake has exactly 20 questions", () => {
    expect(INTAKE_FORM.questions).toHaveLength(20);
  });

  it("every question id is unique within its form", () => {
    for (const form of ALL_FORMS) {
      const ids = form.questions.map((q) => q.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it("every form has version >= 1", () => {
    for (const form of ALL_FORMS) {
      expect(form.version).toBeGreaterThanOrEqual(1);
    }
  });

  it("select questions always declare at least one option", () => {
    for (const form of ALL_FORMS) {
      for (const q of form.questions) {
        if (q.type === "select") {
          expect(q.options).toBeDefined();
          expect(q.options!.length).toBeGreaterThan(0);
        }
      }
    }
  });

  it("question ids are stable form-field-safe slugs", () => {
    for (const form of ALL_FORMS) {
      for (const q of form.questions) {
        expect(q.id).toMatch(/^[a-z][a-z0-9_]*$/);
      }
    }
  });
});
