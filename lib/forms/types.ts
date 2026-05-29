export type FormQuestion = {
  id: string;
  prompt: string;
  type: "short" | "long" | "select" | "date";
  options?: string[];
  required?: boolean;
};

export type FormDefinition = {
  version: number;
  title: string;
  description?: string;
  questions: FormQuestion[];
};

export type FormAnswers = Record<string, string>;
