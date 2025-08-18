// src/components/Navbar.jsx
import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <NavLink to="/" className="logo-title">
           <img className="logo" src="/logo.png" alt="logo" />
        </NavLink>
      </div>

      <button
        className="mobile-menu-toggle"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        ☰
      </button>

      <ul className={`navbar-list ${menuOpen ? "mobile-open" : ""}`}>
        {token && role === "ADMIN" && (
          <li>
            <button className="navbar-link" onClick={handleLogout}>
              Logout
            </button>
          </li>
        )}

        {token && role === "USER" && (
          <>
            <li>
              <NavLink
                to="/cart"
                className={({ isActive }) =>
                  isActive ? "navbar-link active" : "navbar-link"
                }
              >
                Cart
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  isActive ? "navbar-link active" : "navbar-link"
                }
              >
                Profile
              </NavLink>
            </li>
            <li>
              <button className="navbar-link" onClick={handleLogout}>
                Logout
              </button>
            </li>
          </>
        )}

        {!token && (
          <>
            <li>
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  isActive ? "navbar-link active" : "navbar-link"
                }
              >
                Login
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/register"
                className={({ isActive }) =>
                  isActive ? "navbar-link active" : "navbar-link"
                }
              >
                Register
              </NavLink>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
