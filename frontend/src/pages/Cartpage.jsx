import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { updateCartQuantity, removeFromCart } from "../redux/actions/cartActions";
import { placeOrder } from "../api/orders";
import { useState } from "react";

export default function Cartpage() {
  const cart = useSelector((state) => state.cart.items || []);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [shippingAddress, setShippingAddress] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = 10;
  const tax = 0.1 * subtotal;
  const total = subtotal + shipping + tax;

  const handleIncrease = (item) => {
    dispatch(updateCartQuantity(item.id, item.quantity + 1));
  };

  const handleCheckout = async () => {
    if (!shippingAddress.trim()) {
      alert('Please enter a shipping address');
      return;
    }

    setIsPlacingOrder(true);
    try {
      const orderData = {
        cart: cart.map(item => ({
          product_id: item.id,
          quantity: item.quantity
        })),
        shipping_address: shippingAddress
      };

      await placeOrder(orderData);
      alert('Order placed successfully!');
      navigate('/orders');
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handleDecrease = (item) => {
    if (item.quantity > 1) {
      dispatch(updateCartQuantity(item.id, item.quantity - 1));
    } else {
      dispatch(removeFromCart(item.id));
    }
  };

  return (
    <div className="container py-5">
      <h1 className="mb-5">Your Shopping Cart</h1>
      <div className="row">
        <div className="col-lg-8">
          <div className="card mb-4">
            <div className="card-body">
              {cart.length === 0 && <p>Your cart is empty.</p>}
              {cart.map((product) => (
                <div className="row cart-item mb-3" key={product.id}>
                  <div className="col-md-3">
                    <img
                      src={product.thumbnail}
                      alt={product.title}
                      className="img-fluid rounded"
                    />
                  </div>
                  <div className="col-md-5">
                    <h5 className="card-title">{product.title}</h5>
                    <p className="text-muted">Brand: {product.brand}</p>
                  </div>
                  <div className="col-md-2">
                    <div className="input-group">
                      <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => handleDecrease(product)}
                      >
                        -
                      </button>
                      <input
                        type="text"
                        className="form-control form-control-sm text-center"
                        value={product.quantity}
                        readOnly
                      />
                      <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => handleIncrease(product)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="col-md-2 text-end">
                    <p className="fw-bold">
                      ${(product.price * product.quantity).toFixed(2)}
                    </p>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => dispatch(removeFromCart(product.id))}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-start mb-4">
            <Link to="/" className="btn btn-outline-primary">
              <i className="bi bi-arrow-left me-2"></i>Continue Shopping
            </Link>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title mb-4">Order Summary</h5>
              <div className="d-flex justify-content-between mb-3">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between mb-3">
                <span>Shipping</span>
                <span>${shipping.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between mb-3">
                <span>Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between mb-4">
                <strong>Total</strong>
                <strong>${total.toFixed(2)}</strong>
              </div>
              {!showCheckout ? (
                <button 
                  className="btn btn-primary w-100"
                  onClick={() => setShowCheckout(true)}
                  disabled={cart.length === 0}
                >
                  Proceed to Checkout
                </button>
              ) : (
                <div>
                  <div className="mb-3">
                    <label htmlFor="shippingAddress" className="form-label">Shipping Address</label>
                    <textarea
                      id="shippingAddress"
                      className="form-control"
                      rows="3"
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      placeholder="Enter your full shipping address..."
                    />
                  </div>
                  <div className="d-flex gap-2">
                    <button 
                      className="btn btn-secondary flex-fill"
                      onClick={() => setShowCheckout(false)}
                      disabled={isPlacingOrder}
                    >
                      Back
                    </button>
                    <button 
                      className="btn btn-success flex-fill"
                      onClick={handleCheckout}
                      disabled={isPlacingOrder || !shippingAddress.trim()}
                    >
                      {isPlacingOrder ? 'Placing Order...' : 'Place Order'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="card mt-4">
            <div className="card-body">
              <h5 className="card-title mb-3">Apply Promo Code</h5>
              <div className="input-group mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter promo code"
                />
                <button className="btn btn-outline-secondary" type="button">
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
