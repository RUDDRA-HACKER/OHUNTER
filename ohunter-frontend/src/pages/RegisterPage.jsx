import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
import { registerUser } from "../api";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    city: "",
    skills: "",
    experienceYears: "0",
    role: "STUDENT_FRESHER",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const payload = {
        ...form,
        experienceYears: form.experienceYears === "" ? null : Number(form.experienceYears),
      };

      await registerUser(payload);
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

  function handleRoleChange(event) {
    const nextRole = event.target.value;
    setForm((current) => ({
      ...current,
      role: nextRole,
      experienceYears: nextRole === "STUDENT_FRESHER" ? "0" : current.experienceYears,
    }));
  }

  return (
    <main className="auth-screen">
      <section className="auth-card card">
        <span className="auth-logo">OHunter</span>
        <h1>Create account</h1>
        <p>Join as a student jobseeker or employer.</p>

        <form className="stack" onSubmit={handleSubmit} style={{ marginTop: 24 }}>
          <input
            className="input-field"
            type="text"
            placeholder="Full name"
            value={form.fullName}
            onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
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
          <p className="helper" style={{ marginTop: 6 }}>
            Use a mix of uppercase, lowercase, numbers and symbols; minimum 6 characters.
          </p>
          <input
            className="input-field"
            type="tel"
            placeholder="Phone number"
            value={form.phone}
            onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
          />
          <input
            className="input-field"
            type="text"
            placeholder="City"
            value={form.city}
            onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))}
          />
          <input
            className="input-field"
            type="text"
            placeholder="Skills, comma separated"
            value={form.skills}
            onChange={(event) => setForm((current) => ({ ...current, skills: event.target.value }))}
          />
          <input
            className="input-field"
            type="number"
            min="0"
            placeholder="Experience years"
            value={form.experienceYears}
            onChange={(event) =>
              setForm((current) => ({ ...current, experienceYears: event.target.value }))
            }
          />
          <select
            className="input-field"
            value={form.role}
            onChange={handleRoleChange}
          >
            <option value="STUDENT_FRESHER">Student Fresher(Job seeker)</option>
            <option value="STUDENT_EXPERIENCED">Experienced(Job seeker)</option>
            <option value="EMPLOYER">Job Poster(Employer)</option>
          </select>
          <button className="btn-primary auth-button" disabled={loading} type="submit">
            {loading ? <LoadingSpinner label="Creating account" /> : null}
            {loading ? "Creating..." : "Register"}
          </button>
          {message ? <p className={`form-message ${messageType}`}>{message}</p> : null}
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </section>
    </main>
  );
}
