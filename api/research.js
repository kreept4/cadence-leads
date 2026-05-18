export const config = { maxDuration: 60 };

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { query, count = 5 } = req.body;
  if (!query) return res.status(400).json({ error: "Query required" });

  const leadCount = Math.min(Number(count) || 5, 10);

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 4000,
        system: `You are a B2B lead researcher. Return ONLY a valid JSON array of leads. No commentary, no markdown, no explanation — pure JSON only.

Each lead object must have:
- company: string
- industry: string
- location: string
- contactName: string
- contactTitle: string
- email: string (realistic guess based on company)
- website: string
- linkedin: string (LinkedIn company URL)
- fitScore: number 1-10
- fitReason: string (1-2 sentences why they need compliance/regulation help)
- regulation: string (main regulation they face e.g. GDPR, SOX, HIPAA)
- pitch: string (2-3 sentence personalised outreach pitch)
- followUp: string (suggested follow-up timeline e.g. "Follow up in 3 days")`,

        messages: [
          {
            role: "user",
            content: `Find ${leadCount} high-quality B2B leads for: "${query}". Return only a JSON array.`,
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Anthropic error:", data);
      return res.status(500).json({ error: data?.error?.message || "API error" });
    }

    const raw = data.content?.[0]?.text || "[]";

    // Strip any accidental markdown fences
    const clean = raw.replace(/```json|```/g, "").trim();

    let leads;
    try {
      leads = JSON.parse(clean);
    } catch {
      console.error("JSON parse failed:", clean.slice(0, 200));
      return res.status(500).json({ error: "Failed to parse leads from AI response" });
    }

    return res.status(200).json({ leads });
  } catch (err) {
    console.error("Handler error:", err);
    return res.status(500).json({ error: err.message || "Unknown error" });
  }
}
