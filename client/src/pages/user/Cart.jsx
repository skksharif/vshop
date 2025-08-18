import React, { useEffect, useState } from "react";
import { fetchWithToken } from "../../api/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Cart.css";

export default function Cart() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [paymentOption, setPaymentOption] = useState("FULL_PAYMENT");

  // Fetch Cart
  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await fetchWithToken("/user/cart");
      const data = await res.json();
      if (data.success && data.cart) {
        setCart(data.cart);
      } else {
        setCart({ items: [] }); // set empty cart state
      }
    } catch (err) {
      console.error("Error fetching cart:", err);
      toast.error("Failed to fetch cart");
      setCart({ items: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);


  // Place Order
  const handlePlaceOrder = async () => {
    if (!cart || cart.items.length === 0) {
      toast.warning("Your cart is empty! Add products before placing order.");
      return;
    }

    const itemsToOrder = cart.items.map((item) => ({
      productId: item.product.id,
      variantId: item.variant?.id || null,
      quantity: item.quantity,
      price: item.product.price,
    }));

    const total = itemsToOrder.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    try {
      setPlacingOrder(true);
      const res = await fetchWithToken("/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: itemsToOrder, total, paymentOption }),
      });
      const data = await res.json();

      if (data.success) {
        toast.success("Order placed successfully!");
        setCart({ items: [] }); // clear cart
      } else {
        toast.error(data.message || "Failed to place order");
      }
    } catch (err) {
      console.error("Error placing order:", err);
      toast.error("Error placing order");
    } finally {
      setPlacingOrder(false);
    }
  };

  // Loading state
  if (loading)
    return (
      <div className="cart-loading-container">
        <p className="cart-loading">Loading cart items...</p>
      </div>
    );

  // Empty cart state
  if (!cart || cart.items.length === 0)
    return (
      <div className="cart-empty-container">
        <ToastContainer position="top-right" autoClose={3000} />
        <p className="cart-empty-text">Your cart is currently empty 🛒</p>
      </div>
    );

  const total = cart.items.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  return (
    <div className="cart-container">
      <ToastContainer position="top-right" autoClose={3000} />
      <h2 className="cart-title">My Cart</h2>

      <div className="cart-content">
        {/* Cart Items */}
        <div className="cart-left">
          {cart.items.map((item) => (
            <div key={item.id} className="cart-item">
              <img
                src={item.product.images[0]}
                alt={item.product.name}
                className="cart-item-img"
              />
              <div className="cart-item-details">
                <h3>{item.product.name}</h3>
                <p>₹{item.product.price}</p>
                <p>Qty: {item.quantity}</p>
                {item.variant && (
                  <p>
                    Color: {item.variant.color} | Size: {item.variant.size}
                  </p>
                )}
              </div>
              <div className="cart-item-subtotal">
                ₹{item.product.price * item.quantity}
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="cart-right">
          <h3>Order Summary</h3>
          <p>Total Items: {cart.items.length}</p>
          <p>Total Amount: ₹{total}</p>

          <div className="cart-payment">
            <label>
              Payment Option:
              <select
                value={paymentOption}
                onChange={(e) => setPaymentOption(e.target.value)}
              >
                <option value="FULL_PAYMENT">Full Payment</option>
                <option value="EMI_3_MONTH">EMI - 3 Months</option>
                <option value="EMI_6_MONTH">EMI - 6 Months</option>
              </select>
            </label>
          </div>

          <button
            className="cart-btn-order"
            onClick={handlePlaceOrder}
            disabled={placingOrder}
          >
            {placingOrder ? "Placing Order..." : "Place Order"}
          </button>
        </div>
      </div>
    </div>
  );
}
