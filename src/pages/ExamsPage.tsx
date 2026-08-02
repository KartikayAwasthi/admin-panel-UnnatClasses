import { useEffect, useState } from "react";
import { GraduationCap, Pencil, Plus, Trash2 } from "lucide-react";
import type { Exam, ExamFormValues } from "../types";
import { createExam, deleteExam, listExams, updateExam } from "../api/exams";
import { RequestError } from "../api/client";
import ExamForm from "../components/ExamForm";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";

type Dialog =
  | { kind: "none" }
  | { kind: "create" }
  | { kind: "edit"; item: Exam }
  | { kind: "delete"; item: Exam };

type Props = {
  autoOpenCreate?: boolean;
  onAutoOpenHandled?: () => void;
};

export default function ExamsPage({ autoOpenCreate, onAutoOpenHandled }: Props) {
  const [items, setItems] = useState<Exam[]>([]);
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
      setItems(await listExams());
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load exams");
    } finally {
      setLoading(false);
    }
  }

  function closeDialog() {
    setDialog({ kind: "none" });
    setFormErrors(undefined);
  }

  async function handleCreate(values: ExamFormValues) {
    setSubmitting(true);
    setFormErrors(undefined);
    try {
      await createExam(values);
      closeDialog();
      await refresh();
    } catch (err) {
      if (err instanceof RequestError && err.fieldErrors) {
        setFormErrors(err.fieldErrors);
      } else {
        setActionError(err instanceof Error ? err.message : "Failed to publish");
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdate(id: number, values: ExamFormValues) {
    setSubmitting(true);
    setFormErrors(undefined);
    try {
      await updateExam(id, values);
      closeDialog();
      await refresh();
    } catch (err) {
      if (err instanceof RequestError && err.fieldErrors) {
        setFormErrors(err.fieldErrors);
      } else {
        setActionError(err instanceof Error ? err.message : "Failed to save");
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(item: Exam) {
    setSubmitting(true);
    setActionError(null);
    try {
      await deleteExam(item.id);
      closeDialog();
      await refresh();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section>
      <header className="page-header">
        <div>
          <h1>Exams</h1>
          <p className="page-subtitle">Competitive exam notifications shown on the Exams page.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setDialog({ kind: "create" })}>
          <Plus size={16} />
          New exam
        </button>
      </header>

      {actionError && <p className="banner banner-error">{actionError}</p>}

      {loading && <p className="state-message">Loading…</p>}
      {loadError && <p className="banner banner-error">{loadError}</p>}

      {!loading && !loadError && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Exam</th>
                <th>Category</th>
                <th>Exam date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr>
                  <td colSpan={4}>
                    <div className="empty-state">
                      <GraduationCap size={28} strokeWidth={1.5} />
                      <p>No exams yet</p>
                      <span>Publish your first exam notification for GS Classes students.</span>
                    </div>
                  </td>
                </tr>
              )}
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="cell-title" data-label="Exam">{item.title}</td>
                  <td data-label="Category">
                    <span className="badge">{item.category}</span>
                  </td>
                  <td data-label="Exam date">{item.examDate ?? <span className="hint">TBA</span>}</td>
                  <td className="row-actions">
                    <button className="icon-btn" title="Edit" onClick={() => setDialog({ kind: "edit", item })}>
                      <Pencil size={15} />
                    </button>
                    <button
                      className="icon-btn icon-btn-danger"
                      title="Delete"
                      onClick={() => setDialog({ kind: "delete", item })}
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
        <Modal title="Publish a new exam" subtitle="Add a competitive exam notification." onClose={closeDialog}>
          <ExamForm submitting={submitting} errors={formErrors} onSubmit={handleCreate} onCancel={closeDialog} />
        </Modal>
      )}

      {dialog.kind === "edit" && (
        <Modal title="Edit exam" subtitle={dialog.item.title} onClose={closeDialog}>
          <ExamForm
            initial={dialog.item}
            submitting={submitting}
            errors={formErrors}
            onSubmit={(values) => handleUpdate(dialog.item.id, values)}
            onCancel={closeDialog}
          />
        </Modal>
      )}

      {dialog.kind === "delete" && (
        <ConfirmDialog
          title="Delete exam"
          message={`Delete "${dialog.item.title}"? This cannot be undone.`}
          busy={submitting}
          onConfirm={() => handleDelete(dialog.item)}
          onCancel={closeDialog}
        />
      )}
    </section>
  );
}
