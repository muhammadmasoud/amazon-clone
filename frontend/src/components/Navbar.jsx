import { Link } from 'react-router-dom';

function Navbar() {
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
          <Link to="/login" className="text-sm hover:text-gray-300">
            <p className="text-gray-300">Hello, Sign in</p>
            <p className="font-bold">Account & Lists</p>
          </Link>

          <Link to="/orders" className="text-sm">
            <p className="text-gray-300">Returns</p>
            <p className="font-bold">& Orders</p>
          </Link>

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