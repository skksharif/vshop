// src/pages/AddCategory.jsx
import React, { useEffect, useState } from "react";
import { fetchWithToken } from "../../../api/api";
import "./AddCategory.css";

export default function AddCategory() {
  const [categories, setCategories] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [categoryFile, setCategoryFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch all categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetchWithToken("/category/getCatergory", {
        method: "GET",
      });
      if (!res.ok) throw new Error("Failed to fetch categories");
      const data = await res.json();
      if (data.success) setCategories(data.categories || []);
    } catch (err) {
      console.error("Error fetching categories:", err);
    } finally {
      setLoading(false);
    }
  };

  // Upload to Cloudinary
  // cloudinary upload
  const uploadToCloudinary = async (file) => {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "kyc_card");
    const res = await fetch(
      "https://api.cloudinary.com/v1_1/dralfzsvo/image/upload",
      {
        method: "POST",
        body: data,
      }
    );
    if (!res.ok) throw new Error("Cloudinary upload failed");
    return res.json();
  };

  // Handle file change
  const handleFileChange = (e) => setCategoryFile(e.target.files[0]);

  // Create category
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!categoryName || (!imageUrl && !categoryFile)) {
      setMessage("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      let finalImageUrl = imageUrl;
      if (categoryFile) {
        setUploading(true);
        const uploadRes = await uploadToCloudinary(categoryFile);
        finalImageUrl = uploadRes.secure_url;
        setUploading(false);
      }

      const res = await fetchWithToken("/admin/create-category", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryName, imageUrl: finalImageUrl }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setMessage("Category created successfully");
        setCategoryName("");
        setCategoryFile(null);
        setImageUrl("");
        fetchCategories(); // refresh list
      } else {
        setMessage(data.message || "Failed to create category");
      }
    } catch (err) {
      console.error("Error creating category:", err);
      setMessage("Something went wrong");
    } finally {
      setLoading(false);
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
          disabled={loading || uploading}
          required
        />

        <label className="file-upload-label">
          Upload Category Image
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={loading || uploading}
          />
        </label>
        {categoryFile && <p>{categoryFile.name}</p>}

        <button type="submit" disabled={loading || uploading}>
          {loading ? "Saving..." : uploading ? "Uploading..." : "Add Category"}
        </button>
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
