import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getContactCategories, submitContactMessage } from '../api/contact';

export default function Contact() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  // Get initial data from location state (when coming from order pages)
  const initialData = location.state || {};
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username || '' : '',
    email: user?.email || '',
    subject: initialData.subject || '',
    category: initialData.category || 'general_inquiry',
    message: initialData.message || '',
    order_number: initialData.orderNumber || ''
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await getContactCategories();
      setCategories(response.categories || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load contact categories');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate required fields
      if (!formData.name.trim() || !formData.email.trim() || !formData.subject.trim() || !formData.message.trim()) {
        throw new Error('Please fill in all required fields');
      }

      await submitContactMessage(formData);
      setSubmitted(true);
    } catch (err) {
      console.error('Error submitting contact message:', err);
      setError(err.response?.data?.message || err.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50 relative overflow-hidden py-12">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-green-400/10 to-blue-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-400/10 to-indigo-400/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-card p-12 rounded-3xl shadow-2xl border border-white/30 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-xl">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
              Message Sent Successfully!
            </h1>
            <p className="text-gray-600 mb-6 text-lg">
              Thank you for contacting us. We have received your message and will get back to you within 24-48 hours.
            </p>
            <p className="text-sm text-gray-500 mb-8">
              You should receive a confirmation email shortly at <span className="font-medium text-gray-700">{formData.email}</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/orders')}
                className="btn-primary relative overflow-hidden group"
              >
                <span className="relative z-10">Back to Orders</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
              </button>
              <button
                onClick={() => navigate('/')}
                className="btn-secondary relative overflow-hidden group"
              >
                <span className="relative z-10">Continue Shopping</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-100/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden py-12">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-purple-400/10 to-pink-400/10 rounded-full blur-3xl"></div>
      <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 w-72 h-72 bg-gradient-to-r from-cyan-400/5 to-blue-400/5 rounded-full blur-2xl"></div>
      
      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-xl mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-4">
            Contact Support
          </h1>
          <p className="text-gray-600 text-lg">
            We're here to help! Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        {/* Contact Form */}
        <div className="glass-card p-8 rounded-3xl shadow-2xl border border-white/30">
          {error && (
            <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 text-red-700 rounded-2xl flex items-center">
              <svg className="w-5 h-5 mr-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name and Email Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                  placeholder="Enter your full name"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Category and Order Number Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="order_number" className="block text-sm font-medium text-gray-700 mb-2">
                  Order Number (Optional)
                </label>
                <input
                  type="text"
                  id="order_number"
                  name="order_number"
                  value={formData.order_number}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter order number if applicable"
                />
              </div>
            </div>

            {/* Subject */}
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                Subject *
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Brief description of your issue"
              />
            </div>

            {/* Message */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Message *
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                required
                rows={6}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Please provide detailed information about your issue or question..."
              />
            </div>

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
              >
                <span className="relative z-10 flex items-center justify-center">
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      Send Message
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
              </button>
              
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Other Ways to Get Help</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Frequently Asked Questions</h4>
              <p className="text-blue-700 text-sm">
                Check our FAQ section for quick answers to common questions.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Order Tracking</h4>
              <p className="text-blue-700 text-sm">
                Track your order status and delivery information in real-time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
