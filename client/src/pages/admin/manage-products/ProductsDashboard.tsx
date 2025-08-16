import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getCategories, createProduct } from "../../../services/category"; // ✅ should come from product.ts, not category.ts
import type { Category } from "../../../types";

export default function ProductsDashboard() {
  const [categoryId, setCategoryId] = useState("");
  const [form, setForm] = useState({
    productName: "",
    description: "",
    price: 0,
    images: [] as string[],
    color: "",
    sizes: [] as string[],
    isActive: true,
  });

  // Get categories for dropdown
  const { data: categories, isLoading: loadingCategories } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  console.log(categories)

  // Create product mutation
  const mutation = useMutation({
    mutationFn: () => createProduct(categoryId, form),
    onSuccess: () => {
      alert("Product created successfully!");
      setForm({
        productName: "",
        description: "",
        price: 0,
        images: [],
        color: "",
        sizes: [],
        isActive: true,
      });
      setCategoryId("");
    },
  });

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Add Product</h1>

      <form
        className="grid grid-cols-2 gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate();
        }}
      >
        {/* Category Dropdown */}
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          required
          className="border p-2 rounded col-span-2"
        >
          <option value="">Select Category</option>
          {loadingCategories ? (
            <option>Loading...</option>
          ) : (
            categories.categories?.length > 0 &&
            categories.categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))
          )}
        </select>

        <input
          type="text"
          name="productName"
          placeholder="Product Name"
          value={form.productName}
          onChange={handleChange}
          className="border p-2 rounded col-span-2"
          required
        />

        <input
          type="number"
          name="price"
          placeholder="Price"
          value={form.price}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />

        <input
          type="text"
          name="color"
          placeholder="Color"
          value={form.color}
          onChange={handleChange}
          className="border p-2 rounded"
        />

        <input
          type="text"
          name="sizes"
          placeholder="Sizes (comma separated)"
          value={form.sizes.join(",")}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              sizes: e.target.value.split(","),
            }))
          }
          className="border p-2 rounded col-span-2"
        />

        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          className="border p-2 rounded col-span-2"
        />

        <input
          type="text"
          name="images"
          placeholder="Image URLs (comma separated)"
          value={form.images.join(",")}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              images: e.target.value.split(","),
            }))
          }
          className="border p-2 rounded col-span-2"
        />

        <label className="col-span-2 flex items-center space-x-2">
          <input
            type="checkbox"
            name="isActive"
            checked={form.isActive}
            onChange={handleChange}
          />
          <span>Active</span>
        </label>

        <button
          type="submit"
          className="bg-blue-600 text-white rounded p-2 hover:bg-blue-700 col-span-2"
          disabled={mutation.isLoading}
        >
          {mutation.isLoading ? "Creating..." : "Create Product"}
        </button>
      </form>
    </div>
  );
}
