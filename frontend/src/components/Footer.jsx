import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#232f3e] text-white mt-auto">
      {/* Back to Top Button */}
      <div 
        className="bg-[#37475a] text-center py-4 cursor-pointer hover:bg-[#485769] transition-colors duration-200"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <p className="text-sm font-medium">Back to top</p>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Get to Know Us */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Get to Know Us</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">
                  About Amazon Clone
                </Link>
              </li>
              <li>
                <Link to="/careers" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">
                  Careers
                </Link>
              </li>
              <li>
                <Link to="/investor" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">
                  Investor Relations
                </Link>
              </li>
              <li>
                <Link to="/press" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">
                  Press Releases
                </Link>
              </li>
            </ul>
          </div>

          {/* Make Money with Us */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Make Money with Us</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/sell" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">
                  Sell on Amazon Clone
                </Link>
              </li>
              <li>
                <Link to="/affiliate" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">
                  Become an Affiliate
                </Link>
              </li>
              <li>
                <Link to="/advertise" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">
                  Advertise Your Products
                </Link>
              </li>
              <li>
                <Link to="/host" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">
                  Host an Amazon Hub
                </Link>
              </li>
            </ul>
          </div>

          {/* Amazon Payment Products */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Payment Products</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/credit-card" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">
                  Amazon Clone Rewards Visa
                </Link>
              </li>
              <li>
                <Link to="/store-card" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">
                  Amazon Clone Store Card
                </Link>
              </li>
              <li>
                <Link to="/business-card" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">
                  Amazon Clone Business Card
                </Link>
              </li>
              <li>
                <Link to="/reload" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">
                  Shop with Points
                </Link>
              </li>
            </ul>
          </div>

          {/* Let Us Help You */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Let Us Help You</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/orders" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">
                  Your Orders
                </Link>
              </li>
              <li>
                <Link to="/track" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">
                  Track Packages
                </Link>
              </li>
              <li>
                <Link to="/returns" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">
                  Returns & Replacements
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">
                  Help & Customer Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-600 my-8"></div>

        {/* Logo and Social Links */}
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img
                src="/amazon.png"
                alt="Amazon Clone"
                className="h-10 object-contain brightness-0 invert mr-2"
              />
              <span className="text-xl font-bold text-white">Amazon Clone</span>
            </Link>
          </div>

          {/* Social Media Links */}
          <div className="flex space-x-4">
            <a 
              href="https://facebook.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-white transition-colors duration-200"
              aria-label="Facebook"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
            <a 
              href="https://twitter.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-white transition-colors duration-200"
              aria-label="Twitter"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
            </a>
            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-white transition-colors duration-200"
              aria-label="Instagram"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987s11.987-5.367 11.987-11.987C24.014 5.367 18.647.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.337-1.285C3.595 14.24 3.098 12.784 3.098 11.987c0-.796.497-2.253 2.014-3.716.888-.795 2.04-1.285 3.337-1.285 1.297 0 2.448.49 3.337 1.285 1.517 1.463 2.014 2.92 2.014 3.716 0 .797-.497 2.254-2.014 3.716-.889.795-2.04 1.285-3.337 1.285zm7.119 0c-1.297 0-2.448-.49-3.337-1.285-1.517-1.462-2.014-2.919-2.014-3.716 0-.796.497-2.253 2.014-3.716.889-.795 2.04-1.285 3.337-1.285s2.448.49 3.337 1.285c1.517 1.463 2.014 2.92 2.014 3.716 0 .797-.497 2.254-2.014 3.716-.889.795-2.04 1.285-3.337 1.285z"/>
              </svg>
            </a>
            <a 
              href="https://youtube.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-white transition-colors duration-200"
              aria-label="YouTube"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Language and Country Selector */}
        <div className="flex flex-wrap items-center justify-center space-x-6 mt-6 text-sm">
          <button className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors duration-200 border border-gray-600 rounded px-3 py-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm7.931 9h-2.764a14.67 14.67 0 0 0-1.792-6.243A8.013 8.013 0 0 1 19.931 11zM12 4.069c.722.187 1.37.566 1.988 1.193A12.705 12.705 0 0 1 15.497 11H12V4.069zm0 8.931h3.497c-.204 2.02-.611 3.86-1.509 5.738C13.37 17.434 12.722 17.813 12 18v-5.069zm-2 0H12V18c-.722-.187-1.37-.566-1.988-1.193C9.204 14.86 8.797 13.02 8.503 11H10zM8.503 13H10v5.069c-.722-.187-1.37-.566-1.988-1.193C7.204 15.14 6.797 13.3 6.503 11h2zm1.669-8.243A14.67 14.67 0 0 0 8.38 11H5.616a8.013 8.013 0 0 1 4.556-6.243z"/>
            </svg>
            <span>English</span>
          </button>
          <button className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors duration-200">
            <span>🇺🇸 United States</span>
          </button>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="bg-[#131921] py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 text-xs text-gray-400">
            <div>
              <Link to="/conditions" className="hover:text-white transition-colors">
                Conditions of Use
              </Link>
            </div>
            <div>
              <Link to="/privacy" className="hover:text-white transition-colors">
                Privacy Notice
              </Link>
            </div>
            <div>
              <Link to="/ads" className="hover:text-white transition-colors">
                Interest-Based Ads
              </Link>
            </div>
            <div>
              <Link to="/accessibility" className="hover:text-white transition-colors">
                Accessibility
              </Link>
            </div>
            <div>
              <Link to="/help" className="hover:text-white transition-colors">
                Help
              </Link>
            </div>
            <div>
              <Link to="/cookies" className="hover:text-white transition-colors">
                Cookies Notice
              </Link>
            </div>
            <div>
              <Link to="/sustainability" className="hover:text-white transition-colors">
                Sustainability
              </Link>
            </div>
          </div>
          
          <div className="text-center mt-4 text-xs text-gray-400">
            <p>© {currentYear} Amazon Clone, Inc. or its affiliates. Built with ❤️ by Muhammad Masoud</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
