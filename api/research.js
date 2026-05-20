export const config = { maxDuration: 60 };

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { query, count = 5 } = req.body;
  if (!query) return res.status(400).json({ error: "Query required" });
  const leadCount = Math.min(Number(count) || 5, 20);

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: "claude-haiku-4-5-20251001", max_tokens: 2500, messages: [{ role: "user", content: `Generate ${leadCount} B2B sales leads for: "${query}". This query may reference any city or country worldwide - always return results regardless of location. If exact companies are unknown for that location, generate realistic plausible ones. Return ONLY a valid JSON array, no explanation, no markdown, no preamble. Each object must have exactly these fields: company, industry, location, contactName, contactTitle, email, website, linkedin, fitScore (1-10), fitReason, regulation, pitch, followUp. For the pitch field, write a formal outreach email following this exact structure and tone: Start with "Hello," then a new line. Paragraph 1: "My name is Boluwatife, and I run Cadence Compliance, a data protection and compliance advisory focused on helping organizations strengthen practical, audit-ready compliance systems." Paragraph 2: Mention the specific company by name, note something specific and realistic about their operations or sector, and connect it to why data protection and compliance matters for them under their local regulatory framework. Paragraph 3: Name 3-4 realistic compliance gaps commonly seen in their specific industry. Paragraph 4: "At Cadence Compliance, we work with growing businesses to build practical compliance structures that align with regulatory expectations without disrupting day-to-day operations." Paragraph 5: "I would welcome a brief conversation to share some of the trends we are seeing across the sector and explore whether there may be an opportunity to support your team." Close with: "Kind regards, Boluwatife, Cadence Compliance". Use no hyphens, no bullet points, no em dashes. Write in full sentences only. Formal, professional tone throughout. Array must have exactly ${leadCount} items.` }] }),
    });
    const text = await r.text();
    let data;
    try { data = JSON.parse(text); } catch { return res.status(500).json({ error: "API error: " + text.slice(0, 100) }); }
    if (!r.ok) return res.status(500).json({ error: data?.error?.message || "API error" });
    const raw = data.content?.[0]?.text || "[]";
    const clean = raw.replace(/```json|```/g, "").trim();
    let leads;
    try { leads = JSON.parse(clean); } catch { return res.status(500).json({ error: "Parse failed" }); }
    return res.status(200).json({ leads });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Unknown error" });
  }
}
