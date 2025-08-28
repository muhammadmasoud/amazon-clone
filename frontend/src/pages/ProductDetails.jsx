import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { getProduct, getProductReviews } from '../api/products';
import { fetchCartCount } from '../redux/actions/cartActions';
import ProductActionButtons from '../components/ProductActionButtons';
import ProductImageGallery from '../components/ProductImageGallery';
import ProductReview from '../components/ProductReviews';
import ReviewForm from '../components/ReviewForm';
import { useAuth } from '../context/AuthContext';

function ProductDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const dispatch = useDispatch();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  const [error, setError] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [hasUserReviewed, setHasUserReviewed] = useState(false);

  useEffect(() => {
    // Fetch cart count when user is authenticated
    if (user) {
      dispatch(fetchCartCount());
    }
  }, [user, dispatch]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        setIsLoadingReviews(true);
        setError(null);
        const [productResponse, reviewsResponse] = await Promise.all([
          getProduct(id),
          getProductReviews(id)
        ]);
        setProduct(productResponse.data);
        setReviews(reviewsResponse.data);
        
        // Check if current user has already reviewed this product
        if (user && reviewsResponse.data.length > 0) {
          const userDisplayName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email;
          const userReview = reviewsResponse.data.find(review => 
            review.user === userDisplayName
          );
          setHasUserReviewed(!!userReview);
        }
      } catch (error) {
        console.error('Failed to fetch product:', error);
        setError('Could not load product. Please try again later.');
      } finally {
        setIsLoading(false);
        setIsLoadingReviews(false);
      }
    };

    fetchProduct();
  }, [id, user]);

  const handleReviewSubmitted = async () => {
    // Refresh reviews after a new review is submitted
    try {
      const reviewsResponse = await getProductReviews(id);
      setReviews(reviewsResponse.data);
      setShowReviewForm(false);
      setHasUserReviewed(true);
      
      // Also refresh product data to get updated average rating
      const productResponse = await getProduct(id);
      setProduct(productResponse.data);
    } catch (error) {
      console.error('Failed to refresh reviews:', error);
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading product...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center">Product not found</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/5 to-indigo-400/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-purple-400/5 to-pink-400/5 rounded-full blur-3xl"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          <div className="lg:w-1/2">
            <div className="glass-card p-6 rounded-3xl shadow-2xl border border-white/30">
              <ProductImageGallery image={product.image} />
            </div>
          </div>

          <div className="lg:w-1/2">
            <div className="glass-card p-8 rounded-3xl shadow-2xl border border-white/30">
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-4">
                {product.title}
              </h1>

              {product.category && (
                <div className="flex items-center mb-6">
                  <span className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {product.category}
                  </span>
                </div>
              )}

              <div className="flex items-center space-x-3 mb-6">
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <span 
                      key={i} 
                      className={`text-lg ${i < Math.floor(product.average_rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <span className="text-blue-600 font-medium hover:text-blue-800 transition-colors cursor-pointer">
                  ({product.average_rating?.toFixed(1) || '0.0'}) ratings
                </span>
              </div>

              <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent my-6"></div>

              <div className="flex items-baseline space-x-2 mb-6">
                <span className="text-lg text-gray-600">$</span>
                <span className="text-4xl font-bold amazon-gradient-text">{product.unit_price}</span>
                <span className="text-gray-500 text-lg">USD</span>
              </div>

              {product.stock === 0 ? (
                <div className="bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 p-4 rounded-2xl mb-6 shadow-sm">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <p className="text-red-700 font-semibold">Out of Stock</p>
                  </div>
                </div>
              ) : product.stock <= 10 && (
                <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border-l-4 border-orange-500 p-4 rounded-2xl mb-6 shadow-sm">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-orange-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <p className="text-orange-700 font-medium">
                      Only {product.stock} left in stock
                    </p>
                  </div>
                </div>
              )}

              <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent my-6"></div>

              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  About this item
                </h2>
                <div className="bg-gradient-to-r from-gray-50 to-blue-50/50 p-4 rounded-2xl border border-gray-200/50">
                  <p className="text-gray-700 leading-relaxed">{product.description}</p>
                </div>
              </div>

              <div className="hidden lg:block">
                <ProductActionButtons product={product} />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:hidden mt-8">
          <div className="glass-card p-6 rounded-3xl shadow-2xl border border-white/30">
            <ProductActionButtons product={product} />
          </div>
        </div>
        
        <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent my-12"></div>
        
        {/* Reviews Section */}
        <div className="mt-12">
          <div className="glass-card p-8 rounded-3xl shadow-2xl border border-white/30">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Customer Reviews
              </h2>
              
              {/* Add Review Button */}
              {user && !hasUserReviewed && (
                <button
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className="btn-primary text-sm relative overflow-hidden group"
                >
                  <span className="relative z-10">
                    {showReviewForm ? 'Cancel Review' : 'Write a Review'}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
                </button>
              )}
            </div>
            
            {/* Average Rating Summary */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl mb-8 border border-blue-200/50 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                <div className="text-center sm:text-left">
                  <div className="text-4xl font-bold amazon-gradient-text mb-2">
                    {product.average_rating?.toFixed(1) || '0.0'}
                  </div>
                  <div className="flex justify-center sm:justify-start space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <span 
                        key={i} 
                        className={`text-xl ${i < Math.floor(product.average_rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-center sm:text-left">
                  <p className="text-gray-600 font-medium">
                    Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Share your thoughts with other customers
                  </p>
                </div>
              </div>
            </div>

            {/* Show message if user already reviewed */}
            {user && hasUserReviewed && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 text-green-700 px-6 py-4 rounded-2xl mb-6 shadow-sm">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Thank you! You have already reviewed this product.</span>
                </div>
              </div>
            )}

            {/* Review Form */}
            {showReviewForm && (
              <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200/50">
                <ReviewForm
                  productId={id}
                  onReviewSubmitted={handleReviewSubmitted}
                  onCancel={() => setShowReviewForm(false)}
                />
              </div>
            )}

            {/* Reviews List */}
            <div className="space-y-6">
              {isLoadingReviews ? (
                <div className="text-center py-8">
                  <div className="loading-spinner w-8 h-8 mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading reviews...</p>
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 mb-4 text-lg font-medium">No reviews yet. Be the first to review!</p>
                  {!user && (
                    <p className="text-sm text-gray-400">
                      <a href="/login" className="text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors">
                        Sign in
                      </a>
                      {' '}to write a review
                    </p>
                  )}
                </div>
              ) : (
                reviews.map((review) => (
                  <div key={review.id} className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-200/50 hover:shadow-md transition-all duration-300">
                    <ProductReview review={review} />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;