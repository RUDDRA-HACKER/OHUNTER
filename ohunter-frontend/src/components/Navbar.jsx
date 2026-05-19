import { useContext, useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function navLinkClass({ isActive }) {
  return `nav-link${isActive ? " active" : ""}`;
}

export default function Navbar() {
  const location = useLocation();
  const { isAuthenticated, isEmployer, isJobseeker, logout } = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 16);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const centerLinks = [{ label: "Browse Jobs", to: "/jobs" }];
  if (isEmployer) {
    centerLinks.push({ label: "Post a Job", to: "/employer/post-job" });
  }

  return (
    <header className={`navbar${scrolled ? " navbar-scrolled" : ""}`}>
      <div className="page-container navbar-shell">
        <Link to="/" className="navbar-logo" aria-label="OHunter home">
          <span className="navbar-logo-accent">O</span>
          <span className="navbar-logo-rest"> H U N T E R</span>
        </Link>

        <nav className="navbar-center" aria-label="Primary navigation">
          {centerLinks.map((link) => (
            <NavLink key={link.to} to={link.to} className={navLinkClass}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="navbar-right">
          {!isAuthenticated ? (
            <>
              <NavLink to="/login" className={navLinkClass}>
                Login
              </NavLink>
              <Link to="/register" className="btn-outline navbar-action">
                Register
              </Link>
            </>
          ) : null}

          {isJobseeker ? (
            <>
              <NavLink to="/my-applications" className={navLinkClass}>
                My Applications
              </NavLink>
              <button className="btn-outline navbar-action" type="button" onClick={logout}>
                Logout
              </button>
            </>
          ) : null}

          {isEmployer ? (
            <>
              <NavLink to="/employer/dashboard" className={navLinkClass}>
                Dashboard
              </NavLink>
              <button className="btn-outline navbar-action" type="button" onClick={logout}>
                Logout
              </button>
            </>
          ) : null}
        </div>

        <button
          className={`navbar-menu-button${menuOpen ? " is-open" : ""}`}
          type="button"
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((current) => !current)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <div className={`mobile-menu${menuOpen ? " open" : ""}`}>
        <div className="page-container mobile-menu-inner">
          {centerLinks.map((link) => (
            <NavLink key={link.to} to={link.to} className={navLinkClass}>
              {link.label}
            </NavLink>
          ))}

          {!isAuthenticated ? (
            <>
              <NavLink to="/login" className={navLinkClass}>
                Login
              </NavLink>
              <NavLink to="/register" className={navLinkClass}>
                Register
              </NavLink>
            </>
          ) : null}

          {isJobseeker ? (
            <>
              <NavLink to="/my-applications" className={navLinkClass}>
                My Applications
              </NavLink>
              <button className="nav-link mobile-logout" type="button" onClick={logout}>
                Logout
              </button>
            </>
          ) : null}

          {isEmployer ? (
            <>
              <NavLink to="/employer/dashboard" className={navLinkClass}>
                Dashboard
              </NavLink>
              <button className="nav-link mobile-logout" type="button" onClick={logout}>
                Logout
              </button>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}
