import { useState, type FormEvent } from "react";
import type { Note, NoteFormValues } from "../types";

type Props = {
  initial?: Note;
  submitting: boolean;
  errors?: Record<string, string>;
  onSubmit: (values: NoteFormValues, file: File | null) => void;
  onCancel: () => void;
};

const emptyValues: NoteFormValues = {
  title: "",
  subject: "",
  classRange: "",
  description: "",
  published: true,
};

export default function NoteForm({ initial, submitting, errors, onSubmit, onCancel }: Props) {
  const [values, setValues] = useState<NoteFormValues>(
    initial
      ? {
          title: initial.title,
          subject: initial.subject,
          classRange: initial.classRange,
          description: initial.description,
          published: initial.published,
        }
      : emptyValues
  );
  const [file, setFile] = useState<File | null>(null);

  function update<K extends keyof NoteFormValues>(key: K, value: NoteFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSubmit(values, file);
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="title">Title</label>
        <input
          id="title"
          value={values.title}
          onChange={(e) => update("title", e.target.value)}
          required
        />
        {errors?.title && <span className="field-error">{errors.title}</span>}
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="subject">Subject</label>
          <input
            id="subject"
            value={values.subject}
            onChange={(e) => update("subject", e.target.value)}
            placeholder="e.g. History"
            required
          />
          {errors?.subject && <span className="field-error">{errors.subject}</span>}
        </div>
        <div className="field">
          <label htmlFor="classRange">Class range</label>
          <input
            id="classRange"
            value={values.classRange}
            onChange={(e) => update("classRange", e.target.value)}
            placeholder="e.g. Class 11–12"
            required
          />
          {errors?.classRange && <span className="field-error">{errors.classRange}</span>}
        </div>
      </div>

      <div className="field">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          rows={3}
          value={values.description}
          onChange={(e) => update("description", e.target.value)}
          required
        />
        {errors?.description && <span className="field-error">{errors.description}</span>}
      </div>

      <div className="field">
        <label htmlFor="file">
          {initial ? "Replace file (optional)" : "File"}
        </label>
        <input
          id="file"
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          required={!initial}
        />
        {initial && (
          <span className="hint">
            Current file: {initial.fileType} ({initial.fileSize})
          </span>
        )}
        {errors?.file && <span className="field-error">{errors.file}</span>}
      </div>

      <div className="field field-checkbox">
        <label htmlFor="published">
          <input
            id="published"
            type="checkbox"
            checked={values.published}
            onChange={(e) => update("published", e.target.checked)}
          />
          Published (visible on the site)
        </label>
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={submitting}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? "Saving…" : initial ? "Save changes" : "Upload note"}
        </button>
      </div>
    </form>
  );
}
