import React, { useEffect, useState } from "react";
import { fetchWithToken } from "../../../api/api";
import "./AddProducts.css";

export default function AddProducts() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loadingCats, setLoadingCats] = useState(false);

  const [productsCount, setProductsCount] = useState(0);

  const [form, setForm] = useState({
    productName: "",
    description: "",
    price: "",
    color: "",
    isActive: true,
  });

  const [images, setImages] = useState([]); // store File objects
  const [sizes, setSizes] = useState([]);
  const [sizeInput, setSizeInput] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  // ✅ Replace with your Cloudinary values
  const CLOUDINARY_UPLOAD_URL = "https://api.cloudinary.com/v1_1/dralfzsvo/image/upload";
  const CLOUDINARY_UPLOAD_PRESET = "kyc_card";

  // Fetch categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoadingCats(true);
        const res = await fetchWithToken("/category/getCatergory", { method: "GET" });
        if (!res.ok) throw new Error("Failed to fetch categories");
        const data = await res.json();
        if (data.success && Array.isArray(data.categories)) {
          setCategories(data.categories);
          if (data.categories[0]?.id) {
            setSelectedCategory(data.categories[0].id);
          }
        }
      } catch (err) {
        console.error(err);
        setMessage("❌ Could not load categories");
      } finally {
        setLoadingCats(false);
      }
    };
    loadCategories();
  }, []);

  // Fetch product count
  useEffect(() => {
    const loadProductsCount = async () => {
      try {
        const res = await fetchWithToken("/admin/getAllProducts", { method: "GET" });
        if (!res.ok) throw new Error("Failed to fetch products");
        const data = await res.json();
        if (data.success && Array.isArray(data.products)) {
          setProductsCount(data.products.length);
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadProductsCount();
  }, []);

  const updateField = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Image upload
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length) {
      setImages((prev) => [...prev, ...files]);
    }
  };

  const removeImage = (idx) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  // Sizes
  const addSize = () => {
    const s = sizeInput.trim().toUpperCase();
    if (!s) return;
    if (!sizes.includes(s)) setSizes((prev) => [...prev, s]);
    setSizeInput("");
  };

  const removeSize = (idx) => {
    setSizes((prev) => prev.filter((_, i) => i !== idx));
  };

  // ✅ Upload images to Cloudinary
  const uploadToCloudinary = async (file) => {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const res = await fetch(CLOUDINARY_UPLOAD_URL, { method: "POST", body: data });
    if (!res.ok) throw new Error("Cloudinary upload failed");
    const json = await res.json();
    return json.secure_url;
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!selectedCategory) return setMessage("⚠️ Please select a category.");
    if (!form.productName.trim() || !form.description.trim())
      return setMessage("⚠️ Product name and description are required.");
    const priceNum = Number(form.price);
    if (Number.isNaN(priceNum) || priceNum < 0)
      return setMessage("⚠️ Please enter a valid non-negative price.");
    if (images.length === 0)
      return setMessage("⚠️ Please upload at least one product image.");
    if (sizes.length === 0)
      return setMessage("⚠️ Please add at least one size.");

    try {
      setSubmitting(true);

      // ✅ Upload all images first
      const uploadedUrls = await Promise.all(images.map(uploadToCloudinary));

      // ✅ Send JSON to backend
      const payload = {
        productName: form.productName.trim(),
        description: form.description.trim(),
        price: priceNum,
        color: form.color.trim(),
        isActive: form.isActive,
        sizes,
        images: uploadedUrls,
      };

      const res = await fetchWithToken(
        `/admin/create-product?categoryId=${encodeURIComponent(selectedCategory)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (data.success) {
        setMessage("✅ Product created successfully!");
        setForm({ productName: "", description: "", price: "", color: "", isActive: true });
        setImages([]);
        setSizes([]);
        setProductsCount((prev) => prev + 1);
      } else {
        setMessage(`❌ ${data.message || "Failed to create product"}`);
      }
    } catch (err) {
      console.error(err);
      setMessage(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="prod-container">
      <div className="prod-header">
        <h2 className="prod-title">Add Product</h2>
        <span className="prod-count">Total Products: {productsCount}</span>
      </div>

      <form className="prod-form" onSubmit={handleSubmit}>
        {/* Category + Product Name */}
        <div className="grid-2">
          <div className="form-row">
            <label className="form-label">Category</label>
            {loadingCats ? (
              <div className="skeleton-select" />
            ) : (
              <select
                className="form-input"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className="form-row">
            <label className="form-label">Product Name</label>
            <input
              className="form-input"
              name="productName"
              value={form.productName}
              onChange={updateField}
              placeholder="Wireless Headphones"
            />
          </div>
        </div>

        {/* Price + Color */}
        <div className="grid-2">
          <div className="form-row">
            <label className="form-label">Price</label>
            <input
              className="form-input"
              name="price"
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={updateField}
              placeholder="199.99"
            />
          </div>
          <div className="form-row">
            <label className="form-label">Color</label>
            <input
              className="form-input"
              name="color"
              value={form.color}
              onChange={updateField}
              placeholder="Black"
            />
          </div>
        </div>

        {/* Description */}
        <div className="form-row">
          <label className="form-label">Description</label>
          <textarea
            className="form-textarea"
            name="description"
            value={form.description}
            onChange={updateField}
            rows={3}
            placeholder="High-quality wireless headphones with noise cancellation"
          />
        </div>

        {/* Images + Sizes */}
        <div className="grid-2">
          {/* Images */}
          <div className="form-row">
            <label className="form-label">Images</label>
            <input type="file" multiple accept="image/*" onChange={handleImageUpload} />
            {images.length > 0 && (
              <div className="chips-grid">
                {images.map((file, i) => (
                  <div key={i} className="chip-item">
                    <img src={URL.createObjectURL(file)} alt={`img-${i}`} className="chip-img" />
                    <button type="button" className="chip-remove" onClick={() => removeImage(i)}>
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sizes */}
          <div className="form-row">
            <label className="form-label">Sizes</label>
            <div className="input-add">
              <input
                className="form-input"
                value={sizeInput}
                onChange={(e) => setSizeInput(e.target.value)}
                placeholder="S, M, L"
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSize())}
              />
              <button className="btn" type="button" onClick={addSize}>
                Add
              </button>
            </div>
            {sizes.length > 0 && (
              <div className="pill-row">
                {sizes.map((s, i) => (
                  <span key={s} className="pill">
                    {s}
                    <button type="button" className="pill-remove" onClick={() => removeSize(i)}>
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Active toggle */}
        <div className="form-row checkbox-row">
          <label className="checkbox">
            <input type="checkbox" name="isActive" checked={form.isActive} onChange={updateField} />
            <span>Active</span>
          </label>
        </div>

        {/* Message */}
        {message && <p className="msg">{message}</p>}

        <div className="actions">
          <button className="btn" type="submit" disabled={submitting}>
            {submitting ? "Creating..." : "Create Product"}
          </button>
        </div>
      </form>
    </div>
  );
}
