import api from "../api/axios";

export const authService = {
  login: async (credentials) => {
    try {
      // Send username and password for login
      const response = await api.post("/auth/login/", {
        username: credentials.username, // Changed from email
        password: credentials.password,
      });

      if (response.data.access) {
        localStorage.setItem("token", response.data.access);
        return response.data;
      }
    } catch (error) {
      console.error("Login Error:", error.response?.data);
      throw error.response?.data || error.message;
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
