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
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center min-h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h2>
            <p className="text-gray-600 mb-6">{error || 'The order you\'re looking for doesn\'t exist.'}</p>
            <Link 
              to="/orders"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Back to Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <button 
                onClick={() => navigate('/orders')}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <h1 className="text-3xl font-bold text-gray-900">
                Order #{order.order_number || order.id}
              </h1>
            </div>
            <p className="text-gray-600">
              Placed on {formatDate(order.created_at)}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
              <span className="mr-1">{getStatusIcon(order.status)}</span>
              {order.status_display || order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('_', ' ')}
            </span>
            
            {order.can_be_cancelled && order.status !== 'cancelled' && (
              <button
                onClick={handleCancelOrder}
                disabled={cancelling}
                className="px-4 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50 disabled:opacity-50"
              >
                {cancelling ? 'Cancelling...' : 'Cancel Order'}
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('details')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'details'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Order Details
            </button>
            <button
              onClick={() => setActiveTab('tracking')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'tracking'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Order Tracking
            </button>
            {order.invoice_number && (
              <button
                onClick={() => setActiveTab('invoice')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'invoice'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Invoice
              </button>
            )}
          </nav>
        </div>

        {/* Tab Content */}
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
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold mb-6">Order Items</h3>
          <div className="space-y-6">
            {order.items?.map((item) => (
              <div key={item.id} className="flex gap-4 pb-6 border-b border-gray-200 last:border-b-0">
                <div className="flex-shrink-0">
                  <img
                    src={item.product?.image || '/placeholder-product.svg'}
                    alt={item.product_title || item.product?.title}
                    className="w-20 h-20 object-cover rounded-lg border"
                    onError={(e) => {
                      e.target.src = '/placeholder-product.svg';
                    }}
                  />
                </div>
                <div className="flex-grow">
                  <Link 
                    to={`/product/${item.product?.id}`}
                    className="text-blue-600 hover:text-blue-800 font-medium block mb-1"
                  >
                    {item.product_title || item.product?.title}
                  </Link>
                  <p className="text-sm text-gray-600 mb-2">
                    SKU: {item.product?.sku || 'N/A'}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <span>Quantity: {item.quantity}</span>
                    <span>Price: ${parseFloat(item.price).toFixed(2)}</span>
                    <span className="font-semibold">
                      Subtotal: ${parseFloat(item.subtotal).toFixed(2)}
                    </span>
                  </div>
                  {item.is_fulfilled && (
                    <span className="inline-flex mt-2 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                      Fulfilled
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Order Summary */}
      <div className="space-y-6">
        {/* Payment & Shipping Summary */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span>${parseFloat(order.subtotal || 0).toFixed(2)}</span>
            </div>
            {order.discount_amount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-${parseFloat(order.discount_amount).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Shipping</span>
              <span>${parseFloat(order.shipping_cost || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tax</span>
              <span>${parseFloat(order.tax_amount || 0).toFixed(2)}</span>
            </div>
            <div className="border-t pt-3">
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>${parseFloat(order.total_amount).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Status */}
          <div className="mt-6 pt-4 border-t">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Payment Status</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                order.is_paid 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {order.is_paid ? 'Paid' : 'Pending'}
              </span>
            </div>
            {order.payment_method && (
              <div className="flex items-center justify-between mt-2">
                <span className="text-gray-600">Payment Method</span>
                <span className="capitalize">{order.payment_method.replace('_', ' ')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Shipping Information */}
        {order.shipping_address && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Shipping Address</h3>
            <div className="text-sm text-gray-600">
              {order.shipping_address.name && (
                <p className="font-medium text-gray-900">{order.shipping_address.name}</p>
              )}
              <p>{order.shipping_address.line1}</p>
              {order.shipping_address.line2 && <p>{order.shipping_address.line2}</p>}
              <p>
                {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}
              </p>
              <p>{order.shipping_address.country}</p>
            </div>
            
            {order.estimated_delivery_days && order.status !== 'delivered' && order.status !== 'cancelled' && (
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Estimated Delivery</span>
                  <span className="font-medium">
                    {order.estimated_delivery_days === 0 ? 'Today' : 
                     order.estimated_delivery_days === 1 ? 'Tomorrow' :
                     `${order.estimated_delivery_days} days`}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Actions</h3>
          <div className="space-y-3">
            {order.tracking_number && (
              <Link
                to={`/track/${order.order_number || order.id}`}
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                Track Package
              </Link>
            )}
            
            {order.status === 'delivered' && (
              <button className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976-2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                Leave Review
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
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Contact Support
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
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Order Tracking</h3>
          <p className="text-gray-600">
            Track your order progress and estimated delivery
          </p>
        </div>
        {order.tracking_number && (
          <div className="mt-4 sm:mt-0">
            <p className="text-sm text-gray-600">Tracking Number</p>
            <p className="font-mono font-semibold">{order.tracking_number}</p>
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="relative">
        {timeline.map((step, index) => (
          <div key={step.status} className="relative flex items-start mb-8 last:mb-0">
            {/* Timeline line */}
            {index < timeline.length - 1 && (
              <div 
                className={`absolute left-4 top-8 w-0.5 h-12 ${
                  step.completed && !step.cancelled ? 'bg-green-500' : 'bg-gray-200'
                }`} 
              />
            )}
            
            {/* Timeline dot */}
            <div 
              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                step.current && !step.cancelled
                  ? 'bg-blue-500 border-blue-500 text-white'
                  : step.completed && !step.cancelled
                  ? 'bg-green-500 border-green-500 text-white'
                  : 'bg-gray-100 border-gray-300 text-gray-500'
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
            <div className="ml-4 flex-grow">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{step.icon}</span>
                <h4 className={`font-semibold ${
                  step.current ? 'text-blue-600' : 
                  step.completed && !step.cancelled ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {step.label}
                </h4>
                {step.current && (
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                    Current
                  </span>
                )}
              </div>
              
              <p className="text-sm text-gray-600">
                {step.completed && !step.cancelled
                  ? `Completed on ${formatDate(order.updated_at || order.created_at)}`
                  : step.current
                  ? 'In progress'
                  : 'Pending'
                }
              </p>
              
              {step.status === 'shipped' && order.tracking_number && step.completed && (
                <p className="text-sm text-blue-600 mt-1">
                  Tracking number: {order.tracking_number}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Delivery Information */}
      {order.estimated_delivery_days && order.status !== 'delivered' && order.status !== 'cancelled' && (
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h4 className="font-semibold text-blue-900">Estimated Delivery</h4>
          </div>
          <p className="text-blue-800">
            Your order is expected to arrive in {' '}
            {order.estimated_delivery_days === 0 ? 'today' : 
             order.estimated_delivery_days === 1 ? 'tomorrow' :
             `${order.estimated_delivery_days} days`}
          </p>
        </div>
      )}
    </div>
  );
}

// Order Invoice Tab
function OrderInvoiceTab({ order }) {
  return (
    <div className="bg-white rounded-lg shadow p-8">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Invoice</h3>
          <p className="text-gray-600">Invoice #: {order.invoice_number}</p>
          <p className="text-gray-600">Date: {formatDate(order.created_at)}</p>
        </div>
        <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Download PDF
        </button>
      </div>

      {/* Invoice Content */}
      <div className="prose max-w-none">
        {/* Items */}
        <table className="w-full mb-8">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Item</th>
              <th className="text-right py-2">Qty</th>
              <th className="text-right py-2">Price</th>
              <th className="text-right py-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items?.map((item) => (
              <tr key={item.id} className="border-b">
                <td className="py-3">
                  <div>
                    <p className="font-medium">{item.product_title || item.product?.title}</p>
                    <p className="text-sm text-gray-600">SKU: {item.product?.sku || 'N/A'}</p>
                  </div>
                </td>
                <td className="text-right py-3">{item.quantity}</td>
                <td className="text-right py-3">${parseFloat(item.price).toFixed(2)}</td>
                <td className="text-right py-3">${parseFloat(item.subtotal).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="border-t pt-4">
          <div className="flex justify-end">
            <div className="w-64">
              <div className="flex justify-between mb-2">
                <span>Subtotal:</span>
                <span>${parseFloat(order.subtotal || 0).toFixed(2)}</span>
              </div>
              {order.discount_amount > 0 && (
                <div className="flex justify-between mb-2 text-green-600">
                  <span>Discount:</span>
                  <span>-${parseFloat(order.discount_amount).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between mb-2">
                <span>Shipping:</span>
                <span>${parseFloat(order.shipping_cost || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Tax:</span>
                <span>${parseFloat(order.tax_amount || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total:</span>
                <span>${parseFloat(order.total_amount).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
