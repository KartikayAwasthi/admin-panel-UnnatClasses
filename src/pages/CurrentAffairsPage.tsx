import { useEffect, useState } from "react";
import { Newspaper, Pencil, Plus, Trash2 } from "lucide-react";
import type { CurrentAffair, CurrentAffairFormValues } from "../types";
import {
  createCurrentAffair,
  deleteCurrentAffair,
  listCurrentAffairs,
  updateCurrentAffair,
} from "../api/currentAffairs";
import { RequestError } from "../api/client";
import CurrentAffairForm from "../components/CurrentAffairForm";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";

type Dialog =
  | { kind: "none" }
  | { kind: "create" }
  | { kind: "edit"; item: CurrentAffair }
  | { kind: "delete"; item: CurrentAffair };

type Props = {
  autoOpenCreate?: boolean;
  onAutoOpenHandled?: () => void;
};

export default function CurrentAffairsPage({ autoOpenCreate, onAutoOpenHandled }: Props) {
  const [items, setItems] = useState<CurrentAffair[]>([]);
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
      setItems(await listCurrentAffairs());
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load current affairs");
    } finally {
      setLoading(false);
    }
  }

  function closeDialog() {
    setDialog({ kind: "none" });
    setFormErrors(undefined);
  }

  async function handleCreate(values: CurrentAffairFormValues) {
    setSubmitting(true);
    setFormErrors(undefined);
    try {
      await createCurrentAffair(values);
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

  async function handleUpdate(id: number, values: CurrentAffairFormValues) {
    setSubmitting(true);
    setFormErrors(undefined);
    try {
      await updateCurrentAffair(id, values);
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

  async function handleDelete(item: CurrentAffair) {
    setSubmitting(true);
    setActionError(null);
    try {
      await deleteCurrentAffair(item.id);
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
          <h1>Current Affairs</h1>
          <p className="page-subtitle">GS current affairs entries shown on the Resources page.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setDialog({ kind: "create" })}>
          <Plus size={16} />
          New entry
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
                <th>Title</th>
                <th>Category</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr>
                  <td colSpan={4}>
                    <div className="empty-state">
                      <Newspaper size={28} strokeWidth={1.5} />
                      <p>No entries yet</p>
                      <span>Publish your first current affairs entry for GS Classes students.</span>
                    </div>
                  </td>
                </tr>
              )}
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="cell-title" data-label="Title">{item.title}</td>
                  <td data-label="Category">
                    <span className="badge">{item.category}</span>
                  </td>
                  <td data-label="Date">{item.date}</td>
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
        <Modal title="Publish a new entry" subtitle="Add a current affairs entry for GS Classes." onClose={closeDialog}>
          <CurrentAffairForm
            submitting={submitting}
            errors={formErrors}
            onSubmit={handleCreate}
            onCancel={closeDialog}
          />
        </Modal>
      )}

      {dialog.kind === "edit" && (
        <Modal title="Edit entry" subtitle={dialog.item.title} onClose={closeDialog}>
          <CurrentAffairForm
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
          title="Delete entry"
          message={`Delete "${dialog.item.title}"? This cannot be undone.`}
          busy={submitting}
          onConfirm={() => handleDelete(dialog.item)}
          onCancel={closeDialog}
        />
      )}
    </section>
  );
}
