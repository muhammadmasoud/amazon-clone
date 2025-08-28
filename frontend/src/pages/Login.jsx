import { useFormik } from "formik";
import { loginSchema } from "../schemas";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/auth";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [unverifiedError, setUnverifiedError] = useState("");
  const [resendingEmail, setResendingEmail] = useState(false);
  const [emailResent, setEmailResent] = useState(false);

  const handleResendVerification = async (email) => {
    try {
      setResendingEmail(true);
      await authService.resendVerificationEmail(email);
      setEmailResent(true);
      setUnverifiedError("");
    } catch (error) {
      setUnverifiedError(error.message || "Failed to resend verification email");
    } finally {
      setResendingEmail(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: loginSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        setUsernameError("");
        setPasswordError("");
        setUnverifiedError("");
        setEmailResent(false);
        
        await login(values);
        navigate("/");
      } catch (error) {
        if (error.response?.data?.error === "email") {
          setUsernameError(error.response.data.message);
        } else if (error.response?.data?.error === "password") {
          setPasswordError(error.response.data.message);
        } else if (error.response?.data?.error === "unverified") {
          setUnverifiedError(error.response.data.message);
        } else {
          setPasswordError("Login failed. Please try again.");
        }
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden flex flex-col justify-center">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl"></div>
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-gradient-to-bl from-purple-400/15 to-pink-400/15 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-gradient-to-tr from-cyan-400/10 to-blue-400/10 rounded-full blur-2xl"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-white/5 to-white/10 rounded-full blur-3xl"></div>

      <div className="relative z-10 max-w-md w-full mx-auto px-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-xl mb-4">
            <img
              src="/amazon.png"
              alt="Amazon Clone"
              className="h-10 w-auto object-contain brightness-0 invert"
            />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Welcome Back
          </h1>
          <p className="text-gray-600 mt-2">Sign in to your account</p>
        </div>

        <form
          className="glass-card rounded-3xl p-8 shadow-2xl backdrop-blur-xl border border-white/30"
          onSubmit={formik.handleSubmit}
        >
          <div className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`input-field ${
                  (formik.touched.email && formik.errors.email) || usernameError
                    ? "border-red-400 focus:border-red-500 focus:ring-red-200"
                    : "focus:border-blue-500 focus:ring-blue-200"
                }`}
                placeholder="Enter your email"
                autoComplete="email"
              />
              {usernameError && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {usernameError}
                </p>
              )}
              {formik.touched.email && formik.errors.email && !usernameError && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {formik.errors.email}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Password
              </label>
              <input
                type="password"
                name="password"
                id="password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`input-field ${
                  (formik.touched.password && formik.errors.password) || passwordError
                    ? "border-red-400 focus:border-red-500 focus:ring-red-200"
                    : "focus:border-blue-500 focus:ring-blue-200"
                }`}
                placeholder="Enter your password"
                autoComplete="current-password"
              />
              {passwordError && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {passwordError}
                </p>
              )}
              {formik.touched.password && formik.errors.password && !passwordError && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {formik.errors.password}
                </p>
              )}
            </div>

            {/* Email verification error message */}
            {unverifiedError && (
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-4 backdrop-blur-sm">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-semibold text-yellow-800">
                      Email verification required
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>{unverifiedError}</p>
                      <button
                        type="button"
                        onClick={() => handleResendVerification(formik.values.email)}
                        disabled={resendingEmail || !formik.values.email}
                        className="mt-3 inline-flex items-center px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                      >
                        {resendingEmail ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Sending...
                          </>
                        ) : (
                          'Resend verification email'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Email resent success message */}
            {emailResent && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-4 backdrop-blur-sm">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-700 font-medium">
                      Verification email sent! Please check your inbox and click the verification link.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={formik.isSubmitting}
            className="mt-8 w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
          >
            <span className="relative z-10 flex items-center justify-center">
              {formik.isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
          </button>

          {/* Forgot Password Link */}
          <div className="mt-6 text-center">
            <Link 
              to="/forgot-password" 
              className="text-sm bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-indigo-700 font-medium transition-all duration-300"
            >
              Forgot your password?
            </Link>
          </div>
        </form>

        {/* Sign up link */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            New to Amazon Clone?{" "}
            <Link 
              to="/signup" 
              className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-indigo-700 font-semibold transition-all duration-300"
            >
              Create your account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;