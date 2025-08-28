import { useState } from 'react';
import { createProductReview } from '../api/products';
import { useAuth } from '../context/AuthContext';

function ReviewForm({ productId, onReviewSubmitted, onCancel }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    rating: 5
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRatingChange = (rating) => {
    setFormData(prev => ({
      ...prev,
      rating
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to write a review');
      return;
    }

    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      
      await createProductReview(productId, formData);
      
      // Reset form
      setFormData({
        title: '',
        content: '',
        rating: 5
      });
      
      // Notify parent component
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    } catch (error) {
      console.error('Failed to submit review:', error);
      if (error.response?.status === 400) {
        setError('You have already reviewed this product');
      } else {
        setError('Failed to submit review. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-8 rounded-2xl border border-amber-200/50 shadow-lg">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <p className="text-gray-700 text-lg font-medium mb-4">
            Share your experience with other customers
          </p>
          <a 
            href="/login" 
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3 px-6 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            <span>Sign In to Write a Review</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl border border-white/30 shadow-2xl">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
          Write Your Review
        </h3>
      </div>
      
      {error && (
        <div className="bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 p-4 rounded-2xl mb-6 shadow-sm animate-shake">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-red-700 font-medium">{error}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rating */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-2xl border border-yellow-200/50 shadow-sm">
          <label className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Rate this product
          </label>
          <div className="flex items-center space-x-2 mb-3">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => handleRatingChange(rating)}
                className={`text-3xl transition-all duration-200 transform hover:scale-110 ${
                  rating <= formData.rating
                    ? 'text-yellow-400 hover:text-yellow-500 drop-shadow-sm'
                    : 'text-gray-300 hover:text-gray-400'
                }`}
              >
                ★
              </button>
            ))}
          </div>
          <p className="text-sm font-medium text-gray-600 bg-white/60 px-3 py-1 rounded-full inline-block">
            {formData.rating} out of 5 stars
          </p>
        </div>

        {/* Title */}
        <div>
          <label htmlFor="title" className="text-lg font-bold text-gray-900 mb-3 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            Review Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Summarize your review in a few words..."
            className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-gray-300/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 placeholder-gray-400 font-medium shadow-sm"
            required
          />
        </div>

        {/* Content */}
        <div>
          <label htmlFor="content" className="text-lg font-bold text-gray-900 mb-3 flex items-center">
            <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Your Experience
          </label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="Tell others about your experience with this product. What did you like or dislike? How was the quality? Would you recommend it?"
            rows={5}
            className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-gray-300/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 placeholder-gray-400 font-medium shadow-sm resize-none"
            required
          />
        </div>

        {/* Submit Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 btn-primary relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <span className="relative z-10 flex items-center justify-center space-x-2">
              {isSubmitting ? (
                <>
                  <div className="loading-spinner w-5 h-5"></div>
                  <span>Publishing Review...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  <span>Publish Review</span>
                </>
              )}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
          </button>
          
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 sm:flex-none px-6 py-3 bg-white/60 backdrop-blur-sm text-gray-700 font-bold rounded-xl border border-gray-300/50 hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-300 shadow-sm hover:shadow-md"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default ReviewForm;
