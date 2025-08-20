import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { authService } from '../services/auth';

function SignupSuccess() {
  const location = useLocation();
  const [resendingEmail, setResendingEmail] = useState(false);
  const [emailResent, setEmailResent] = useState(false);
  const [error, setError] = useState('');
  
  // Get email from navigation state
  const email = location.state?.email;

  const handleResendVerification = async () => {
    if (!email) return;
    
    try {
      setResendingEmail(true);
      setError('');
      await authService.resendVerificationEmail(email);
      setEmailResent(true);
    } catch (error) {
      setError(error.message || "Failed to resend verification email");
    } finally {
      setResendingEmail(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center">
      <div className="max-w-md w-full mx-auto">
        <div className="bg-white p-8 border border-gray-300 rounded-lg text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
            </svg>
          </div>
          
          <h2 className="text-2xl font-semibold mb-4">Check Your Email</h2>
          
          <p className="text-gray-600 mb-6">
            We've sent a verification email to <strong>{email}</strong>. Please check your inbox and click the verification link to complete your registration.
          </p>

          <div className="bg-gray-50 p-4 rounded-md mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-2">What's next?</h3>
            <ol className="text-sm text-gray-600 space-y-1">
              <li>1. Check your email inbox</li>
              <li>2. Look for an email from Amazon Clone</li>
              <li>3. Click the "Verify My Email" button</li>
              <li>4. Return here to sign in</li>
            </ol>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {emailResent && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
              <p className="text-sm text-green-700">
                Verification email sent successfully! Please check your inbox.
              </p>
            </div>
          )}

          <div className="space-y-3">
            {email && (
              <button
                onClick={handleResendVerification}
                disabled={resendingEmail}
                className="w-full bg-gray-200 text-gray-800 rounded-md py-2 px-4 text-sm font-medium hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resendingEmail ? 'Sending...' : 'Resend verification email'}
              </button>
            )}
            
            <Link 
              to="/login"
              className="block bg-[#f0c14b] border border-[#a88734] rounded-md py-2 px-4 text-sm font-medium text-gray-900 hover:bg-[#f4d078] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
            >
              Go to Sign In
            </Link>
          </div>

          <div className="mt-6 text-xs text-gray-500">
            <p>Didn't receive the email? Check your spam folder or try resending.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignupSuccess;