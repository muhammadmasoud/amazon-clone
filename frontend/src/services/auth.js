import api from "../api/axios";

export const authService = {
  login: async (credentials) => {
    try {
      const response = await api.post("/auth/login/", {
        email: credentials.email,
        password: credentials.password,
      });

      if (response.data.access) {
        localStorage.setItem("token", response.data.access);
        localStorage.setItem("refreshToken", response.data.refresh);
        return response.data;
      }
    } catch (error) {
      // Attach the full error response to the error object
      const enhancedError = new Error(error.message);
      enhancedError.response = error.response;
      throw enhancedError;
    }
  },

  signup: async (userData) => {
    try {
      const response = await api.post("/auth/signup/", userData);
      return response.data;
    } catch (error) {
      console.error("Signup failed:", error.response?.data || error.message);
      throw error.response?.data || { message: "Signup failed" };
    }
  },

  verifyEmail: async (token) => {
    try {
      const response = await api.get(`/auth/verify-email/${token}/`);
      return response.data;
    } catch (error) {
      console.error("Email verification failed:", error.response?.data || error.message);
      throw error.response?.data || { message: "Email verification failed" };
    }
  },

  resendVerificationEmail: async (email) => {
    try {
      const response = await api.post("/auth/resend-verification/", { email });
      return response.data;
    } catch (error) {
      console.error("Resend verification failed:", error.response?.data || error.message);
      throw error.response?.data || { message: "Failed to resend verification email" };
    }
  },

  forgotPassword: async (email) => {
    try {
      const response = await api.post("/auth/forgot-password/", { email });
      return response.data;
    } catch (error) {
      console.error("Forgot password failed:", error.response?.data || error.message);
      throw error.response?.data || { message: "Failed to send password reset email" };
    }
  },

  validateResetToken: async (token) => {
    try {
      const response = await api.get(`/auth/validate-reset-token/${token}/`);
      return response.data;
    } catch (error) {
      console.error("Token validation failed:", error.response?.data || error.message);
      throw error.response?.data || { message: "Invalid or expired reset token" };
    }
  },

  resetPassword: async (token, passwordData) => {
    try {
      const response = await api.post(`/auth/reset-password/${token}/`, passwordData);
      return response.data;
    } catch (error) {
      console.error("Password reset failed:", error.response?.data || error.message);
      const enhancedError = new Error(error.message);
      enhancedError.response = error.response;
      throw enhancedError;
    }
  },

  logout: async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        await api.post("/auth/logout/", { refresh: refreshToken });
      }
    } catch (error) {
      console.error("Logout error:", error);
      // Continue with logout even if server request fails
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
    }
  },

  getCurrentUser: async () => {
    try {
      const response = await api.get("/auth/profile/");
      return response.data;
    } catch (error) {
      console.error("Get current user error:", error.response?.data || error.message);
      throw error;
    }
  },

  updateProfile: async (userData) => {
    try {
      const response = await api.put("/auth/profile/", userData);
      return response.data;
    } catch (error) {
      console.error("Update profile error:", error.response?.data || error.message);
      if (error.response?.data) {
        throw new Error(error.response.data.message || 'Profile update failed');
      }
      throw new Error('Network error occurred');
    }
  }
};