// src/pages/AddCategory.jsx
import React, { useEffect, useState } from "react";
import { fetchWithToken } from "../../../api/api";
import "./AddCategory.css";

export default function AddCategory() {
  const [categories, setCategories] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch all categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetchWithToken("/category/getCatergory", { method: "GET" });
      if (!res.ok) throw new Error("Failed to fetch categories");
      const data = await res.json();
      if (data.success) setCategories(data.categories || []);
    } catch (err) {
      console.error("Error fetching categories:", err);
    } finally {
      setLoading(false);
    }
  };

  // Create category
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!categoryName || !imageUrl) {
      setMessage("⚠️ Please fill in all fields");
      return;
    }

    try {
      const res = await fetchWithToken("/admin/create-category", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryName, imageUrl }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setMessage("✅ Category created successfully!");
        setCategoryName("");
        setImageUrl("");
        fetchCategories(); // refresh list
      } else {
        setMessage(`❌ ${data.message || "Failed to create category"}`);
      }
    } catch (err) {
      console.error("Error creating category:", err);
      setMessage("❌ Something went wrong");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="category-container">
      <h2>Category Management</h2>

      {/* Add Category Form */}
      <form className="category-form" onSubmit={handleAddCategory}>
        <input
          type="text"
          placeholder="Category Name"
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Image URL"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />
        <button type="submit">Add Category</button>
      </form>

      {/* Feedback Message */}
      {message && <p className="message">{message}</p>}

      {/* Categories List */}
      <h3>Available Categories ({categories.length})</h3>

      {loading ? (
        <p>Loading categories...</p>
      ) : categories.length === 0 ? (
        <p>No categories found</p>
      ) : (
        <div className="category-grid">
          {categories.map((cat) => (
            <div key={cat.id} className="category-card">
              <img src={cat.image} alt={cat.name} />
              <p>{cat.name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
