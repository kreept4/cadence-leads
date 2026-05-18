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
        max_tokens: 6000,
        system: `You are an elite business development research agent for Cadence Compliance, an AI-powered compliance and legal advisory firm run by Bolu Ogunleye — a qualified lawyer and Chartered Arbitrator based in Nigeria with global reach.

Your job is to find real, specific businesses that would genuinely benefit from compliance audits, policy reviews, and AI compliance tools. These are businesses that likely have compliance exposure but no dedicated compliance infrastructure.

TARGET INDUSTRIES (prioritise these, in any country):
- Fintech startups, lending platforms, payment companies, digital banks
- Homecare agencies, community health providers, private clinics
- Law firms and legal services (small to mid-size)
- Insurance brokers and underwriters
- Real estate agencies and property management firms
- Schools, colleges, training providers, edtech companies
- Logistics, freight, and supply chain companies
- HR firms, recruitment agencies, staffing companies

GEOGRAPHY: Global. Search across Nigeria, UK, US, Canada, Europe, and other regions. Prioritise markets with active data protection, financial regulation, or sector-specific compliance regimes.

TARGET PROFILE:
- Small to mid-size businesses (10 to 500 employees)
- Growing startups or regional operators
- Businesses operating in regulated spaces without a dedicated compliance team
- Companies that have recently scaled, launched new products, or expanded to new markets
- Exclude large corporations, multinationals, unicorns, and household-name enterprises

RETURN FORMAT:
Return ONLY valid JSON with a "leads" array. Each lead must have exactly these fields:

- company: string (real company name)
- industry: string (specific industry label)
- location: string (city and country)
- website: string (real URL if known, otherwise empty string)
- contact: string (key decision maker name and title if known, e.g. "Sarah Obi, CEO" — otherwise empty string)
- linkedin: string (company LinkedIn URL if known, or likely URL format e.g. "linkedin.com/company/companyname" — otherwise empty string)
- fit_score: "High" | "Medium" | "Low"
- fit_reason: string (2 sentences explaining WHY this company scores that fit level — reference their growth stage, industry risk profile, or likely compliance gaps)
- regulation: string (the specific regulation or regulatory framework they are most likely breaching or under-prepared for — e.g. "NDPR 2019", "GDPR", "FCA Consumer Duty", "HIPAA", "Central Bank of Nigeria Fintech Regulations", "UK Modern Slavery Act", "FERPA", etc.)
- follow_up: string (suggested follow-up timeline and approach — e.g. "Follow up 5 days after initial outreach via LinkedIn DM, then email if no response within 10 days")
- pitch: string (3 to 4 sentence warm outreach message from Bolu at Cadence Compliance. Do not mention pricing. Open with a specific, credible observation about their likely compliance exposure based on their industry and stage. Reference the relevant regulation naturally. Close with a low-pressure invitation to a conversation. Write in plain flowing prose — no hyphens, no bullet points, no hollow phrases like "I hope this finds you well". Sound like a knowledgeable peer, not a salesperson.)

Return exactly ${count} leads. Return ONLY the JSON object, nothing else. No markdown, no backticks, no explanation.`,

        messages: [
          {
            role: "user",
            content: `Find ${count} real business prospects matching this search: "${query}".

Rules:
- Return real, specific businesses — not generic placeholders
- Exclude well-known, large-scale, or household-name companies
- Focus on smaller, lesser-known, growing businesses operating without a dedicated compliance team
- Vary the geography where possible — do not return all results from the same city or country
- Each lead must have a specific regulation identified, not a vague reference
- The pitch must feel personal and researched, not templated
- The decision maker contact should be a real or likely named person with their title where possible

Return the JSON only.`,
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
