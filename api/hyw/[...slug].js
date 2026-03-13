const BACKEND_ORIGIN =
  process.env.BACKEND_ORIGIN || "https://hyw-rma-production.up.railway.app";

async function readRequestBody(req) {
  const chunks = [];

  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  return Buffer.concat(chunks).toString("utf8");
}

module.exports = async (req, res) => {
  const requestUrl = new URL(req.url, "https://proxy.local");
  const fallbackSlug = requestUrl.pathname
    .replace(/^\/api\/hyw\/?/, "")
    .replace(/\/$/, "");
  const slug = Array.isArray(req.query.slug)
    ? req.query.slug.join("/")
    : req.query.slug || fallbackSlug;
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
    let requestBody = req.body;

    if (
      typeof requestBody === "undefined" ||
      (requestBody &&
        typeof requestBody === "object" &&
        !Buffer.isBuffer(requestBody) &&
        Object.keys(requestBody).length === 0 &&
        Number(req.headers["content-length"] || 0) > 0)
    ) {
      requestBody = await readRequestBody(req);
    }

    if (Buffer.isBuffer(requestBody)) {
      requestOptions.body = requestBody;
    } else if (typeof requestBody === "string") {
      requestOptions.body = requestBody;
    } else {
      requestOptions.body = JSON.stringify(requestBody || {});
    }

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
