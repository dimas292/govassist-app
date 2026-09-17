import { useState } from "react";
import { loginAdmin } from "../../services/api";

function BrandMark() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M12 1.5l3.4 7.1 7.1 3.4-7.1 3.4-3.4 7.1-3.4-7.1L1.5 12l7.1-3.4z" opacity=".45" />
      <path fill="currentColor" d="M12 1.5l3.4 7.1L12 12 8.6 8.6z" />
    </svg>
  );
}

export default function AdminLogin({ onAuthenticated }) {
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      onAuthenticated(await loginAdmin(credentials.username, credentials.password));
    } catch (loginError) {
      setError(loginError.message || "Login admin gagal.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth">
      <main className="auth__panel">
        <form className="auth__form w-full shadow-md rounded-lg border border-gray-200 bg-white sm:p-8" style={{ maxWidth: "36rem" }} onSubmit={handleSubmit} aria-labelledby="login-title">
          <div className="flex flex-col gap-2"> 
            <h1 className="text-3xl font-semibold">Masuk ke dashboard</h1>
          
          </div>
          {error && <div className="alert alert--danger" role="alert"><span>{error}</span></div>}
          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium">Username</span>
              <input className="input w-full" autoComplete="username" value={credentials.username} onChange={(event) => setCredentials((current) => ({ ...current, username: event.target.value }))} required autoFocus />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium">Password</span>
              <input className="input w-full" type="password" autoComplete="current-password" value={credentials.password} onChange={(event) => setCredentials((current) => ({ ...current, password: event.target.value }))} required />
            </label>
          </div>
          <button type="submit" className="button button--primary w-full" disabled={loading}>{loading ? "Memeriksa..." : "Masuk"}</button>
        </form>
      </main>
      <aside className="auth__aside">
        <span className="auth__brand">
          {/* <span className="auth__brand-mark"><BrandMark /></span> */}
          <span className="auth__brand-name">GovAssist</span>
        </span>
      </aside>
    </div>
  );
}
