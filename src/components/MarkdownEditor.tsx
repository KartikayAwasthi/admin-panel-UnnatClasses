import { useMemo, useRef, useState } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { Bold, Italic, Heading2, List, ListOrdered, Link2, Quote, Image as ImageIcon } from "lucide-react";
import { uploadImage } from "../api/client";

type Props = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
};

type ToolbarAction = "bold" | "italic" | "heading" | "bullet" | "numbered" | "link" | "quote";

function applyLinePrefix(text: string, start: number, end: number, prefix: string) {
  const lineStart = text.lastIndexOf("\n", start - 1) + 1;
  const lineEndIdx = text.indexOf("\n", end);
  const lineEnd = lineEndIdx === -1 ? text.length : lineEndIdx;
  const block = text.slice(lineStart, lineEnd);
  const prefixed = block
    .split("\n")
    .map((line) => (line.startsWith(prefix) ? line : prefix + line))
    .join("\n");
  return {
    next: text.slice(0, lineStart) + prefixed + text.slice(lineEnd),
    selectionStart: lineStart,
    selectionEnd: lineStart + prefixed.length,
  };
}

function wrapSelection(text: string, start: number, end: number, before: string, after: string, placeholder: string) {
  const selected = text.slice(start, end) || placeholder;
  const next = text.slice(0, start) + before + selected + after + text.slice(end);
  return {
    next,
    selectionStart: start + before.length,
    selectionEnd: start + before.length + selected.length,
  };
}

// Without this, an image inserted right after existing text (e.g. a bullet
// list) with no blank line before it gets parsed as a lazy continuation of
// that block instead of its own image — it ends up invisibly buried inside
// the previous paragraph/list item instead of rendering as a picture.
function leadingBreak(before: string): string {
  if (before.length === 0) return "";
  if (/\n[ \t]*\n[ \t]*$/.test(before)) return "";
  return before.endsWith("\n") ? "\n" : "\n\n";
}

function trailingBreak(after: string): string {
  if (after.length === 0) return "";
  if (/^[ \t]*\n[ \t]*\n/.test(after)) return "";
  return after.startsWith("\n") ? "\n" : "\n\n";
}

export default function MarkdownEditor({ id, value, onChange, rows = 8, placeholder }: Props) {
  const [mode, setMode] = useState<"write" | "preview">("write");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  const html = useMemo(() => {
    const raw = marked.parse(value || "*Nothing to preview yet.*", { breaks: true, async: false }) as string;
    return DOMPurify.sanitize(raw);
  }, [value]);

  function runAction(action: ToolbarAction) {
    const el = textareaRef.current;
    if (!el) return;
    const { selectionStart: start, selectionEnd: end, value: text } = el;

    let result: { next: string; selectionStart: number; selectionEnd: number };
    switch (action) {
      case "bold":
        result = wrapSelection(text, start, end, "**", "**", "bold text");
        break;
      case "italic":
        result = wrapSelection(text, start, end, "_", "_", "italic text");
        break;
      case "link":
        result = wrapSelection(text, start, end, "[", "](https://)", "link text");
        break;
      case "heading":
        result = applyLinePrefix(text, start, end, "## ");
        break;
      case "bullet":
        result = applyLinePrefix(text, start, end, "- ");
        break;
      case "numbered":
        result = applyLinePrefix(text, start, end, "1. ");
        break;
      case "quote":
        result = applyLinePrefix(text, start, end, "> ");
        break;
    }

    onChange(result.next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(result.selectionStart, result.selectionEnd);
    });
  }

  async function handleImageSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const el = textareaRef.current;
    if (!el) return;

    setImageError(null);
    setUploadingImage(true);
    try {
      const url = await uploadImage(file);
      const { selectionStart: start, selectionEnd: end, value: text } = el;
      const before = text.slice(0, start);
      const after = text.slice(end);
      const lead = leadingBreak(before);
      const trail = trailingBreak(after);
      const image = `![${file.name}](${url})`;
      const next = before + lead + image + trail + after;
      onChange(next);
      requestAnimationFrame(() => {
        el.focus();
        const pos = (before + lead + image).length;
        el.setSelectionRange(pos, pos);
      });
    } catch (err) {
      setImageError(err instanceof Error ? err.message : "Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  }

  return (
    <div className="md-editor">
      <div className="md-toolbar">
        <div className="md-toolbar-buttons">
          <button type="button" title="Bold" onClick={() => runAction("bold")}>
            <Bold size={14} />
          </button>
          <button type="button" title="Italic" onClick={() => runAction("italic")}>
            <Italic size={14} />
          </button>
          <button type="button" title="Heading" onClick={() => runAction("heading")}>
            <Heading2 size={14} />
          </button>
          <button type="button" title="Bullet list" onClick={() => runAction("bullet")}>
            <List size={14} />
          </button>
          <button type="button" title="Numbered list" onClick={() => runAction("numbered")}>
            <ListOrdered size={14} />
          </button>
          <button type="button" title="Quote" onClick={() => runAction("quote")}>
            <Quote size={14} />
          </button>
          <button type="button" title="Link" onClick={() => runAction("link")}>
            <Link2 size={14} />
          </button>
          <button
            type="button"
            title="Insert image"
            disabled={uploadingImage}
            onClick={() => imageInputRef.current?.click()}
          >
            <ImageIcon size={14} />
          </button>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="md-image-input"
            onChange={handleImageSelected}
          />
        </div>
        <div className="md-toolbar-tabs">
          <button
            type="button"
            className={mode === "write" ? "active" : ""}
            onClick={() => setMode("write")}
          >
            Write
          </button>
          <button
            type="button"
            className={mode === "preview" ? "active" : ""}
            onClick={() => setMode("preview")}
          >
            Preview
          </button>
        </div>
      </div>

      {mode === "write" ? (
        <textarea
          id={id}
          ref={textareaRef}
          rows={rows}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="md-textarea"
          required
        />
      ) : (
        <div className="md-preview" dangerouslySetInnerHTML={{ __html: html }} />
      )}

      {uploadingImage && <span className="hint">Uploading image…</span>}
      {imageError && <span className="field-error">{imageError}</span>}
    </div>
  );
}
