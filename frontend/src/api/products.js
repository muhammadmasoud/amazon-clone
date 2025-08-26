import instance from './axios'; // Import the pre-configured axios instance

// Function to get a paginated list of products
export const getProducts = (page = 1, category = null, searchQuery = null) => {
  const params = { page }; // Always send the page number
  if (category) {
    params.category = category; // Add category filter if provided
  }
  if (searchQuery) params.q = searchQuery;
  return instance.get('/products/', { params }); // This becomes /api/products/?page=1&category=5
};

// Function to get a single product by ID
export const getProduct = (id) => {
  return instance.get(`/products/${id}/`);
};

// Function to get reviews for a specific product
export const getProductReviews = (productId) => {
  return instance.get(`/products/${productId}/reviews/`);
};

// Function to create a new review for a product
export const createProductReview = (productId, reviewData) => {
  return instance.post(`/products/${productId}/reviews/`, reviewData);
};

// Function to get all categories (for our filter dropdown later)
export const getCategories = () => {
  return instance.get('products/categories/');
};

