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