import { useState, type FormEvent } from "react";
import type { Exam, ExamFormValues } from "../types";
import { uploadImage } from "../api/client";
import MarkdownEditor from "./MarkdownEditor";

type Props = {
  initial?: Exam;
  submitting: boolean;
  errors?: Record<string, string>;
  onSubmit: (values: ExamFormValues) => void;
  onCancel: () => void;
};

function emptyValues(): ExamFormValues {
  return {
    title: "",
    category: "",
    examDate: "",
    summary: "",
    aboutExam: "",
    examPattern: "",
    syllabus: "",
    coverImageUrl: null,
    officialLink: "",
    published: true,
  };
}

export default function ExamForm({ initial, submitting, errors, onSubmit, onCancel }: Props) {
  const [values, setValues] = useState<ExamFormValues>(
    initial
      ? {
          title: initial.title,
          category: initial.category,
          examDate: initial.examDate ?? "",
          summary: initial.summary,
          aboutExam: initial.aboutExam,
          examPattern: initial.examPattern,
          syllabus: initial.syllabus,
          coverImageUrl: initial.coverImageUrl,
          officialLink: initial.officialLink ?? "",
          published: initial.published,
        }
      : emptyValues()
  );
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  function update<K extends keyof ExamFormValues>(key: K, value: ExamFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!coverImageFile) {
      onSubmit(values);
      return;
    }
    setUploading(true);
    setUploadError(null);
    try {
      const coverImageUrl = await uploadImage(coverImageFile);
      onSubmit({ ...values, coverImageUrl });
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Failed to upload image");
    } finally {
      setUploading(false);
    }
  }

  const busy = submitting || uploading;

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="exam-title">Exam name</label>
        <input
          id="exam-title"
          value={values.title}
          onChange={(e) => update("title", e.target.value)}
          placeholder="e.g. UPSC Civil Services Prelims 2027"
          required
        />
        {errors?.title && <span className="field-error">{errors.title}</span>}
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="exam-category">Category</label>
          <input
            id="exam-category"
            value={values.category}
            onChange={(e) => update("category", e.target.value)}
            placeholder="e.g. UPSC, SSC, Banking"
            required
          />
          {errors?.category && <span className="field-error">{errors.category}</span>}
        </div>
        <div className="field">
          <label htmlFor="exam-date">Exam date (optional)</label>
          <input
            id="exam-date"
            type="date"
            value={values.examDate}
            onChange={(e) => update("examDate", e.target.value)}
          />
          <span className="hint">Leave blank if the date isn&apos;t announced yet.</span>
          {errors?.examDate && <span className="field-error">{errors.examDate}</span>}
        </div>
      </div>

      <div className="field">
        <label htmlFor="exam-summary">Summary</label>
        <textarea
          id="exam-summary"
          rows={2}
          value={values.summary}
          onChange={(e) => update("summary", e.target.value)}
          placeholder="Short teaser shown on the exam card"
          required
        />
        {errors?.summary && <span className="field-error">{errors.summary}</span>}
      </div>

      <div className="field">
        <label htmlFor="exam-about">About the exam</label>
        <MarkdownEditor
          id="exam-about"
          rows={6}
          value={values.aboutExam}
          onChange={(v) => update("aboutExam", v)}
          placeholder="What the exam is, who conducts it, why it matters…"
        />
        {errors?.aboutExam && <span className="field-error">{errors.aboutExam}</span>}
      </div>

      <div className="field">
        <label htmlFor="exam-pattern">Exam pattern</label>
        <MarkdownEditor
          id="exam-pattern"
          rows={6}
          value={values.examPattern}
          onChange={(v) => update("examPattern", v)}
          placeholder="Stages, marking scheme, paper structure…"
        />
        {errors?.examPattern && <span className="field-error">{errors.examPattern}</span>}
      </div>

      <div className="field">
        <label htmlFor="exam-syllabus">Syllabus</label>
        <MarkdownEditor
          id="exam-syllabus"
          rows={6}
          value={values.syllabus}
          onChange={(v) => update("syllabus", v)}
          placeholder="Subjects and topics covered…"
        />
        {errors?.syllabus && <span className="field-error">{errors.syllabus}</span>}
      </div>

      <div className="field">
        <label htmlFor="exam-link">Official link (optional)</label>
        <input
          id="exam-link"
          type="url"
          value={values.officialLink}
          onChange={(e) => update("officialLink", e.target.value)}
          placeholder="https://…"
        />
        {errors?.officialLink && <span className="field-error">{errors.officialLink}</span>}
      </div>

      <div className="field">
        <label htmlFor="exam-cover">Poster image (optional)</label>
        <input
          id="exam-cover"
          type="file"
          accept="image/*"
          onChange={(e) => setCoverImageFile(e.target.files?.[0] ?? null)}
        />
        {!coverImageFile && values.coverImageUrl && (
          <span className="hint">Current image is set. Choose a file to replace it.</span>
        )}
        {uploadError && <span className="field-error">{uploadError}</span>}
        {errors?.coverImageUrl && <span className="field-error">{errors.coverImageUrl}</span>}
      </div>

      <div className="field field-checkbox">
        <label htmlFor="exam-published">
          <input
            id="exam-published"
            type="checkbox"
            checked={values.published}
            onChange={(e) => update("published", e.target.checked)}
          />
          Published (visible on the site)
        </label>
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={busy}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {uploading ? "Uploading image…" : submitting ? "Saving…" : initial ? "Save changes" : "Publish"}
        </button>
      </div>
    </form>
  );
}
