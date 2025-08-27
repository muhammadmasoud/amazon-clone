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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          <div className="lg:w-1/2">
            <ProductImageGallery image={product.image} />
          </div>

          <div className="lg:w-1/2">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
              {product.title}
            </h1>

            {product.category && (
              <p className="text-sm text-gray-500 mb-4">
                Category: <span className="text-blue-600">{product.category}</span>
              </p>
            )}

            <div className="flex items-center space-x-1 mb-4">
              <div className="flex space-x-0.5">
                {[...Array(5)].map((_, i) => (
                  <span 
                    key={i} 
                    className={`text-sm ${i < Math.floor(product.average_rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
                  >
                    ★
                  </span>
                ))}
              </div>
              <span className="text-sm text-blue-600">
                ({product.average_rating || 0})
              </span>
            </div>

            <hr className="my-4" />

            <div className="flex items-baseline space-x-1 mb-4">
              <span className="text-sm text-gray-600">EGP</span>
              <span className="text-2xl font-bold text-gray-900">{product.unit_price}</span>
            </div>

            {product.stock === 0 ? (
              <div className="bg-red-50 border-l-4 border-red-500 p-2 rounded-r mb-4">
                <p className="text-xs text-red-700 font-bold">Out of Stock</p>
              </div>
            ) : product.stock <= 10 && (
              <div className="bg-red-50 border-l-4 border-red-500 p-2 rounded-r mb-4">
                <p className="text-xs text-red-700 font-medium">
                  Only {product.stock} left in stock
                </p>
              </div>
            )}

            <hr className="my-4" />

            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">About this item</h2>
              <p className="text-gray-700">{product.description}</p>
            </div>

            <div className="hidden lg:block">
              <ProductActionButtons product={product} />
            </div>
          </div>
        </div>

        <div className="lg:hidden mt-8">
          <ProductActionButtons product={product} />
        </div>
        <div className="border-t border-gray-200 my-8"></div>
        {/* Reviews Section */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
            
            {/* Add Review Button */}
            {user && !hasUserReviewed && (
              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {showReviewForm ? 'Cancel Review' : 'Write a Review'}
              </button>
            )}
          </div>
          
          {/* Average Rating Summary */}
          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <div className="flex items-center space-x-4">
              <div className="text-3xl font-bold text-gray-900">
                {product.average_rating?.toFixed(1) || '0.0'}
              </div>
              <div>
                <div className="flex space-x-0.5">
                  {[...Array(5)].map((_, i) => (
                    <span 
                      key={i} 
                      className={`text-lg ${i < Math.floor(product.average_rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Based on {reviews.length} review(s)
                </p>
              </div>
            </div>
          </div>

          {/* Show message if user already reviewed */}
          {user && hasUserReviewed && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
              Thank you! You have already reviewed this product.
            </div>
          )}

          {/* Review Form */}
          {showReviewForm && (
            <div className="mb-8">
              <ReviewForm
                productId={id}
                onReviewSubmitted={handleReviewSubmitted}
                onCancel={() => setShowReviewForm(false)}
              />
            </div>
          )}

          {/* Reviews List */}
          <div className="space-y-4">
            {isLoadingReviews ? (
              <p>Loading reviews...</p>
            ) : reviews.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No reviews yet. Be the first to review!</p>
                {!user && (
                  <p className="text-sm text-gray-400">
                    <a href="/login" className="text-blue-600 hover:underline">
                      Sign in
                    </a>
                    {' '}to write a review
                  </p>
                )}
              </div>
            ) : (
              reviews.map((review) => (
                <ProductReview key={review.id} review={review} />
              ))
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
}

export default ProductDetails;