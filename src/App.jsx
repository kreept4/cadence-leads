export const config = { maxDuration: 60 };

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { query, count = 5 } = req.body;
  if (!query) return res.status(400).json({ error: "Query required" });

  // Cap at 10 to avoid timeouts
  const safeCount = Math.min(Number(count) || 5, 10);

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
        system: `You are a business development research agent for Cadence Compliance, an AI-powered compliance advisory firm run by Bolu Ogunleye — a qualified lawyer based in Nigeria with global reach.

Find real businesses that need compliance help but lack a dedicated compliance team.

TARGET INDUSTRIES: Fintech, homecare, law firms, insurance brokers, real estate, schools, logistics, HR/recruitment.
GEOGRAPHY: Global — Nigeria, UK, US, Canada, Europe. Vary the regions.
TARGET: 10–500 employees, growing or recently scaled, no in-house compliance team. No large corporations or household names.

Return ONLY valid JSON with a "leads" array. Each lead must have:
- company: string
- industry: string
- location: string (city, country)
- website: string (real URL or empty string)
- contact: string (name and title, or empty string)
- linkedin: string (URL or empty string)
- fit_score: "High" | "Medium" | "Low"
- fit_reason: string (2 sentences — why this score, referencing their stage or gaps)
- regulation: string (specific regulation e.g. "NDPR 2019", "GDPR", "FCA Consumer Duty", "HIPAA")
- follow_up: string (suggested timeline and channel)
- pitch: string (3 sentences from Bolu — credible, peer-to-peer, no pricing, no hollow openers, references the regulation, ends with low-pressure invite)

Return exactly ${safeCount} leads. Return ONLY the JSON object. No markdown, no backticks.`,

        messages: [
          {
            role: "user",
            content: `Find ${safeCount} real compliance prospects for: "${query}". Vary geography. No household names. Return JSON only.`,
          },
        ],
      }),
    });

    const data = await response.json();
    if (data.error) throw new Error(JSON.stringify(data.error));

    const text = data.content?.map((b) => b.text || "").join("") || "";
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    res.status(200).json(parsed);
  } catch (err) {
    console.error("Research error:", err);
    res.status(500).json({ error: err.message || "Research failed" });
  }
}