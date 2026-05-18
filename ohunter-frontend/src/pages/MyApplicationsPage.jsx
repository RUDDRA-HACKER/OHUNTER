export default function MyApplicationsPage() {
  return (
    <main className="page-container" style={{ paddingTop: 32, paddingBottom: 48, maxWidth: 880 }}>
      <section className="card page-card">
        <span className="badge">Jobseeker</span>
        <h1 style={{ marginTop: 12 }}>My applications</h1>
        <p style={{ marginTop: 8 }}>Show the authenticated jobseeker's applications and statuses here.</p>
      </section>
    </main>
  );
}
