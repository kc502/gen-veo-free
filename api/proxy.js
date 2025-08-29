// api/proxy.js
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { apiKey, model, prompt, negativePrompt, aspectRatio, personGeneration } = req.body;

    if (!apiKey) return res.status(400).json({ error: 'Missing API key' });

    const startResp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:predictLongRunning`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify({
          instances: [{ prompt }],
          parameters: {
            aspectRatio,
            ...(negativePrompt ? { negativePrompt } : {}),
            ...(personGeneration ? { personGeneration } : {})
          }
        })
      }
    );

    const op = await startResp.json();
    res.status(200).json(op);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
