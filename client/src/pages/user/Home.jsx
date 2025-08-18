import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchWithToken } from "../../api/api";

import CategoryChips from "../../components/CategoryChips";
import ProductCard from "../../components/ProductCard";
import { ToastContainer, toast } from "react-toastify";

import "./Home.css";
import LandingPage from "./LandingPage";

export default function Home() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all"); // ✅ default to "all"
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]); // ✅ store all products separately
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Redirect admin users
  useEffect(() => {
    const userRole = localStorage.getItem("role");
    if (userRole === "ADMIN") {
      navigate("/admin");
    }
  }, [navigate]);

  const handleViewProduct = (productId) => {
    navigate(`/product/${productId}`);
  };

  // ✅ Fetch categories
  useEffect(() => {
    const loadCategories = async () => {
      const res = await fetchWithToken("/category/getCatergory");
      if (res.ok) {
        const data = await res.json();
        // prepend "All" category manually
        setCategories([{ id: "all", name: "All" }, ...data.categories]);
      }
    };
    loadCategories();
  }, []);

  // ✅ Fetch all products initially
  useEffect(() => {
    const loadAllProducts = async () => {
      setLoading(true);
      const res = await fetchWithToken("/category/getallproducts");
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products);
        setAllProducts(data.products); // keep a master copy
      }
      setLoading(false);
    };
    loadAllProducts();
  }, []);

  // ✅ Fetch products when a category is selected
  useEffect(() => {
    if (selectedCategory === "all") {
      setProducts(allProducts); // show all
      return;
    }

    const loadProducts = async () => {
      setLoading(true);
      const res = await fetchWithToken(
        `/category/products-by-category?categoryId=${selectedCategory}`
      );
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products);
      } else {
        setProducts([]);
      }
      setLoading(false);
    };

    loadProducts();
  }, [selectedCategory, allProducts]);

  // ✅ Add to Cart
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
    <>
     <LandingPage/>
      <div className="home-container" id="products">
        <ToastContainer position="top-right" autoClose={3000} />
        <h1 className="page-title">Village Angel</h1>
        <p className="subtitle">Authentic products crafted with tradition</p>

        {/* ✅ Chips include "All" */}
        <CategoryChips
          categories={categories}
          selectedCategory={selectedCategory}
          onSelect={setSelectedCategory}
        />

        {loading ? (
          <div className="loader"></div>
        ) : (
          <div className="products-list">
            {products.length > 0 ? (
              products.map((product) => (
                <div
                  key={product.id}
                  className="product-card-wrapper"
                  onClick={() => handleViewProduct(product.id)}
                  style={{ cursor: "pointer" }}
                >
                  <ProductCard
                    product={product}
                    onAddToCart={handleAddToCart}
                  />
                </div>
              ))
            ) : (
              <p className="no-products">No products available.</p>
            )}
          </div>
        )}
      </div>
    </>
  );
}
