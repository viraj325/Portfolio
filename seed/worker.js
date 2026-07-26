const worker = {
  async fetch(request, env) {
    const url = new URL(request.url);
    const isDocumentRequest =
      request.method === "GET" &&
      (url.pathname === "/" || !url.pathname.split("/").pop().includes("."));

    if (isDocumentRequest) {
      const indexRequest = new Request(new URL("/index.html", url), request);
      const indexResponse = await env.ASSETS.fetch(indexRequest);

      if (!indexResponse.ok) return indexResponse;

      const page = await indexResponse.text();
      const absoluteSocialImage = `${url.origin}/assets/seed-lockup.png`;
      const hydratedPage = page
        .replace('content="assets/seed-lockup.png"', `content="${absoluteSocialImage}"`)
        .replace('content="assets/seed-lockup.png"', `content="${absoluteSocialImage}"`);

      return new Response(hydratedPage, {
        status: indexResponse.status,
        headers: indexResponse.headers,
      });
    }

    return env.ASSETS.fetch(request);
  },
};

export default worker;
