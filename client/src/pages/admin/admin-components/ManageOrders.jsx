import React, { useEffect, useState } from "react";
import { fetchWithToken } from "../../../api/api";
import "./ManageOrders.css";

export default function ManageOrders() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("pending");

  // Fetch orders by status
  const fetchOrders = async (status) => {
    try {
      setLoading(true);

      let endpoint = "/admin/orders/pending";
      if (status === "approved") endpoint = "/admin/orders/approved";
      if (status === "shipped") endpoint = "/admin/orders/shipped";

      const res = await fetchWithToken(endpoint);
      const data = await res.json();

      if (data.success) {
        const ordersData =
          data.pendingOrders || data.approvedOrders || data.shippedOrders || [];

        setOrders(ordersData);

        // Collect product IDs from all items
        const productIds = new Set();
        ordersData.forEach((order) => {
          order.items.forEach((item) => productIds.add(item.productId));
        });

        // Fetch each product one by one
        for (const id of productIds) {
          if (!products[id]) {
            await fetchProductById(id);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch product by ID (one by one)
  const fetchProductById = async (id) => {
    try {
      const res = await fetchWithToken(`/category/getProduct?productId=${id}`);
      const data = await res.json();
      if (data.success && data.product) {
        setProducts((prev) => ({ ...prev, [data.product.id]: data.product.name }));
      }
    } catch (err) {
      console.error("Error fetching product:", err);
    }
  };

  useEffect(() => {
    fetchOrders(activeTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Approve order
  const handleApprove = async (orderId) => {
    if (!window.confirm("Approve this order?")) return;
    try {
      setActionLoading(true);
      const res = await fetchWithToken("/admin/orders/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, newStatus: "approved" }),
      });
      const data = await res.json();
      if (data.success) fetchOrders(activeTab);
      else alert("Failed to approve: " + data.message);
    } catch (err) {
      console.error(err);
      alert("Error approving order");
    } finally {
      setActionLoading(false);
    }
  };

  // Mark as shipped
  const handleShipped = async (orderId) => {
    if (!window.confirm("Mark this order as shipped?")) return;
    try {
      setActionLoading(true);
      const res = await fetchWithToken("/admin/orders/shipped", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (data.success) fetchOrders(activeTab);
      else alert("Failed to mark shipped: " + data.message);
    } catch (err) {
      console.error(err);
      alert("Error marking order shipped");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="manage-container">
      <h2 className="manage-title">Order Management</h2>

      {/* Tabs */}
      <div className="manage-tabs">
        {["pending", "approved", "shipped"].map((tab) => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Orders */}
      {loading ? (
        <p className="manage-loading">Loading orders...</p>
      ) : orders.length === 0 ? (
        <p className="manage-empty">No orders for {activeTab} status.</p>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-user">
                <p>
                  <strong>User:</strong> {order.user.fullName} (@{order.user.userName})
                </p>
                <p><strong>Email:</strong> {order.user.email}</p>
                <p><strong>Phone:</strong> {order.user.phone}</p>
              </div>

              <div className="order-info">
                <p><strong>Order ID:</strong> {order.id}</p>
                <p><strong>Status:</strong> {order.status}</p>
                <p><strong>Total:</strong> ₹{order.total}</p>
                <p><strong>Payment:</strong> {order.paymentOption}</p>
                <p><strong>Placed on:</strong> {new Date(order.createdAt).toLocaleString()}</p>
              </div>

              <div className="order-items">
                {order.items.map((item) => (
                  <div key={item.id} className="order-item">
                    <p>
                      <strong>{products[item.productId] || "Loading..."}</strong>
                      {" "} - Qty: {item.quantity} - ₹{item.price}
                    </p>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="order-actions">
                {activeTab === "pending" && (
                  <button
                    className="btn-approve"
                    onClick={() => handleApprove(order.id)}
                    disabled={actionLoading}
                  >
                    Approve
                  </button>
                )}
                {activeTab === "approved" && (
                  <button
                    className="btn-shipped"
                    onClick={() => handleShipped(order.id)}
                    disabled={actionLoading}
                  >
                    Mark as Shipped
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
