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

Target profile: small to mid-size businesses, growing startups, independent firms, and regional operators in regulated industries. Avoid large corporations, multinationals, or household-name enterprises that have dedicated compliance departments. Focus on businesses that are likely operating without structured compliance infrastructure.

Target industries: homecare agencies, community health providers, fintech startups, lending platforms, payment companies, small to mid-size law firms, insurance brokers, real estate agencies, and similar compliance-sensitive businesses.

When given a search query, find REAL businesses. Use your knowledge to identify specific companies that are realistic prospects. Return ONLY valid JSON, no markdown, no explanation.

Return a JSON object with a "leads" array. Each lead must have:
- company: string (real company name)
- industry: string
- location: string
- website: string (real URL if known, otherwise empty string)
- contact: string (any known contact info, or empty string)
- fit_score: "High" | "Medium" | "Low"
- reason: string (1-2 sentences why they specifically need compliance help, focused on gaps a growing business typically has)
- pitch: string (2-3 sentence warm outreach message from Bolu at Cadence Compliance. Do not mention pricing. Lead with a relevant insight or observation about their likely compliance exposure. Write in plain flowing prose with no hyphens or bullet points. Sound human and credible, not salesy.)

Return exactly ${count} leads. Return ONLY the JSON object, nothing else.`,
        messages: [
          {
            role: "user",
            content: `Find ${count} real business prospects matching this description: "${query}". 

Important rules:
- Exclude any well-known, widely recognised, or large-scale companies. Do not return household names, unicorns, or market leaders.
- Focus on smaller, lesser-known, growing businesses that are likely operating without a dedicated compliance team.
- These should be real businesses but ones that are under the radar, regional, or early stage.
- They must genuinely operate in regulated spaces and would benefit from an external compliance audit.

Return the JSON only.`,
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
