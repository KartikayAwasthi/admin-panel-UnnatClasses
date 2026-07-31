import { useEffect, useState } from "react";
import {
  BookOpenCheck,
  Newspaper,
  Megaphone,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import DashboardPage from "./pages/DashboardPage";
import NotesPage from "./pages/NotesPage";
import CurrentAffairsPage from "./pages/CurrentAffairsPage";
import PostsPage from "./pages/PostsPage";
import LoginPage from "./pages/LoginPage";
import { LIVE_SITE_URL } from "./constants";
import { setOnUnauthorized } from "./api/client";
import { clearToken, getToken } from "./auth/session";

type ResourceTab = "notes" | "current-affairs" | "posts";
type Tab = "dashboard" | ResourceTab;

const RESOURCE_TABS: { key: ResourceTab; label: string; description: string; icon: typeof BookOpenCheck }[] = [
  { key: "notes", label: "Notes", description: "PDF & DOC study material", icon: BookOpenCheck },
  { key: "current-affairs", label: "Current Affairs", description: "GS current affairs entries", icon: Newspaper },
  { key: "posts", label: "Posts", description: "Announcements & articles", icon: Megaphone },
];

export default function App() {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [pendingCreateTab, setPendingCreateTab] = useState<ResourceTab | null>(null);
  const [authed, setAuthed] = useState<boolean>(() => !!getToken());
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setOnUnauthorized(() => {
      clearToken();
      setAuthed(false);
    });
  }, []);

  function handleNavigate(target: ResourceTab, openCreate?: boolean) {
    setTab(target);
    setPendingCreateTab(openCreate ? target : null);
  }

  function handleSelectTab(target: Tab) {
    setTab(target);
    setPendingCreateTab(null);
    setMenuOpen(false);
  }

  function handleLogout() {
    clearToken();
    setAuthed(false);
    setMenuOpen(false);
  }

  if (!authed) {
    return <LoginPage onLoggedIn={() => setAuthed(true)} />;
  }

  return (
    <div className="app">
      <aside className={`sidebar ${menuOpen ? "menu-open" : ""}`}>
        <div className="brand">
          <img src="/images/logo.png" alt="Unnat Classes logo" className="brand-logo" />
          <div>
            <div className="brand-name">
              UNNAT <span className="accent">CLASSES</span>
            </div>
            <div className="brand-sub">Admin Panel</div>
          </div>
          <button
            type="button"
            className="sidebar-toggle"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <div className="sidebar-menu">
          <nav>
            <button
              className={`nav-link ${tab === "dashboard" ? "active" : ""}`}
              onClick={() => handleSelectTab("dashboard")}
            >
              <LayoutDashboard size={17} className="nav-link-icon" />
              <span className="nav-link-text">
                <span className="nav-link-label">Dashboard</span>
                <span className="nav-link-desc">Overview & quick actions</span>
              </span>
            </button>
          </nav>

          <div className="nav-section-label">Resources</div>
          <nav>
            {RESOURCE_TABS.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.key}
                  className={`nav-link ${tab === t.key ? "active" : ""}`}
                  onClick={() => handleSelectTab(t.key)}
                >
                  <Icon size={17} className="nav-link-icon" />
                  <span className="nav-link-text">
                    <span className="nav-link-label">{t.label}</span>
                    <span className="nav-link-desc">{t.description}</span>
                  </span>
                </button>
              );
            })}
          </nav>

          <div className="sidebar-footer">
            <a href={LIVE_SITE_URL} target="_blank" rel="noreferrer" className="sidebar-footer-link">
              <ExternalLink size={14} />
              View live site
            </a>
            <button type="button" className="sidebar-footer-link sidebar-logout" onClick={handleLogout}>
              <LogOut size={14} />
              Log out
            </button>
          </div>
        </div>
      </aside>
      {menuOpen && <div className="sidebar-scrim" onClick={() => setMenuOpen(false)} />}
      <main className="content">
        {tab === "dashboard" && <DashboardPage onNavigate={handleNavigate} />}
        {tab === "notes" && (
          <NotesPage
            autoOpenCreate={pendingCreateTab === "notes"}
            onAutoOpenHandled={() => setPendingCreateTab(null)}
          />
        )}
        {tab === "current-affairs" && (
          <CurrentAffairsPage
            autoOpenCreate={pendingCreateTab === "current-affairs"}
            onAutoOpenHandled={() => setPendingCreateTab(null)}
          />
        )}
        {tab === "posts" && (
          <PostsPage
            autoOpenCreate={pendingCreateTab === "posts"}
            onAutoOpenHandled={() => setPendingCreateTab(null)}
          />
        )}
      </main>
    </div>
  );
}
