import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchWithToken } from "../../api/api";

import CategoryChips from "../../components/CategoryChips";
import ProductCard from "../../components/ProductCard";
import { ToastContainer, toast } from "react-toastify";

import "./Home.css";

export default function Home() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);

  // Check user role on mount
  useEffect(() => {
    const userRole = localStorage.getItem("role"); // e.g., "ADMIN" or "USER"
    if (userRole === "ADMIN") {
      navigate("/admin");
    }
  }, [navigate]);

  const handleViewProduct = (productId) => {
    navigate(`/product/${productId}`);
  };

  // Fetch categories
  useEffect(() => {
    const loadCategories = async () => {
      const res = await fetchWithToken("/category/getCatergory");
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories);
      }
    };
    loadCategories();
  }, []);

  // Fetch products for selected category
  useEffect(() => {
    if (!selectedCategory) return;
    const loadProducts = async () => {
      const res = await fetchWithToken(
        `/category/products-by-category?categoryId=${selectedCategory}`
      );
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products);
      } else {
        setProducts([]);
      }
    };
    loadProducts();
  }, [selectedCategory]);

  // Add to Cart
  const handleAddToCart = async (product) => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const res = await fetchWithToken("/user/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          variantId: product.variants?.[0]?.id || null,
          quantity: 1,
          price: product.price,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(" Added to cart!");
        setCart((prev) => [...prev, data.item]);
      } else {
        alert("Failed to add to cart");
      }
    } catch (err) {
      console.error("Error adding to cart:", err);
    }
  };

  return (
    <div className="home-container">
        <ToastContainer position="top-right" autoClose={3000} />
      <h1 className="page-title">Shop by Category</h1>

      <CategoryChips
        categories={categories}
        selectedCategory={selectedCategory}
        onSelect={setSelectedCategory}
      />

      <div className="products-list">
        {products.length > 0 ? (
          products.map((product) => (
            <div
              key={product.id}
              className="product-card-wrapper"
              onClick={() => handleViewProduct(product.id)}
              style={{ cursor: "pointer" }}
            >
              <ProductCard product={product} onAddToCart={handleAddToCart} />
            </div>
          ))
        ) : (
          <p className="no-products">
            No products available. Select a category.
          </p>
        )}
      </div>
    </div>
  );
}
