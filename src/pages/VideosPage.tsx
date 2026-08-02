import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2, Video as VideoIcon } from "lucide-react";
import type { Video, VideoFormValues } from "../types";
import { createVideo, deleteVideo, listVideos, updateVideo } from "../api/videos";
import { RequestError } from "../api/client";
import VideoForm from "../components/VideoForm";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";

type Dialog =
  | { kind: "none" }
  | { kind: "create" }
  | { kind: "edit"; video: Video }
  | { kind: "delete"; video: Video };

type Props = {
  autoOpenCreate?: boolean;
  onAutoOpenHandled?: () => void;
};

export default function VideosPage({ autoOpenCreate, onAutoOpenHandled }: Props) {
  const [videos, setVideos] = useState<Video[]>([]);
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
      setVideos(await listVideos());
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load videos");
    } finally {
      setLoading(false);
    }
  }

  function closeDialog() {
    setDialog({ kind: "none" });
    setFormErrors(undefined);
  }

  async function handleCreate(values: VideoFormValues) {
    setSubmitting(true);
    setFormErrors(undefined);
    try {
      await createVideo(values);
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

  async function handleUpdate(id: number, values: VideoFormValues) {
    setSubmitting(true);
    setFormErrors(undefined);
    try {
      await updateVideo(id, values);
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

  async function handleDelete(video: Video) {
    setSubmitting(true);
    setActionError(null);
    try {
      await deleteVideo(video.id);
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
          <h1>Videos</h1>
          <p className="page-subtitle">Free videos shown on the Resources page, linked from YouTube.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setDialog({ kind: "create" })}>
          <Plus size={16} />
          New video
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
              {videos.length === 0 && (
                <tr>
                  <td colSpan={4}>
                    <div className="empty-state">
                      <VideoIcon size={28} strokeWidth={1.5} />
                      <p>No videos yet</p>
                      <span>Add a YouTube link to publish a free video resource.</span>
                    </div>
                  </td>
                </tr>
              )}
              {videos.map((video) => (
                <tr key={video.id}>
                  <td className="cell-title" data-label="Title">{video.title}</td>
                  <td data-label="Category">
                    <span className="badge">{video.category}</span>
                  </td>
                  <td data-label="Date">{video.date}</td>
                  <td className="row-actions">
                    <button className="icon-btn" title="Edit" onClick={() => setDialog({ kind: "edit", video })}>
                      <Pencil size={15} />
                    </button>
                    <button
                      className="icon-btn icon-btn-danger"
                      title="Delete"
                      onClick={() => setDialog({ kind: "delete", video })}
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
        <Modal title="Publish a new video" subtitle="Link a video from the Unnat Classes YouTube channel." onClose={closeDialog}>
          <VideoForm submitting={submitting} errors={formErrors} onSubmit={handleCreate} onCancel={closeDialog} />
        </Modal>
      )}

      {dialog.kind === "edit" && (
        <Modal title="Edit video" subtitle={dialog.video.title} onClose={closeDialog}>
          <VideoForm
            initial={dialog.video}
            submitting={submitting}
            errors={formErrors}
            onSubmit={(values) => handleUpdate(dialog.video.id, values)}
            onCancel={closeDialog}
          />
        </Modal>
      )}

      {dialog.kind === "delete" && (
        <ConfirmDialog
          title="Delete video"
          message={`Delete "${dialog.video.title}"? This cannot be undone.`}
          busy={submitting}
          onConfirm={() => handleDelete(dialog.video)}
          onCancel={closeDialog}
        />
      )}
    </section>
  );
}
