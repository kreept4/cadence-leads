export const config = { maxDuration: 60 };

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { query, count = 5 } = req.body;
  if (!query) return res.status(400).json({ error: "Query required" });

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  try {
    const searchRes = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "places.displayName,places.formattedAddress,places.websiteUri,places.nationalPhoneNumber,places.types,places.id",
      },
      body: JSON.stringify({ textQuery: query, maxResultCount: Math.min(count, 20) }),
    });

    const searchData = await searchRes.json();
    console.log("Places API response:", JSON.stringify(searchData).slice(0, 500));

    const places = searchData.places || [];
    console.log("Places found:", places.length);

    if (places.length === 0) {
      return res.status(200).json({ leads: [], source: "none", debug: searchData });
    }

    const placeSummaries = places.map(p => ({
      company: p.displayName?.text || "Unknown",
      location: p.formattedAddress || "",
      website: p.websiteUri || "",
      phone: p.nationalPhoneNumber || "",
      types: (p.types || []).join(", "),
    }));

    const enrichRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 3000,
        messages: [{
          role: "user",
          content: `You are a B2B lead enrichment assistant. For each company below, add: industry, contactName (realistic guess), contactTitle, email (realistic guess based on website domain), linkedin, fitScore (1-10), fitReason, regulation, followUp, and a formal pitch email. The pitch must follow this exact structure: Start with "Hello," then new line. Paragraph 1: "My name is Boluwatife, and I run Cadence Compliance, a data protection and compliance advisory focused on helping organizations strengthen practical, audit-ready compliance systems." Paragraph 2: Mention the company by name, note something specific about their operations, connect it to data protection and compliance under their local regulatory framework. Paragraph 3: Name 3-4 realistic compliance gaps in their industry. Paragraph 4: "At Cadence Compliance, we work with growing businesses to build practical compliance structures that align with regulatory expectations without disrupting day-to-day operations." Paragraph 5: "I would welcome a brief conversation to share some of the trends we are seeing across the sector and explore whether there may be an opportunity to support your team." Close with: "Kind regards, Boluwatife, Cadence Compliance". No hyphens, no bullets, no em dashes. Formal tone. Return ONLY a valid JSON array where each object has: company, industry, location, contactName, contactTitle, email, website, linkedin, fitScore, fitReason, regulation, pitch, followUp. Companies: ${JSON.stringify(placeSummaries)}`
        }],
      }),
    });

    const enrichData = await enrichRes.json();
    const raw = enrichData.content?.[0]?.text || "[]";
    const clean = raw.replace(/```json|```/g, "").trim();
    let leads;
    try { leads = JSON.parse(clean); } catch { return res.status(500).json({ error: "Enrichment parse failed", raw: raw.slice(0, 200) }); }

    leads = leads.map((l, i) => ({
      ...l,
      website: placeSummaries[i]?.website || l.website,
      source: "real",
    }));

    return res.status(200).json({ leads, source: "places" });
  } catch (err) {
    console.error("Places error:", err);
    return res.status(500).json({ error: err.message || "Unknown error" });
  }
}
