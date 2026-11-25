export default {
  async fetch(request) {
    const headers = {
      "Content-Type": "application/json",
      "Cache-Control": "no-store"
    };

    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...headers, Allow: "POST" }
      });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: "Ungültige Anfrage." }), {
        status: 400,
        headers
      });
    }

    const token = typeof body?.token === "string" ? body.token.trim() : "";

    if (!token) {
      return new Response(JSON.stringify({ error: "Bitte einen Vercel-Token übergeben." }), {
        status: 400,
        headers
      });
    }

    if (token.length > 8192) {
      return new Response(JSON.stringify({ error: "Der Token ist ungewöhnlich lang." }), {
        status: 400,
        headers
      });
    }

    try {
      const upstreamResponse = await fetch("https://api.vercel.com/v2/user", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json"
        }
      });

      const responseText = await upstreamResponse.text();
      let responseData;

      try {
        responseData = responseText ? JSON.parse(responseText) : {};
      } catch {
        responseData = { message: "Vercel hat keine JSON-Antwort zurückgegeben." };
      }

      return new Response(JSON.stringify(responseData), {
        status: upstreamResponse.status,
        headers
      });
    } catch {
      return new Response(JSON.stringify({
        error: "Die Vercel-API konnte nicht erreicht werden. Bitte versuche es erneut."
      }), {
        status: 502,
        headers
      });
    }
  }
};
