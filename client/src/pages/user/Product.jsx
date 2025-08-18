import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchWithToken } from "../../api/api";
import { ToastContainer, toast } from "react-toastify";
import "./Product.css";

export default function Product() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetchWithToken(`/category/getproduct?productId=${id}`);
        const data = await res.json();
        setProduct(data.product);
      } catch (err) {
        console.error("Error fetching product:", err);
        toast.error("Failed to load product");
      }
    };
    fetchProduct();
  }, [id]);

  if (!product) return <p className="product-loading">Loading product...</p>;

  const handleThumbnailClick = (index) => setMainImageIndex(index);

  const handleAddToCart = () => {
    if (product.sizes.length > 0 && !selectedSize) {
      toast.warning(" Please select a size.");
      return;
    }

    // Here you can integrate your cart logic, e.g., updating context or local storage
    console.log({
      productId: product.id,
      name: product.name,
      price: product.price,
      size: selectedSize,
      quantity,
    });

    toast.success(" Product added to cart!");
  };

  return (
    <div className="product-page-container">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="product-content">
        {/* Images */}
        <div className="product-images">
          <div className="product-main-image">
            <img src={product.images[mainImageIndex]} alt={product.name} />
          </div>
          <div className="product-thumbnails">
            {product.images.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`${product.name} ${idx}`}
                className={`thumbnail ${idx === mainImageIndex ? "active-thumb" : ""}`}
                onClick={() => handleThumbnailClick(idx)}
              />
            ))}
          </div>
        </div>

        {/* Product Details */}
        <div className="product-details">
          <h1 className="product-title">{product.name}</h1>

          {/* Category */}
          {product.category && (
            <div className="product-category">
              <strong>Category:</strong> {product.category.name}
              {product.category.image && (
                <img
                  src={product.category.image}
                  alt={product.category.name}
                  className="category-img"
                />
              )}
            </div>
          )}

          {/* Price & Color */}
          <p className="product-price">Price: ₹{product.price}</p>
          {product.color && <p className="product-color">Color: {product.color}</p>}

          {/* Sizes */}
          {product.sizes.length > 0 && (
            <div className="product-sizes">
              <strong>Sizes:</strong>
              <div className="sizes-list">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    className={`size-btn ${selectedSize === s ? "selected-size" : ""}`}
                    onClick={() => setSelectedSize(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="product-quantity">
            <label>Quantity: </label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
            />
          </div>

          {/* Description */}
          <p className="product-description">{product.description}</p>

          {/* Status */}
          <p className={`product-status ${product.isActive ? "active" : "inactive"}`}>
            {product.isActive ? "Active" : "Inactive"}
          </p>

          {/* Add to Cart */}
          <button className="add-cart-btn" onClick={handleAddToCart}>
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
