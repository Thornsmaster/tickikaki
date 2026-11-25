module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = typeof req.body?.token === "string" ? req.body.token.trim() : "";

  if (!token) {
    return res.status(400).json({ error: "Bitte einen Vercel-Token übergeben." });
  }

  if (token.length > 8192) {
    return res.status(400).json({ error: "Der Token ist ungewöhnlich lang." });
  }

  try {
    const upstreamResponse = await fetch("https://api.vercel.com/v2/user", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json"
      },
      cache: "no-store"
    });

    const responseText = await upstreamResponse.text();
    let responseData;

    try {
      responseData = responseText ? JSON.parse(responseText) : {};
    } catch {
      responseData = { message: "Vercel hat keine JSON-Antwort zurückgegeben." };
    }

    return res.status(upstreamResponse.status).json(responseData);
  } catch {
    return res.status(502).json({
      error: "Die Vercel-API konnte nicht erreicht werden. Bitte versuche es erneut."
    });
  }
};
