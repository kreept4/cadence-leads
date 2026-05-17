import { useState } from "react";

const C = {
  bg: "#0f1117",
  surface: "#1a1d27",
  border: "#2a2d3a",
  accent: "#1a3a2a",
  gold: "#c9a84c",
  goldLight: "#e8c97a",
  text: "#e8e6e0",
  muted: "#8a8880",
  light: "#4a4840",
  green: "#4a8c61",
  red: "#c05040",
  yellow: "#c9a84c",
};

const SCORE_COLOR = { High: C.green, Medium: C.yellow, Low: C.red };

export default function LeadAgent() {
  const [query, setQuery] = useState("");
  const [count, setCount] = useState(5);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState("");
  const [error, setError] = useState("");

  const research = async () => {
    if (!query.trim() || loading) return;
    setLeads([]);
    setError("");
    setSyncStatus("");
    setLoading(true);
    setStatus("Searching for prospects...");

    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, count }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setLeads(data.leads || []);
      setStatus(`Found ${data.leads?.length || 0} prospects.`);
    } catch (e) {
      setError(e.message || "Something went wrong.");
      setStatus("");
    } finally {
      setLoading(false);
    }
  };

  const syncToSheets = async () => {
    if (!leads.length || syncing) return;
    setSyncing(true);
    setSyncStatus("Syncing to Google Sheets...");
    try {
      const res = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leads }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSyncStatus(`✓ ${leads.length} leads added to Cadence Leads sheet.`);
    } catch (e) {
      setSyncStatus(`Error: ${e.message}`);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'DM Sans', sans-serif", color: C.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=DM+Sans:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 4px; }
        input, select { font-family: 'DM Sans', sans-serif !important; }
        .lead-card:hover { border-color: ${C.gold}66 !important; }
        button:disabled { opacity: 0.4; cursor: not-allowed; }
      `}</style>

      {/* Header */}
      <div style={{
        background: C.surface, borderBottom: `1px solid ${C.border}`,
        padding: "18px 32px", display: "flex", alignItems: "center", gap: 14,
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10, background: C.gold,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18, fontWeight: 700, color: C.accent,
          fontFamily: "'Cormorant Garamond', serif",
        }}>C</div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "'Cormorant Garamond', serif", color: C.text }}>
            Cadence Lead Scout
          </div>
          <div style={{ fontSize: 11, color: C.muted, letterSpacing: "1.5px", textTransform: "uppercase" }}>
            AI-Powered Prospect Research
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>

        {/* Search */}
        <div style={{
          background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: 14, padding: "28px 28px", marginBottom: 28,
        }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 6, color: C.text }}>
            Find Prospects
          </h2>
          <p style={{ fontSize: 13, color: C.muted, marginBottom: 20, lineHeight: 1.6 }}>
            Describe the type of business you want to target. Be specific — industry, location, size, or keywords.
          </p>
          <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && research()}
              placeholder='e.g. "homecare agencies in Connecticut" or "fintech startups in Lagos"'
              style={{
                flex: 1, padding: "12px 16px", background: C.bg,
                border: `1px solid ${C.border}`, borderRadius: 10,
                color: C.text, fontSize: 14, outline: "none",
              }}
            />
            <select
              value={count}
              onChange={e => setCount(Number(e.target.value))}
              style={{
                padding: "12px 14px", background: C.bg,
                border: `1px solid ${C.border}`, borderRadius: 10,
                color: C.text, fontSize: 14, outline: "none", cursor: "pointer",
              }}
            >
              {[3, 5, 8, 10].map(n => (
                <option key={n} value={n}>{n} leads</option>
              ))}
            </select>
          </div>
          <button
            onClick={research}
            disabled={!query.trim() || loading}
            style={{
              padding: "12px 28px", background: C.gold,
              border: "none", borderRadius: 10, color: C.accent,
              fontSize: 14, fontWeight: 700, cursor: "pointer",
            }}
          >
            {loading ? "Researching..." : "Find Prospects →"}
          </button>
          {status && (
            <p style={{ marginTop: 14, fontSize: 13, color: C.muted }}>{status}</p>
          )}
          {error && (
            <p style={{ marginTop: 14, fontSize: 13, color: C.red }}>{error}</p>
          )}
        </div>

        {/* Results */}
        {leads.length > 0 && (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h2 style={{ fontSize: 15, fontWeight: 600, color: C.text }}>
                {leads.length} Prospects Found
              </h2>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {syncStatus && (
                  <span style={{ fontSize: 12, color: syncStatus.startsWith("✓") ? C.green : C.red }}>
                    {syncStatus}
                  </span>
                )}
                <button
                  onClick={syncToSheets}
                  disabled={syncing}
                  style={{
                    padding: "9px 20px", background: C.accent,
                    border: `1px solid ${C.green}44`, borderRadius: 10,
                    color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer",
                  }}
                >
                  {syncing ? "Syncing..." : "→ Save to Google Sheets"}
                </button>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {leads.map((lead, i) => (
                <div key={i} className="lead-card" style={{
                  background: C.surface, border: `1px solid ${C.border}`,
                  borderRadius: 12, padding: "22px 24px", transition: "border-color 0.2s",
                }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 4, fontFamily: "'Cormorant Garamond', serif" }}>
                        {lead.company}
                      </h3>
                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 12, color: C.muted }}>{lead.industry}</span>
                        {lead.location && <span style={{ fontSize: 12, color: C.muted }}>· {lead.location}</span>}
                        {lead.website && (
                          <a href={lead.website.startsWith("http") ? lead.website : `https://${lead.website}`}
                            target="_blank" rel="noreferrer"
                            style={{ fontSize: 12, color: C.gold, textDecoration: "none" }}>
                            {lead.website}
                          </a>
                        )}
                      </div>
                    </div>
                    <div style={{
                      padding: "5px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700,
                      background: `${SCORE_COLOR[lead.fit_score] || C.muted}22`,
                      color: SCORE_COLOR[lead.fit_score] || C.muted,
                      border: `1px solid ${SCORE_COLOR[lead.fit_score] || C.muted}44`,
                      flexShrink: 0, marginLeft: 16,
                    }}>
                      {lead.fit_score} Fit
                    </div>
                  </div>

                  {lead.contact && (
                    <div style={{ fontSize: 13, color: C.muted, marginBottom: 10 }}>
                      Contact: <span style={{ color: C.text }}>{lead.contact}</span>
                    </div>
                  )}

                  {lead.reason && (
                    <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, marginBottom: 12 }}>
                      {lead.reason}
                    </p>
                  )}

                  {lead.pitch && (
                    <div style={{
                      padding: "14px 16px", background: C.bg,
                      border: `1px solid ${C.border}`, borderRadius: 8,
                      fontSize: 13, color: C.text, lineHeight: 1.7,
                    }}>
                      <div style={{ fontSize: 11, color: C.gold, fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", marginBottom: 8 }}>
                        Personalised Pitch
                      </div>
                      {lead.pitch}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

