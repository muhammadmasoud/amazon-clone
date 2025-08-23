function ProductReview({ review }) {
  return (
    <div className="border-b border-gray-200 py-6">
      {/* Review Header */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <h4 className="font-semibold text-gray-900">{review.user || 'Anonymous'}</h4>
          <div className="flex items-center space-x-1 mt-1">
            <div className="flex space-x-0.5">
              {[...Array(5)].map((_, i) => (
                <span 
                  key={i} 
                  className={`text-sm ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                >
                  ★
                </span>
              ))}
            </div>
            <span className="text-sm text-gray-500">{review.rating}.0 out of 5</span>
          </div>
        </div>
        <span className="text-sm text-gray-500">
          {new Date(review.created_at).toLocaleDateString()}
        </span>
      </div>

      {/* Review Content */}
      <div>
        <h5 className="font-medium text-gray-900 mb-1">{review.title}</h5>
        <p className="text-gray-700 text-sm">{review.content}</p>
      </div>
    </div>
  );
}

export default ProductReview;