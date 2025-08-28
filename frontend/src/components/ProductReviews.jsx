function ProductReviews({ review }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="group hover:transform hover:scale-[1.01] transition-all duration-300">
      {/* Review Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          {/* User Avatar and Name */}
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm">
                {(review.user || 'A').charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-lg">
                {review.user || 'Anonymous User'}
              </h4>
              <p className="text-sm text-gray-500">Verified Purchase</p>
            </div>
          </div>
          
          {/* Rating */}
          <div className="flex items-center space-x-3">
            <div className="flex space-x-1">
              {[...Array(5)].map((_, i) => (
                <span 
                  key={i} 
                  className={`text-lg transition-colors duration-200 ${
                    i < review.rating 
                      ? 'text-yellow-400 drop-shadow-sm' 
                      : 'text-gray-300'
                  }`}
                >
                  ★
                </span>
              ))}
            </div>
            <span className="bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium shadow-sm">
              {review.rating}.0 out of 5
            </span>
          </div>
        </div>
        
        {/* Date Badge */}
        <div className="bg-gradient-to-r from-gray-100 to-gray-200 px-4 py-2 rounded-full shadow-sm">
          <span className="text-sm font-medium text-gray-600">
            {formatDate(review.created_at)}
          </span>
        </div>
      </div>

      {/* Review Content */}
      <div className="space-y-3">
        <h5 className="font-bold text-xl text-gray-900 leading-tight">
          {review.title}
        </h5>
        <div className="bg-gradient-to-r from-gray-50 to-blue-50/30 p-4 rounded-xl border-l-4 border-blue-400 shadow-sm">
          <p className="text-gray-700 leading-relaxed font-medium">
            {review.content}
          </p>
        </div>
      </div>
    </div>
  );
}

export default ProductReviews;