import { API_BASE } from "./api-base.js";

export function checkSession() {
  const account = JSON.parse(localStorage.getItem("account"));

  if (!account) {
    window.location.hash = "#login";
    return;
  }

  fetch(`${API_BASE}/check-session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      account_id: account.account_id,
      token: account.token,
    }),
  })
    .then(async (res) => {
      const data = await res.json();
      if (!res.ok || data.message === "Account logged in on another device.") {
        throw new Error(
          data?.message || "Session invalid. Please sign in again.",
        );
      }
      return data;
    })
   
}
