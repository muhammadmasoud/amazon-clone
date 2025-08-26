import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const CheckoutPage = () => {
  const cartItems = useSelector((state) => state.cart.items);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [shipping, setShipping] = useState("123 Main St, Cairo, Egypt");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingCost = totalPrice > 100 ? 0 : 9.99;
  const grandTotal = (totalPrice + shippingCost).toFixed(2);
  const estimatedDelivery = new Date(Date.now() + 5 * 86400000).toDateString();

  const handleCheckout = async () => {
    const token = localStorage.getItem("token");
    setLoading(true);
    setError("");

    try {
      await axios.post(
        "http://localhost:8000/api/orders/",
        {
          shipping_address: shipping,
          payment_method: paymentMethod,
          cart: cartItems.map((item) => ({
            product_id: item.id,
            quantity: item.quantity,
          })),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      dispatch({ type: "CLEAR_CART" });
      navigate("/order-confirmation", {
        state: {
          orderData: {
            shipping_address: shipping,
            payment_method: paymentMethod,
            card_info:
              paymentMethod === "card"
                ? {
                    name: cardName,
                    last4: cardNumber.slice(-4),
                    expiry: cardExpiry,
                  }
                : {},
            items: cartItems,
            total: grandTotal,
            deliveryDate: estimatedDelivery,
          },
        },
      });
    } catch (err) {
      console.error(err);
      setError("❌ Failed to place the order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen p-4 sm:p-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded shadow-md">
          <h2 className="text-2xl font-semibold mb-6">Delivery Address</h2>
          <textarea
            value={shipping}
            onChange={(e) => setShipping(e.target.value)}
            placeholder="Street, City, ZIP, Country"
            className="w-full border border-gray-300 rounded p-3 min-h-[100px] mb-4"
          />

          <h2 className="text-2xl font-semibold mt-6 mb-4">Payment Method</h2>
          <div className="space-y-2 mb-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="payment"
                value="cash"
                checked={paymentMethod === "cash"}
                onChange={() => setPaymentMethod("cash")}
              />
              Cash on Delivery
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="payment"
                value="card"
                checked={paymentMethod === "card"}
                onChange={() => setPaymentMethod("card")}
              />
              Credit / Debit Card
            </label>
          </div>

          {paymentMethod === "card" && (
            <div className="space-y-4 mb-6">
              <input
                type="text"
                placeholder="Cardholder Name"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                className="w-full border border-gray-300 rounded p-2"
              />
              <input
                type="text"
                placeholder="Card Number"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                className="w-full border border-gray-300 rounded p-2"
              />
              <input
                type="text"
                placeholder="MM/YY"
                value={cardExpiry}
                onChange={(e) => setCardExpiry(e.target.value)}
                className="w-full border border-gray-300 rounded p-2"
              />
            </div>
          )}

          <button
            onClick={handleCheckout}
            disabled={loading || !shipping}
            className={`mt-6 w-full text-center py-3 font-bold rounded ${
              shipping
                ? "bg-yellow-400 hover:bg-yellow-500 text-black"
                : "bg-yellow-200 text-gray-500 cursor-not-allowed"
            }`}
          >
            {loading ? "Placing Order..." : "Place your order"}
          </button>

          {error && <p className="text-red-600 mt-4 text-sm">{error}</p>}
        </div>

        <div className="bg-white p-6 rounded shadow-md h-fit sticky top-10 text-sm sm:text-base">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          <ul className="divide-y divide-gray-200 mb-4 max-h-[250px] overflow-y-auto pr-1">
            {cartItems.map((item) => (
              <li key={item.id} className="py-2 text-sm flex gap-4">
                <img
                  src={item.image || "https://via.placeholder.com/50"}
                  alt={item.name}
                  className="w-12 h-12 object-cover rounded"
                />
                <div className="flex-1">
                  <div className="flex justify-between">
                    <span>{item.name}</span>
                    <span>x{item.quantity}</span>
                  </div>
                  <div className="text-right text-gray-500 text-xs">
                    ${item.price.toFixed(2)} each
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="border-t border-gray-300 pt-4 text-sm space-y-2">
            <div className="flex justify-between">
              <span>Items Total</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{shippingCost === 0 ? "Free" : `$${shippingCost}`}</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200">
              <span>Order Total</span>
              <span>${grandTotal}</span>
            </div>
            <div className="text-sm text-gray-500 pt-2">
              Estimated Delivery: <span className="font-medium">{estimatedDelivery}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
