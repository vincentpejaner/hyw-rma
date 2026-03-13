const DIRECT_API_ORIGIN = import.meta.env.VITE_DIRECT_API_ORIGIN || "";

const isSecureDeployment =
  typeof window !== "undefined" && window.location.protocol === "https:";

export const API_BASE = "https://hyw-rma-production-81c6.up.railway.app/api/hyw";
