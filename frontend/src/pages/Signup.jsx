import { useFormik } from "formik";
import { signupSchema } from "../schemas";
import { Link } from 'react-router-dom';


function Signup() {
  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema: signupSchema,
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
          <h2 className="text-2xl font-semibold mb-6">Create Account</h2>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Your name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#f0c14b] focus:border-[#a88734] hover:border-[#a88734]"
                autoComplete="name"
              />
              {formik.touched.name && formik.errors.name && (
                <p className="mt-1 text-sm text-red-600">
                  {formik.errors.name}
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
                autoComplete="new-password"
              />
              {formik.touched.password && formik.errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {formik.errors.password}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Re-enter password
              </label>
              <input
                type="password"
                name="confirmPassword"
                id="confirmPassword"
                value={formik.values.confirmPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#f0c14b] focus:border-[#a88734] hover:border-[#a88734]"
                autoComplete="new-password"
              />
              {formik.touched.confirmPassword &&
                formik.errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">
                    {formik.errors.confirmPassword}
                  </p>
                )}
            </div>
          </div>

          <button
            type="submit"
            className="mt-6 w-full bg-[#f0c14b] border border-[#a88734] rounded-md py-2 px-4 text-sm font-medium text-gray-900 hover:bg-[#f4d078] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
          >
            Create your account
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;
