import { useAuth } from '../context/AuthContext';

function Profile() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-semibold text-gray-900">Your Profile</h1>
          </div>
          
          <div className="px-6 py-4">
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Account Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{user?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <p className="mt-1 text-sm text-gray-900">{user?.name || 'N/A'}</p>
                  </div>
          </div>
        </div>

              <div className="border-t border-gray-200 pt-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Account Actions</h2>
                <div className="space-y-3">
                <button
                    onClick={logout}
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      Sign Out
                    </button>
                  </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;