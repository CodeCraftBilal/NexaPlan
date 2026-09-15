import axios from "axios";

export const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle global errors here if needed
    if (error.response?.status === 401) {
      // Potentially redirect to login
    }
    return Promise.reject(error);
  }
);
