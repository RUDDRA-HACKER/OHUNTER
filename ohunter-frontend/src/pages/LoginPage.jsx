import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../api";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await loginUser(form);
      login(data);
      navigate(data.role === "EMPLOYER" ? "/employer/dashboard" : "/jobs", { replace: true });
    } catch (err) {
      setError(err?.message || err?.error || "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-screen">
      <section className="auth-card card">
        <span className="auth-logo">OHunter</span>
        <h1>Sign in</h1>
        <p>Continue to your workspace.</p>

        <form className="stack" onSubmit={handleSubmit} style={{ marginTop: 24 }}>
          <input
            className="input-field"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            required
          />
          <input
            className="input-field"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            required
          />
          <button className="btn-primary auth-button" disabled={loading} type="submit">
            {loading ? "Signing in..." : "Login"}
          </button>
          {error && <p className="form-message error">{error}</p>}
        </form>

        <p className="auth-footer">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </section>
    </main>
  );
}
