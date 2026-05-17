export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { query, count = 5 } = req.body;
  if (!query) return res.status(400).json({ error: "Query required" });

  try {
    const response = await fetch("https://cc.freemodel.dev/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.FREEMODEL_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 4000,
        system: `You are a business development research agent for Cadence Compliance, an AI-powered compliance and legal advisory firm. Your job is to find real, specific businesses that would genuinely benefit from compliance audits and AI compliance tools.

Cadence Compliance offers:
- AI Compliance Audits ($300 one-time)
- AI Compliance Agent retainer ($150/month)
- Legal Research Support ($100/month)

Target businesses in regulated industries: healthcare/homecare, fintech/financial services, legal firms, insurance, real estate, and other compliance-heavy sectors.

When given a search query, find REAL businesses — use your knowledge and reasoning to identify specific companies. For each lead return ONLY valid JSON, no markdown, no explanation.

Return a JSON object with a "leads" array. Each lead must have:
- company: string (real company name)
- industry: string
- location: string
- website: string (real URL if known, otherwise empty string)
- contact: string (any known contact info, or empty string)
- fit_score: "High" | "Medium" | "Low"
- reason: string (1-2 sentences why they need compliance help)
- pitch: string (2-3 sentence personalised outreach message from Bolu at Cadence Compliance)

Return exactly ${count} leads. Return ONLY the JSON object, nothing else.`,
        messages: [
          {
            role: "user",
            content: `Find ${count} real business prospects matching this description: "${query}". Focus on businesses that genuinely operate in regulated spaces and would benefit from compliance auditing and AI compliance tools. Return the JSON only.`,
          },
        ],
      }),
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);

    const text = data.content?.map(b => b.text || "").join("") || "";
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    res.status(200).json(parsed);
  } catch (err) {
    res.status(500).json({ error: err.message || "Research failed" });
  }
}
