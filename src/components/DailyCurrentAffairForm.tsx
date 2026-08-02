import { useState, type FormEvent } from "react";
import { ChevronDown, ChevronUp, ImagePlus, X } from "lucide-react";
import type { DailyCurrentAffair, DailyCurrentAffairFormValues } from "../types";
import { uploadImage } from "../api/client";

type Props = {
  initial?: DailyCurrentAffair;
  submitting: boolean;
  errors?: Record<string, string>;
  onSubmit: (values: DailyCurrentAffairFormValues) => void;
  onCancel: () => void;
};

type ImageItem = {
  id: string;
  previewUrl: string;
  file?: File;
  existingUrl?: string;
};

const MAX_IMAGES = 10;

function emptyValues(): { caption: string; date: string; published: boolean } {
  return {
    caption: "",
    date: new Date().toISOString().slice(0, 10),
    published: true,
  };
}

function newId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function DailyCurrentAffairForm({ initial, submitting, errors, onSubmit, onCancel }: Props) {
  const [fields, setFields] = useState(
    initial
      ? { caption: initial.caption ?? "", date: initial.date, published: initial.published }
      : emptyValues()
  );
  const [images, setImages] = useState<ImageItem[]>(
    initial ? initial.images.map((url) => ({ id: newId(), previewUrl: url, existingUrl: url })) : []
  );
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  function update<K extends keyof typeof fields>(key: K, value: (typeof fields)[K]) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  function addFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const remaining = MAX_IMAGES - images.length;
    if (remaining <= 0) {
      setUploadError(`You can add at most ${MAX_IMAGES} images.`);
      return;
    }
    const files = Array.from(fileList).slice(0, remaining);
    const items: ImageItem[] = files.map((file) => ({
      id: newId(),
      previewUrl: URL.createObjectURL(file),
      file,
    }));
    setImages((prev) => [...prev, ...items]);
    setUploadError(null);
  }

  function removeImage(id: string) {
    setImages((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item?.file) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((i) => i.id !== id);
    });
  }

  function moveImage(id: string, direction: -1 | 1) {
    setImages((prev) => {
      const index = prev.findIndex((i) => i.id === id);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (images.length === 0) {
      setUploadError("Add at least one image.");
      return;
    }
    setUploading(true);
    setUploadError(null);
    try {
      const urls = await Promise.all(
        images.map((item) => (item.file ? uploadImage(item.file) : Promise.resolve(item.existingUrl!)))
      );
      onSubmit({ ...fields, images: urls });
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Failed to upload images");
    } finally {
      setUploading(false);
    }
  }

  const busy = submitting || uploading;

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="dca-date">Date</label>
        <input
          id="dca-date"
          type="date"
          value={fields.date}
          onChange={(e) => update("date", e.target.value)}
          required
        />
        {errors?.date && <span className="field-error">{errors.date}</span>}
      </div>

      <div className="field">
        <label htmlFor="dca-caption">Caption (optional)</label>
        <textarea
          id="dca-caption"
          rows={3}
          value={fields.caption}
          onChange={(e) => update("caption", e.target.value)}
          placeholder="Add a short caption for this update…"
        />
        {errors?.caption && <span className="field-error">{errors.caption}</span>}
      </div>

      <div className="field">
        <label htmlFor="dca-images">Images ({images.length}/{MAX_IMAGES})</label>
        {images.length > 0 && (
          <div className="image-picker-grid">
            {images.map((item, i) => (
              <div key={item.id} className="image-picker-thumb">
                <img src={item.previewUrl} alt={`Image ${i + 1}`} />
                <div className="image-picker-thumb-actions">
                  <button
                    type="button"
                    className="icon-btn"
                    title="Move up"
                    disabled={i === 0}
                    onClick={() => moveImage(item.id, -1)}
                  >
                    <ChevronUp size={13} />
                  </button>
                  <button
                    type="button"
                    className="icon-btn"
                    title="Move down"
                    disabled={i === images.length - 1}
                    onClick={() => moveImage(item.id, 1)}
                  >
                    <ChevronDown size={13} />
                  </button>
                  <button
                    type="button"
                    className="icon-btn icon-btn-danger"
                    title="Remove"
                    onClick={() => removeImage(item.id)}
                  >
                    <X size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        {images.length < MAX_IMAGES && (
          <label htmlFor="dca-images" className="image-picker-add">
            <ImagePlus size={16} />
            Add images
          </label>
        )}
        <input
          id="dca-images"
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <span className="hint">Up to {MAX_IMAGES} images. Drag order with the arrows — first image is the cover.</span>
        {uploadError && <span className="field-error">{uploadError}</span>}
        {errors?.images && <span className="field-error">{errors.images}</span>}
      </div>

      <div className="field field-checkbox">
        <label htmlFor="dca-published">
          <input
            id="dca-published"
            type="checkbox"
            checked={fields.published}
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
          {uploading ? "Uploading images…" : submitting ? "Saving…" : initial ? "Save changes" : "Publish"}
        </button>
      </div>
    </form>
  );
}
