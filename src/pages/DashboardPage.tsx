import { useEffect, useState } from "react";
import {
  BookOpenCheck,
  FilePlus2,
  GraduationCap,
  Images,
  Megaphone,
  Newspaper,
  Plus,
  ArrowUpRight,
  Video as VideoIcon,
} from "lucide-react";
import type { Note, CurrentAffair, DailyCurrentAffair, Exam, Post, Video } from "../types";
import { listNotes } from "../api/notes";
import { listCurrentAffairs } from "../api/currentAffairs";
import { listDailyCurrentAffairs } from "../api/dailyCurrentAffairs";
import { listExams } from "../api/exams";
import { listPosts } from "../api/posts";
import { listVideos } from "../api/videos";
import { fileUrl } from "../api/client";
import { LIVE_SITE_URL } from "../constants";

type ResourceTab = "notes" | "current-affairs" | "daily-current-affairs" | "exams" | "posts" | "videos";

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

function toActivity(
  notes: Note[],
  currentAffairs: CurrentAffair[],
  dailyCurrentAffairs: DailyCurrentAffair[],
  exams: Exam[],
  posts: Post[],
  videos: Video[]
): ActivityItem[] {
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
    ...dailyCurrentAffairs.map((d) => ({
      id: `dca-${d.id}`,
      type: "daily-current-affairs" as const,
      title: d.caption || `${d.images.length} image${d.images.length === 1 ? "" : "s"}`,
      meta: `${d.images.length} image${d.images.length === 1 ? "" : "s"}`,
      date: d.date,
      href: `${LIVE_SITE_URL}/resources/daily-current-affairs/${d.slug}`,
    })),
    ...exams.map((e) => ({
      id: `exam-${e.id}`,
      type: "exams" as const,
      title: e.title,
      meta: e.category,
      date: e.examDate ?? "",
      href: `${LIVE_SITE_URL}/exams/${e.slug}`,
    })),
    ...posts.map((p) => ({
      id: `post-${p.id}`,
      type: "posts" as const,
      title: p.title,
      meta: p.tag,
      date: p.date,
      href: `${LIVE_SITE_URL}/resources/posts/${p.slug}`,
    })),
    ...videos.map((v) => ({
      id: `video-${v.id}`,
      type: "videos" as const,
      title: v.title,
      meta: v.category,
      date: v.date,
      href: `${LIVE_SITE_URL}/resources/videos/${v.slug}`,
    })),
  ];
  return items.sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 8);
}

const TYPE_META: Record<ResourceTab, { label: string; icon: typeof BookOpenCheck }> = {
  notes: { label: "Note", icon: BookOpenCheck },
  "current-affairs": { label: "Current Affairs", icon: Newspaper },
  "daily-current-affairs": { label: "Daily Current Affairs", icon: Images },
  exams: { label: "Exam", icon: GraduationCap },
  posts: { label: "Post", icon: Megaphone },
  videos: { label: "Video", icon: VideoIcon },
};

export default function DashboardPage({ onNavigate }: Props) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentAffairs, setCurrentAffairs] = useState<CurrentAffair[]>([]);
  const [dailyCurrentAffairs, setDailyCurrentAffairs] = useState<DailyCurrentAffair[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    Promise.all([
      listNotes(),
      listCurrentAffairs(),
      listDailyCurrentAffairs(),
      listExams(),
      listPosts(),
      listVideos(),
    ])
      .then(([n, c, d, e, p, v]) => {
        if (cancelled) return;
        setNotes(n);
        setCurrentAffairs(c);
        setDailyCurrentAffairs(d);
        setExams(e);
        setPosts(p);
        setVideos(v);
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

  const totalResources =
    notes.length + currentAffairs.length + dailyCurrentAffairs.length + exams.length + posts.length + videos.length;
  const activity = toActivity(notes, currentAffairs, dailyCurrentAffairs, exams, posts, videos);

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
              <div className="stat-icon stat-icon-ca">
                <Images size={18} />
              </div>
              <div>
                <div className="stat-value">{dailyCurrentAffairs.length}</div>
                <div className="stat-label">Daily Current Affairs</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon stat-icon-ca">
                <GraduationCap size={18} />
              </div>
              <div>
                <div className="stat-value">{exams.length}</div>
                <div className="stat-label">Exams</div>
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
            <div className="stat-card">
              <div className="stat-icon stat-icon-posts">
                <VideoIcon size={18} />
              </div>
              <div>
                <div className="stat-value">{videos.length}</div>
                <div className="stat-label">Videos</div>
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
                <button className="quick-action" onClick={() => onNavigate("daily-current-affairs", true)}>
                  <Plus size={18} />
                  <span>New daily current affairs post</span>
                </button>
                <button className="quick-action" onClick={() => onNavigate("exams", true)}>
                  <Plus size={18} />
                  <span>New exam notification</span>
                </button>
                <button className="quick-action" onClick={() => onNavigate("posts", true)}>
                  <Plus size={18} />
                  <span>New post</span>
                </button>
                <button className="quick-action" onClick={() => onNavigate("videos", true)}>
                  <Plus size={18} />
                  <span>New video</span>
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
