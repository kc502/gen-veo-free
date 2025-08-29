export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { apiKey, body } = req.body;

    if (!apiKey) {
      return res.status(400).json({ error: "Missing API key" });
    }

    // Gemini API ကို proxy လုပ်မယ်
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify(body)
      }
    );

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    console.error("Proxy error:", error);
    return res.status(500).json({ error: "Proxy request failed" });
  }
}
