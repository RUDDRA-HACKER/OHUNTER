import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../api";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "", role: "JOBSEEKER" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await registerUser(form);
      setMessageType("success");
      setMessage("Account created successfully. Redirecting to login...");
      window.setTimeout(() => navigate("/login", { replace: true }), 900);
    } catch (err) {
      setMessageType("error");
      setMessage(err?.message || err?.error || "Unable to register.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-screen">
      <section className="auth-card card">
        <span className="auth-logo">OHunter</span>
        <h1>Create account</h1>
        <p>Join as a jobseeker or employer.</p>

        <form className="stack" onSubmit={handleSubmit} style={{ marginTop: 24 }}>
          <input
            className="input-field"
            type="text"
            placeholder="Username"
            value={form.username}
            onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
            required
          />
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
          <select
            className="input-field"
            value={form.role}
            onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))}
          >
            <option value="JOBSEEKER">JOBSEEKER</option>
            <option value="EMPLOYER">EMPLOYER</option>
          </select>
          <button className="btn-primary auth-button" disabled={loading} type="submit">
            {loading ? "Creating..." : "Register"}
          </button>
          {message && <p className={`form-message ${messageType}`}>{message}</p>}
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </section>
    </main>
  );
}
