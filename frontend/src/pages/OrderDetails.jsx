import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getOrderDetails, cancelOrder, getStatusColor, getStatusIcon } from '../api/orders';
import { formatDate, formatDateTime } from '../utils/dateUtils';
import ErrorMessage from '../components/ErrorMessage';

export default function OrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await getOrderDetails(orderId);
      setOrder(response.data);
    } catch (err) {
      setError('Failed to fetch order details');
      console.error('Error fetching order:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      setCancelling(true);
      await cancelOrder(orderId);
      
      // Update local state
      setOrder(prev => ({
        ...prev,
        status: 'cancelled',
        can_be_cancelled: false
      }));
      
      alert('Order cancelled successfully');
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert(error.response?.data?.detail || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  const getOrderTimeline = () => {
    const baseStatuses = [
      { status: 'pending', label: 'Order Placed', icon: '📝' },
      { status: 'confirmed', label: 'Order Confirmed', icon: '✅' },
      { status: 'processing', label: 'Processing', icon: '⚙️' },
      { status: 'shipped', label: 'Shipped', icon: '🚚' },
      { status: 'delivered', label: 'Delivered', icon: '📦' }
    ];

    const currentStatusIndex = baseStatuses.findIndex(s => s.status === order.status);
    
    return baseStatuses.map((statusItem, index) => ({
      ...statusItem,
      completed: index <= currentStatusIndex || order.status === 'delivered',
      current: statusItem.status === order.status,
      cancelled: order.status === 'cancelled'
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-purple-400/10 to-pink-400/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center min-h-64">
            <div className="glass-card rounded-3xl shadow-2xl border border-white/30 p-12 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
              </div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">
                Loading Order Details
              </h3>
              <p className="text-gray-600">Please wait while we fetch your order information...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-orange-50 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-red-400/10 to-pink-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-orange-400/10 to-red-400/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="glass-card rounded-3xl shadow-2xl border border-white/30 p-16 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-red-800 to-pink-700 bg-clip-text text-transparent mb-4">
              Order Not Found
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {error || 'The order you\'re looking for doesn\'t exist or may have been removed.'}
            </p>
            <Link 
              to="/orders"
              className="btn-primary relative overflow-hidden group"
            >
              <span className="relative z-10 flex items-center justify-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Orders
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
            </Link>
          </div>
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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <button 
                  onClick={() => navigate('/orders')}
                  className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-700 rounded-xl flex items-center justify-center text-white hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </button>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    Order #{order.order_number || order.id}
                  </h1>
                  <p className="text-gray-600 flex items-center mt-1">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Placed on {formatDate(order.created_at)}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <span className={`px-4 py-2 rounded-xl text-sm font-semibold shadow-lg ${getStatusColor(order.status)}`}>
                <span className="mr-2">{getStatusIcon(order.status)}</span>
                {order.status_display || order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('_', ' ')}
              </span>
              
              {order.can_be_cancelled && order.status !== 'cancelled' && (
                <button
                  onClick={handleCancelOrder}
                  disabled={cancelling}
                  className="bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold py-2 px-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                >
                  <span className="relative z-10">
                    {cancelling ? 'Cancelling...' : 'Cancel Order'}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="glass-card rounded-3xl shadow-2xl border border-white/30 p-6 mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('details')}
              className={`py-3 px-6 border-b-2 font-semibold text-sm rounded-t-xl transition-all duration-300 ${
                activeTab === 'details'
                  ? 'border-blue-500 text-blue-600 bg-gradient-to-t from-blue-50/50 to-transparent'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50/50'
              }`}
            >
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Order Details
              </span>
            </button>
            <button
              onClick={() => setActiveTab('tracking')}
              className={`py-3 px-6 border-b-2 font-semibold text-sm rounded-t-xl transition-all duration-300 ${
                activeTab === 'tracking'
                  ? 'border-blue-500 text-blue-600 bg-gradient-to-t from-blue-50/50 to-transparent'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50/50'
              }`}
            >
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                Order Tracking
              </span>
            </button>
            {order.invoice_number && (
              <button
                onClick={() => setActiveTab('invoice')}
                className={`py-3 px-6 border-b-2 font-semibold text-sm rounded-t-xl transition-all duration-300 ${
                  activeTab === 'invoice'
                    ? 'border-blue-500 text-blue-600 bg-gradient-to-t from-blue-50/50 to-transparent'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50/50'
                }`}
              >
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Invoice
                </span>
              </button>
            )}
          </nav>
        </div>        {/* Tab Content */}
        {activeTab === 'details' && <OrderDetailsTab order={order} navigate={navigate} />}
        {activeTab === 'tracking' && <OrderTrackingTab order={order} timeline={getOrderTimeline()} />}
        {activeTab === 'invoice' && <OrderInvoiceTab order={order} />}
      </div>
    </div>
  );
}

// Order Details Tab
function OrderDetailsTab({ order, navigate }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Order Items */}
      <div className="lg:col-span-2">
        <div className="glass-card rounded-3xl shadow-2xl border border-white/30 p-8">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-6 flex items-center">
            <svg className="w-6 h-6 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            Order Items
          </h3>
          <div className="space-y-6">
            {order.items?.map((item) => (
              <div key={item.id} className="bg-gradient-to-r from-gray-50/50 to-blue-50/50 p-6 rounded-2xl border border-gray-200/30 hover:shadow-lg transition-all duration-300">
                <div className="flex gap-6 pb-6 border-b border-gray-200/50 last:border-b-0">
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 bg-gradient-to-br from-gray-300 to-gray-500 rounded-2xl overflow-hidden border border-gray-200">
                      <img
                        src={item.product?.image || '/placeholder-product.svg'}
                        alt={item.product_title || item.product?.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = '/placeholder-product.svg';
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex-grow">
                    <Link 
                      to={`/product/${item.product?.id}`}
                      className="text-blue-600 hover:text-blue-800 font-semibold text-lg block mb-2 hover:underline transition-colors duration-300"
                    >
                      {item.product_title || item.product?.title}
                    </Link>
                    <p className="text-sm text-gray-600 mb-3 flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                      </svg>
                      SKU: {item.product?.sku || 'N/A'}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                      <div className="bg-white/60 p-3 rounded-xl border border-blue-200/50">
                        <span className="text-gray-600">Quantity:</span>
                        <span className="font-semibold ml-2">{item.quantity}</span>
                      </div>
                      <div className="bg-white/60 p-3 rounded-xl border border-blue-200/50">
                        <span className="text-gray-600">Price:</span>
                        <span className="font-semibold ml-2">${parseFloat(item.price).toFixed(2)}</span>
                      </div>
                      <div className="bg-white/60 p-3 rounded-xl border border-blue-200/50">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="font-bold ml-2 text-green-600">${parseFloat(item.subtotal).toFixed(2)}</span>
                      </div>
                    </div>
                    {item.is_fulfilled && (
                      <span className="inline-flex mt-3 px-3 py-1 text-xs font-semibold bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 rounded-xl border border-green-200 shadow-sm">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Fulfilled
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Order Summary */}
      <div className="space-y-6">
        {/* Payment & Shipping Summary */}
        <div className="glass-card rounded-3xl shadow-2xl border border-white/30 p-6">
          <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-6 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Order Summary
          </h3>
          <div className="bg-gradient-to-r from-gray-50/50 to-blue-50/50 p-4 rounded-2xl border border-gray-200/30">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">${parseFloat(order.subtotal || 0).toFixed(2)}</span>
              </div>
              {order.discount_amount > 0 && (
                <div className="flex justify-between items-center text-green-600">
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    Discount
                  </span>
                  <span className="font-semibold">-${parseFloat(order.discount_amount).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Shipping</span>
                <span className="font-semibold">${parseFloat(order.shipping_cost || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Tax</span>
                <span className="font-semibold">${parseFloat(order.tax_amount || 0).toFixed(2)}</span>
              </div>
              <div className="border-t pt-3 border-gray-200/50">
                <div className="flex justify-between items-center font-bold text-lg bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-xl border border-green-200">
                  <span>Total</span>
                  <span className="text-green-700">${parseFloat(order.total_amount).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Status */}
          <div className="mt-6 pt-4 border-t border-gray-200/50">
            <div className="bg-gradient-to-r from-purple-50/50 to-pink-50/50 p-4 rounded-2xl border border-purple-200/30">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-700 font-medium flex items-center">
                  <svg className="w-4 h-4 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  Payment Status
                </span>
                <span className={`px-3 py-1 rounded-xl text-sm font-semibold shadow-sm ${
                  order.is_paid 
                    ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200' 
                    : 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border border-yellow-200'
                }`}>
                  {order.is_paid ? (
                    <span className="flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Paid
                    </span>
                  ) : 'Pending'}
                </span>
              </div>
              {order.payment_method && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Payment Method</span>
                  <span className="capitalize font-medium bg-white/60 px-3 py-1 rounded-lg">{order.payment_method.replace('_', ' ')}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Shipping Information */}
        {order.shipping_address && (
          <div className="glass-card rounded-3xl shadow-2xl border border-white/30 p-6">
            <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-6 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Shipping Address
            </h3>
            <div className="bg-gradient-to-r from-gray-50/50 to-blue-50/50 p-4 rounded-2xl border border-gray-200/30">
              <div className="text-sm text-gray-600 space-y-1">
                {order.shipping_address.name && (
                  <p className="font-semibold text-gray-900 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {order.shipping_address.name}
                  </p>
                )}
                <p className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  {order.shipping_address.line1}
                </p>
                {order.shipping_address.line2 && (
                  <p className="ml-6">{order.shipping_address.line2}</p>
                )}
                <p className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}
                </p>
                <p className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {order.shipping_address.country}
                </p>
              </div>
            </div>
            
            {order.estimated_delivery_days && order.status !== 'delivered' && order.status !== 'cancelled' && (
              <div className="mt-6 pt-4 border-t border-gray-200/50">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-2xl border border-blue-200">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 font-medium flex items-center">
                      <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Estimated Delivery
                    </span>
                    <span className="font-bold text-blue-700">
                      {order.estimated_delivery_days === 0 ? 'Today' : 
                       order.estimated_delivery_days === 1 ? 'Tomorrow' :
                       `${order.estimated_delivery_days} days`}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="glass-card rounded-3xl shadow-2xl border border-white/30 p-6">
          <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-6 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Actions
          </h3>
          <div className="space-y-3">
            {order.tracking_number && (
              <Link
                to={`/track/${order.order_number || order.id}`}
                className="btn-primary w-full relative overflow-hidden group"
              >
                <span className="relative z-10 flex items-center justify-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  Track Package
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
              </Link>
            )}
            
            {order.status === 'delivered' && (
              <button className="btn-secondary w-full relative overflow-hidden group">
                <span className="relative z-10 flex items-center justify-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976-2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  Leave Review
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-100/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
              </button>
            )}
            
            <button 
              onClick={() => {
                console.log('Contact Support button clicked, order:', order);
                navigate('/contact', {
                  state: {
                    category: 'order_issue',
                    orderNumber: order?.order_number || order?.id,
                    subject: `Issue with Order #${order?.order_number || order?.id}`,
                    message: `I need assistance with my order #${order?.order_number || order?.id}${order?.created_at ? ` placed on ${formatDate(order.created_at)}` : ''}.\n\nOrder Status: ${order?.status_display || order?.status || 'Unknown'}\nTotal Amount: $${order?.total_amount ? parseFloat(order.total_amount).toFixed(2) : '0.00'}\n\nPlease describe your issue below:`
                  }
                });
              }}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 w-full relative overflow-hidden group">
              <span className="relative z-10 flex items-center justify-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Contact Support
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Order Tracking Tab
function OrderTrackingTab({ order, timeline }) {
  if (order.status === 'cancelled') {
    return (
      <div className="glass-card rounded-3xl shadow-2xl border border-white/30 p-12 text-center">
        <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-red-600 to-pink-600 rounded-2xl flex items-center justify-center">
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </div>
        <h3 className="text-2xl font-bold bg-gradient-to-r from-red-800 to-pink-700 bg-clip-text text-transparent mb-4">
          Order Cancelled
        </h3>
        <p className="text-gray-600 max-w-md mx-auto">
          This order was cancelled on {formatDate(order.updated_at || order.created_at)}. If you have any questions, please contact our support team.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-3xl shadow-2xl border border-white/30 p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2 flex items-center">
            <svg className="w-6 h-6 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            Order Tracking
          </h3>
          <p className="text-gray-600">
            Track your order progress and estimated delivery
          </p>
        </div>
        {order.tracking_number && (
          <div className="mt-4 sm:mt-0 bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-2xl border border-purple-200">
            <p className="text-sm font-medium text-purple-700 mb-1">Tracking Number</p>
            <p className="font-mono font-bold text-purple-900">{order.tracking_number}</p>
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="bg-gradient-to-r from-gray-50/50 to-blue-50/50 p-6 rounded-2xl border border-gray-200/30">
        <div className="relative">
          {timeline.map((step, index) => (
            <div key={step.status} className="relative flex items-start mb-8 last:mb-0">
              {/* Timeline line */}
              {index < timeline.length - 1 && (
                <div 
                  className={`absolute left-4 top-8 w-0.5 h-12 ${
                    step.completed && !step.cancelled ? 'bg-gradient-to-b from-green-500 to-green-400' : 'bg-gray-200'
                  }`} 
                />
              )}
              
              {/* Timeline dot */}
              <div 
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border-2 shadow-lg ${
                  step.current && !step.cancelled
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 border-blue-500 text-white'
                    : step.completed && !step.cancelled
                    ? 'bg-gradient-to-br from-green-500 to-green-600 border-green-500 text-white'
                    : 'bg-white border-gray-300 text-gray-500'
                }`}
              >
                {step.completed && !step.cancelled ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </div>
              
              {/* Timeline content */}
              <div className="ml-6 flex-grow">
                <div className="bg-white/60 p-4 rounded-xl border border-gray-200/50">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xl">{step.icon}</span>
                    <h4 className={`font-bold text-lg ${
                      step.current ? 'text-blue-600' : 
                      step.completed && !step.cancelled ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {step.label}
                    </h4>
                    {step.current && (
                      <span className="px-3 py-1 text-xs bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 rounded-full border border-blue-200 font-semibold">
                        Current
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">
                    {step.completed && !step.cancelled
                      ? `Completed on ${formatDate(order.updated_at || order.created_at)}`
                      : step.current
                      ? 'In progress'
                      : 'Pending'
                    }
                  </p>
                  
                  {step.status === 'shipped' && order.tracking_number && step.completed && (
                    <div className="mt-3 p-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-700 font-medium">
                        📦 Tracking number: {order.tracking_number}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Delivery Information */}
      {order.estimated_delivery_days && order.status !== 'delivered' && order.status !== 'cancelled' && (
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 className="font-bold text-blue-900 text-lg">Estimated Delivery</h4>
              <p className="text-blue-800">
                Your order is expected to arrive {' '}
                {order.estimated_delivery_days === 0 ? 'today' : 
                 order.estimated_delivery_days === 1 ? 'tomorrow' :
                 `in ${order.estimated_delivery_days} days`}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Order Invoice Tab
function OrderInvoiceTab({ order }) {
  return (
    <div className="glass-card rounded-3xl shadow-2xl border border-white/30 p-8">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-4 flex items-center">
            <svg className="w-8 h-8 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Invoice
          </h3>
          <div className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 p-4 rounded-2xl border border-blue-200/30">
            <p className="text-gray-700 font-medium">Invoice #: <span className="font-bold text-blue-700">{order.invoice_number}</span></p>
            <p className="text-gray-700 font-medium">Date: <span className="font-bold text-blue-700">{formatDate(order.created_at)}</span></p>
          </div>
        </div>
        <button className="btn-primary relative overflow-hidden group">
          <span className="relative z-10 flex items-center justify-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download PDF
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
        </button>
      </div>

      {/* Invoice Content */}
      <div className="bg-gradient-to-r from-gray-50/50 to-blue-50/50 p-6 rounded-2xl border border-gray-200/30">
        {/* Items */}
        <div className="overflow-x-auto">
          <table className="w-full mb-8">
            <thead>
              <tr className="border-b border-gray-300">
                <th className="text-left py-3 font-bold text-gray-900">Item</th>
                <th className="text-right py-3 font-bold text-gray-900">Qty</th>
                <th className="text-right py-3 font-bold text-gray-900">Price</th>
                <th className="text-right py-3 font-bold text-gray-900">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((item) => (
                <tr key={item.id} className="border-b border-gray-200">
                  <td className="py-4">
                    <div className="bg-white/60 p-3 rounded-xl border border-gray-200/50">
                      <p className="font-semibold text-gray-900">{item.product_title || item.product?.title}</p>
                      <p className="text-sm text-gray-600 flex items-center mt-1">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                        </svg>
                        SKU: {item.product?.sku || 'N/A'}
                      </p>
                    </div>
                  </td>
                  <td className="text-right py-4 font-semibold">{item.quantity}</td>
                  <td className="text-right py-4 font-semibold">${parseFloat(item.price).toFixed(2)}</td>
                  <td className="text-right py-4 font-bold text-green-600">${parseFloat(item.subtotal).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="border-t border-gray-300 pt-6">
          <div className="flex justify-end">
            <div className="w-80">
              <div className="bg-white/80 p-4 rounded-xl border border-gray-200/50 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Subtotal:</span>
                  <span className="font-semibold">${parseFloat(order.subtotal || 0).toFixed(2)}</span>
                </div>
                {order.discount_amount > 0 && (
                  <div className="flex justify-between items-center text-green-600">
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                      Discount:
                    </span>
                    <span className="font-semibold">-${parseFloat(order.discount_amount).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Shipping:</span>
                  <span className="font-semibold">${parseFloat(order.shipping_cost || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Tax:</span>
                  <span className="font-semibold">${parseFloat(order.tax_amount || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center font-bold text-xl bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-xl border border-green-200 border-t">
                  <span className="text-gray-900">Total:</span>
                  <span className="text-green-700">${parseFloat(order.total_amount).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
