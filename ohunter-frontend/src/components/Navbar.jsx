import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { isAuthenticated, isGuest, user, logout } = useAuth();

  return (
    <header className="topbar page-container" style={{ paddingTop: 24, paddingBottom: 24 }}>
      <Link to="/" className="brand">
        <span className="badge">OH</span>
        <div>
          <h2>OHunter</h2>
          <p>Premium job portal</p>
        </div>
      </Link>

      <nav className="toolbar">
        <NavLink to="/jobs" className="btn-outline">Jobs</NavLink>
        {isAuthenticated && <NavLink to="/applications" className="btn-outline">My Applications</NavLink>}
        {user?.role === "EMPLOYER" && <NavLink to="/employer" className="btn-outline">Employer Dashboard</NavLink>}
        {isGuest && <span className="badge">Guest mode</span>}
        {isAuthenticated ? (
          <button className="btn-danger" onClick={logout} type="button">Log out</button>
        ) : (
          <Link className="btn-primary" to="/login">Sign in</Link>
        )}
      </nav>
    </header>
  );
}
