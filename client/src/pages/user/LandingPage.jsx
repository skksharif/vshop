import { useNavigate } from "react-router-dom";
import "./LandingPage.css";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <section className="hero">
      <div className="hero-content">
        <h1 className="brand-title">Village Angel</h1>
        <p className="brand-tagline">
          Authentic Boutique Dresses – Where Elegance Meets Tradition
        </p>
        <div className="hero-buttons">
          <a href="#products" className="btn-gold" >
            Shop Now
          </a>
          <button className="btn-outline" onClick={() => navigate("/cart")}>
            Goto Cart
          </button>
        </div>
      </div>

      <div className="hero-image">
        <img
          src="/women.png"
          alt="Village Angel Boutique"
        />
      </div>
    </section>
  );
}
