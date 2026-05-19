import { Link } from "react-router-dom";

const stats = [
  { icon: "💼", number: "10,000+", label: "Jobs" },
  { icon: "🏢", number: "5,000+", label: "Companies" },
  { icon: "👀", number: "50,000+", label: "Seekers" },
];

const features = [
  {
    title: "Smart Search",
    description: "Find jobs by keyword, location, and fresher tag without friction.",
  },
  {
    title: "Instant Apply",
    description: "Keep the application flow fast and focused for every seeker.",
  },
  {
    title: "Manage Applications",
    description: "Track application status in real time from a single dashboard.",
  },
];

export default function LandingPage() {
  return (
    <main className="landing-page">
      <section className="page-container hero-section">
        <div className="hero-blob" aria-hidden="true" />
        <div className="hero-content card">
          <span className="badge">Premium job portal</span>
          <h1>
            Find Your <span className="accent-word">Dream</span> Job
          </h1>
          <p>OHunter connects top talent with great companies</p>

          <div className="toolbar hero-actions" style={{ marginTop: 28 }}>
            <Link className="btn-primary" to="/jobs">
              Browse Jobs
            </Link>
            <Link className="btn-outline" to="/employer/post-job">
              Post a Job
            </Link>
          </div>
        </div>
      </section>

      <section className="page-container stats-bar">
        {stats.map((stat) => (
          <article className="stat-card card" key={stat.label}>
            <span className="stat-icon" aria-hidden="true">
              {stat.icon}
            </span>
            <strong>{stat.number}</strong>
            <span>{stat.label}</span>
          </article>
        ))}
      </section>

      <section className="page-container features-section">
        <div className="section-heading">
          <span className="badge">Why OHunter</span>
          <h2>Built for speed, clarity, and hiring momentum.</h2>
        </div>

        <div className="features-grid">
          {features.map((feature) => (
            <article className="feature-card card" key={feature.title}>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="page-container footer-banner">
        <div>
          <span className="badge">Get started</span>
          <h2>Ready to get hired?</h2>
        </div>
        <Link className="btn-primary" to="/register">
          Register
        </Link>
      </section>
    </main>
  );
}
