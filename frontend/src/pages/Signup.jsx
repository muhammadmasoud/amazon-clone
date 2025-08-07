import { useFormik } from "formik";
import { signupSchema } from "../schemas";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../services/auth";
import { useState } from "react";

function Signup() {
  const navigate = useNavigate();
  const [fieldErrors, setFieldErrors] = useState({});

  const formik = useFormik({
    initialValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema: signupSchema,
    onSubmit: async (values) => {
      try {
        setFieldErrors({}); // Clear previous errors
        const userData = {
          username: values.username,
          email: values.email,
          password: values.password,
          password_confirm: values.confirmPassword,
        };
        await authService.signup(userData);
        navigate("/login");
      } catch (error) {
        if (typeof error === "object") {
          setFieldErrors(error);
        } else {
          console.error("Unexpected error:", error);
        }
      }
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center">
      <div className="max-w-md w-full mx-auto">
        <form
          className="bg-white p-8 border border-gray-300 rounded-lg"
          onSubmit={formik.handleSubmit}
        >
          <h2 className="text-2xl font-semibold mb-6">Create Account</h2>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700"
              >
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                value={formik.values.username}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`mt-1 block w-full px-3 py-2 border ${
                  (formik.touched.username && formik.errors.username) ||
                  fieldErrors.username
                    ? "border-red-300"
                    : "border-gray-300"
                } rounded-md`}
              />
              {(fieldErrors.username ||
                (formik.touched.username && formik.errors.username)) && (
                <p className="mt-1 text-sm text-red-600">
                  {Array.isArray(fieldErrors.username)
                    ? fieldErrors.username[0]
                    : fieldErrors.username || formik.errors.username}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`mt-1 block w-full px-3 py-2 border ${
                  (formik.touched.email && formik.errors.email) ||
                  fieldErrors.email
                    ? "border-red-300"
                    : "border-gray-300"
                } rounded-md`}
              />
              {(fieldErrors.email ||
                (formik.touched.email && formik.errors.email)) && (
                <p className="mt-1 text-sm text-red-600">
                  {Array.isArray(fieldErrors.email)
                    ? fieldErrors.email[0]
                    : fieldErrors.email || formik.errors.email}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  name="password"
                  id="password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`appearance-none block w-full px-3 py-2 border ${
                    formik.touched.password && formik.errors.password
                      ? "border-red-300"
                      : "border-gray-300"
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm`}
                  autoComplete="new-password"
                />
                {formik.touched.password && formik.errors.password && (
                  <p className="mt-2 text-sm text-red-600">
                    {formik.errors.password}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Re-enter password
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  name="confirmPassword"
                  id="confirmPassword"
                  value={formik.values.confirmPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`appearance-none block w-full px-3 py-2 border ${
                    formik.touched.confirmPassword &&
                    formik.errors.confirmPassword
                      ? "border-red-300"
                      : "border-gray-300"
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm`}
                  autoComplete="new-password"
                />
                {formik.touched.confirmPassword &&
                  formik.errors.confirmPassword && (
                    <p className="mt-2 text-sm text-red-600">
                      {formik.errors.confirmPassword}
                    </p>
                  )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={formik.isSubmitting}
                className="mt-6 w-full bg-[#f0c14b] border border-[#a88734] rounded-md py-2 px-4"
              >
                {formik.isSubmitting ? "Creating account..." : "Create account"}
              </button>
            </div>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Already have an account?{" "}
                  <Link to="/login" className="text-[#0066c0] hover:underline">
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
