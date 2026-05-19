export const config = { maxDuration: 60 };
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { query, count = 5 } = req.body;
  if (!query) return res.status(400).json({ error: "Query required" });
  const leadCount = Math.min(Number(count) || 5, 10);
  try {
    const response = await fetch("https://cc.freemodel.dev/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": process.env.FREEMODEL_API_KEY, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: "claude-haiku-4-5-20251001", max_tokens: 2500, messages: [{ role: "user", content: `Find ${leadCount} B2B leads for: "${query}". Return only a JSON array with: company, industry, location, contactName, contactTitle, email, website, linkedin, fitScore, fitReason, regulation, pitch, followUp.` }] }),
    });
    const data = await response.json();
    if (!response.ok) return res.status(500).json({ error: data?.error?.message || "API error" });
    const raw = data.content?.[0]?.text || "[]";
    const clean = raw.replace(/```json|```/g, "").trim();
    let leads;
    try { leads = JSON.parse(clean); } catch { return res.status(500).json({ error: "Parse failed" }); }
    return res.status(200).json({ leads });
  } catch (err) { return res.status(500).json({ error: err.message || "Unknown error" }); }
}
