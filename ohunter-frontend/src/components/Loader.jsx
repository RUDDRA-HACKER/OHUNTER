export default function Loader({ label = "Loading..." }) {
  return (
    <div className="card" style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <span className="badge">OH</span>
      <p>{label}</p>
    </div>
  );
}
