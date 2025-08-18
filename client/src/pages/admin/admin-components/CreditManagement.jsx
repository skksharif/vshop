import React, { useEffect, useState } from "react";
import { fetchWithToken } from "../../../api/api";
import "./CreditManagement.css";

export default function CreditManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [creditValue, setCreditValue] = useState("");
  const [message, setMessage] = useState("");

  // Fetch verified users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetchWithToken("/admin/verifiedusers", { method: "GET" });
      const data = await res.json();
      console.log(data)
      if (data.success) {
        setUsers(data.verifiedUsers || []);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  // Set or Update credit limit
  const handleCreditUpdate = async (e) => {
    e.preventDefault();
    if (!selectedUser || !creditValue) {
      setMessage("Select user and enter credit amount");
      return;
    }

    const endpoint = selectedUser.creditBal
      ? "/admin/update-credit-limit"
      : "/admin/set-credit-limit";

    const body = selectedUser.creditBal
      ? { userId: selectedUser.id, newCredit: Number(creditValue) }
      : { userId: selectedUser.id, creditBal: Number(creditValue) };

    try {
      const res = await fetchWithToken(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setMessage("✅ Credit updated successfully");
        setCreditValue("");
        setSelectedUser(null);
        fetchUsers();
      } else {
        setMessage(`❌ ${data.message || "Failed to update credit"}`);
      }
    } catch (err) {
      console.error("Error updating credit:", err);
      setMessage("❌ Something went wrong");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="credit-container">
      <h2 className="credit-title">Credit Management</h2>

      {message && <p className="credit-msg">{message}</p>}

      {loading ? (
        <p>Loading users...</p>
      ) : (
        <div className="credit-grid">
          {/* User List */}
          <div className="user-list">
            <h3 className="section-title">Verified Users ({users.length})</h3>
            <table className="user-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Credit Balance</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.fullName}</td>
                    <td>{user.email}</td>
                    <td>{user.creditBal || "Not Set"}</td>
                    <td>
                      <button
                        className="btn-edit"
                        onClick={() => {
                          setSelectedUser(user);
                          setCreditValue(user.creditBal || "");
                        }}
                      >
                        {user.creditBal ? "Update" : "Set"} Credit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Credit Form */}
          {selectedUser && (
            <div className="credit-form">
              <h3 className="section-title">
                {selectedUser.creditBal ? "Update" : "Set"} Credit Limit
              </h3>
              <form onSubmit={handleCreditUpdate}>
                <p>
                  <strong>User:</strong> {selectedUser.fullName} ({selectedUser.email})
                </p>
                <input
                  type="number"
                  placeholder="Enter credit amount"
                  value={creditValue}
                  onChange={(e) => setCreditValue(e.target.value)}
                  className="input-field"
                />
                <div className="form-actions">
                  <button type="submit" className="btn-submit">
                    Save
                  </button>
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => setSelectedUser(null)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
