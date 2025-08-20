import React, { useEffect, useState } from "react";
import { fetchWithToken } from "../../api/api"; // your helper
import "./Profile.css";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [allOrders, setAllOrders] = useState([]); // store all orders here
  const [orders, setOrders] = useState([]);       // filtered orders
  const [loading, setLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("pending"); // default tab

  // Fetch profile from localStorage
  const fetchProfile = () => {
    try {
      setLoading(true);
      const storedUser = localStorage.getItem("user");
      if (storedUser) setUser(JSON.parse(storedUser));
    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all orders once
  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      const res = await fetchWithToken(`/orders`);
      const data = await res.json();
      if (data.success) {
        setAllOrders(data.orders); // store all
        filterOrders(activeTab, data.orders); // filter for default tab
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setOrdersLoading(false);
    }
  };

  // Filter by status
  const filterOrders = (status, ordersList = allOrders) => {
    const filtered = ordersList.filter(
      (order) => order.status.toLowerCase() === status.toLowerCase()
    );
    setOrders(filtered);
  };

  useEffect(() => {
    fetchProfile();
    fetchOrders(); // load once
  }, []);

  // Handle tab change
  const handleTabChange = (status) => {
    setActiveTab(status);
    filterOrders(status);
  };

  if (loading) return <p className="profile-loading">Loading profile...</p>;
  if (!user) return <p className="profile-error">No profile data found</p>;

  return (
    <div className="profile-container">
      <div className="profile-columns">
        {/* Left Column: Profile Info */}
        <div className="profile-left">
          <div className="profile-card">
            <div className="profile-header">
              <div className="profile-avatar">
                {user.fullName?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="profile-name">{user.fullName}</h3>
                <p className="profile-username">@{user.userName}</p>
              </div>
            </div>
            <div className="profile-info-grid">
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Phone:</strong> {user.phone}</p>
              <p>
                <strong>Credit Balance:</strong>{" "}
                <span className="credit-badge">{user.creditBal}</span>
              </p>
              <p>
                <strong>KYC Verified:</strong>{" "}
                <span
                  className={`kyc-badge ${
                    user.kycVerified ? "kyc-yes" : "kyc-no"
                  }`}
                >
                  {user.kycVerified ? "Yes" : "No"}
                </span>
              </p>
              <p><strong>KYC Card:</strong> <a href={user.kycCard}>KYC Card</a></p>
              {user.aadhaarPanUrl && (
                <p>
                  <strong>KYC Document:</strong>{" "}
                  <a
                    href={user.aadhaarPanUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View Document
                  </a>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Orders */}
        <div className="profile-right">
          <h2 className="orders-title">My Orders</h2>

          {/* Tabs */}
          <div className="orders-tabs">
            {["pending", "approved", "shipped"].map((status) => (
              <button
                key={status}
                className={`orders-tab ${
                  activeTab === status ? "active-tab" : ""
                }`}
                onClick={() => handleTabChange(status)}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>

          {ordersLoading ? (
            <p className="orders-loading">Loading {activeTab} orders...</p>
          ) : orders.length === 0 ? (
            <p className="orders-empty">
              You have no {activeTab} orders yet.
            </p>
          ) : (
            <div className="orders-list">
              {orders.map((order) => (
                <div key={order.id} className="order-card">
                  <div className="order-header">
                    <p><strong>Order ID:</strong> {order.id}</p>
                    <p><strong>Status:</strong> {order.status}</p>
                  </div>
                  <p><strong>Total:</strong> ₹{order.total}</p>
                  <p><strong>Payment Option:</strong> {order.paymentOption}</p>
                  <div className="order-items">
                    {order.items.map((item) => (
                      <div key={item.id} className="order-item">
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="order-item-img"
                        />
                        <div className="order-item-details">
                          <p className="order-item-name">{item.product.name}</p>
                          <p>Price: ₹{item.price}</p>
                          <p>Quantity: {item.quantity}</p>
                          {item.variant && (
                            <p>
                              Color: {item.variant.color} | Size:{" "}
                              {item.variant.size}
                            </p>
                          )}
                        </div>
                        <div className="order-item-subtotal">
                          ₹{item.price * item.quantity}
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="order-date">
                    <strong>Ordered On:</strong>{" "}
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
