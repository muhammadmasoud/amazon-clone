import instance from './axios'; // Import the pre-configured axios instance

// Function to get a paginated list of products
export const getProducts = (page = 1, category = null) => {
  const params = { page }; // Always send the page number
  if (category) {
    params.category = category; // Add category filter if provided
  }
  return instance.get('/products/', { params }); // This becomes /api/products/?page=1&category=5
};

// Function to get all categories (for our filter dropdown later)
export const getCategories = () => {
  return instance.get('products/categories/');
};

// We can add more functions here later, like getProduct(id)