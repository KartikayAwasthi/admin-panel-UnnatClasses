import { useState, type FormEvent } from "react";
import { login } from "../api/auth";
import { setToken } from "../auth/session";
import { RequestError } from "../api/client";

type Props = {
  onLoggedIn: () => void;
};

export default function LoginPage({ onLoggedIn }: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const { token } = await login(username, password);
      setToken(token);
      onLoggedIn();
    } catch (err) {
      setError(err instanceof RequestError ? err.message : "Failed to log in");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-brand">
          <img src="/images/logo.png" alt="Unnat Classes logo" className="login-logo" />
          <div>
            <div className="login-brand-name">
              UNNAT <span className="accent">CLASSES</span>
            </div>
            <div className="login-brand-sub">Admin Panel</div>
          </div>
        </div>

        <div className="field">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
            required
          />
        </div>

        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && <p className="banner banner-error">{error}</p>}

        <button type="submit" className="btn btn-primary login-submit" disabled={submitting}>
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
