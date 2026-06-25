window.API_BASE_URL = import.meta.env.VITE_API_URL || window.API_BASE_URL || "http://localhost:5000";
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios'
import './index.css'
import App from './App.jsx'

// 🔒 Global Fetch Interceptor for Auto Logout on Token Expiration
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  try {
    const response = await originalFetch(...args);
    if (response.status === 401 || response.status === 403) {
      console.warn("Session expired or unauthorized. Logging out...");
      localStorage.removeItem("Token");
      localStorage.removeItem("Data");
      window.location = "/login";
    }
    return response;
  } catch (error) {
    return Promise.reject(error);
  }
};

// 🔒 Global Axios Interceptor for Auto Logout on Token Expiration
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.warn("Session expired or unauthorized. Logging out...");
      localStorage.removeItem("Token");
      localStorage.removeItem("Data");
      window.location = "/login";
    }
    return Promise.reject(error);
  }
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
