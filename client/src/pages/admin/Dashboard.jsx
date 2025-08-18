// src/pages/AdminHome.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, NavLink, Routes, Route } from "react-router-dom";
import {
  FaPlusCircle, // Add Category
  FaBoxOpen, // Add Products
  FaShoppingCart, // Manage Orders
  FaMoneyBillWave, // Manage Credit
  FaCalendarAlt, // Upcoming Visits
  FaBars,
  FaTimes,
} from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
import { CiLogout } from "react-icons/ci";
import { FiUserCheck } from "react-icons/fi";
import "./Dashboard.css";
import UserVerification from "./admin-components/UserVerification";
import AddCategory from "./admin-components/AddCategory";
import AddProducts from "./admin-components/AddProducts";
import CreditManagement from "./admin-components/CreditManagement";
import ManageOrders from "./admin-components/ManageOrders";

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  // Redirect if not logged in OR not an admin
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role !== "ADMIN") {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="admin-container">
      {/* Mobile Sidebar Toggle */}
      <button
        className="mobile-sidebar-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle sidebar"
      >
        {sidebarOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* Mobile Overlay */}
      <div
        className={`mobile-sidebar-overlay ${sidebarOpen ? "open" : ""}`}
        onClick={closeSidebar}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <nav className="sidebar-nav">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            onClick={closeSidebar}
          >
            <MdDashboard className="nav-item-icon" />
            <span className="nav-item-text">Dashboard</span>
          </NavLink>

          <NavLink
            to="/admin/user-verification"
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            onClick={closeSidebar}
          >
            <FiUserCheck className="nav-item-icon" />
            <span className="nav-item-text">User Verification</span>
          </NavLink>

          <NavLink
            to="/admin/add-category"
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            onClick={closeSidebar}
          >
            <FaPlusCircle className="nav-item-icon" />
            <span className="nav-item-text">Add Category</span>
          </NavLink>

          <NavLink
            to="/admin/add-products"
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            onClick={closeSidebar}
          >
            <FaBoxOpen className="nav-item-icon" />
            <span className="nav-item-text">Add Products</span>
          </NavLink>

          <NavLink
            to="/admin/manage-orders"
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            onClick={closeSidebar}
          >
            <FaShoppingCart className="nav-item-icon" />
            <span className="nav-item-text">Manage Orders</span>
          </NavLink>

          <NavLink
            to="/admin/manage-credit"
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            onClick={closeSidebar}
          >
            <FaMoneyBillWave className="nav-item-icon" />
            <span className="nav-item-text">Manage Credit</span>
          </NavLink>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div className="main-board">
          <Routes>
            <Route path="" element={<div>📊 Dashboard Overview</div>} />
            <Route
              path="user-verification"
              element={<UserVerification/>}
            />
            <Route path="add-category" element={<AddCategory/>} />
            <Route path="add-products" element={<AddProducts/>} />
            <Route path="manage-orders" element={<ManageOrders />} />
            <Route path="manage-credit" element={<CreditManagement />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
