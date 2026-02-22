const url = {
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
  hostedUrl: import.meta.env.VITE_HOSTED_URL || "",
  mobileUrl: import.meta.env.VITE_MOBILE_URL || "",
};

export default url;
