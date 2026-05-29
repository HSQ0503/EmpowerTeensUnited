import Link from "next/link";
import { A } from "@/app/components/tokens";
import { CourseMetadataForm } from "../_metadata-form";
import { createCourseAction } from "../actions";

export const metadata = { title: "New course · Admin" };

export default function NewCoursePage() {
  return (
    <div style={{ maxWidth: 720 }}>
      <div style={{ marginBottom: 24 }}>
        <Link
          href="/admin/courses"
          style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 1.4,
            textTransform: "uppercase",
            color: A.muted,
            textDecoration: "none",
          }}
        >
          ← Courses
        </Link>
        <h1
          className="etu-h2"
          style={{
            marginTop: 12,
            fontFamily: A.fontHead,
            fontSize: 32,
            fontWeight: 500,
            color: A.navy,
            letterSpacing: "-0.02em",
          }}
        >
          New course
        </h1>
        <p
          style={{
            marginTop: 8,
            color: A.muted,
            fontSize: 14,
            lineHeight: 1.5,
          }}
        >
          We&apos;ll create one empty week per week count. Add the title, body,
          and questions to each week on the next screen.
        </p>
      </div>
      <CourseMetadataForm
        action={createCourseAction}
        submitLabel="Create course"
        showWeeksInput
      />
    </div>
  );
}
