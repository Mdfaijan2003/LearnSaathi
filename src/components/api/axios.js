// src/api/axios.js
import axios from "axios";

const Api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5137/api/v1",
  withCredentials: true,
});

export default Api;
