import { useState, type FormEvent } from "react";
import type { InstagramPost, InstagramPostFormValues } from "../types";
import { uploadImage } from "../api/client";

type Props = {
  initial?: InstagramPost;
  submitting: boolean;
  errors?: Record<string, string>;
  onSubmit: (values: InstagramPostFormValues) => void;
  onCancel: () => void;
};

function emptyValues(): InstagramPostFormValues {
  return {
    title: "",
    permalink: "",
    mediaType: "REEL",
    thumbnailUrl: null,
    caption: "",
    date: new Date().toISOString().slice(0, 10),
    published: true,
  };
}

function guessMediaType(url: string): "REEL" | "POST" {
  return /instagram\.com\/reel\//.test(url) ? "REEL" : "POST";
}

export default function InstagramPostForm({ initial, submitting, errors, onSubmit, onCancel }: Props) {
  const [values, setValues] = useState<InstagramPostFormValues>(
    initial
      ? {
          title: initial.title,
          permalink: initial.permalink,
          mediaType: initial.mediaType,
          thumbnailUrl: initial.thumbnailUrl,
          caption: initial.caption ?? "",
          date: initial.date,
          published: initial.published,
        }
      : emptyValues()
  );
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  function update<K extends keyof InstagramPostFormValues>(key: K, value: InstagramPostFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!thumbnailFile && !values.thumbnailUrl) {
      setUploadError("Add a thumbnail image.");
      return;
    }
    if (!thumbnailFile) {
      onSubmit(values);
      return;
    }
    setUploading(true);
    setUploadError(null);
    try {
      const thumbnailUrl = await uploadImage(thumbnailFile);
      onSubmit({ ...values, thumbnailUrl });
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
        <label htmlFor="ig-title">Title</label>
        <input
          id="ig-title"
          value={values.title}
          onChange={(e) => update("title", e.target.value)}
          placeholder="e.g. Republic Day celebration reel"
          required
        />
        {errors?.title && <span className="field-error">{errors.title}</span>}
      </div>

      <div className="field">
        <label htmlFor="ig-permalink">Instagram URL</label>
        <input
          id="ig-permalink"
          value={values.permalink}
          onChange={(e) => {
            const url = e.target.value;
            update("permalink", url);
            if (url) update("mediaType", guessMediaType(url));
          }}
          placeholder="https://www.instagram.com/reel/..."
          required
        />
        <span className="hint">Paste the Reel or Post link from Instagram.</span>
        {errors?.permalink && <span className="field-error">{errors.permalink}</span>}
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="ig-media-type">Type</label>
          <select
            id="ig-media-type"
            value={values.mediaType}
            onChange={(e) => update("mediaType", e.target.value as "REEL" | "POST")}
          >
            <option value="REEL">Reel</option>
            <option value="POST">Post</option>
          </select>
          {errors?.mediaType && <span className="field-error">{errors.mediaType}</span>}
        </div>
        <div className="field">
          <label htmlFor="ig-date">Date</label>
          <input
            id="ig-date"
            type="date"
            value={values.date}
            onChange={(e) => update("date", e.target.value)}
            required
          />
          {errors?.date && <span className="field-error">{errors.date}</span>}
        </div>
      </div>

      <div className="field">
        <label htmlFor="ig-caption">Caption (optional)</label>
        <textarea
          id="ig-caption"
          rows={3}
          value={values.caption}
          onChange={(e) => update("caption", e.target.value)}
          placeholder="Copy the Instagram caption here so it shows on the site…"
        />
        {errors?.caption && <span className="field-error">{errors.caption}</span>}
      </div>

      <div className="field">
        <label htmlFor="ig-thumbnail">Thumbnail image</label>
        <input
          id="ig-thumbnail"
          type="file"
          accept="image/*"
          onChange={(e) => setThumbnailFile(e.target.files?.[0] ?? null)}
        />
        {!thumbnailFile && values.thumbnailUrl && (
          <span className="hint">Current thumbnail is set. Choose a file to replace it.</span>
        )}
        <span className="hint">A cover image for the reel/post — e.g. a screenshot from Instagram.</span>
        {uploadError && <span className="field-error">{uploadError}</span>}
        {errors?.thumbnailUrl && <span className="field-error">{errors.thumbnailUrl}</span>}
      </div>

      <div className="field field-checkbox">
        <label htmlFor="ig-published">
          <input
            id="ig-published"
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
