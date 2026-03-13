const BACKEND_ORIGIN =
  process.env.BACKEND_ORIGIN || "https://hyw-rma-production.up.railway.app";

module.exports = async (req, res) => {
  const slug = Array.isArray(req.query.slug) ? req.query.slug.join("/") : "";
  const targetUrl = new URL(
    `/api/hyw/${slug}`,
    BACKEND_ORIGIN.endsWith("/") ? BACKEND_ORIGIN : `${BACKEND_ORIGIN}/`,
  );

  Object.entries(req.query).forEach(([key, value]) => {
    if (key === "slug") {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((entry) => targetUrl.searchParams.append(key, entry));
      return;
    }

    if (typeof value !== "undefined") {
      targetUrl.searchParams.append(key, value);
    }
  });

  const headers = { ...req.headers };
  delete headers.host;
  delete headers.connection;
  delete headers["content-length"];

  const requestOptions = {
    method: req.method,
    headers,
  };

  if (req.method !== "GET" && req.method !== "HEAD") {
    requestOptions.body =
      typeof req.body === "string" ? req.body : JSON.stringify(req.body || {});
    requestOptions.headers["content-type"] =
      requestOptions.headers["content-type"] || "application/json";
  }

  try {
    const response = await fetch(targetUrl, requestOptions);
    const responseText = await response.text();

    res.status(response.status);

    const contentType = response.headers.get("content-type");
    if (contentType) {
      res.setHeader("content-type", contentType);
    }

    res.send(responseText);
  } catch (error) {
    console.error("Proxy request failed:", error);
    res.status(502).json({
      message: "Failed to reach backend server.",
      error: error?.message || "Proxy error",
    });
  }
};
