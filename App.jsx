import { useState } from "react";

const INDUSTRIES = [
  "Homecare & Community Health",
  "Fintech & Lending",
  "Law Firms & Legal Services",
  "Insurance Brokers",
  "Real Estate Agencies",
  "HR & Recruitment",
  "Logistics & Supply Chain",
  "Schools & Education",
];

const SCORE_COLOR = {
  High: { bg: "#e8f5ee", text: "#1a7a3c", border: "#b2dfc3" },
  Medium: { bg: "#fff8e6", text: "#a0760a", border: "#f0d88a" },
  Low: { bg: "#fef0ee", text: "#c0392b", border: "#f5b8b2" },
};

export default function LeadAgent() {
  const [query, setQuery] = useState("");
  const [count, setCount] = useState(10);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState("");
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [searchAll, setSearchAll] = useState(false);
  const [activeIndustry, setActiveIndustry] = useState(null);

  const research = async (overrideQuery) => {
    const q = overrideQuery || query;
    if (!q.trim() || loading) return;
    setLeads([]);
    setError("");
    setSyncStatus("");
    setExpanded(null);
    setLoading(true);
    setStatus("Searching for prospects…");

    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: searchAll
            ? "businesses across all regulated industries globally that need compliance help"
            : q,
          count,
        }),
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

  const handleIndustryClick = (ind) => {
    setActiveIndustry(ind);
    setSearchAll(false);
    setQuery(ind);
    research(ind);
  };

  const handleSearchAll = () => {
    setSearchAll(true);
    setActiveIndustry(null);
    setQuery("");
    research("businesses across all regulated industries globally that need compliance help");
  };

  const syncToSheets = async () => {
    if (!leads.length || syncing) return;
    setSyncing(true);
    setSyncStatus("Syncing…");
    try {
      const res = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leads }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSyncStatus(`✓ ${leads.length} leads saved.`);
    } catch (e) {
      setSyncStatus(`Error: ${e.message}`);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f5f7fa",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      color: "#111",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f5f7fa; }

        .lead-card {
          transition: box-shadow 0.18s ease, transform 0.15s ease;
        }
        .lead-card:hover {
          box-shadow: 0 8px 32px rgba(0,120,212,0.10) !important;
          transform: translateY(-1px);
        }

        .ind-pill {
          transition: background 0.15s, color 0.15s, border-color 0.15s;
          cursor: pointer;
          user-select: none;
        }
        .ind-pill:hover {
          background: #e8f2ff !important;
          border-color: #0078d4 !important;
          color: #0062b1 !important;
        }

        .search-btn {
          transition: background 0.15s, transform 0.1s;
        }
        .search-btn:hover:not(:disabled) {
          background: #005bb5 !important;
          transform: scale(1.015);
        }
        .search-btn:disabled { opacity: 0.45; cursor: not-allowed; }

        .all-toggle {
          transition: background 0.15s, border-color 0.15s;
          cursor: pointer;
        }
        .all-toggle:hover { border-color: #0078d4 !important; }

        .expand-btn {
          cursor: pointer;
          background: none;
          border: none;
          padding: 0;
          font-family: inherit;
          color: #0078d4;
          font-size: 13px;
          font-weight: 500;
        }
        .expand-btn:hover { text-decoration: underline; }

        .sync-btn {
          transition: background 0.15s;
          cursor: pointer;
        }
        .sync-btn:hover:not(:disabled) { background: #005bb5 !important; }
        .sync-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        input:focus {
          outline: none;
          border-color: #0078d4 !important;
          box-shadow: 0 0 0 3px rgba(0,120,212,0.12);
        }

        select:focus { outline: none; border-color: #0078d4 !important; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .lead-enter { animation: fadeUp 0.28s ease both; }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .spinner {
          width: 18px; height: 18px;
          border: 2px solid #fff4;
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          display: inline-block;
          vertical-align: middle;
          margin-right: 8px;
        }

        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: #d0d5dd; border-radius: 4px; }
      `}</style>

      {/* Nav */}
      <nav style={{
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "saturate(180%) blur(20px)",
        WebkitBackdropFilter: "saturate(180%) blur(20px)",
        borderBottom: "1px solid #e8edf5",
        padding: "0 32px",
        height: 52,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 7,
            background: "linear-gradient(135deg, #0078d4 0%, #00b4d8 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="5.5" cy="5.5" r="4" stroke="#fff" strokeWidth="1.5"/>
              <path d="M9 9l3 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span style={{ fontWeight: 600, fontSize: 15, color: "#111", letterSpacing: "-0.2px" }}>
            Cadence Lead Scout
          </span>
        </div>
        <span style={{ fontSize: 12, color: "#8a94a6", fontWeight: 500 }}>
          AI-Powered Prospect Research
        </span>
      </nav>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "48px 24px 80px" }}>

        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h1 style={{
            fontSize: 36, fontWeight: 700, letterSpacing: "-0.8px",
            color: "#111", lineHeight: 1.15, marginBottom: 12,
          }}>
            Find your next<br />
            <span style={{ color: "#0078d4" }}>compliance prospect.</span>
          </h1>
          <p style={{ fontSize: 15, color: "#6b7280", maxWidth: 460, margin: "0 auto" }}>
            Describe a business type, pick an industry, or search across all sectors.
            Get real leads with tailored pitches in seconds.
          </p>
        </div>

        {/* Search card */}
        <div style={{
          background: "#fff",
          borderRadius: 18,
          boxShadow: "0 2px 16px rgba(0,0,0,0.07)",
          padding: "28px 28px 24px",
          marginBottom: 24,
        }}>
          {/* Search row */}
          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            <input
              value={query}
              onChange={e => { setQuery(e.target.value); setSearchAll(false); setActiveIndustry(null); }}
              onKeyDown={e => e.key === "Enter" && research()}
              placeholder='e.g. "fintech startups in Lagos" or "homecare agencies in Texas"'
              style={{
                flex: 1, padding: "11px 15px",
                border: "1.5px solid #e2e8f0",
                borderRadius: 10, fontSize: 14,
                color: "#111", background: "#f9fafc",
                transition: "border-color 0.15s",
              }}
            />
            <select
              value={count}
              onChange={e => setCount(Number(e.target.value))}
              style={{
                padding: "11px 12px",
                border: "1.5px solid #e2e8f0",
                borderRadius: 10, fontSize: 14,
                color: "#111", background: "#f9fafc",
                cursor: "pointer", minWidth: 110,
              }}
            >
              {[5, 8, 10, 15, 20].map(n => (
                <option key={n} value={n}>{n} leads</option>
              ))}
            </select>
            <button
              className="search-btn"
              onClick={() => research()}
              disabled={(!query.trim() && !searchAll) || loading}
              style={{
                padding: "11px 24px",
                background: "#0078d4",
                border: "none", borderRadius: 10,
                color: "#fff", fontSize: 14, fontWeight: 600,
                display: "flex", alignItems: "center", gap: 0,
                whiteSpace: "nowrap",
              }}
            >
              {loading && <span className="spinner" />}
              {loading ? "Searching…" : "Search →"}
            </button>
          </div>

          {/* Search All toggle */}
          <div
            className="all-toggle"
            onClick={handleSearchAll}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "7px 14px",
              border: `1.5px solid ${searchAll ? "#0078d4" : "#e2e8f0"}`,
              borderRadius: 8,
              background: searchAll ? "#e8f2ff" : "#f9fafc",
              marginBottom: 16,
            }}
          >
            <div style={{
              width: 16, height: 16, borderRadius: 4,
              background: searchAll ? "#0078d4" : "#fff",
              border: `1.5px solid ${searchAll ? "#0078d4" : "#d1d5db"}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              {searchAll && (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2 5l2.5 2.5L8 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            <span style={{ fontSize: 13, fontWeight: 500, color: searchAll ? "#0062b1" : "#374151" }}>
              Search All Industries
            </span>
          </div>

          {/* Industry pills */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {INDUSTRIES.map(ind => (
              <div
                key={ind}
                className="ind-pill"
                onClick={() => handleIndustryClick(ind)}
                style={{
                  padding: "6px 13px",
                  border: `1.5px solid ${activeIndustry === ind ? "#0078d4" : "#e2e8f0"}`,
                  borderRadius: 20,
                  background: activeIndustry === ind ? "#e8f2ff" : "#f9fafc",
                  color: activeIndustry === ind ? "#0062b1" : "#4b5563",
                  fontSize: 13, fontWeight: 500,
                }}
              >
                {ind}
              </div>
            ))}
          </div>

          {status && !loading && (
            <p style={{ marginTop: 14, fontSize: 13, color: "#6b7280" }}>{status}</p>
          )}
          {error && (
            <p style={{ marginTop: 14, fontSize: 13, color: "#c0392b" }}>{error}</p>
          )}
        </div>

        {/* Results */}
        {leads.length > 0 && (
          <>
            <div style={{
              display: "flex", alignItems: "center",
              justifyContent: "space-between", marginBottom: 16,
            }}>
              <h2 style={{ fontSize: 15, fontWeight: 600, color: "#111" }}>
                {leads.length} Prospects Found
              </h2>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {syncStatus && (
                  <span style={{
                    fontSize: 12, fontWeight: 500,
                    color: syncStatus.startsWith("✓") ? "#1a7a3c" : "#c0392b",
                  }}>
                    {syncStatus}
                  </span>
                )}
                <button
                  className="sync-btn"
                  onClick={syncToSheets}
                  disabled={syncing}
                  style={{
                    padding: "8px 18px",
                    background: "#0078d4",
                    border: "none", borderRadius: 8,
                    color: "#fff", fontSize: 13, fontWeight: 600,
                  }}
                >
                  {syncing ? "Saving…" : "→ Save to Sheets"}
                </button>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {leads.map((lead, i) => {
                const sc = SCORE_COLOR[lead.fit_score] || SCORE_COLOR.Low;
                const isOpen = expanded === i;
                return (
                  <div
                    key={i}
                    className="lead-card lead-enter"
                    style={{
                      background: "#fff",
                      borderRadius: 14,
                      boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
                      overflow: "hidden",
                      animationDelay: `${i * 40}ms`,
                    }}
                  >
                    {/* Card header — always visible */}
                    <div
                      style={{ padding: "18px 22px", cursor: "pointer" }}
                      onClick={() => setExpanded(isOpen ? null : i)}
                    >
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111", letterSpacing: "-0.2px" }}>
                              {lead.company}
                            </h3>
                            <span style={{
                              padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                              background: sc.bg, color: sc.text, border: `1px solid ${sc.border}`,
                              flexShrink: 0,
                            }}>
                              {lead.fit_score} Fit
                            </span>
                          </div>
                          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                            {lead.industry && (
                              <span style={{
                                fontSize: 12, color: "#6b7280",
                                background: "#f3f4f6", padding: "2px 8px",
                                borderRadius: 5,
                              }}>
                                {lead.industry}
                              </span>
                            )}
                            {lead.location && (
                              <span style={{ fontSize: 12, color: "#9ca3af" }}>
                                📍 {lead.location}
                              </span>
                            )}
                            {lead.regulation && (
                              <span style={{
                                fontSize: 12, color: "#0062b1",
                                background: "#e8f2ff", padding: "2px 8px",
                                borderRadius: 5, fontWeight: 500,
                              }}>
                                {lead.regulation}
                              </span>
                            )}
                          </div>
                        </div>
                        <div style={{
                          color: "#0078d4", fontSize: 18, marginLeft: 12, flexShrink: 0,
                          transition: "transform 0.2s",
                          transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                        }}>
                          ⌄
                        </div>
                      </div>
                    </div>

                    {/* Expanded content */}
                    {isOpen && (
                      <div style={{
                        padding: "0 22px 20px",
                        borderTop: "1px solid #f0f4f8",
                        paddingTop: 16,
                        display: "flex", flexDirection: "column", gap: 14,
                      }}>
                        {/* Meta row */}
                        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                          {lead.contact && (
                            <div>
                              <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 3 }}>Contact</div>
                              <div style={{ fontSize: 13, color: "#111", fontWeight: 500 }}>{lead.contact}</div>
                            </div>
                          )}
                          {lead.website && (
                            <div>
                              <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 3 }}>Website</div>
                              <a
                                href={lead.website.startsWith("http") ? lead.website : `https://${lead.website}`}
                                target="_blank" rel="noreferrer"
                                style={{ fontSize: 13, color: "#0078d4", textDecoration: "none", fontWeight: 500 }}
                              >
                                {lead.website}
                              </a>
                            </div>
                          )}
                          {lead.linkedin && (
                            <div>
                              <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 3 }}>LinkedIn</div>
                              <a
                                href={lead.linkedin.startsWith("http") ? lead.linkedin : `https://${lead.linkedin}`}
                                target="_blank" rel="noreferrer"
                                style={{ fontSize: 13, color: "#0078d4", textDecoration: "none", fontWeight: 500 }}
                              >
                                View Profile →
                              </a>
                            </div>
                          )}
                          {lead.follow_up && (
                            <div>
                              <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 3 }}>Follow-up</div>
                              <div style={{ fontSize: 13, color: "#374151" }}>{lead.follow_up}</div>
                            </div>
                          )}
                        </div>

                        {/* Why they fit */}
                        {(lead.reason || lead.fit_reason) && (
                          <div style={{
                            background: "#f8fafc", borderRadius: 10,
                            padding: "12px 14px",
                            borderLeft: "3px solid #0078d4",
                          }}>
                            <div style={{ fontSize: 11, color: "#0062b1", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 6 }}>Why They Need You</div>
                            <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.65 }}>{lead.fit_reason || lead.reason}</p>
                          </div>
                        )}

                        {/* Pitch */}
                        {lead.pitch && (
                          <div style={{
                            background: "#f0f6ff", borderRadius: 10,
                            padding: "14px 16px",
                            border: "1px solid #c7dcf5",
                          }}>
                            <div style={{ fontSize: 11, color: "#0062b1", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 8 }}>Personalised Pitch</div>
                            <p style={{ fontSize: 13, color: "#1e3a5f", lineHeight: 1.7 }}>{lead.pitch}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
