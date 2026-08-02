import { useState, type FormEvent } from "react";
import type { Video, VideoFormValues } from "../types";

type Props = {
  initial?: Video;
  submitting: boolean;
  errors?: Record<string, string>;
  onSubmit: (values: VideoFormValues) => void;
  onCancel: () => void;
};

function emptyValues(): VideoFormValues {
  return {
    title: "",
    youtubeUrl: "",
    category: "",
    description: "",
    date: new Date().toISOString().slice(0, 10),
    published: true,
  };
}

export default function VideoForm({ initial, submitting, errors, onSubmit, onCancel }: Props) {
  const [values, setValues] = useState<VideoFormValues>(
    initial
      ? {
          title: initial.title,
          youtubeUrl: initial.youtubeUrl,
          category: initial.category,
          description: initial.description,
          date: initial.date,
          published: initial.published,
        }
      : emptyValues()
  );

  function update<K extends keyof VideoFormValues>(key: K, value: VideoFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSubmit(values);
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="v-title">Title</label>
        <input id="v-title" value={values.title} onChange={(e) => update("title", e.target.value)} required />
        {errors?.title && <span className="field-error">{errors.title}</span>}
      </div>

      <div className="field">
        <label htmlFor="v-url">YouTube URL</label>
        <input
          id="v-url"
          value={values.youtubeUrl}
          onChange={(e) => update("youtubeUrl", e.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
          required
        />
        <span className="hint">Paste the full YouTube video link — a watch, youtu.be, or shorts URL.</span>
        {errors?.youtubeUrl && <span className="field-error">{errors.youtubeUrl}</span>}
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="v-category">Category</label>
          <input
            id="v-category"
            value={values.category}
            onChange={(e) => update("category", e.target.value)}
            placeholder="e.g. Geography"
            required
          />
          {errors?.category && <span className="field-error">{errors.category}</span>}
        </div>
        <div className="field">
          <label htmlFor="v-date">Date</label>
          <input
            id="v-date"
            type="date"
            value={values.date}
            onChange={(e) => update("date", e.target.value)}
            required
          />
          {errors?.date && <span className="field-error">{errors.date}</span>}
        </div>
      </div>

      <div className="field">
        <label htmlFor="v-description">Description</label>
        <textarea
          id="v-description"
          rows={3}
          value={values.description}
          onChange={(e) => update("description", e.target.value)}
          required
        />
        {errors?.description && <span className="field-error">{errors.description}</span>}
      </div>

      <div className="field field-checkbox">
        <label htmlFor="v-published">
          <input
            id="v-published"
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
          {submitting ? "Saving…" : initial ? "Save changes" : "Publish"}
        </button>
      </div>
    </form>
  );
}
