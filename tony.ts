const GEMINI_API_BASE = "https://generativelanguage.googleapis.com";

async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);

  // 健康检查
  if (url.pathname === "/health") {
    return new Response("OK", { status: 200 });
  }

  // 转发 Gemini API
  if (url.pathname.startsWith("/v1beta/")) {
    const targetUrl = `${GEMINI_API_BASE}${url.pathname}${url.search}`;

    const headers = new Headers(req.headers);
    headers.set("User-Agent", "Gemini-Aggregator-Serverless/1.0");

    try {
      const response = await fetch(targetUrl, {
        method: req.method,
        headers,
        body: req.body,
      });

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      });
    } catch (error) {
      return new Response(
        JSON.stringify({
          error: "Forwarding failed",
          details: error instanceof Error ? error.message : String(error),
        }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }
  }

  return new Response("Not Found", { status: 404 });
}

// 关键：不要写 port: 80，也不要用旧的 serve
Deno.serve(handler);
