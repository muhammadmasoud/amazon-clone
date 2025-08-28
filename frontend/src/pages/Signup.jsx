import { useFormik } from "formik";
import { signupSchema } from "../schemas";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

function Signup() {
  const navigate = useNavigate();
  const { signup, error, clearError } = useAuth();
  const [fieldErrors, setFieldErrors] = useState({});

  const formik = useFormik({
    initialValues: {
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema: signupSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        clearError();
        setFieldErrors({}); 
        const userData = {
          first_name: values.first_name,
          last_name: values.last_name,
          email: values.email,
          password: values.password,
          password_confirm: values.confirmPassword,
        };
        await signup(userData);
        
        // Navigate to signup success page with email
        navigate("/signup-success", { 
          state: { email: values.email } 
        });
      } catch (error) {
        if (typeof error === "object") {
          setFieldErrors(error);
        } else {
          console.error("Unexpected error:", error);
        }
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 relative overflow-hidden flex flex-col justify-center">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-purple-400/20 to-blue-400/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-indigo-400/15 to-purple-400/15 rounded-full blur-3xl"></div>
      <div className="absolute top-1/3 right-1/3 w-72 h-72 bg-gradient-to-r from-blue-400/10 to-cyan-400/10 rounded-full blur-2xl"></div>
      <div className="absolute bottom-1/4 right-0 w-64 h-64 bg-gradient-to-l from-pink-400/10 to-purple-400/10 rounded-full blur-2xl"></div>

      <div className="relative z-10 max-w-md w-full mx-auto px-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl shadow-xl mb-4">
            <img
              src="/amazon.png"
              alt="Amazon Clone"
              className="h-10 w-auto object-contain brightness-0 invert"
            />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Join Amazon Clone
          </h1>
          <p className="text-gray-600 mt-2">Create your account and start shopping</p>
        </div>

        <form
          className="glass-card rounded-3xl p-8 shadow-2xl backdrop-blur-xl border border-white/30"
          onSubmit={formik.handleSubmit}
        >
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="first_name"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  First Name
                </label>
                <input
                  id="first_name"
                  name="first_name"
                  type="text"
                  value={formik.values.first_name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`input-field ${
                    (formik.touched.first_name && formik.errors.first_name) ||
                    fieldErrors.first_name
                      ? "border-red-400 focus:border-red-500 focus:ring-red-200"
                      : "focus:border-purple-500 focus:ring-purple-200"
                  }`}
                  placeholder="John"
                  autoComplete="given-name"
                />
                {(fieldErrors.first_name ||
                  (formik.touched.first_name && formik.errors.first_name)) && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {Array.isArray(fieldErrors.first_name)
                      ? fieldErrors.first_name[0]
                      : fieldErrors.first_name || formik.errors.first_name}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="last_name"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Last Name
                </label>
                <input
                  id="last_name"
                  name="last_name"
                  type="text"
                  value={formik.values.last_name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`input-field ${
                    (formik.touched.last_name && formik.errors.last_name) ||
                    fieldErrors.last_name
                      ? "border-red-400 focus:border-red-500 focus:ring-red-200"
                      : "focus:border-purple-500 focus:ring-purple-200"
                  }`}
                  placeholder="Doe"
                  autoComplete="family-name"
                />
                {(fieldErrors.last_name ||
                  (formik.touched.last_name && formik.errors.last_name)) && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {Array.isArray(fieldErrors.last_name)
                      ? fieldErrors.last_name[0]
                      : fieldErrors.last_name || formik.errors.last_name}
                  </p>
                )}
              </div>
            </div>

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
                  (formik.touched.email && formik.errors.email) ||
                  fieldErrors.email
                    ? "border-red-400 focus:border-red-500 focus:ring-red-200"
                    : "focus:border-purple-500 focus:ring-purple-200"
                }`}
                placeholder="john.doe@example.com"
              />
              {(fieldErrors.email ||
                (formik.touched.email && formik.errors.email)) && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {Array.isArray(fieldErrors.email)
                    ? fieldErrors.email[0]
                    : fieldErrors.email || formik.errors.email}
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
                  formik.touched.password && formik.errors.password
                    ? "border-red-400 focus:border-red-500 focus:ring-red-200"
                    : "focus:border-purple-500 focus:ring-purple-200"
                }`}
                placeholder="Create a strong password"
                autoComplete="new-password"
              />
              {formik.touched.password && formik.errors.password && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {formik.errors.password}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                id="confirmPassword"
                value={formik.values.confirmPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`input-field ${
                  formik.touched.confirmPassword &&
                  formik.errors.confirmPassword
                    ? "border-red-400 focus:border-red-500 focus:ring-red-200"
                    : "focus:border-purple-500 focus:ring-purple-200"
                }`}
                placeholder="Confirm your password"
                autoComplete="new-password"
              />
              {formik.touched.confirmPassword &&
                formik.errors.confirmPassword && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {formik.errors.confirmPassword}
                  </p>
                )}
            </div>
          </div>

          <button
            type="submit"
            disabled={formik.isSubmitting}
            className="mt-8 w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
          >
            <span className="relative z-10 flex items-center justify-center">
              {formik.isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
          </button>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white/80 backdrop-blur-sm text-gray-600 rounded-full">
                  Already have an account?{" "}
                  <Link 
                    to="/login" 
                    className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent hover:from-purple-700 hover:to-blue-700 font-semibold transition-all duration-300"
                  >
                    Sign in
                  </Link>
                </span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Signup;