import instance from './axios';

// Get contact categories
export const getContactCategories = async () => {
  try {
    const response = await instance.get('/contact/categories/');
    return response.data;
  } catch (error) {
    console.error('Error fetching contact categories:', error);
    throw error;
  }
};

// Submit contact message
export const submitContactMessage = async (data) => {
  try {
    const response = await instance.post('/contact/', data);
    return response.data;
  } catch (error) {
    console.error('Error submitting contact message:', error);
    throw error;
  }
};
