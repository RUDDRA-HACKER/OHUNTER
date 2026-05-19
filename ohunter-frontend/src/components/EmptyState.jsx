import { Link } from "react-router-dom";

export default function EmptyState({ icon, title, message, actionLabel, actionTo, onAction }) {
  return (
    <div className="empty-state card">
      <div className="empty-illustration" aria-hidden="true">
        {icon}
      </div>
      <h2>{title}</h2>
      <p>{message}</p>
      {actionLabel ? (
        actionTo ? (
          <Link className="btn-primary" to={actionTo}>
            {actionLabel}
          </Link>
        ) : (
          <button className="btn-primary" type="button" onClick={onAction}>
            {actionLabel}
          </button>
        )
      ) : null}
    </div>
  );
}
