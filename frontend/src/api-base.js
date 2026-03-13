const DIRECT_API_ORIGIN =
  import.meta.env.VITE_DIRECT_API_ORIGIN || "http://192.168.254.131:3001";

const isSecureDeployment =
  typeof window !== "undefined" && window.location.protocol === "https:";

export const API_BASE = isSecureDeployment
  ? "/api/hyw"
  : `${DIRECT_API_ORIGIN}/api/hyw`;
