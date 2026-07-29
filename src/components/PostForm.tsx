import { useState, type FormEvent } from "react";
import type { Post, PostFormValues } from "../types";
import { paragraphsToContent } from "../utils/content";
import { uploadImage } from "../api/client";
import MarkdownEditor from "./MarkdownEditor";

type Props = {
  initial?: Post;
  submitting: boolean;
  errors?: Record<string, string>;
  onSubmit: (values: PostFormValues) => void;
  onCancel: () => void;
};

function emptyValues(): PostFormValues {
  return {
    title: "",
    date: new Date().toISOString().slice(0, 10),
    author: "",
    tag: "",
    excerpt: "",
    content: "",
    coverImageUrl: null,
    published: true,
  };
}

export default function PostForm({ initial, submitting, errors, onSubmit, onCancel }: Props) {
  const [values, setValues] = useState<PostFormValues>(
    initial
      ? {
          title: initial.title,
          date: initial.date,
          author: initial.author,
          tag: initial.tag,
          excerpt: initial.excerpt,
          content: paragraphsToContent(initial.content),
          coverImageUrl: initial.coverImageUrl,
          published: initial.published,
        }
      : emptyValues()
  );
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  function update<K extends keyof PostFormValues>(key: K, value: PostFormValues[K]) {
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
        <label htmlFor="p-title">Title</label>
        <input id="p-title" value={values.title} onChange={(e) => update("title", e.target.value)} required />
        {errors?.title && <span className="field-error">{errors.title}</span>}
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="p-date">Date</label>
          <input
            id="p-date"
            type="date"
            value={values.date}
            onChange={(e) => update("date", e.target.value)}
            required
          />
          {errors?.date && <span className="field-error">{errors.date}</span>}
        </div>
        <div className="field">
          <label htmlFor="p-author">Author</label>
          <input id="p-author" value={values.author} onChange={(e) => update("author", e.target.value)} required />
          {errors?.author && <span className="field-error">{errors.author}</span>}
        </div>
        <div className="field">
          <label htmlFor="p-tag">Tag</label>
          <input
            id="p-tag"
            value={values.tag}
            onChange={(e) => update("tag", e.target.value)}
            placeholder="e.g. Announcement"
            required
          />
          {errors?.tag && <span className="field-error">{errors.tag}</span>}
        </div>
      </div>

      <div className="field">
        <label htmlFor="p-excerpt">Excerpt</label>
        <textarea
          id="p-excerpt"
          rows={2}
          value={values.excerpt}
          onChange={(e) => update("excerpt", e.target.value)}
          required
        />
        {errors?.excerpt && <span className="field-error">{errors.excerpt}</span>}
      </div>

      <div className="field">
        <label htmlFor="p-content">Content</label>
        <MarkdownEditor
          id="p-content"
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
        <label htmlFor="p-cover">Cover image (optional)</label>
        <input
          id="p-cover"
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
        <label htmlFor="p-published">
          <input
            id="p-published"
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
