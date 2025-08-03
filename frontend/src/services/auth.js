import api from "../api/axios";

export const authService = {
  login: async (credentials) => {
    try {
      const response = await api.post("/auth/login/", {
        username: credentials.username,
        password: credentials.password,
      });

      if (response.data.access) {
        localStorage.setItem("token", response.data.access);
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

  logout: () => {
    localStorage.removeItem("token");
  },
};
