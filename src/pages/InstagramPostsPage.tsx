import { useEffect, useState } from "react";
import { Camera, Pencil, Plus, Trash2 } from "lucide-react";
import type { InstagramPost, InstagramPostFormValues } from "../types";
import {
  createInstagramPost,
  deleteInstagramPost,
  listInstagramPosts,
  updateInstagramPost,
} from "../api/instagramPosts";
import { RequestError } from "../api/client";
import InstagramPostForm from "../components/InstagramPostForm";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";

type Dialog =
  | { kind: "none" }
  | { kind: "create" }
  | { kind: "edit"; post: InstagramPost }
  | { kind: "delete"; post: InstagramPost };

type Props = {
  autoOpenCreate?: boolean;
  onAutoOpenHandled?: () => void;
};

export default function InstagramPostsPage({ autoOpenCreate, onAutoOpenHandled }: Props) {
  const [posts, setPosts] = useState<InstagramPost[]>([]);
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
      setPosts(await listInstagramPosts());
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load Instagram posts");
    } finally {
      setLoading(false);
    }
  }

  function closeDialog() {
    setDialog({ kind: "none" });
    setFormErrors(undefined);
  }

  async function handleCreate(values: InstagramPostFormValues) {
    setSubmitting(true);
    setFormErrors(undefined);
    try {
      await createInstagramPost(values);
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

  async function handleUpdate(id: number, values: InstagramPostFormValues) {
    setSubmitting(true);
    setFormErrors(undefined);
    try {
      await updateInstagramPost(id, values);
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

  async function handleDelete(post: InstagramPost) {
    setSubmitting(true);
    setActionError(null);
    try {
      await deleteInstagramPost(post.id);
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
          <h1>Instagram</h1>
          <p className="page-subtitle">Reels & posts shown on the Reels page, linked from Instagram.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setDialog({ kind: "create" })}>
          <Plus size={16} />
          New Instagram post
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
                <th>Type</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {posts.length === 0 && (
                <tr>
                  <td colSpan={4}>
                    <div className="empty-state">
                      <Camera size={28} strokeWidth={1.5} />
                      <p>No Instagram posts yet</p>
                      <span>Paste a Reel or Post link to publish it on the Reels page.</span>
                    </div>
                  </td>
                </tr>
              )}
              {posts.map((post) => (
                <tr key={post.id}>
                  <td className="cell-title" data-label="Title">{post.title}</td>
                  <td data-label="Type">
                    <span className="badge">{post.mediaType === "REEL" ? "Reel" : "Post"}</span>
                  </td>
                  <td data-label="Date">{post.date}</td>
                  <td className="row-actions">
                    <button className="icon-btn" title="Edit" onClick={() => setDialog({ kind: "edit", post })}>
                      <Pencil size={15} />
                    </button>
                    <button
                      className="icon-btn icon-btn-danger"
                      title="Delete"
                      onClick={() => setDialog({ kind: "delete", post })}
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
        <Modal title="Publish a new Instagram post" subtitle="Link a Reel or Post from the Unnat Classes Instagram." onClose={closeDialog}>
          <InstagramPostForm submitting={submitting} errors={formErrors} onSubmit={handleCreate} onCancel={closeDialog} />
        </Modal>
      )}

      {dialog.kind === "edit" && (
        <Modal title="Edit Instagram post" subtitle={dialog.post.title} onClose={closeDialog}>
          <InstagramPostForm
            initial={dialog.post}
            submitting={submitting}
            errors={formErrors}
            onSubmit={(values) => handleUpdate(dialog.post.id, values)}
            onCancel={closeDialog}
          />
        </Modal>
      )}

      {dialog.kind === "delete" && (
        <ConfirmDialog
          title="Delete Instagram post"
          message={`Delete "${dialog.post.title}"? This cannot be undone.`}
          busy={submitting}
          onConfirm={() => handleDelete(dialog.post)}
          onCancel={closeDialog}
        />
      )}
    </section>
  );
}
