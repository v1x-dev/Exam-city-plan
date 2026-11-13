import axios from "axios";
const api = axios.create({ baseURL: "http://localhost:5000/api", withCredentials: true });
export const errMsg = (e) => e.response?.data?.error || "Cannot reach the server. Is Flask running?";
export default api;
