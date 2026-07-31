import { useEffect, useState } from "react";
import { FilePlus2, FileText, Pencil, Trash2 } from "lucide-react";
import type { Note, NoteFormValues } from "../types";
import { createNote, deleteNote, listNotes, updateNote } from "../api/notes";
import { RequestError, fileUrl } from "../api/client";
import NoteForm from "../components/NoteForm";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";

type Dialog = { kind: "none" } | { kind: "create" } | { kind: "edit"; note: Note } | { kind: "delete"; note: Note };

type Props = {
  autoOpenCreate?: boolean;
  onAutoOpenHandled?: () => void;
};

export default function NotesPage({ autoOpenCreate, onAutoOpenHandled }: Props) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [dialog, setDialog] = useState<Dialog>({ kind: "none" });
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string> | undefined>();
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    if (autoOpenCreate) {
      setDialog({ kind: "create" });
      onAutoOpenHandled?.();
    }
  }, [autoOpenCreate]);

  async function refresh() {
    setLoading(true);
    setLoadError(null);
    try {
      setNotes(await listNotes());
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load notes");
    } finally {
      setLoading(false);
    }
  }

  function closeDialog() {
    setDialog({ kind: "none" });
    setFormErrors(undefined);
  }

  async function handleCreate(values: NoteFormValues, file: File | null) {
    if (!file) {
      setFormErrors({ file: "A file is required" });
      return;
    }
    setSubmitting(true);
    setFormErrors(undefined);
    try {
      await createNote(values, file);
      closeDialog();
      await refresh();
    } catch (err) {
      if (err instanceof RequestError && err.fieldErrors) {
        setFormErrors(err.fieldErrors);
      } else {
        setActionError(err instanceof Error ? err.message : "Failed to create note");
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdate(id: number, values: NoteFormValues, file: File | null) {
    setSubmitting(true);
    setFormErrors(undefined);
    try {
      await updateNote(id, values, file);
      closeDialog();
      await refresh();
    } catch (err) {
      if (err instanceof RequestError && err.fieldErrors) {
        setFormErrors(err.fieldErrors);
      } else {
        setActionError(err instanceof Error ? err.message : "Failed to update note");
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(note: Note) {
    setSubmitting(true);
    setActionError(null);
    try {
      await deleteNote(note.id);
      closeDialog();
      await refresh();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to delete note");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section>
      <header className="page-header">
        <div>
          <h1>Notes</h1>
          <p className="page-subtitle">PDF and DOC study material available to students on the Resources page.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setDialog({ kind: "create" })}>
          <FilePlus2 size={16} />
          Upload note
        </button>
      </header>

      {actionError && <p className="banner banner-error">{actionError}</p>}

      {loading && <p className="state-message">Loading notes…</p>}
      {loadError && <p className="banner banner-error">{loadError}</p>}

      {!loading && !loadError && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Subject</th>
                <th>Class</th>
                <th>File</th>
                <th>Uploaded</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {notes.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <div className="empty-state">
                      <FileText size={28} strokeWidth={1.5} />
                      <p>No notes yet</p>
                      <span>Upload your first PDF or DOC to make it available to students.</span>
                    </div>
                  </td>
                </tr>
              )}
              {notes.map((note) => (
                <tr key={note.id}>
                  <td className="cell-title" data-label="Title">{note.title}</td>
                  <td data-label="Subject">{note.subject}</td>
                  <td data-label="Class">{note.classRange}</td>
                  <td data-label="File">
                    <a className="badge badge-link" href={fileUrl(note.fileUrl)} target="_blank" rel="noreferrer">
                      {note.fileType} · {note.fileSize}
                    </a>
                  </td>
                  <td data-label="Uploaded">{note.uploadedAt}</td>
                  <td className="row-actions">
                    <button
                      className="icon-btn"
                      title="Edit"
                      onClick={() => setDialog({ kind: "edit", note })}
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      className="icon-btn icon-btn-danger"
                      title="Delete"
                      onClick={() => setDialog({ kind: "delete", note })}
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {dialog.kind === "create" && (
        <Modal title="Upload a new note" subtitle="Add a PDF or DOC resource for students." onClose={closeDialog}>
          <NoteForm submitting={submitting} errors={formErrors} onSubmit={handleCreate} onCancel={closeDialog} />
        </Modal>
      )}

      {dialog.kind === "edit" && (
        <Modal title="Edit note" subtitle={dialog.note.title} onClose={closeDialog}>
          <NoteForm
            initial={dialog.note}
            submitting={submitting}
            errors={formErrors}
            onSubmit={(values, file) => handleUpdate(dialog.note.id, values, file)}
            onCancel={closeDialog}
          />
        </Modal>
      )}

      {dialog.kind === "delete" && (
        <ConfirmDialog
          title="Delete note"
          message={`Delete "${dialog.note.title}"? This will remove the file and cannot be undone.`}
          busy={submitting}
          onConfirm={() => handleDelete(dialog.note)}
          onCancel={closeDialog}
        />
      )}
    </section>
  );
}
