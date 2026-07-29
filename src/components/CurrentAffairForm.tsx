import { useState, type FormEvent } from "react";
import type { CurrentAffair, CurrentAffairFormValues } from "../types";
import { paragraphsToContent } from "../utils/content";
import { uploadImage } from "../api/client";
import MarkdownEditor from "./MarkdownEditor";

type Props = {
  initial?: CurrentAffair;
  submitting: boolean;
  errors?: Record<string, string>;
  onSubmit: (values: CurrentAffairFormValues) => void;
  onCancel: () => void;
};

function emptyValues(): CurrentAffairFormValues {
  return {
    title: "",
    date: new Date().toISOString().slice(0, 10),
    category: "",
    summary: "",
    content: "",
    coverImageUrl: null,
    published: true,
  };
}

export default function CurrentAffairForm({ initial, submitting, errors, onSubmit, onCancel }: Props) {
  const [values, setValues] = useState<CurrentAffairFormValues>(
    initial
      ? {
          title: initial.title,
          date: initial.date,
          category: initial.category,
          summary: initial.summary,
          content: paragraphsToContent(initial.content),
          coverImageUrl: initial.coverImageUrl,
          published: initial.published,
        }
      : emptyValues()
  );
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  function update<K extends keyof CurrentAffairFormValues>(key: K, value: CurrentAffairFormValues[K]) {
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
        <label htmlFor="ca-title">Title</label>
        <input id="ca-title" value={values.title} onChange={(e) => update("title", e.target.value)} required />
        {errors?.title && <span className="field-error">{errors.title}</span>}
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="ca-date">Date</label>
          <input
            id="ca-date"
            type="date"
            value={values.date}
            onChange={(e) => update("date", e.target.value)}
            required
          />
          {errors?.date && <span className="field-error">{errors.date}</span>}
        </div>
        <div className="field">
          <label htmlFor="ca-category">Category</label>
          <input
            id="ca-category"
            value={values.category}
            onChange={(e) => update("category", e.target.value)}
            placeholder="e.g. Economy"
            required
          />
          {errors?.category && <span className="field-error">{errors.category}</span>}
        </div>
      </div>

      <div className="field">
        <label htmlFor="ca-summary">Summary</label>
        <textarea
          id="ca-summary"
          rows={2}
          value={values.summary}
          onChange={(e) => update("summary", e.target.value)}
          required
        />
        {errors?.summary && <span className="field-error">{errors.summary}</span>}
      </div>

      <div className="field">
        <label htmlFor="ca-content">Content</label>
        <MarkdownEditor
          id="ca-content"
          rows={8}
          value={values.content}
          onChange={(v) => update("content", v)}
          placeholder="Separate paragraphs with a blank line."
        />
        <span className="hint">
          Separate paragraphs with a blank line — each becomes one paragraph on the site. Supports
          Markdown formatting and inline images.
        </span>
        {errors?.content && <span className="field-error">{errors.content}</span>}
      </div>

      <div className="field">
        <label htmlFor="ca-cover">Cover image (optional)</label>
        <input
          id="ca-cover"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
          onChange={(e) => setCoverImageFile(e.target.files?.[0] ?? null)}
        />
        {!coverImageFile && values.coverImageUrl && (
          <span className="hint">Current image is set. Choose a file to replace it.</span>
        )}
        {uploadError && <span className="field-error">{uploadError}</span>}
        {errors?.coverImageUrl && <span className="field-error">{errors.coverImageUrl}</span>}
      </div>

      <div className="field field-checkbox">
        <label htmlFor="ca-published">
          <input
            id="ca-published"
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
