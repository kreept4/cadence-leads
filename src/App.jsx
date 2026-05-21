import { useState, useRef } from "react";

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

const ALL_INDUSTRIES_QUERY = INDUSTRIES.map((i) => i.query);

const FIT_COLORS = {
  High: { bg: "#e6f4ea", text: "#1a7f37", dot: "#2da44e" },
  Medium: { bg: "#fff8e1", text: "#b45309", dot: "#f59e0b" },
  Low: { bg: "#fef2f2", text: "#b91c1c", dot: "#ef4444" },
};

function LeadCard({ lead, index }) {
  const [open, setOpen] = useState(false);
  const fit = FIT_COLORS[lead.fit_score] || FIT_COLORS["Medium"];

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 16,
        border: "1px solid #e5e7eb",
        overflow: "hidden",
        boxShadow: open ? "0 8px 32px rgba(0,120,212,0.10)" : "0 1px 4px rgba(0,0,0,0.06)",
        transition: "box-shadow 0.2s ease",
        animationDelay: `${index * 60}ms`,
        animation: "fadeUp 0.4s ease both",
      }}
    >
      {/* Collapsed header */}
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "18px 20px",
          display: "flex",
          alignItems: "center",
          gap: 14,
          textAlign: "left",
        }}
      >
        {/* Company initial avatar */}
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: "linear-gradient(135deg, #0078d4, #005a9e)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fff", fontWeight: 700, fontSize: 18, flexShrink: 0,
          fontFamily: "'Georgia', serif",
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
                <span style={{
                  background: "#eff6ff", color: "#1d4ed8",
                  fontSize: 11, padding: "1px 7px", borderRadius: 10, fontWeight: 600,
                }}>
                  {lead.regulation}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Chevron */}
        <svg
          width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          style={{ flexShrink: 0, transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s ease" }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Expanded body */}
      {open && (
        <div style={{ padding: "0 20px 20px", borderTop: "1px solid #f3f4f6" }}>
          {/* Fit reason */}
          {lead.fit_reason && (
            <div style={{
              background: "#f8fafc", borderRadius: 10, padding: "12px 14px",
              marginTop: 14, fontSize: 13, color: "#374151", lineHeight: 1.6,
            }}>
              {lead.fit_reason}
            </div>
          )}

          {/* Info grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 14 }}>
            {lead.contact && (
              <InfoBlock label="Contact" value={lead.contact} />
            )}
            {lead.website && (
              <InfoBlock label="Website" value={
                <a href={lead.website.startsWith("http") ? lead.website : `https://${lead.website}`}
                  target="_blank" rel="noreferrer"
                  style={{ color: "#0078d4", textDecoration: "none", fontSize: 13 }}>
                  {lead.website.replace(/^https?:\/\//, "")}
                </a>
              } />
            )}
            {lead.linkedin && (
              <InfoBlock label="LinkedIn" value={
                <a href={lead.linkedin.startsWith("http") ? lead.linkedin : `https://${lead.linkedin}`}
                  target="_blank" rel="noreferrer"
                  style={{ color: "#0078d4", textDecoration: "none", fontSize: 13 }}>
                  View Profile
                </a>
              } />
            )}
            {lead.follow_up && (
              <InfoBlock label="Follow-up" value={lead.follow_up} />
            )}
          </div>

          {/* Pitch */}
          {lead.pitch && (
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>
                Outreach Pitch
              </div>
              <div style={{
                background: "linear-gradient(135deg, #eff6ff, #f0f9ff)",
                border: "1px solid #bfdbfe",
                borderRadius: 10, padding: "14px 16px",
                fontSize: 13, color: "#1e3a5f", lineHeight: 1.7,
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
  const abortRef = useRef(null);
  async function fetchLeads(q, n) {
    // Try Places API first for real businesses
    try {
      const placesRes = await fetch("/api/places", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q, count: n }),
      });
      const placesData = await placesRes.json();
      if (placesRes.ok && placesData.leads && placesData.leads.length >= 3) {
        return placesData.leads;
      }
    } catch (_) {}
    // Fall back to AI if Places returns fewer than 3 results
    const res = await fetch("/api/research", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: q, count: n }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "API error");
    return (data.leads || []).map(l => ({ ...l, source: "ai" }));
  }
        return placesData.leads;
      }
    } catch (_) {}
    // Fall back to AI if Places returns fewer than 3 results
    const res = await fetch("/api/research", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: q, count: n }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "API error");
    return (data.leads || []).map(l => ({ ...l, source: "ai" }));
  }
  }

  async function handleSearch(customQuery) {
    const q = customQuery || query;
    if (!q.trim()) return;
    setLoading(true);
    setError("");
    setLeads([]);
    setProgress({ current: 0, total: 0 });
    try {
      const results = await fetchLeads(q.trim(), count);
      setLeads(results);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAllIndustries() {
    setLoading(true);
    setError("");
    setLeads([]);
    setActiveIndustry(null);
    setDrawerOpen(false);

    const queries = ALL_INDUSTRIES_QUERY;
    const perIndustry = Math.max(1, Math.floor(count / queries.length));
    const total = queries.length;
    setProgress({ current: 0, total });

    let allLeads = [];
    for (let i = 0; i < queries.length; i++) {
      try {
        const results = await fetchLeads(queries[i], perIndustry);
        allLeads = [...allLeads, ...results];
        setLeads([...allLeads]);
        setProgress({ current: i + 1, total });
      } catch {
        // skip failed industry, continue
      }
    }

    if (allLeads.length === 0) setError("No leads returned. Try again.");
    setLoading(false);
    setProgress({ current: 0, total: 0 });
  }

  function handlePill(industry) {
    setActiveIndustry(industry.label);
    setQuery(industry.query);
    setDrawerOpen(false);
    handleSearch(industry.query);
  }

  async function pushToSheets() {
    if (!leads.length) return;
    try {
      const res = await fetch("/api/sheets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leads }),
      });
      const data = await res.json();
      if (data.success) alert(data.count + " leads saved to Google Sheets!");
      else alert("Sheets error: " + data.error);
    } catch (err) {
      alert("Failed to reach Sheets API: " + err.message);
    }
  }

  async function saveToSheets() {
    if (!leads.length) return;
    const headers = ["Company", "Industry", "Location", "Contact", "Website", "LinkedIn", "Fit Score", "Fit Reason", "Regulation", "Follow-up", "Pitch"];
    const rows = leads.map((l) => [
      l.company, l.industry, l.location, l.contact, l.website,
      l.linkedin, l.fit_score, l.fit_reason, l.regulation, l.follow_up, l.pitch,
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${(c || "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cadence-leads.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f5f7fa", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        * { box-sizing: border-box; }
        body { margin: 0; }
        input:focus { outline: none; }
        button:focus-visible { outline: 2px solid #0078d4; outline-offset: 2px; }
      `}</style>

      {/* Nav */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(245,247,250,0.85)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid #e5e7eb", padding: "0 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between", height: 60,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img src="/logo.png" alt="Cadence Leads" style={{ height: 40, width: "auto", objectFit: "contain" }} />
        </div>
        {leads.length > 0 && (
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={saveToSheets} style={{
              background: "#0078d4", color: "#fff", border: "none",
              borderRadius: 8, padding: "7px 16px", fontSize: 13, fontWeight: 600,
              cursor: "pointer",
            }}>
              Export CSV
            </button>
            <button onClick={pushToSheets} style={{
              background: "#16a34a", color: "#fff", border: "none",
              borderRadius: 8, padding: "7px 16px", fontSize: 13, fontWeight: 600,
              cursor: "pointer",
            }}>
              Save to Sheets
            </button>
          </div>
        )}
      </nav>

      <main style={{ maxWidth: 720, margin: "0 auto", padding: "40px 20px 80px" }}>

        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <h1 style={{
            fontSize: 32, fontWeight: 800, color: "#111827",
            fontFamily: "'Georgia', serif", margin: "0 0 8px",
            letterSpacing: "-0.5px", lineHeight: 1.2,
          }}>
            Find Your Next<br />
            <span style={{ color: "#0078d4" }}>Compliance Client</span>
          </h1>
          <p style={{ fontSize: 15, color: "#6b7280", margin: 0 }}>
            AI-powered prospect research for Cadence Compliance
          </p>
        </div>

        {/* Search bar */}
        <div style={{
          background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)", padding: "16px 20px",
          marginBottom: 12,
        }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="e.g. Homecare agencies in Connecticut"
              style={{
                flex: 1, border: "none", fontSize: 15, color: "#111827",
                background: "transparent", padding: 0,
              }}
            />
            <select
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              style={{
                border: "1px solid #e5e7eb", borderRadius: 8, padding: "6px 10px",
                fontSize: 13, color: "#374151", background: "#f9fafb", cursor: "pointer",
              }}
            >
              {[3, 5, 8, 10].map((n) => <option key={n} value={n}>{n} leads</option>)}
            </select>
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
            <button
              onClick={() => handleSearch()}
              disabled={loading || !query.trim()}
              style={{
                flex: 1, background: loading ? "#93c5fd" : "#0078d4",
                color: "#fff", border: "none", borderRadius: 10,
                padding: "11px 0", fontSize: 14, fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer", transition: "background 0.15s",
              }}
            >
              {loading && progress.total === 0 ? "Searching…" : "Search"}
            </button>
            <button
              onClick={handleAllIndustries}
              disabled={loading}
              style={{
                flex: 1, background: loading ? "#f3f4f6" : "#f0f9ff",
                color: loading ? "#9ca3af" : "#0078d4",
                border: "1px solid " + (loading ? "#e5e7eb" : "#bfdbfe"),
                borderRadius: 10, padding: "11px 0", fontSize: 14, fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer", transition: "all 0.15s",
              }}
            >
              All Industries
            </button>
          </div>
        </div>

        {/* Filter drawer toggle */}
        <button
          onClick={() => setDrawerOpen((o) => !o)}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "none", border: "none", cursor: "pointer",
            fontSize: 13, color: "#6b7280", fontWeight: 600,
            padding: "6px 4px", marginBottom: drawerOpen ? 8 : 16,
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="20" y2="12" /><line x1="12" y1="18" x2="20" y2="18" />
          </svg>
          Filter by Industry
          <svg
            width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            style={{ transform: drawerOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
          {activeIndustry && (
            <span style={{
              marginLeft: 4, background: "#0078d4", color: "#fff",
              fontSize: 11, padding: "2px 8px", borderRadius: 20, fontWeight: 600,
            }}>
              {activeIndustry}
            </span>
          )}
        </button>

        {/* Drawer pills */}
        {drawerOpen && (
          <div style={{
            background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14,
            padding: 16, marginBottom: 16,
            display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8,
            animation: "fadeUp 0.2s ease both",
          }}>
            {INDUSTRIES.map((ind) => (
              <button
                key={ind.label}
                onClick={() => handlePill(ind)}
                disabled={loading}
                style={{
                  padding: "9px 12px", borderRadius: 10, border: "1px solid",
                  fontSize: 13, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
                  transition: "all 0.15s", textAlign: "center",
                  background: activeIndustry === ind.label ? "#0078d4" : "#f9fafb",
                  color: activeIndustry === ind.label ? "#fff" : "#374151",
                  borderColor: activeIndustry === ind.label ? "#0078d4" : "#e5e7eb",
                }}
              >
                {ind.label}
              </button>
            ))}
          </div>
        )}

        {/* Progress bar for all-industries */}
        {loading && progress.total > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#6b7280", marginBottom: 6 }}>
              <span>Searching all industries…</span>
              <span>{progress.current}/{progress.total}</span>
            </div>
            <div style={{ background: "#e5e7eb", borderRadius: 99, height: 6 }}>
              <div style={{
                height: 6, borderRadius: 99, background: "#0078d4",
                width: `${(progress.current / progress.total) * 100}%`,
                transition: "width 0.4s ease",
              }} />
            </div>
          </div>
        )}

        {/* Single search loading */}
        {loading && progress.total === 0 && (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#6b7280" }}>
            <div style={{
              width: 32, height: 32, border: "3px solid #e5e7eb",
              borderTopColor: "#0078d4", borderRadius: "50%",
              animation: "spin 0.8s linear infinite", margin: "0 auto 12px",
            }} />
            <div style={{ fontSize: 14, fontWeight: 500 }}>Finding prospects…</div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12,
            padding: "14px 16px", color: "#b91c1c", fontSize: 14, marginBottom: 16,
          }}>
            {error}
          </div>
        )}

        {/* Results */}
        {leads.length > 0 && (
          <div>
            <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 14, fontWeight: 500 }}>
              {leads.length} prospect{leads.length !== 1 ? "s" : ""} found
              {loading && progress.total > 0 && " — loading more…"}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {leads.map((lead, i) => (
                <LeadCard key={`${lead.company}-${i}`} lead={lead} index={i} />
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
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





