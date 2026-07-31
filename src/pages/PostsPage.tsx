import { useEffect, useState } from "react";
import { Megaphone, Pencil, Plus, Trash2 } from "lucide-react";
import type { Post, PostFormValues } from "../types";
import { createPost, deletePost, listPosts, updatePost } from "../api/posts";
import { RequestError } from "../api/client";
import PostForm from "../components/PostForm";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";

type Dialog = { kind: "none" } | { kind: "create" } | { kind: "edit"; post: Post } | { kind: "delete"; post: Post };

type Props = {
  autoOpenCreate?: boolean;
  onAutoOpenHandled?: () => void;
};

export default function PostsPage({ autoOpenCreate, onAutoOpenHandled }: Props) {
  const [posts, setPosts] = useState<Post[]>([]);
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
      setPosts(await listPosts());
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load posts");
    } finally {
      setLoading(false);
    }
  }

  function closeDialog() {
    setDialog({ kind: "none" });
    setFormErrors(undefined);
  }

  async function handleCreate(values: PostFormValues) {
    setSubmitting(true);
    setFormErrors(undefined);
    try {
      await createPost(values);
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

  async function handleUpdate(id: number, values: PostFormValues) {
    setSubmitting(true);
    setFormErrors(undefined);
    try {
      await updatePost(id, values);
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

  async function handleDelete(post: Post) {
    setSubmitting(true);
    setActionError(null);
    try {
      await deletePost(post.id);
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
          <h1>Posts</h1>
          <p className="page-subtitle">Announcements and articles shown on the Resources page.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setDialog({ kind: "create" })}>
          <Plus size={16} />
          New post
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
                <th>Author</th>
                <th>Tag</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {posts.length === 0 && (
                <tr>
                  <td colSpan={5}>
                    <div className="empty-state">
                      <Megaphone size={28} strokeWidth={1.5} />
                      <p>No posts yet</p>
                      <span>Publish an announcement or article for your students and parents.</span>
                    </div>
                  </td>
                </tr>
              )}
              {posts.map((post) => (
                <tr key={post.id}>
                  <td className="cell-title" data-label="Title">{post.title}</td>
                  <td data-label="Author">{post.author}</td>
                  <td data-label="Tag">
                    <span className="badge">{post.tag}</span>
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
        <Modal title="Publish a new post" subtitle="Add an announcement or article." onClose={closeDialog}>
          <PostForm submitting={submitting} errors={formErrors} onSubmit={handleCreate} onCancel={closeDialog} />
        </Modal>
      )}

      {dialog.kind === "edit" && (
        <Modal title="Edit post" subtitle={dialog.post.title} onClose={closeDialog}>
          <PostForm
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
          title="Delete post"
          message={`Delete "${dialog.post.title}"? This cannot be undone.`}
          busy={submitting}
          onConfirm={() => handleDelete(dialog.post)}
          onCancel={closeDialog}
        />
      )}
    </section>
  );
}
