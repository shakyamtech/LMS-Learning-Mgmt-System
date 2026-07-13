"use client";

import { createCourse } from "@/app/actions/courses";
import { useActionState, useEffect, useRef } from "react";

interface Teacher {
  id: string;
  name: string | null;
  email: string | null;
}

interface CourseFormProps {
  teachers: Teacher[];
}

export default function CourseForm({ teachers }: CourseFormProps) {
  const [state, formAction, isPending] = useActionState(createCourse, null);
  const formRef = useRef<HTMLFormElement>(null);

  // Clear the form fields upon successful course creation
  useEffect(() => {
    if (state?.success && formRef.current) {
      formRef.current.reset();
    }
  }, [state]);

  return (
    <div className="card" style={{ height: "fit-content" }}>
      <h3 className="text-h3" style={{ margin: "0 0 1.5rem 0" }}>Create New Course</h3>
      
      <form ref={formRef} action={formAction}>
        {state?.error && (
          <div style={{
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            border: "1px solid var(--error)",
            color: "var(--error)",
            padding: "0.75rem 1rem",
            borderRadius: "var(--radius-md)",
            marginBottom: "1rem",
            fontSize: "0.85rem",
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}>
            <span>⚠️</span> {state.error}
          </div>
        )}

        {state?.success && (
          <div style={{
            backgroundColor: "rgba(34, 197, 94, 0.1)",
            border: "1px solid var(--success)",
            color: "var(--success)",
            padding: "0.75rem 1rem",
            borderRadius: "var(--radius-md)",
            marginBottom: "1rem",
            fontSize: "0.85rem",
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}>
            <span>✅</span> {state.message}
          </div>
        )}

        <div className="input-group">
          <label className="input-label" htmlFor="code">Course Code</label>
          <input
            className="input-field"
            type="text"
            id="code"
            name="code"
            placeholder="e.g. CS-201"
            required
            disabled={isPending}
          />
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="title">Course Title</label>
          <input
            className="input-field"
            type="text"
            id="title"
            name="title"
            placeholder="e.g. Advanced AI & ML"
            required
            disabled={isPending}
          />
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="description">Description</label>
          <textarea
            className="input-field"
            id="description"
            name="description"
            placeholder="Provide course learning outcomes..."
            required
            disabled={isPending}
            rows={3}
            style={{ fontFamily: "inherit", resize: "none" }}
          />
        </div>

        <div className="input-group" style={{ marginBottom: "1.75rem" }}>
          <label className="input-label" htmlFor="teacherId">Assign Instructor</label>
          <select
            className="input-field"
            id="teacherId"
            name="teacherId"
            required
            disabled={isPending}
            defaultValue=""
            style={{ cursor: "pointer" }}
          >
            <option value="" disabled>Choose a teacher...</option>
            {teachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.name || teacher.email?.split("@")[0]} ({teacher.email})
              </option>
            ))}
          </select>
        </div>

        <button
          className="btn btn-primary"
          type="submit"
          disabled={isPending || teachers.length === 0}
          style={{ width: "100%", padding: "0.75rem", fontSize: "0.9rem" }}
        >
          {isPending ? "Creating..." : "Create Course"}
        </button>

        {teachers.length === 0 && (
          <p style={{ margin: "0.5rem 0 0 0", fontSize: "0.75rem", color: "var(--error)", textAlign: "center" }}>
            * Register a Teacher account first to assign a course!
          </p>
        )}
      </form>
    </div>
  );
}
