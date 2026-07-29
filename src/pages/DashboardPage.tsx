import { useEffect, useState } from "react";
import {
  BookOpenCheck,
  FilePlus2,
  Megaphone,
  Newspaper,
  Plus,
  ArrowUpRight,
} from "lucide-react";
import type { Note, CurrentAffair, Post } from "../types";
import { listNotes } from "../api/notes";
import { listCurrentAffairs } from "../api/currentAffairs";
import { listPosts } from "../api/posts";
import { fileUrl } from "../api/client";
import { LIVE_SITE_URL } from "../constants";

type ResourceTab = "notes" | "current-affairs" | "posts";

type Props = {
  onNavigate: (tab: ResourceTab, openCreate?: boolean) => void;
};

type ActivityItem = {
  id: string;
  type: ResourceTab;
  title: string;
  meta: string;
  date: string;
  href: string;
};

function toActivity(notes: Note[], currentAffairs: CurrentAffair[], posts: Post[]): ActivityItem[] {
  const items: ActivityItem[] = [
    ...notes.map((n) => ({
      id: `note-${n.id}`,
      type: "notes" as const,
      title: n.title,
      meta: n.subject,
      date: n.uploadedAt,
      href: fileUrl(n.fileUrl),
    })),
    ...currentAffairs.map((c) => ({
      id: `ca-${c.id}`,
      type: "current-affairs" as const,
      title: c.title,
      meta: c.category,
      date: c.date,
      href: `${LIVE_SITE_URL}/resources/current-affairs/${c.slug}`,
    })),
    ...posts.map((p) => ({
      id: `post-${p.id}`,
      type: "posts" as const,
      title: p.title,
      meta: p.tag,
      date: p.date,
      href: `${LIVE_SITE_URL}/resources/posts/${p.slug}`,
    })),
  ];
  return items.sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 8);
}

const TYPE_META: Record<ResourceTab, { label: string; icon: typeof BookOpenCheck }> = {
  notes: { label: "Note", icon: BookOpenCheck },
  "current-affairs": { label: "Current Affairs", icon: Newspaper },
  posts: { label: "Post", icon: Megaphone },
};

export default function DashboardPage({ onNavigate }: Props) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentAffairs, setCurrentAffairs] = useState<CurrentAffair[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    Promise.all([listNotes(), listCurrentAffairs(), listPosts()])
      .then(([n, c, p]) => {
        if (cancelled) return;
        setNotes(n);
        setCurrentAffairs(c);
        setPosts(p);
      })
      .catch((err) => {
        if (cancelled) return;
        setLoadError(err instanceof Error ? err.message : "Failed to load dashboard data");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const totalResources = notes.length + currentAffairs.length + posts.length;
  const activity = toActivity(notes, currentAffairs, posts);

  return (
    <section>
      <header className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="page-subtitle">Overview of everything published on the Unnat Classes Resources page.</p>
        </div>
      </header>

      {loadError && <p className="banner banner-error">{loadError}</p>}

      {loading ? (
        <p className="state-message">Loading dashboard…</p>
      ) : (
        <>
          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-icon stat-icon-notes">
                <BookOpenCheck size={18} />
              </div>
              <div>
                <div className="stat-value">{notes.length}</div>
                <div className="stat-label">Notes</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon stat-icon-ca">
                <Newspaper size={18} />
              </div>
              <div>
                <div className="stat-value">{currentAffairs.length}</div>
                <div className="stat-label">Current Affairs</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon stat-icon-posts">
                <Megaphone size={18} />
              </div>
              <div>
                <div className="stat-value">{posts.length}</div>
                <div className="stat-label">Posts</div>
              </div>
            </div>
            <div className="stat-card stat-card-total">
              <div>
                <div className="stat-value">{totalResources}</div>
                <div className="stat-label">Total resources live on site</div>
              </div>
            </div>
          </div>

          <div className="dashboard-grid">
            <div className="card">
              <h2>Quick actions</h2>
              <div className="quick-actions">
                <button className="quick-action" onClick={() => onNavigate("notes", true)}>
                  <FilePlus2 size={18} />
                  <span>Upload note</span>
                </button>
                <button className="quick-action" onClick={() => onNavigate("current-affairs", true)}>
                  <Plus size={18} />
                  <span>New current affairs entry</span>
                </button>
                <button className="quick-action" onClick={() => onNavigate("posts", true)}>
                  <Plus size={18} />
                  <span>New post</span>
                </button>
              </div>
            </div>

            <div className="card">
              <h2>Recent activity</h2>
              {activity.length === 0 ? (
                <p className="page-subtitle">Nothing published yet — use a quick action to get started.</p>
              ) : (
                <ul className="activity-list">
                  {activity.map((item) => {
                    const meta = TYPE_META[item.type];
                    const Icon = meta.icon;
                    return (
                      <li key={item.id} className="activity-item">
                        <span className={`activity-icon activity-icon-${item.type}`}>
                          <Icon size={15} />
                        </span>
                        <div className="activity-body">
                          <div className="activity-title">{item.title}</div>
                          <div className="activity-meta">
                            {meta.label} · {item.meta} · {item.date}
                          </div>
                        </div>
                        <a href={item.href} target="_blank" rel="noreferrer" className="activity-link" title="View">
                          <ArrowUpRight size={15} />
                        </a>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
