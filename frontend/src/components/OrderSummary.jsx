import { formatDate } from '../utils/dateUtils';

export default function OrderSummary({ order, showItems = true, className = '' }) {
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

  return (
    <div className={`bg-white rounded-lg shadow-md border border-gray-200 ${className}`}>
      {/* Order Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold">Order #{order.id}</h3>
            <p className="text-gray-600 text-sm">{formatDate(order.created_at)}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(order.status)}`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
              {order.is_paid && (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Paid
                </span>
              )}
            </div>
            <p className="font-bold text-lg">${parseFloat(order.total_amount).toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Order Items (if showItems is true) */}
      {showItems && order.items && (
        <div className="p-6">
          <div className="space-y-3">
            {order.items.slice(0, 3).map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <img
                  src={item.product.thumbnail || '/placeholder-product.svg'}
                  alt={item.product.title}
                  className="w-12 h-12 object-cover rounded border"
                  onError={(e) => {
                    e.target.src = '/placeholder-product.svg';
                  }}
                />
                <div className="flex-grow min-w-0">
                  <p className="text-sm font-medium truncate">{item.product.title}</p>
                  <p className="text-xs text-gray-600">
                    {item.quantity} × ${parseFloat(item.price).toFixed(2)}
                  </p>
                </div>
                <p className="text-sm font-semibold">${parseFloat(item.subtotal).toFixed(2)}</p>
              </div>
            ))}
            {order.items.length > 3 && (
              <p className="text-sm text-gray-600 text-center">
                +{order.items.length - 3} more items
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
