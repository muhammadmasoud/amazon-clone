import { useState } from "react";
import { useAuth } from "../context/AuthContext";

function Profile() {
  const { user, logout, updateProfile, loading, error } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    mobile: user?.mobile || '',
    address: user?.address || '',
  });
  const [updateSuccess, setUpdateSuccess] = useState(false);

  console.log("User profile:", user);

  const handleEditClick = () => {
    setIsEditing(true);
    // Reset form data to current user data
    setFormData({
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      mobile: user?.mobile || '',
      address: user?.address || '',
    });
    setUpdateSuccess(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setFormData({
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      mobile: user?.mobile || '',
      address: user?.address || '',
    });
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
    try {
      await updateProfile(formData);
      setIsEditing(false);
      setUpdateSuccess(true);
      // Hide success message after 3 seconds
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden py-8">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-purple-400/10 to-pink-400/10 rounded-full blur-3xl"></div>
      <div className="absolute top-1/3 right-1/3 w-72 h-72 bg-gradient-to-r from-cyan-400/5 to-blue-400/5 rounded-full blur-2xl"></div>
      
      <div className="relative z-10 max-w-4xl mx-auto px-4">
        <div className="glass-card rounded-3xl shadow-2xl border border-white/30">
          {/* Header */}
          <div className="px-8 py-6 border-b border-gray-200/50">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Your Profile
              </h1>
            </div>
            
            {updateSuccess && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 text-green-700 px-6 py-4 rounded-2xl shadow-sm">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Profile updated successfully!</span>
                </div>
              </div>
            )}
            
            {error && (
              <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl shadow-sm">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">{error}</span>
                </div>
              </div>
            )}
          </div>

          <div className="px-8 py-6">
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-8">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Account Information
                  </h2>
                  
                  <div className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 p-6 rounded-2xl border border-blue-200/30">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="first_name" className="block text-sm font-semibold text-gray-700 mb-2">
                          First Name
                        </label>
                        <input
                          type="text"
                          id="first_name"
                          name="first_name"
                          value={formData.first_name}
                          onChange={handleInputChange}
                          className="input-field"
                          placeholder="Enter your first name"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="last_name" className="block text-sm font-semibold text-gray-700 mb-2">
                          Last Name
                        </label>
                        <input
                          type="text"
                          id="last_name"
                          name="last_name"
                          value={formData.last_name}
                          onChange={handleInputChange}
                          className="input-field"
                          placeholder="Enter your last name"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Email Address
                        </label>
                        <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-500">
                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            <span className="text-sm">{user?.email || "N/A"} (cannot be changed)</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="mobile" className="block text-sm font-semibold text-gray-700 mb-2">
                          Mobile Number
                        </label>
                        <input
                          type="tel"
                          id="mobile"
                          name="mobile"
                          value={formData.mobile}
                          onChange={handleInputChange}
                          className="input-field"
                          placeholder="Enter your mobile number"
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label htmlFor="address" className="block text-sm font-semibold text-gray-700 mb-2">
                          Address
                        </label>
                        <textarea
                          id="address"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          rows={3}
                          className="input-field resize-none"
                          placeholder="Enter your complete address"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200/50 pt-8">
                  <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="btn-secondary relative overflow-hidden group"
                    >
                      <span className="relative z-10 flex items-center justify-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Cancel
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-100/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
                    </button>
                    
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                    >
                      <span className="relative z-10 flex items-center justify-center">
                        {loading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Saving...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Save Changes
                          </>
                        )}
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Account Information
                  </h2>
                  
                  <div className="bg-gradient-to-r from-gray-50/50 to-blue-50/50 p-6 rounded-2xl border border-gray-200/30">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white/60 p-4 rounded-xl border border-gray-200/50">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                          Email Address
                        </label>
                        <p className="text-gray-900 font-medium flex items-center">
                          <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                          </svg>
                          {user?.email || "N/A"}
                        </p>
                      </div>
                      
                      <div className="bg-white/60 p-4 rounded-xl border border-gray-200/50">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                          First Name
                        </label>
                        <p className="text-gray-900 font-medium flex items-center">
                          <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          {user?.first_name || "N/A"}
                        </p>
                      </div>
                      
                      <div className="bg-white/60 p-4 rounded-xl border border-gray-200/50">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                          Last Name
                        </label>
                        <p className="text-gray-900 font-medium flex items-center">
                          <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          {user?.last_name || "N/A"}
                        </p>
                      </div>
                      
                      <div className="bg-white/60 p-4 rounded-xl border border-gray-200/50">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                          Mobile Number
                        </label>
                        <p className="text-gray-900 font-medium flex items-center">
                          <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          {user?.mobile || "N/A"}
                        </p>
                      </div>
                      
                      <div className="md:col-span-2 bg-white/60 p-4 rounded-xl border border-gray-200/50">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                          Address
                        </label>
                        <p className="text-gray-900 font-medium flex items-start">
                          <svg className="w-4 h-4 mr-2 mt-0.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>{user?.address || "N/A"}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200/50 pt-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-6 text-center flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Account Actions
                  </h2>
                  
                  <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <button
                      onClick={handleEditClick}
                      className="btn-primary relative overflow-hidden group"
                    >
                      <span className="relative z-10 flex items-center justify-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit Profile
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
                    </button>
                    
                    <button
                      onClick={logout}
                      className="bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 relative overflow-hidden group"
                    >
                      <span className="relative z-10 flex items-center justify-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign Out
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;