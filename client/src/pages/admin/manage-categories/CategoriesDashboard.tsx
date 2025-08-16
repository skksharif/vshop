import React, { useState, useEffect } from "react";
import { createCategory, getCategories } from "../../../services/category";
import type { Category } from "../../../types";

export default function CategoriesDashboard() {
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchCategories = async () => {
    try {
      const data:any = await getCategories();
      console.log(data.categories)
      setCategories(data.categories.reverse());
    } catch (err) {
      console.error(err);
      setError("Failed to fetch categories.");
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const newCategory = await createCategory({
        categoryName: name,
        imageUrl: image,
      });
      setName("");
      setImage("");
      setSuccess("Category created successfully!");
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to create category."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Category Dashboard</h1>

      {/* Category Create Form */}
      <form onSubmit={handleSubmit} className="mb-6 space-y-4">
        <div>
          <label className="block font-medium mb-1">Category Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Image URL</label>
          <input
            type="text"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Category"}
        </button>
      </form>

      {error && <p className="text-red-500 mb-2">{error}</p>}
      {success && <p className="text-green-500 mb-2">{success}</p>}

      {/* Categories List */}
      <h2 className="text-xl font-semibold mb-2">Existing Categories</h2>
      <ul>
        {categories.length > 0 &&
          categories.map((cat) => (
            <li key={cat.id} className="border-b py-2 flex items-center gap-3">
              <img
                src={cat.image}
                alt={cat.name}
                className="w-12 h-12 object-cover rounded"
              />
              <span>{cat.name}</span>
            </li>
          ))}
      </ul>
    </div>
  );
}
