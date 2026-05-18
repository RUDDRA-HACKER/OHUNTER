export default function Toast({ type = "info", message }) {
  if (!message) return null;

  return <div className={`toast toast-${type}`}>{message}</div>;
}
