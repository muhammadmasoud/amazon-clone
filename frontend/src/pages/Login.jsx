import { useFormik } from "formik";
import { loginSchema } from "../schemas";
import { Link } from "react-router-dom";

function Login() {
  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: loginSchema,
    onSubmit: (values) => {
      console.log(values);
    },
  });
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center">
      <div className="max-w-md w-full mx-auto">
        <form
          className="bg-white p-8 border border-gray-300 rounded-lg shadow-sm"
          onSubmit={formik.handleSubmit}
        >
          <h2 className="text-2xl font-semibold mb-6">Sign In</h2>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#f0c14b] focus:border-[#a88734] hover:border-[#a88734]"
                autoComplete="email"
              />
              {formik.touched.email && formik.errors.email && (
                <p className="mt-1 text-sm text-red-600">
                  {formik.errors.email}
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
              <input
                type="password"
                name="password"
                id="password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#f0c14b] focus:border-[#a88734] hover:border-[#a88734]"
                autoComplete="current-password"
              />
              {formik.touched.password && formik.errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {formik.errors.password}
                </p>
              )}
            </div>
          </div>

          <input
            type="submit"
            value="Sign In"
            className="mt-6 w-full bg-[#f0c14b] border border-[#a88734] rounded-md py-2 px-4 text-sm font-medium text-gray-900 hover:bg-[#f4d078] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
          />
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Are you a new customer?{" "}
            <Link to="/signup" className="text-blue-600 hover:underline">
              Signup
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
