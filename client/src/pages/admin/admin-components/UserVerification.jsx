// src/pages/UserVerification.jsx
import React, { useEffect, useState } from "react";
import { fetchWithToken } from "../../../api/api";
import "./UserVerification.css";

export default function UserVerification() {
  const [unverifiedUsers, setUnverifiedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [verifyingUserId, setVerifyingUserId] = useState(null); // track which user is being verified

  // Fetch Unverified Users
  const fetchUnverifiedUsers = async () => {
    try {
      const res = await fetchWithToken(`/admin/unverified-users`, { method: "GET" });
      if (!res.ok) throw new Error("Failed to fetch unverified users");

      const data = await res.json();
      if (data.success) {
        setUnverifiedUsers(data.users || []);
      }
    } catch (err) {
      console.error("Error fetching unverified users:", err);
    }
  };

  // Verify User
  const verifyUser = async (userId) => {
    setVerifyingUserId(userId); // set current verifying user
    try {
      const res = await fetchWithToken(`/admin/verifyUser?userId=${userId}`, {
        method: "PATCH",
      });

      if (!res.ok) throw new Error("Failed to verify user");

      // Refresh unverified list
      await fetchUnverifiedUsers();
    } catch (err) {
      console.error("Error verifying user:", err);
    } finally {
      setVerifyingUserId(null); // reset
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchUnverifiedUsers().finally(() => setLoading(false));
  }, []);

  // Filter users based on search term (email or phone only)
  const filteredUsers = unverifiedUsers.filter((user) =>
    [user.email, user.phone]
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="verification-container">
      <h2>User Verification</h2>

      <div className="stats">
        <p>
          Unverified Users: <strong>{unverifiedUsers.length}</strong>
        </p>
      </div>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search by email or phone..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
      />

      {loading ? (
        <p>Loading users...</p>
      ) : (
        <>
          {filteredUsers.length === 0 ? (
            <p>No unverified users found 🎉</p>
          ) : (
            <div className="table-container">
              <table className="user-table">
                <thead>
                  <tr>
                    <th>Full Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>KYC Card</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td>{user.fullName}</td>
                      <td>{user.email}</td>
                      <td>{user.phone}</td>
                      <td>
                        <a
                          href={user.kycCard}
                          target="_blank"
                          rel="noreferrer"
                        >
                          View Doc
                        </a>
                      </td>
                      <td>
                        <button
                          className="verify-btn"
                          disabled={verifyingUserId === user.id}
                          onClick={() => verifyUser(user.id)}
                        >
                          {verifyingUserId === user.id ? (
                            <span className="spinner"></span>
                          ) : (
                            "Verify"
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
