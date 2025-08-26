import React from "react";
import { useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";

const getCardBrand = (number) => {
  if (!number) return null;
  const firstDigit = number[0];
  const firstTwo = number.slice(0, 2);
  if (firstDigit === "4") return "Visa";
  if (["51", "52", "53", "54", "55"].includes(firstTwo)) return "MasterCard";
  if (["34", "37"].includes(firstTwo)) return "AmEx";
  return "Card";
};

const OrderConfirmation = () => {
  const location = useLocation();
  const orderData = location.state?.orderData || {};

  const {
    shipping_address = "[Hidden for demo]",
    payment_method = "cash",
    card_info = {},
    items = [],
    total = 0,
    deliveryDate = new Date(Date.now() + 5 * 86400000).toDateString(),
  } = orderData;

  const cardBrand = getCardBrand(card_info?.last4);

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center bg-white p-4 sm:p-6"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <img
        src="https://img.icons8.com/emoji/96/000000/check-mark-emoji.png"
        alt="Success"
        className="mb-4 sm:mb-6"
      />
      <h1 className="text-2xl sm:text-3xl font-bold text-green-600 mb-2">Order Confirmed</h1>
      <p className="text-gray-600 mb-6 text-center max-w-md text-sm sm:text-base">
        Your order was successfully placed.<br />
        Estimated delivery by <span className="font-medium">{deliveryDate}</span>.
      </p>

      <div className="w-full max-w-2xl border rounded shadow p-4 mb-6 bg-gray-50 text-sm sm:text-base">
        <h2 className="text-lg font-semibold mb-2">Order Summary</h2>

        <div className="mb-2">
          <strong>Shipping Address:</strong>
          <p className="text-gray-700">{shipping_address}</p>
        </div>

        <div className="mb-4">
          <strong>Payment Method:</strong> {payment_method === "card" ? "Credit / Debit Card" : "Cash on Delivery"}
          {payment_method === "card" && card_info && (
            <div className="text-gray-600 mt-2 ml-2 space-y-1">
              <p>
                <strong>Card:</strong> {cardBrand} ending in {card_info.last4} {cardBrand && (
                  <img
                    src={`https://img.icons8.com/color/32/000000/${cardBrand.toLowerCase()}-credit-card.png`}
                    alt={cardBrand}
                    className="inline-block ml-2 w-6 h-6 align-middle"
                  />
                )}
              </p>
              <p><strong>Name on Card:</strong> {card_info.name}</p>
              <p><strong>Expiry:</strong> {card_info.expiry}</p>
            </div>
          )}
        </div>

        <ul className="divide-y divide-gray-200 mb-4">
          {items.map((item, idx) => (
            <li key={idx} className="py-2 flex justify-between">
              <span>{item.name}</span>
              <span>x{item.quantity}</span>
            </li>
          ))}
        </ul>

        <div className="text-right font-semibold">Total: ${total}</div>
      </div>

      <Link to="/">
        <button className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 px-6 rounded">
          Continue Shopping
        </button>
      </Link>
    </motion.div>
  );
};

export default OrderConfirmation;
