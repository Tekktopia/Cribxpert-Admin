const url = {
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
  hostedUrl: import.meta.env.VITE_HOSTED_URL || "https://cribxpert-backend.onrender.com",
  mobileUrl: import.meta.env.VITE_MOBILE_URL || "http://192.168.0.145:5000",
};

export default url;
