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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Track Your Order</h1>
          <p className="text-gray-600">
            Enter your order number to track your package
          </p>
        </div>

        {/* Track Order Form */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-grow">
              <label htmlFor="tracking-input" className="block text-sm font-medium text-gray-700 mb-2">
                Order Number
              </label>
              <input
                id="tracking-input"
                type="text"
                value={trackingInput}
                onChange={(e) => setTrackingInput(e.target.value)}
                placeholder="Enter your order number"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
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
                className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Tracking...' : 'Track Order'}
              </button>
            </div>
          </div>
          
          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
        </div>

        {/* Order Details */}
        {order && (
          <div className="space-y-8">
            {/* Order Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Order Number</h3>
                  <p className="text-lg font-semibold">#{order.order_number || order.id || 'N/A'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Order Date</h3>
                  <p className="text-lg font-semibold">{formatDate(order.created_at)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Status</h3>
                  <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status || 'pending')}`}>
                    {order.status_display || (order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('_', ' ') : 'Pending')}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Total Amount</h3>
                  <p className="text-lg font-semibold">${order.total_amount ? parseFloat(order.total_amount).toFixed(2) : '0.00'}</p>
                </div>
              </div>

              {order.tracking_number && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Carrier Tracking Number</h3>
                      <p className="text-lg font-mono font-semibold">{order.tracking_number}</p>
                    </div>
                    {order.carrier_name && (
                      <div className="text-right">
                        <h3 className="text-sm font-medium text-gray-500">Carrier</h3>
                        <p className="text-lg font-semibold">{order.carrier_name}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {(order.estimated_delivery_days || order.estimated_delivery_days === 0) && (order.status || 'pending') !== 'delivered' && (order.status || 'pending') !== 'cancelled' && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h4 className="font-semibold text-blue-900">Estimated Delivery</h4>
                      <p className="text-blue-800">
                        Expected to arrive in {' '}
                        {order.estimated_delivery_days === 0 ? 'today' : 
                         order.estimated_delivery_days === 1 ? 'tomorrow' :
                         `${order.estimated_delivery_days} days`}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Order Timeline */}
            {(order.status || 'pending') !== 'cancelled' ? (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-semibold mb-6">Order Progress</h3>
                
                <div className="relative">
                  {getOrderTimeline().map((step, index) => (
                    <div key={step.status} className="relative flex items-start pb-8 last:pb-0">
                      {/* Timeline line */}
                      {index < getOrderTimeline().length - 1 && (
                        <div 
                          className={`absolute left-4 top-8 w-0.5 h-16 ${
                            step.completed ? 'bg-green-500' : 'bg-gray-200'
                          }`} 
                        />
                      )}
                      
                      {/* Timeline dot */}
                      <div 
                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                          step.current
                            ? 'bg-blue-500 border-blue-500 text-white shadow-lg'
                            : step.completed
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'bg-gray-100 border-gray-300 text-gray-500'
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
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xl">{step.icon}</span>
                          <h4 className={`font-semibold ${
                            step.current ? 'text-blue-600' : 
                            step.completed ? 'text-green-600' : 'text-gray-500'
                          }`}>
                            {step.label}
                          </h4>
                          {step.current && (
                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
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
                          <p className="text-sm text-blue-600 mt-1">
                            Tracking: {order.tracking_number}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 text-red-500">
                  <svg fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Order Cancelled</h3>
                <p className="text-gray-600">
                  This order was cancelled on {formatDate(order.updated_at || order.created_at)}
                </p>
              </div>
            )}

            {/* Order Items */}
            {order.items && order.items.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-semibold mb-6">Order Items</h3>
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                      <div className="flex-shrink-0">
                        <img
                          src={item.product?.image || '/placeholder-product.svg'}
                          alt={item.product_title || item.product?.title}
                          className="w-16 h-16 object-cover rounded-lg border"
                          onError={(e) => {
                            e.target.src = '/placeholder-product.svg';
                          }}
                        />
                      </div>
                      <div className="flex-grow">
                        <h4 className="font-medium text-gray-900">
                          {item.product_title || item.product?.title}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Quantity: {item.quantity} × ${parseFloat(item.price).toFixed(2)}
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          Subtotal: ${parseFloat(item.subtotal).toFixed(2)}
                        </p>
                      </div>
                      {item.is_fulfilled && (
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                          Fulfilled
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Help Section */}
        <div className="bg-white rounded-lg shadow p-6 mt-8">
          <h3 className="text-lg font-semibold mb-4">Need Help?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium mb-2">Can't find your order?</h4>
              <p className="text-sm text-gray-600 mb-3">
                Make sure you're using the correct order number. Check your email confirmation for the exact number.
              </p>
              <button 
                onClick={() => navigate('/contact', {
                  state: {
                    category: 'order_issue',
                    orderNumber: order.order_number || order.id,
                    subject: `Cannot find order`,
                    message: `I'm having trouble finding my order. I've tried using order number: ${trackingInput}\n\nPlease help me locate my order.`
                  }
                })}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                Contact Support
              </button>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium mb-2">Delivery Issues?</h4>
              <p className="text-sm text-gray-600 mb-3">
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
                className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                Report Issue
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
