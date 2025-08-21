import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setShowUserDropdown(false);
  };

  return (
    <nav className="bg-[#131921] text-white px-4 py-2">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img
            src="/amazon-logo-white.png"
            alt="Amazon"
            className="h-8 object-contain"
          />
        </Link>

        {/* Search Bar */}
        <div className="flex-1 max-w-2xl mx-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search Amazon"
              className="w-full py-2 px-4 rounded-lg text-black focus:outline-none"
            />
            <button className="absolute right-0 top-0 h-full px-4 bg-[#febd69] hover:bg-[#f3a847] rounded-r-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
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
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex items-center space-x-6">
          {isAuthenticated ? (
            <>
              {/* User Account Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="text-sm hover:text-gray-300 focus:outline-none"
                >
                  <p className="text-gray-300">Hello, {user?.name || user?.email}</p>
                  <p className="font-bold">Account & Lists</p>
                </button>
                
                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowUserDropdown(false)}
                    >
                      Your Profile
                    </Link>
                    <Link
                      to="/orders"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowUserDropdown(false)}
                    >
                      Your Orders
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>

              <Link to="/orders" className="text-sm">
                <p className="text-gray-300">Returns</p>
                <p className="font-bold">& Orders</p>
              </Link>
            </>
          ) : (
            <Link to="/login" className="text-sm hover:text-gray-300">
              <p className="text-gray-300">Hello, Sign in</p>
              <p className="font-bold">Account & Lists</p>
            </Link>
          )}

          <Link to="/cart" className="relative">
            <span className="absolute -top-2 -right-2 bg-[#f08804] text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              0
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
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
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;