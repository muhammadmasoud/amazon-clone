import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUserOrderHistory } from '../api/orders';
import { formatDate } from '../utils/dateUtils';
import ErrorMessage from '../components/ErrorMessage';

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrderHistory();
  }, []);

  const fetchOrderHistory = async () => {
    try {
      setLoading(true);
      const response = await getUserOrderHistory();
      setOrders(response.data);
    } catch (err) {
      setError('Failed to fetch order history');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return statusClasses[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Your Orders</h1>
          <Link 
            to="/"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Continue Shopping
          </Link>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="mb-4">
              <svg 
                className="mx-auto h-24 w-24 text-gray-400" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1} 
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" 
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Orders Yet</h3>
            <p className="text-gray-600 mb-6">You haven't placed any orders yet.</p>
            <Link 
              to="/"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                {/* Order Header */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-6">
                      <div>
                        <p className="text-sm text-gray-600">Order placed</p>
                        <p className="font-semibold">{formatDate(order.created_at)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total</p>
                        <p className="font-semibold">${parseFloat(order.total_amount).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Order #</p>
                        <p className="font-semibold">#{order.id}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                      {order.is_paid && (
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          Paid
                        </span>
                      )}
                      <Link 
                        to={`/orders/${order.id}`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6">
                  <div className="space-y-4">
                    {order.items && order.items.length > 0 ? (
                      order.items.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex items-center gap-4">
                          <div className="flex-shrink-0">
                            <img
                              src={item.product.thumbnail || '/placeholder-product.svg'}
                              alt={item.product.title}
                              className="w-16 h-16 object-cover rounded-lg border"
                              onError={(e) => {
                                e.target.src = '/placeholder-product.svg';
                              }}
                            />
                          </div>
                          <div className="flex-grow min-w-0">
                            <Link 
                              to={`/product/${item.product.id}`}
                              className="text-blue-600 hover:text-blue-800 font-medium text-sm block truncate"
                            >
                              {item.product.title}
                            </Link>
                            <p className="text-sm text-gray-600">
                              Quantity: {item.quantity} × ${parseFloat(item.price).toFixed(2)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">${parseFloat(item.subtotal).toFixed(2)}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-600">No items in this order</p>
                    )}
                    
                    {order.items && order.items.length > 3 && (
                      <div className="text-center pt-2">
                        <Link 
                          to={`/orders/${order.id}`}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          View {order.items.length - 3} more items
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
