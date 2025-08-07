import { useAuth } from '../context/AuthContext';

function Home() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Amazon Clone
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Your one-stop shop for everything you need
          </p>
          
          {isAuthenticated ? (
            <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
              <h2 className="text-2xl font-semibold mb-4">Welcome back!</h2>
              <p className="text-gray-600 mb-4">
                Hello, {user?.name || user?.email}!
              </p>
              <p className="text-sm text-gray-500">
                You are successfully logged in to your account.
              </p>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
              <h2 className="text-2xl font-semibold mb-4">Get Started</h2>
              <p className="text-gray-600 mb-6">
                Sign in to your account or create a new one to start shopping.
              </p>
              <div className="space-y-3">
                <a
                  href="/login"
                  className="block w-full bg-[#f0c14b] border border-[#a88734] rounded-md py-2 px-4 text-sm font-medium text-gray-900 hover:bg-[#f4d078] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                >
                  Sign In
                </a>
                <a
                  href="/signup"
                  className="block w-full bg-gray-800 text-white rounded-md py-2 px-4 text-sm font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Create Account
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home; 