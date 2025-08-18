import { useState } from "react";
import "./ProductCard.css";

export default function ProductCard({ product, onAddToCart }) {
  const [showFullDesc, setShowFullDesc] = useState(false);

  const toggleDesc = (e) => {
    e.stopPropagation(); // prevent card click
    setShowFullDesc(!showFullDesc);
  };

  return (
    <div className="pc-card">
      <div className="pc-image-wrapper">
        <img src={product.images[0]} alt={product.name} className="pc-image" />
      </div>
      <div className="pc-details">
        <h3 className="pc-name">{product.name}</h3>
        <p className="pc-price">₹{product.price}</p>
        <p className={`pc-desc ${showFullDesc ? "show-full" : ""}`}>
          {product.description}
        </p>
        {product.description.length > 80 && (
          <button className="pc-btn-read" onClick={toggleDesc}>
            {showFullDesc ? "Show Less" : "Read More"}
          </button>
        )}
      </div>
      <button
        className="pc-btn-add"
        onClick={(e) => {
          e.stopPropagation();
          onAddToCart(product);
        }}
      >
        Add to Cart
      </button>
    </div>
  );
}
