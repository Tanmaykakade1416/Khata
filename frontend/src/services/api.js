import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: (userData) => api.post("/auth/register", userData),
  login: (credentials) => api.post("/auth/login", credentials),
};

// Transaction API calls
export const transactionAPI = {
  getAll: () => api.get("/transactions"),
  create: (transactionData) => api.post("/transactions", transactionData),
  update: (id, transactionData) =>
    api.put(`/transactions/${id}`, transactionData),
  delete: (id) => api.delete(`/transactions/${id}`),
  getSummary: () => api.get("/transactions/summary"),
};

export default api;
