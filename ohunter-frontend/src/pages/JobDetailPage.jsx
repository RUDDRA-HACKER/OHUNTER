import { useParams } from "react-router-dom";

export default function JobDetailPage() {
  const { id } = useParams();

  return (
    <main className="page-container" style={{ paddingTop: 32, paddingBottom: 48, maxWidth: 880 }}>
      <section className="card page-card">
        <span className="badge">Job details</span>
        <h1 style={{ marginTop: 12 }}>Job #{id}</h1>
        <p style={{ marginTop: 8 }}>This page is scaffolded for a production job detail experience.</p>
      </section>
    </main>
  );
}
