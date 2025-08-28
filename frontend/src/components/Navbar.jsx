import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSelector } from 'react-redux';
import { useState, useEffect, useRef } from 'react';

function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const cart = useSelector((state) => state.cart);
  const navigate = useNavigate();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  const location = useLocation();
  const isHomePage = location.pathname === '/';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

    const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Navigate to homepage with search query
      navigate(`/?search=${encodeURIComponent(searchTerm.trim())}&view=products`);
      setSearchTerm(''); // Clear search input
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setShowUserDropdown(false);
  };

  return (
    <nav className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white px-4 py-3 shadow-2xl border-b border-gray-700/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center group">
          <div className="flex items-center hover:scale-105 transition-all duration-300 relative">
            <div className="bg-gradient-to-br from-orange-400 to-orange-600 p-2 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300">
              <img
                src="/amazon.png"
                alt="Amazon Clone"
                className="h-8 w-auto object-contain brightness-0 invert"
              />
            </div>
            <div className="hidden sm:block ml-3">
              <span className="text-xl font-bold text-white group-hover:text-orange-300 transition-colors duration-300 block leading-tight">
                Amazon
              </span>
              <span className="text-xs text-gray-300 group-hover:text-orange-200 transition-colors duration-300 block leading-none">
                Clone
              </span>
            </div>
            {/* Hover glow effect */}
            <div className="absolute inset-0 bg-orange-400/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
          </div>
        </Link>

        {/* Search Bar */}
        <div className="flex-1 max-w-2xl mx-4">
          <form onSubmit={handleSearch} className="relative group">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products, brands and more..."
              className="w-full py-3 px-5 pr-14 rounded-2xl text-gray-900 bg-white/95 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:bg-white transition-all duration-300 shadow-lg group-hover:shadow-xl placeholder-gray-500"
            />
            <button 
              type="submit"
              className="absolute right-1 top-1 h-10 w-12 bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700 rounded-xl transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
            {/* Search bar glow effect */}
            <div className="absolute inset-0 bg-orange-400/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
          </form>
        </div>

        {/* Navigation Links */}
        <div className="flex items-center space-x-6">
          {isAuthenticated ? (
            <>
              {/* User Account Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="text-sm hover:text-orange-300 focus:outline-none transition-all duration-300 group relative"
                >
                  <div className="text-left">
                    <p className="text-gray-300 group-hover:text-orange-200 transition-colors duration-300 text-xs">
                      Hello, {user?.first_name || user?.email?.split('@')[0]}
                    </p>
                    <p className="font-bold text-white group-hover:text-orange-300 transition-colors duration-300">
                      Account & Lists
                    </p>
                  </div>
                  {/* Hover glow effect */}
                  <div className="absolute inset-0 bg-orange-400/10 rounded-lg blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                </button>
                
                {showUserDropdown && (
                  <div className="absolute right-0 mt-3 w-56 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl py-2 z-50 border border-gray-200/50 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-gray-50/80 rounded-2xl"></div>
                    <div className="relative z-10">
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100 hover:text-orange-700 transition-all duration-300"
                        onClick={() => setShowUserDropdown(false)}
                      >
                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Your Profile
                      </Link>
                      <Link
                        to="/orders"
                        className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100 hover:text-orange-700 transition-all duration-300"
                        onClick={() => setShowUserDropdown(false)}
                      >
                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        Your Orders
                      </Link>
                      <Link
                        to="/track"
                        className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100 hover:text-orange-700 transition-all duration-300"
                        onClick={() => setShowUserDropdown(false)}
                      >
                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Track Order
                      </Link>
                      <Link
                        to="/contact"
                        className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100 hover:text-orange-700 transition-all duration-300"
                        onClick={() => setShowUserDropdown(false)}
                      >
                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        Contact Support
                      </Link>
                      <div className="border-t border-gray-200 my-2"></div>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 hover:text-red-700 transition-all duration-300"
                      >
                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <Link 
                to="/orders" 
                className="text-sm hover:text-orange-300 transition-all duration-300 group relative hidden md:block"
                onClick={() => setShowUserDropdown(false)}
              >
                <div className="text-left">
                  <p className="text-gray-300 group-hover:text-orange-200 transition-colors duration-300 text-xs">Returns</p>
                  <p className="font-bold text-white group-hover:text-orange-300 transition-colors duration-300">& Orders</p>
                </div>
                {/* Hover glow effect */}
                <div className="absolute inset-0 bg-orange-400/10 rounded-lg blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
              </Link>

              {/* Admin Panel Button - Only show for admin users */}
              {(user?.is_staff || user?.is_superuser) && (
                <a
                  href="http://localhost:8000/admin/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm hover:text-orange-300 transition-all duration-300 group relative hidden lg:block"
                  title="Admin Panel"
                >
                  <div className="text-left">
                    <p className="text-gray-300 group-hover:text-orange-200 transition-colors duration-300 text-xs">Admin</p>
                    <p className="font-bold text-white group-hover:text-orange-300 transition-colors duration-300">Panel</p>
                  </div>
                  {/* Hover glow effect */}
                  <div className="absolute inset-0 bg-orange-400/10 rounded-lg blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                </a>
              )}

              <Link to="/cart" className="relative group">
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-white group-hover:text-orange-300 transition-colors duration-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                      />
                    </svg>
                    {(cart.cart_count || cart.total_items || 0) > 0 && (
                      <span className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-400 to-orange-600 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center shadow-lg animate-pulse">
                        {cart.cart_count || cart.total_items || 0}
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-bold text-white group-hover:text-orange-300 transition-colors duration-300 mt-1">
                    Cart
                  </span>
                </div>
                {/* Hover glow effect */}
                <div className="absolute inset-0 bg-orange-400/10 rounded-lg blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
              </Link>
            </>
          ) : (
            <Link to="/login" className="text-sm hover:text-orange-300 transition-all duration-300 group relative">
              <div className="text-left">
                <p className="text-gray-300 group-hover:text-orange-200 transition-colors duration-300 text-xs">Hello, Sign in</p>
                <p className="font-bold text-white group-hover:text-orange-300 transition-colors duration-300">Account & Lists</p>
              </div>
              {/* Hover glow effect */}
              <div className="absolute inset-0 bg-orange-400/10 rounded-lg blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;