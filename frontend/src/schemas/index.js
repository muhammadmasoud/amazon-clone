import * as Yup from "yup";

const passwordRegex = /^(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

export const loginSchema = Yup.object({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string().required("Password is required"),
});

export const signupSchema = Yup.object({
  first_name: Yup.string()
    .min(2, "First name must be at least 2 characters")
    .required("First name is required"),
  last_name: Yup.string()
    .min(2, "Last name must be at least 2 characters")
    .required("Last name is required"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required")
    .matches(passwordRegex, "Password must contain at least one special character"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords must match")
    .required("Please confirm your password"),
});