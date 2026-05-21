export const config = { maxDuration: 60 };

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { query, count = 5 } = req.body;
  if (!query) return res.status(400).json({ error: "Query required" });
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  try {
    const searchRes = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Goog-Api-Key": apiKey, "X-Goog-FieldMask": "places.displayName,places.formattedAddress,places.websiteUri,places.types" },
      body: JSON.stringify({ textQuery: query, maxResultCount: Math.min(count, 20) }),
    });
    const searchData = await searchRes.json();
    const places = searchData.places || [];
    if (places.length === 0) return res.status(200).json({ leads: [], source: "none" });
    const placeSummaries = places.map(p => ({ company: p.displayName?.text || "Unknown", location: p.formattedAddress || "", website: p.websiteUri || "", types: (p.types || []).join(", "), contactVerified: false }));

    // Step 2: Web search each company for a real specific detail
    const topPlaces = placeSummaries.slice(0, 5);

    // Step 2: Web search top 3 companies sequentially to avoid rate limits
    const withContext = [];
    for (const place of topPlaces) {
      try {
        const wsRes = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
          body: JSON.stringify({
            model: "claude-haiku-4-5-20251001",
            max_tokens: 200,
            tools: [{ type: "web_search_20250305", name: "web_search" }],
            messages: [{ role: "user", content: "Find one recent fact about: " + place.company + " in " + place.location + ". One sentence only. If nothing found say: NO_CONTEXT" }],
          }),
        });
        const wsData = await wsRes.json();
        const context = wsData.content?.find(b => b.type === "text")?.text || "NO_CONTEXT";
        withContext.push({ ...place, context: context.includes("NO_CONTEXT") ? "" : context.trim() });
      } catch (_) { withContext.push({ ...place, context: "" }); }
      await new Promise(r => setTimeout(r, 1000));
    }
    const remaining = placeSummaries.slice(5).map(p => ({ ...p, context: "" }));
    const allCompanies = [...withContext, ...remaining];
    const enrichData = await enrichRes.json();
    const raw = enrichData.content?.[0]?.text || "[]";
      body: JSON.stringify({ model: "claude-haiku-4-5-20251001", max_tokens: 3000, messages: [{ role: "user", content: "For each company below add: industry, fitScore (1-10), fitReason, regulation, followUp, and a formal pitch. Pitch structure: Start with Hello, then new line. Para1: My name is Boluwatife, and I run Cadence Compliance, a data protection and compliance advisory focused on helping organizations strengthen practical, audit-ready compliance systems. Para2: mention company by name, if context field is not empty reference it as a specific real detail, connect to local regulatory framework. Para3: 3-4 compliance gaps. Para4: At Cadence Compliance, we work with growing businesses to build practical compliance structures that align with regulatory expectations without disrupting day-to-day operations. Para5: I would welcome a brief conversation to share some of the trends we are seeing across the sector and explore whether there may be an opportunity to support your team. Close: Kind regards, Boluwatife, Cadence Compliance. No hyphens no bullets. Return ONLY valid JSON array: company, industry, location, contactName, contactTitle, email, website, linkedin, fitScore, fitReason, regulation, pitch, followUp. Companies: " + JSON.stringify(allCompanies) }] }),
    let leads;
    try { leads = JSON.parse(clean); } catch { return res.status(500).json({ error: "Parse failed" }); }
    leads = leads.map((l, i) => ({ ...l, website: withContext[i]?.website || l.website, source: "real", contactVerified: false }));
    return res.status(200).json({ leads, source: "places" });
  } catch (err) {
    leads = leads.map((l, i) => ({ ...l, website: allCompanies[i]?.website || l.website, source: "real", contactVerified: false }));
  }
}
