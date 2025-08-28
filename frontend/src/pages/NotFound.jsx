import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

const NotFound = () => {
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          window.location.href = '/';
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="relative">
            {/* Amazon-style broken package illustration */}
            <div className="mx-auto w-64 h-64 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl transform rotate-3 shadow-lg"></div>
              <div className="absolute inset-2 bg-white rounded-xl border-2 border-dashed border-orange-300 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl font-bold text-orange-400 mb-2">404</div>
                  <div className="text-orange-600 text-sm font-medium">Package Not Found</div>
                </div>
              </div>
              {/* Scattered "package contents" */}
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-300 rounded-full opacity-60 animate-bounce delay-100"></div>
              <div className="absolute -bottom-6 -left-2 w-6 h-6 bg-blue-300 rounded-full opacity-60 animate-bounce delay-300"></div>
              <div className="absolute top-1/2 -right-8 w-4 h-4 bg-red-300 rounded-full opacity-60 animate-bounce delay-500"></div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Oops! Page Not Found
            </h1>
            <p className="text-lg text-gray-600 max-w-md mx-auto">
              The page you're looking for seems to have been moved, deleted, or doesn't exist. 
              Don't worry, it happens to the best of us!
            </p>
          </div>

          {/* Auto redirect notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
            <div className="flex items-center justify-center space-x-2 text-blue-700">
              <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="text-sm font-medium">
                Redirecting to home in {countdown} seconds...
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/"
              className="w-full sm:w-auto bg-[#ff9900] hover:bg-[#e88b00] text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Go to Homepage
            </Link>
            <button
              onClick={() => window.history.back()}
              className="w-full sm:w-auto bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-8 rounded-lg border border-gray-300 transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              Go Back
            </button>
          </div>

          {/* Quick Links */}
          <div className="pt-8 border-t border-gray-200">
            <p className="text-gray-500 mb-4 font-medium">Or try these popular pages:</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/"
                className="text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200"
              >
                Browse Home
              </Link>
              <span className="text-gray-300">•</span>
              <Link
                to="/orders"
                className="text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200"
              >
                Your Orders
              </Link>
              <span className="text-gray-300">•</span>
              <Link
                to="/contact"
                className="text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200"
              >
                Contact Support
              </Link>
              <span className="text-gray-300">•</span>
              <Link
                to="/track"
                className="text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200"
              >
                Track Package
              </Link>
            </div>
          </div>
        </div>

        {/* Amazon-style footer note */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-400">
            If you believe this is an error, please{' '}
            <Link to="/contact" className="text-blue-500 hover:underline">
              contact our support team
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
