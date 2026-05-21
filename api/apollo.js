export const config = { maxDuration: 60 };

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { company, website, location } = req.body;
  if (!company) return res.status(400).json({ error: "Company required" });

  const apolloKey = process.env.APOLLO_API_KEY;

  try {
    // Search for the company on Apollo
    const accountRes = await fetch("https://api.apollo.io/api/v1/accounts/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apolloKey,
      },
      body: JSON.stringify({
        q_organization_name: company,
        page: 1,
        per_page: 1,
      }),
    });

    const accountData = await accountRes.json();
    const account = accountData?.accounts?.[0];

    if (!account) {
      return res.status(200).json({ found: false });
    }

    // Search for a compliance/legal/risk contact at the company
    const contactRes = await fetch("https://api.apollo.io/api/v1/contacts/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apolloKey,
      },
      body: JSON.stringify({
        q_organization_name: company,
        person_titles: [
          "compliance officer",
          "chief compliance officer",
          "head of compliance",
          "risk and compliance",
          "data protection officer",
          "legal counsel",
          "general counsel",
          "chief legal officer",
          "director of compliance",
          "ceo",
          "managing director",
          "founder",
        ],
        page: 1,
        per_page: 1,
      }),
    });

    const contactData = await contactRes.json();
    const contact = contactData?.contacts?.[0];

    return res.status(200).json({
      found: true,
      contact: contact ? {
        name: `${contact.first_name || ""} ${contact.last_name || ""}`.trim(),
        title: contact.title || "",
        email: contact.email || "",
        linkedin: contact.linkedin_url || "",
        verified: true,
      } : null,
      company: {
        name: account.name || company,
        website: account.website_url || website || "",
        industry: account.industry || "",
        size: account.estimated_num_employees || "",
        linkedin: account.linkedin_url || "",
      },
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
