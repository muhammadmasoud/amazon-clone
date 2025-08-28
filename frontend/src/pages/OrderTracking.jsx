import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { trackOrder } from '../api/orders';

// Safe date formatting function
const formatDate = (dateString) => {
  try {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid Date';
  }
};

export default function OrderTracking() {
  const { orderNumber } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [trackingInput, setTrackingInput] = useState(orderNumber || '');

  console.log('OrderTracking render:', { orderNumber, loading, error, hasOrder: !!order });

  useEffect(() => {
    console.log('OrderTracking useEffect triggered:', orderNumber);
    if (orderNumber) {
      handleTrackOrder(orderNumber);
    } else {
      setLoading(false);
    }
  }, [orderNumber]);

  const handleTrackOrder = async (trackingNumber = trackingInput) => {
    console.log('handleTrackOrder called with:', trackingNumber);
    
    if (!trackingNumber.trim()) {
      setError('Please enter a valid order number');
      return;
    }

    try {
      setLoading(true);
      setError('');
      console.log('Making API call to track order:', trackingNumber);
      const response = await trackOrder(trackingNumber);
      console.log('API response received:', response);
      console.log('Response data:', response.data);
      console.log('Order object:', response.data.order);
      
      // The API returns { order: {...}, timeline: [...] }
      // So we need to access response.data.order, not response.data
      const orderData = response.data.order || response.data;
      console.log('Processed order data:', orderData);
      setOrder(orderData);
    } catch (err) {
      console.error('Error tracking order:', err);
      const errorMessage = err.response?.data?.detail || 'Order not found. Please check your order number and try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getOrderTimeline = () => {
    console.log('getOrderTimeline called with order:', order);
    if (!order) return [];

    try {
      const baseStatuses = [
        { status: 'pending', label: 'Order Placed', icon: '📝', description: 'Your order has been received and is being processed' },
        { status: 'confirmed', label: 'Order Confirmed', icon: '✅', description: 'Your order has been confirmed and is being prepared' },
        { status: 'processing', label: 'Processing', icon: '⚙️', description: 'Your order is being prepared for shipment' },
        { status: 'packed', label: 'Packed', icon: '📦', description: 'Your order has been packed and is ready for pickup' },
        { status: 'shipped', label: 'Shipped', icon: '🚚', description: 'Your order is on its way' },
        { status: 'out_for_delivery', label: 'Out for Delivery', icon: '🛻', description: 'Your order is out for delivery' },
        { status: 'delivered', label: 'Delivered', icon: '✅', description: 'Your order has been delivered' }
      ];

      const currentStatusIndex = baseStatuses.findIndex(s => s.status === (order.status || 'pending'));
      
      return baseStatuses.map((statusItem, index) => ({
        ...statusItem,
        completed: index <= currentStatusIndex || (order.status === 'delivered'),
        current: statusItem.status === (order.status || 'pending'),
        cancelled: order.status === 'cancelled'
      }));
    } catch (error) {
      console.error('Error in getOrderTimeline:', error);
      return [];
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
      processing: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      packed: 'bg-purple-100 text-purple-800 border-purple-200',
      shipped: 'bg-orange-100 text-orange-800 border-orange-200',
      out_for_delivery: 'bg-pink-100 text-pink-800 border-pink-200',
      delivered: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden py-8">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-purple-400/10 to-pink-400/10 rounded-full blur-3xl"></div>
      <div className="absolute top-1/3 right-1/3 w-72 h-72 bg-gradient-to-r from-cyan-400/5 to-blue-400/5 rounded-full blur-2xl"></div>
      
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="glass-card rounded-3xl shadow-2xl border border-white/30 p-8 mb-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-4">
            Track Your Order
          </h1>
          <p className="text-gray-600 max-w-md mx-auto">
            Enter your order number to track your package and get real-time updates on your delivery status
          </p>
        </div>

        {/* Track Order Form */}
        <div className="glass-card rounded-3xl shadow-2xl border border-white/30 p-8 mb-8">
          <div className="flex items-center mb-6">
            <svg className="w-6 h-6 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h2 className="text-xl font-bold text-gray-900">Order Lookup</h2>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 p-6 rounded-2xl border border-blue-200/30">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-grow">
                <label htmlFor="tracking-input" className="block text-sm font-semibold text-gray-700 mb-2">
                  Order Number
                </label>
                <input
                  id="tracking-input"
                  type="text"
                  value={trackingInput}
                  onChange={(e) => setTrackingInput(e.target.value)}
                  placeholder="Enter your order number (e.g., ORD-123456)"
                  className="input-field"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleTrackOrder();
                    }
                  }}
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => handleTrackOrder()}
                  disabled={loading}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                >
                  <span className="relative z-10 flex items-center justify-center">
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Tracking...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        Track Order
                      </>
                    )}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
                </button>
              </div>
            </div>
          </div>
          
          {error && (
            <div className="mt-6 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl shadow-sm">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">{error}</span>
              </div>
            </div>
          )}
        </div>

        {/* Order Details */}
        {order && (
          <div className="space-y-8">
            {/* Order Information */}
            <div className="glass-card rounded-3xl shadow-2xl border border-white/30 p-8">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-6 flex items-center">
                <svg className="w-6 h-6 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Order Information
              </h3>
              
              <div className="bg-gradient-to-r from-gray-50/50 to-blue-50/50 p-6 rounded-2xl border border-gray-200/30">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white/60 p-4 rounded-xl border border-blue-200/50">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                      <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                      </svg>
                      Order Number
                    </h4>
                    <p className="text-lg font-bold text-gray-900">#{order.order_number || order.id || 'N/A'}</p>
                  </div>
                  <div className="bg-white/60 p-4 rounded-xl border border-blue-200/50">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                      <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Order Date
                    </h4>
                    <p className="text-lg font-bold text-gray-900">{formatDate(order.created_at)}</p>
                  </div>
                  <div className="bg-white/60 p-4 rounded-xl border border-blue-200/50">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                      <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      Status
                    </h4>
                    <span className={`inline-flex px-3 py-1 rounded-xl text-sm font-semibold shadow-sm border ${getStatusColor(order.status || 'pending')}`}>
                      {order.status_display || (order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('_', ' ') : 'Pending')}
                    </span>
                  </div>
                  <div className="bg-white/60 p-4 rounded-xl border border-blue-200/50">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                      <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                      Total Amount
                    </h4>
                    <p className="text-lg font-bold text-green-600">${order.total_amount ? parseFloat(order.total_amount).toFixed(2) : '0.00'}</p>
                  </div>
                </div>
              </div>

              {order.tracking_number && (
                <div className="mt-6 pt-6 border-t border-gray-200/50">
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-200">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h4 className="text-sm font-semibold text-purple-700 mb-1 flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Carrier Tracking Number
                        </h4>
                        <p className="text-lg font-mono font-bold text-purple-900">{order.tracking_number}</p>
                      </div>
                      {order.carrier_name && (
                        <div className="mt-4 sm:mt-0 text-left sm:text-right">
                          <h4 className="text-sm font-semibold text-purple-700 mb-1">Carrier</h4>
                          <p className="text-lg font-bold text-purple-900">{order.carrier_name}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {(order.estimated_delivery_days || order.estimated_delivery_days === 0) && (order.status || 'pending') !== 'delivered' && (order.status || 'pending') !== 'cancelled' && (
                <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-blue-900 text-lg">Estimated Delivery</h4>
                      <p className="text-blue-800 font-medium">
                        Expected to arrive {' '}
                        {order.estimated_delivery_days === 0 ? 'today' : 
                         order.estimated_delivery_days === 1 ? 'tomorrow' :
                         `in ${order.estimated_delivery_days} days`}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Order Timeline */}
            {(order.status || 'pending') !== 'cancelled' ? (
              <div className="glass-card rounded-3xl shadow-2xl border border-white/30 p-8">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-6 flex items-center">
                  <svg className="w-6 h-6 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Order Progress
                </h3>
                
                <div className="bg-gradient-to-r from-gray-50/50 to-blue-50/50 p-6 rounded-2xl border border-gray-200/30">
                  <div className="relative">
                    {getOrderTimeline().map((step, index) => (
                      <div key={step.status} className="relative flex items-start pb-8 last:pb-0">
                        {/* Timeline line */}
                        {index < getOrderTimeline().length - 1 && (
                          <div 
                            className={`absolute left-4 top-8 w-0.5 h-16 ${
                              step.completed ? 'bg-gradient-to-b from-green-500 to-green-400' : 'bg-gray-200'
                            }`} 
                          />
                        )}
                        
                        {/* Timeline dot */}
                        <div 
                          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border-2 shadow-lg ${
                            step.current
                              ? 'bg-gradient-to-br from-blue-500 to-blue-600 border-blue-500 text-white'
                              : step.completed
                              ? 'bg-gradient-to-br from-green-500 to-green-600 border-green-500 text-white'
                              : 'bg-white border-gray-300 text-gray-500'
                          }`}
                        >
                          {step.completed ? (
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
                                step.completed ? 'text-green-600' : 'text-gray-500'
                              }`}>
                                {step.label}
                              </h4>
                              {step.current && (
                                <span className="px-3 py-1 text-xs bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 rounded-full border border-blue-200 font-semibold">
                                  Current Status
                                </span>
                              )}
                            </div>
                            
                            <p className="text-sm text-gray-600 mb-2">
                              {step.description}
                            </p>
                            
                            <p className="text-xs text-gray-500">
                              {step.completed
                                ? `Completed on ${formatDate(order.updated_at || order.created_at)}`
                                : step.current
                                ? 'In progress'
                                : 'Pending'
                              }
                            </p>
                            
                            {step.status === 'shipped' && order.tracking_number && step.completed && (
                              <div className="mt-3 p-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                                <p className="text-sm text-blue-700 font-medium">
                                  📦 Tracking: {order.tracking_number}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
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
                  This order was cancelled on {formatDate(order.updated_at || order.created_at)}. If you have any questions about this cancellation, please contact our support team.
                </p>
              </div>
            )}

            {/* Order Items */}
            {order.items && order.items.length > 0 && (
              <div className="glass-card rounded-3xl shadow-2xl border border-white/30 p-8">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-6 flex items-center">
                  <svg className="w-6 h-6 mr-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  Order Items ({order.items.length})
                </h3>
                
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div 
                      key={item.id} 
                      className="group bg-gradient-to-r from-white/60 to-gray-50/60 p-6 rounded-2xl border border-gray-200/50 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
                    >
                      <div className="flex items-start gap-6">
                        <div className="flex-shrink-0 w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden shadow-lg">
                          <img
                            src={item.product?.image || '/placeholder-product.svg'}
                            alt={item.product_title || item.product?.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            onError={(e) => {
                              e.target.src = '/placeholder-product.svg';
                            }}
                          />
                        </div>
                        
                        <div className="flex-grow">
                          <div className="flex justify-between items-start mb-3">
                            <h4 className="font-bold text-lg text-gray-900 hover:text-blue-600 transition-colors cursor-pointer">
                              {item.product_title || item.product?.title}
                            </h4>
                            {item.is_fulfilled && (
                              <span className="px-3 py-1 text-xs font-semibold bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 rounded-full border border-green-200 shadow-sm">
                                ✓ Fulfilled
                              </span>
                            )}
                          </div>
                          
                          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                              </svg>
                              <span>Qty: {item.quantity}</span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                              </svg>
                              <span>Price: ${parseFloat(item.price).toFixed(2)} each</span>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <div className="text-lg">
                              <span className="font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                                Subtotal: ${parseFloat(item.subtotal).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Order Summary */}
                  <div className="mt-8 p-6 bg-gradient-to-r from-gray-50/70 to-blue-50/70 rounded-2xl border border-gray-200/50">
                    <div className="flex justify-between items-center text-lg">
                      <span className="font-bold text-gray-900">Order Total:</span>
                      <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                        ${order.total_amount ? parseFloat(order.total_amount).toFixed(2) : '0.00'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Help Section */}
        <div className="glass-card rounded-3xl shadow-2xl border border-white/30 p-8">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-6 flex items-center">
            <svg className="w-6 h-6 mr-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Need Help?
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="group bg-gradient-to-br from-white/60 to-blue-50/60 p-6 rounded-2xl border border-blue-200/50 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div className="flex-grow">
                  <h4 className="font-bold text-lg text-gray-900 mb-2">Can't find your order?</h4>
                  <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                    Make sure you're using the correct order number. Check your email confirmation for the exact number.
                  </p>
                  <button 
                    onClick={() => navigate('/contact', {
                      state: {
                        category: 'order_issue',
                        orderNumber: order?.order_number || order?.id,
                        subject: `Cannot find order`,
                        message: `I'm having trouble finding my order. I've tried using order number: ${trackingInput}\n\nPlease help me locate my order.`
                      }
                    })}
                    className="btn-primary text-sm font-semibold px-4 py-2 rounded-xl hover:scale-105 transition-all duration-200">
                    Contact Support
                  </button>
                </div>
              </div>
            </div>
            
            <div className="group bg-gradient-to-br from-white/60 to-orange-50/60 p-6 rounded-2xl border border-orange-200/50 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-red-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="flex-grow">
                  <h4 className="font-bold text-lg text-gray-900 mb-2">Delivery Issues?</h4>
                  <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                    If your package hasn't arrived by the expected date, we're here to help.
                  </p>
                  <button 
                    onClick={() => navigate('/contact', {
                      state: {
                        category: 'delivery_problem',
                        orderNumber: order?.order_number || order?.id || trackingInput,
                        subject: `Delivery Issue with Order #${order?.order_number || order?.id || trackingInput}`,
                        message: `I'm experiencing delivery issues with my order.\n\nOrder Number: ${order?.order_number || order?.id || trackingInput}\nExpected Delivery: ${order?.estimated_delivery_days ? `${order.estimated_delivery_days} days` : 'Not specified'}\nCurrent Status: ${order?.status_display || order?.status || 'Unknown'}\n\nIssue Details:`
                      }
                    })}
                    className="btn-secondary text-sm font-semibold px-4 py-2 rounded-xl hover:scale-105 transition-all duration-200">
                    Report Issue
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Additional Help Links */}
          <div className="mt-8 pt-6 border-t border-gray-200/50">
            <div className="bg-gradient-to-r from-gray-50/50 to-purple-50/50 p-6 rounded-2xl border border-purple-200/30">
              <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Additional Resources
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button 
                  onClick={() => navigate('/orders')}
                  className="text-left p-3 bg-white/60 rounded-xl border border-gray-200/50 hover:shadow-md transition-all duration-200 hover:scale-[1.02]"
                >
                  <div className="text-sm font-semibold text-gray-900">View All Orders</div>
                  <div className="text-xs text-gray-600">Check your order history</div>
                </button>
                <button 
                  onClick={() => navigate('/profile')}
                  className="text-left p-3 bg-white/60 rounded-xl border border-gray-200/50 hover:shadow-md transition-all duration-200 hover:scale-[1.02]"
                >
                  <div className="text-sm font-semibold text-gray-900">Account Settings</div>
                  <div className="text-xs text-gray-600">Update your information</div>
                </button>
                <button 
                  onClick={() => navigate('/contact')}
                  className="text-left p-3 bg-white/60 rounded-xl border border-gray-200/50 hover:shadow-md transition-all duration-200 hover:scale-[1.02]"
                >
                  <div className="text-sm font-semibold text-gray-900">Help Center</div>
                  <div className="text-xs text-gray-600">Get general support</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
