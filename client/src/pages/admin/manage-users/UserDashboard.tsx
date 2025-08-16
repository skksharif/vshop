import { useEffect, useState } from "react";
import { getUnverifiedUsers, verifyUser } from "../../../services/admin"; // your API
import type { User } from "../../../types";

// Loading spinner
const Loader = () => (
  <div className="flex justify-center items-center p-4">
    <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-blue-500"></div>
  </div>
);

export default function UserDashboard() {
  const [unverifiedUsers, setUnverifiedUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [verifyingUserId, setVerifyingUserId] = useState<string | null>(null);

  // Fetch unverified users
  const fetchUnverifiedUsers = async () => {
    setLoading(true);
    try {
      const users:any = await getUnverifiedUsers();
      console.log("Fetched unverified users:", users);
      setUnverifiedUsers(users.users);
    } catch (error) {
      console.error("Failed to fetch unverified users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnverifiedUsers();
  }, []);

  // Handle verify user
  const handleVerifyUser = async (userId: string) => {
    setVerifyingUserId(userId);
    try {
      await verifyUser(userId);
      setUnverifiedUsers(prev => prev.filter(u => u.id !== userId));
    } catch (error) {
      console.error("Failed to verify user:", error);
    } finally {
      setVerifyingUserId(null);
    }
  };

  const filteredUsers = unverifiedUsers.filter(u =>
    u.fullName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-white shadow rounded p-6 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Unverified Users</h2>

        <input
          type="text"
          placeholder="Search unverified users..."
          className="border rounded p-2 mb-4 w-full"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        {loading ? (
          <Loader />
        ) : filteredUsers.length === 0 ? (
          <p className="text-gray-500">No unverified users found.</p>
        ) : (
          <ul className="space-y-2">
            {filteredUsers.map(user => (
              <li
                key={user.id}
                className="flex justify-between items-center border-b py-2"
              >
                <span>{user.fullName}</span>
                <button
                  onClick={() => handleVerifyUser(user.id)}
                  disabled={verifyingUserId === user.id}
                  className={`px-3 py-1 rounded text-white ${
                    verifyingUserId === user.id
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-green-500 hover:bg-green-600"
                  }`}
                >
                  {verifyingUserId === user.id ? "Verifying..." : "Verify"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
