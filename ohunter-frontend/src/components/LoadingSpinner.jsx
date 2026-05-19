export default function LoadingSpinner({ label = "Loading" }) {
  return (
    <span className="loading-spinner-wrap" aria-live="polite" aria-label={label}>
      <span className="loading-spinner" aria-hidden="true" />
    </span>
  );
}
