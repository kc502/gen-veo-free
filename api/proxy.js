export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { apiKey, model, prompt, negativePrompt, aspectRatio, personGeneration } = req.body;

    const startResp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:predictLongRunning`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        instances: [{ prompt }],
        parameters: {
          aspectRatio,
          ...(negativePrompt ? { negativePrompt } : {}),
          ...(personGeneration ? { personGeneration } : {})
        }
      })
    });

    const op = await startResp.json();
    if (!startResp.ok) return res.status(startResp.status).json(op);

    // Poll until done
    let done = false, status;
    while(!done){
      await new Promise(r => setTimeout(r, 5000));
      const poll = await fetch(`https://generativelanguage.googleapis.com/v1beta/${op.name}`, {
        headers: { "x-goog-api-key": apiKey }
      });
      status = await poll.json();
      done = !!status.done;
      if(status.error) return res.status(400).json(status.error);
    }

    const uri = status.response?.generateVideoResponse?.generatedSamples?.[0]?.video?.uri ||
                status.response?.generatedVideos?.[0]?.video?.uri;

    if(!uri) return res.status(400).json({ error: "No video URI in response", status });

    // Just forward signed URL back to browser
    return res.status(200).json({ videoUrl: uri });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
