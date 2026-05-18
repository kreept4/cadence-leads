import { useState } from "react";

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_KEY;

const INDUSTRIES = [
  { label: "Fintech", query: "Fintech startups and digital payment companies in Nigeria, UK, and Canada" },
  { label: "Homecare", query: "Homecare agencies and community health providers in the US and UK" },
  { label: "Law Firms", query: "Small and mid-size law firms in Nigeria, UK, and South Africa" },
  { label: "Insurance", query: "Insurance brokers and underwriters in UK, Nigeria, and Canada" },
  { label: "Real Estate", query: "Real estate agencies and property management firms in Nigeria, UK, and US" },
  { label: "Education", query: "Private schools, colleges, and edtech companies in Nigeria, UK, and US" },
  { label: "Logistics", query: "Logistics and freight companies in Nigeria, UK, and Europe" },
  { label: "HR & Recruitment", query: "HR firms and recruitment agencies in Nigeria, UK, and Canada" },
];

const FIT_COLORS = {
  High: { bg: "#e6f4ea", text: "#1a7f37", dot: "#2da44e" },
  Medium: { bg: "#fff8e1", text: "#b45309", dot: "#f59e0b" },
  Low: { bg: "#fef2f2", text: "#b91c1c", dot: "#ef4444" },
};

const SYSTEM_PROMPT = `You are a business development research agent for Cadence Compliance, an AI-powered compliance advisory firm run by Bolu Ogunleye — a qualified lawyer and Chartered Arbitrator based in Nigeria with global reach.

Find real, specific businesses that need compliance help but lack a dedicated compliance team.

TARGET INDUSTRIES: Fintech startups, lending platforms, payment companies, digital banks, homecare agencies, private clinics, law firms, insurance brokers, real estate agencies, schools, edtech companies, logistics companies, HR and recruitment firms.

GEOGRAPHY: Global — Nigeria, UK, US, Canada, Europe. Vary regions across results. Do not cluster all leads in one city or country.

TARGET PROFILE: 10 to 500 employees. Growing or recently scaled. Operating in regulated spaces without a dedicated compliance team. No large corporations, unicorns, or household names.

Return ONLY valid JSON with a "leads" array. Each lead must have exactly these fields:
- company: string
- industry: string
- location: string (city, country)
- website: string (real URL or empty string)
- contact: string (name and title, or empty string)
- linkedin: string (URL or empty string)
- fit_score: "High" | "Medium" | "Low"
- fit_reason: string (2 sentences — why this score, referencing their growth stage or compliance gaps)
- regulation: string (specific regulation e.g. "NDPR 2019", "GDPR", "FCA Consumer Duty", "HIPAA")
- follow_up: string (suggested timeline and channel)
- pitch: string (3 sentences from Bolu — credible peer-to-peer tone, no pricing, no hollow openers, references the regulation, ends with low-pressure invite, no hyphens)

Return ONLY the JSON object. No markdown, no backticks, no explanation.`;

async function searchLeads(query, count) {
  const safeCount = Math.min(Number(count) || 5, 8);
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
      "HTTP-Referer": "https://cadence-leads-sigma.vercel.app",
      "X-Title": "Cadence Leads",
    },
    body: JSON.stringify({
      model: "anthropic/claude-haiku-4-5",
      max_tokens: 2500,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Find ${safeCount} real compliance prospects for: "${query}". Vary geography. No household names. Return JSON only.` },
      ],
    }),
  });

  const data = await response.json();
  if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));
  const text = data.choices?.[0]?.message?.content || "";
  const clean = text.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(clean);
  return parsed.leads || [];
}

function LeadCard({ lead, index }) {
  const [open, setOpen] = useState(false);
  const fit = FIT_COLORS[lead.fit_score] || FIT_COLORS["Medium"];

  return (
    <div style={{
      background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", overflow: "hidden",
      boxShadow: open ? "0 8px 32px rgba(0,120,212,0.10)" : "0 1px 4px rgba(0,0,0,0.06)",
      transition: "box-shadow 0.2s ease", animationDelay: `${index * 60}ms`, animation: "fadeUp 0.4s ease both",
    }}>
      <button onClick={() => setOpen((o) => !o)} style={{
        width: "100%", background: "none", border: "none", cursor: "pointer",
        padding: "18px 20px", display: "flex", alignItems: "center", gap: 14, textAlign: "left",
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: "linear-gradient(135deg, #0078d4, #005a9e)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fff", fontWeight: 700, fontSize: 18, flexShrink: 0, fontFamily: "'Georgia', serif",
        }}>
          {lead.company?.[0]?.toUpperCase() || "?"}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontWeight: 700, fontSize: 15, color: "#111827", fontFamily: "'Georgia', serif" }}>
              {lead.company}
            </span>
            <span style={{
              fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20,
              background: fit.bg, color: fit.text, display: "flex", alignItems: "center", gap: 4,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: fit.dot, display: "inline-block" }} />
              {lead.fit_score} Fit
            </span>
          </div>
          <div style={{ fontSize: 13, color: "#6b7280", marginTop: 2, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <span>{lead.industry}</span>
            <span style={{ color: "#d1d5db" }}>·</span>
            <span>{lead.location}</span>
            {lead.regulation && (
              <>
                <span style={{ color: "#d1d5db" }}>·</span>
                <span style={{ background: "#eff6ff", color: "#1d4ed8", fontSize: 11, padding: "1px 7px", borderRadius: 10, fontWeight: 600 }}>
                  {lead.regulation}
                </span>
              </>
            )}
          </div>
        </div>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          style={{ flexShrink: 0, transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s ease" }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div style={{ padding: "0 20px 20px", borderTop: "1px solid #f3f4f6" }}>
          {lead.fit_reason && (
            <div style={{ background: "#f8fafc", borderRadius: 10, padding: "12px 14px", marginTop: 14, fontSize: 13, color: "#374151", lineHeight: 1.6 }}>
              {lead.fit_reason}
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 14 }}>
            {lead.contact && <InfoBlock label="Contact" value={lead.contact} />}
            {lead.website && (
              <InfoBlock label="Website" value={
                <a href={lead.website.startsWith("http") ? lead.website : `https://${lead.website}`}
                  target="_blank" rel="noreferrer" style={{ color: "#0078d4", textDecoration: "none", fontSize: 13 }}>
                  {lead.website.replace(/^https?:\/\//, "")}
                </a>
              } />
            )}
            {lead.linkedin && (
              <InfoBlock label="LinkedIn" value={
                <a href={lead.linkedin.startsWith("http") ? lead.linkedin : `https://${lead.linkedin}`}
                  target="_blank" rel="noreferrer" style={{ color: "#0078d4", textDecoration: "none", fontSize: 13 }}>
                  View Profile
                </a>
              } />
            )}
            {lead.follow_up && <InfoBlock label="Follow-up" value={lead.follow_up} />}
          </div>
          {lead.pitch && (
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>
                Outreach Pitch
              </div>
              <div style={{
                background: "linear-gradient(135deg, #eff6ff, #f0f9ff)", border: "1px solid #bfdbfe",
                borderRadius: 10, padding: "14px 16px", fontSize: 13, color: "#1e3a5f", lineHeight: 1.7,
              }}>
                {lead.pitch}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function InfoBlock({ label, value }) {
  return (
    <div style={{ background: "#f9fafb", borderRadius: 8, padding: "10px 12px" }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 3 }}>
        {label}
      </div>
      <div style={{ fontSize: 13, color: "#111827" }}>{value}</div>
    </div>
  );
}

export default function App() {
  const [query, setQuery] = useState("");
  const [count, setCount] = useState(5);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeIndustry, setActiveIndustry] = useState(null);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  async function handleSearch(customQuery) {
    const q = customQuery || query;
    if (!q.trim()) return;
    setLoading(true); setError(""); setLeads([]); setProgress({ current: 0, total: 0 });
    try {
      const results = await searchLeads(q.trim(), count);
      setLeads(results);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  async function handleAllIndustries() {
    setLoading(true); setError(""); setLeads([]); setActiveIndustry(null); setDrawerOpen(false);
    const total = INDUSTRIES.length;
    const perIndustry = Math.max(1, Math.floor(count / total));
    setProgress({ current: 0, total });
    let allLeads = [];
    for (let i = 0; i < INDUSTRIES.length; i++) {
      try {
        const results = await searchLeads(INDUSTRIES[i].query, perIndustry);
        allLeads = [...allLeads, ...results];
        setLeads([...allLeads]);
        setProgress({ current: i + 1, total });
      } catch { /* skip */ }
    }
    if (allLeads.length === 0) setError("No leads returned. Try again.");
    setLoading(false); setProgress({ current: 0, total: 0 });
  }

  function handlePill(industry) {
    setActiveIndustry(industry.label); setQuery(industry.query); setDrawerOpen(false);
    handleSearch(industry.query);
  }

  function saveToCSV() {
    if (!leads.length) return;
    const headers = ["Company","Industry","Location","Contact","Website","LinkedIn","Fit Score","Fit Reason","Regulation","Follow-up","Pitch"];
    const rows = leads.map((l) => [l.company,l.industry,l.location,l.contact,l.website,l.linkedin,l.fit_score,l.fit_reason,l.regulation,l.follow_up,l.pitch]);
    const csv = [headers,...rows].map((r) => r.map((c) => `"${(c||"").replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob = new Blob([csv],{type:"text/csv"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href=url; a.download="cadence-leads.csv"; a.click(); URL.revokeObjectURL(url);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f5f7fa", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; } body { margin: 0; } input:focus { outline: none; }
      `}</style>

      <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(245,247,250,0.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid #e5e7eb", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, #0078d4, #005a9e)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <span style={{ fontWeight: 800, fontSize: 16, color: "#111827", fontFamily: "'Georgia', serif", letterSpacing: "-0.3px" }}>
            Cadence <span style={{ color: "#0078d4" }}>Leads</span>
          </span>
        </div>
        {leads.length > 0 && (
          <button onClick={saveToCSV} style={{ background: "#0078d4", color: "#fff", border: "none", borderRadius: 8, padding: "7px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export CSV
          </button>
        )}
      </nav>

      <main style={{ maxWidth: 720, margin: "0 auto", padding: "40px 20px 80px" }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: "#111827", fontFamily: "'Georgia', serif", margin: "0 0 8px", letterSpacing: "-0.5px", lineHeight: 1.2 }}>
            Find Your Next<br /><span style={{ color: "#0078d4" }}>Compliance Client</span>
          </h1>
          <p style={{ fontSize: 15, color: "#6b7280", margin: 0 }}>AI-powered prospect research for Cadence Compliance</p>
        </div>

        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", padding: "16px 20px", marginBottom: 12 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="e.g. Fintech startups in Stockholm"
              style={{ flex: 1, border: "none", fontSize: 15, color: "#111827", background: "transparent", padding: 0 }} />
            <select value={count} onChange={(e) => setCount(Number(e.target.value))}
              style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "6px 10px", fontSize: 13, color: "#374151", background: "#f9fafb", cursor: "pointer" }}>
              {[3, 5, 8].map((n) => <option key={n} value={n}>{n} leads</option>)}
            </select>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
            <button onClick={() => handleSearch()} disabled={loading || !query.trim()}
              style={{ flex: 1, background: loading ? "#93c5fd" : "#0078d4", color: "#fff", border: "none", borderRadius: 10, padding: "11px 0", fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer" }}>
              {loading && progress.total === 0 ? "Searching..." : "Search"}
            </button>
            <button onClick={handleAllIndustries} disabled={loading}
              style={{ flex: 1, background: loading ? "#f3f4f6" : "#f0f9ff", color: loading ? "#9ca3af" : "#0078d4", border: `1px solid ${loading ? "#e5e7eb" : "#bfdbfe"}`, borderRadius: 10, padding: "11px 0", fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer" }}>
              All Industries
            </button>
          </div>
        </div>

        <button onClick={() => setDrawerOpen((o) => !o)}
          style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#6b7280", fontWeight: 600, padding: "6px 4px", marginBottom: drawerOpen ? 8 : 16 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="20" y2="12" /><line x1="12" y1="18" x2="20" y2="18" />
          </svg>
          Filter by Industry
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            style={{ transform: drawerOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
          {activeIndustry && (
            <span style={{ marginLeft: 4, background: "#0078d4", color: "#fff", fontSize: 11, padding: "2px 8px", borderRadius: 20, fontWeight: 600 }}>
              {activeIndustry}
            </span>
          )}
        </button>

        {drawerOpen && (
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, padding: 16, marginBottom: 16, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, animation: "fadeUp 0.2s ease both" }}>
            {INDUSTRIES.map((ind) => (
              <button key={ind.label} onClick={() => handlePill(ind)} disabled={loading}
                style={{ padding: "9px 12px", borderRadius: 10, border: "1px solid", fontSize: 13, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", textAlign: "center", background: activeIndustry === ind.label ? "#0078d4" : "#f9fafb", color: activeIndustry === ind.label ? "#fff" : "#374151", borderColor: activeIndustry === ind.label ? "#0078d4" : "#e5e7eb" }}>
                {ind.label}
              </button>
            ))}
          </div>
        )}

        {loading && progress.total > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#6b7280", marginBottom: 6 }}>
              <span>Searching all industries...</span><span>{progress.current}/{progress.total}</span>
            </div>
            <div style={{ background: "#e5e7eb", borderRadius: 99, height: 6 }}>
              <div style={{ height: 6, borderRadius: 99, background: "#0078d4", width: `${(progress.current / progress.total) * 100}%`, transition: "width 0.4s ease" }} />
            </div>
          </div>
        )}

        {loading && progress.total === 0 && (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#6b7280" }}>
            <div style={{ width: 32, height: 32, border: "3px solid #e5e7eb", borderTopColor: "#0078d4", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
            <div style={{ fontSize: 14, fontWeight: 500 }}>Finding prospects...</div>
          </div>
        )}

        {error && (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, padding: "14px 16px", color: "#b91c1c", fontSize: 14, marginBottom: 16 }}>
            {error}
          </div>
        )}

        {leads.length > 0 && (
          <div>
            <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 14, fontWeight: 500 }}>
              {leads.length} prospect{leads.length !== 1 ? "s" : ""} found{loading && progress.total > 0 && " — loading more..."}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {leads.map((lead, i) => <LeadCard key={`${lead.company}-${i}`} lead={lead} index={i} />)}
            </div>
          </div>
        )}

        {!loading && !error && leads.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#9ca3af" }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto 14px", display: "block" }}>
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#6b7280", marginBottom: 4 }}>No leads yet</div>
            <div style={{ fontSize: 13 }}>Search an industry or pick a filter above</div>
          </div>
        )}
      </main>
    </div>
  );
}
