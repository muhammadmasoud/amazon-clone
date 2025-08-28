import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUserOrderHistory, getStatusColor, getStatusIcon } from '../api/orders';
import { useAuth } from '../context/AuthContext';

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    date_from: '',
    date_to: ''
  });
  const { isAuthenticated, user } = useAuth();

  const fetchOrders = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await getUserOrderHistory(filters);
      setOrders(response.data.results || response.data || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.response?.data?.detail || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [isAuthenticated, filters]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden flex items-center justify-center">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-purple-400/10 to-pink-400/10 rounded-full blur-3xl"></div>
        
        <div className="glass-card rounded-3xl shadow-2xl border border-white/30 p-12 text-center max-w-md mx-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-4">
            Sign in to view your orders
          </h2>
          <p className="text-gray-600 mb-8">Access your order history and track your purchases</p>
          <Link 
            to="/login"
            className="btn-primary relative overflow-hidden group"
          >
            <span className="relative z-10 flex items-center justify-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14" />
              </svg>
              Sign In
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden flex items-center justify-center">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-purple-400/10 to-pink-400/10 rounded-full blur-3xl"></div>
        
        <div className="glass-card rounded-3xl shadow-2xl border border-white/30 p-12 text-center max-w-md mx-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
          </div>
          <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">
            Loading Orders
          </h3>
          <p className="text-gray-600">Please wait while we fetch your order history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-orange-50 relative overflow-hidden flex items-center justify-center">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-red-400/10 to-pink-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-orange-400/10 to-red-400/10 rounded-full blur-3xl"></div>
        
        <div className="glass-card rounded-3xl shadow-2xl border border-white/30 p-12 text-center max-w-md mx-4">
          <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-red-800 to-pink-700 bg-clip-text text-transparent mb-4">
            Error Loading Orders
          </h3>
          <p className="text-gray-600 mb-8">{error}</p>
          <button 
            onClick={fetchOrders}
            className="bg-gradient-to-r from-red-600 to-pink-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 relative overflow-hidden group"
          >
            <span className="relative z-10 flex items-center justify-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Try Again
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden py-8">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-purple-400/10 to-pink-400/10 rounded-full blur-3xl"></div>
      <div className="absolute top-1/3 right-1/3 w-72 h-72 bg-gradient-to-r from-cyan-400/5 to-blue-400/5 rounded-full blur-2xl"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="glass-card rounded-3xl shadow-2xl border border-white/30 p-8 mb-8">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Your Orders
              </h1>
              <p className="text-gray-600 mt-1 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {orders.length} orders total
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="glass-card rounded-3xl shadow-2xl border border-white/30 p-6 mb-8">
          <div className="flex items-center mb-4">
            <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
            </svg>
            <h2 className="text-lg font-semibold text-gray-900">Filter Orders</h2>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 p-4 rounded-2xl border border-blue-200/30">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="status" className="block text-sm font-semibold text-gray-700 mb-2">
                  Filter by Status
                </label>
                <select
                  id="status"
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="input-field"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label htmlFor="date_from" className="block text-sm font-semibold text-gray-700 mb-2">
                  From Date
                </label>
                <input
                  type="date"
                  id="date_from"
                  value={filters.date_from}
                  onChange={(e) => setFilters(prev => ({ ...prev, date_from: e.target.value }))}
                  className="input-field"
                />
              </div>
              <div>
                <label htmlFor="date_to" className="block text-sm font-semibold text-gray-700 mb-2">
                  To Date
                </label>
                <input
                  type="date"
                  id="date_to"
                  value={filters.date_to}
                  onChange={(e) => setFilters(prev => ({ ...prev, date_to: e.target.value }))}
                  className="input-field"
                />
              </div>
            </div>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="glass-card rounded-3xl shadow-2xl border border-white/30 p-16 text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-400 to-gray-600 rounded-3xl flex items-center justify-center">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-4">
              No Orders Yet
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              You haven't placed any orders yet. Start exploring our amazing products and make your first purchase!
            </p>
            <Link 
              to="/"
              className="btn-primary relative overflow-hidden group"
            >
              <span className="relative z-10 flex items-center justify-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Start Shopping
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="glass-card rounded-3xl shadow-2xl border border-white/30 overflow-hidden hover:shadow-3xl transition-all duration-300 transform hover:scale-[1.02]">
                <div className="p-8">
                  {/* Order Header */}
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 pb-6 border-b border-gray-200/50">
                    <div className="flex items-center mb-4 lg:mb-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mr-4">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                          Order #{order.order_number}
                        </h3>
                        <p className="text-gray-600 flex items-center mt-1">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Placed on {formatDate(order.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                      <span className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold ${getStatusColor(order.status)} shadow-lg`}>
                        <span className="mr-2">{getStatusIcon(order.status)}</span>
                        {order.status_display || order.status}
                      </span>
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-2 rounded-xl border border-green-200">
                        <span className="text-xl font-bold bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent">
                          {formatPrice(order.total_amount)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="mb-6">
                    <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      Items Ordered
                    </h4>
                    <div className="bg-gradient-to-r from-gray-50/50 to-blue-50/50 p-4 rounded-2xl border border-gray-200/30">
                      <div className="space-y-3">
                        {order.items?.map((item, index) => (
                          <div key={index} className="flex items-center justify-between bg-white/60 p-4 rounded-xl border border-gray-200/50">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-gradient-to-br from-gray-300 to-gray-500 rounded-xl flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">
                                  {item.product_title || item.product?.title}
                                </p>
                                <p className="text-sm text-gray-600 flex items-center">
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                                  </svg>
                                  Quantity: {item.quantity}
                                </p>
                              </div>
                            </div>
                            <span className="font-bold text-gray-900 bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-1 rounded-lg border border-blue-200">
                              {formatPrice(item.price * item.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Payment Info & Actions */}
                  <div className="border-t border-gray-200/50 pt-6 flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-4 py-3 rounded-xl border border-purple-200">
                      <div className="flex items-center text-gray-700">
                        <svg className="w-4 h-4 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        <span className="font-medium">
                          Payment: {order.payment_method?.replace('_', ' ')?.toUpperCase() || 'N/A'}
                        </span>
                        {order.is_paid && (
                          <span className="text-green-600 ml-2 flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Paid
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                      <Link
                        to={`/orders/${order.id}`}
                        className="btn-secondary relative overflow-hidden group"
                      >
                        <span className="relative z-10 flex items-center justify-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View Details
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-100/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
                      </Link>
                      {order.tracking_number && (
                        <Link
                          to={`/track/${order.order_number}`}
                          className="btn-primary relative overflow-hidden group"
                        >
                          <span className="relative z-10 flex items-center justify-center">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Track Order
                          </span>
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
                        </Link>
                      )}
                    </div>
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
