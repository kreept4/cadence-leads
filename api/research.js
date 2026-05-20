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
      body: JSON.stringify({ model: "claude-haiku-4-5-20251001", max_tokens: 1500, messages: [{ role: "user", content: `Generate exactly ${leadCount} B2B sales leads for: "${query}". Return ONLY a valid JSON array, no explanation, no markdown. Each object must have exactly these fields: company, industry, location, contactName, contactTitle, email, website, linkedin, fitScore (number 1-10), fitReason, regulation, pitch, followUp. For the pitch field, write a personalised outreach message from Bolu Ogunleye, a qualified lawyer, certified mediator and compliance specialist at Cadence Compliance. The pitch should: open with a specific observation about the company or industry, reference a real compliance challenge they likely face, and offer a concrete next step. Keep it under 5 sentences. Tone: confident, professional, direct. Array must have exactly ${leadCount} items.` }] }),
    });
    const text = await response.text();
    let data;
    try { data = JSON.parse(text); } catch { console.error("Freemodel non-JSON:", text.slice(0, 300)); return res.status(500).json({ error: "Freemodel returned an error: " + text.slice(0, 100) }); }
    if (!response.ok) return res.status(500).json({ error: data?.error?.message || "API error" });
    const raw = data.content?.[0]?.text || "[]";
    const clean = raw.replace(/```json|```/g, "").trim();
    let leads;
    try { leads = JSON.parse(clean); } catch { return res.status(500).json({ error: "Parse failed" }); }
    return res.status(200).json({ leads });
  } catch (err) { return res.status(500).json({ error: err.message || "Unknown error" }); }
}




