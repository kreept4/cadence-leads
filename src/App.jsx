import { useState } from "react";

const INDUSTRIES = [
  "All Industries",
  "Fintech",
  "Healthtech",
  "Legal",
  "Real Estate",
  "HR & Recruitment",
  "Insurance",
  "Education",
  "Manufacturing",
];

const COUNTS = [3, 5, 8, 10];

function LeadCard({ lead, index }) {
  const [expanded, setExpanded] = useState(false);

  const scoreColor =
    lead.fitScore >= 8
      ? "#22c55e"
      : lead.fitScore >= 6
      ? "#f59e0b"
      : "#ef4444";

  return (
    <div
      style={{
        background: "#1a1a2e",
        border: "1px solid #2d2d4e",
        borderRadius: "12px",
        padding: "20px",
        marginBottom: "12px",
        animation: `fadeUp 0.3s ease both`,
        animationDelay: `${index * 0.05}s`,
      }}
    >
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "8px" }}>
        <div>
          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#e2e8f0" }}>
            {lead.company}
          </h3>
          <p style={{ margin: "2px 0 0", fontSize: "13px", color: "#94a3b8" }}>
            {lead.contactName} · {lead.contactTitle}
          </p>
          <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#64748b" }}>
            {lead.location} · {lead.industry}
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              background: `${scoreColor}22`,
              border: `1px solid ${scoreColor}44`,
              borderRadius: "20px",
              padding: "3px 10px",
              fontSize: "13px",
              fontWeight: 700,
              color: scoreColor,
            }}
          >
            ★ {lead.fitScore}/10
          </div>
          <p style={{ margin: "4px 0 0", fontSize: "11px", color: "#7c3aed", fontWeight: 600 }}>
            {lead.regulation}
          </p>
        </div>
      </div>

      <div style={{ marginTop: "12px", padding: "10px 14px", background: "#0f0f1e", borderRadius: "8px", fontSize: "13px", color: "#cbd5e1", lineHeight: 1.5 }}>
        {lead.pitch}
      </div>

      <div style={{ marginTop: "12px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {lead.website && (
          <a
            href={lead.website.startsWith("http") ? lead.website : `https://${lead.website}`}
            target="_blank"
            rel="noreferrer"
            style={{ fontSize: "12px", color: "#6366f1", textDecoration: "none", border: "1px solid #6366f144", borderRadius: "6px", padding: "3px 10px" }}
          >
            🌐 Website
          </a>
        )}
        {lead.linkedin && (
          <a
            href={lead.linkedin}
            target="_blank"
            rel="noreferrer"
            style={{ fontSize: "12px", color: "#0ea5e9", textDecoration: "none", border: "1px solid #0ea5e944", borderRadius: "6px", padding: "3px 10px" }}
          >
            💼 LinkedIn
          </a>
        )}
        {lead.email && (
          <a
            href={`mailto:${lead.email}`}
            style={{ fontSize: "12px", color: "#10b981", textDecoration: "none", border: "1px solid #10b98144", borderRadius: "6px", padding: "3px 10px" }}
          >
            ✉ {lead.email}
          </a>
        )}
        <button
          onClick={() => setExpanded(!expanded)}
          style={{ fontSize: "12px", color: "#94a3b8", background: "none", border: "1px solid #2d2d4e", borderRadius: "6px", padding: "3px 10px", cursor: "pointer" }}
        >
          {expanded ? "▲ Less" : "▼ More"}
        </button>
      </div>

      {expanded && (
        <div style={{ marginTop: "12px", fontSize: "13px", color: "#94a3b8", lineHeight: 1.6 }}>
          <p style={{ margin: "4px 0" }}><strong style={{ color: "#e2e8f0" }}>Why they fit:</strong> {lead.fitReason}</p>
          <p style={{ margin: "4px 0" }}><strong style={{ color: "#e2e8f0" }}>Follow-up:</strong> {lead.followUp}</p>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [query, setQuery] = useState("");
  const [industry, setIndustry] = useState("All Industries");
  const [count, setCount] = useState(5);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);

  async function search() {
    const fullQuery =
      industry === "All Industries" ? query : `${industry} companies: ${query}`;

    if (!fullQuery.trim()) return;

    setLoading(true);
    setError("");
    setLeads([]);

    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: fullQuery, count }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Search failed");
      if (!Array.isArray(data.leads)) throw new Error("Invalid response format");

      setLeads(data.leads);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0d0d1a",
        color: "#e2e8f0",
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        padding: "0",
      }}
    >
      {/* Header */}
      <div style={{ background: "#1a1a2e", borderBottom: "1px solid #2d2d4e", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 800, background: "linear-gradient(135deg, #6366f1, #a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Cadence Leads
          </h1>
          <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>B2B compliance prospect finder</p>
        </div>
      </div>

      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "24px 16px" }}>
        {/* Search bar */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search()}
            placeholder="e.g. fintech startups in Stockholm, care homes in New Haven CT..."
            style={{
              flex: 1,
              background: "#1a1a2e",
              border: "1px solid #2d2d4e",
              borderRadius: "10px",
              padding: "12px 16px",
              color: "#e2e8f0",
              fontSize: "14px",
              outline: "none",
            }}
          />
          <button
            onClick={search}
            disabled={loading}
            style={{
              background: loading ? "#4338ca88" : "linear-gradient(135deg, #6366f1, #7c3aed)",
              border: "none",
              borderRadius: "10px",
              padding: "12px 24px",
              color: "#fff",
              fontWeight: 700,
              fontSize: "14px",
              cursor: loading ? "not-allowed" : "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {loading ? "Searching…" : "Find Leads"}
          </button>
        </div>

        {/* Filter drawer toggle */}
        <button
          onClick={() => setDrawerOpen(!drawerOpen)}
          style={{
            background: "none",
            border: "1px solid #2d2d4e",
            borderRadius: "8px",
            padding: "6px 14px",
            color: "#94a3b8",
            fontSize: "13px",
            cursor: "pointer",
            marginBottom: drawerOpen ? "12px" : "0",
          }}
        >
          {drawerOpen ? "▲ Hide filters" : "▼ Filters"}
        </button>

        {drawerOpen && (
          <div style={{ background: "#1a1a2e", border: "1px solid #2d2d4e", borderRadius: "10px", padding: "16px", marginBottom: "16px", display: "flex", gap: "20px", flexWrap: "wrap" }}>
            <div>
              <label style={{ fontSize: "12px", color: "#64748b", display: "block", marginBottom: "6px" }}>INDUSTRY</label>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {INDUSTRIES.map((ind) => (
                  <button
                    key={ind}
                    onClick={() => setIndustry(ind)}
                    style={{
                      background: industry === ind ? "#6366f1" : "#0f0f1e",
                      border: `1px solid ${industry === ind ? "#6366f1" : "#2d2d4e"}`,
                      borderRadius: "20px",
                      padding: "4px 12px",
                      color: industry === ind ? "#fff" : "#94a3b8",
                      fontSize: "12px",
                      cursor: "pointer",
                      fontWeight: industry === ind ? 600 : 400,
                    }}
                  >
                    {ind}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ fontSize: "12px", color: "#64748b", display: "block", marginBottom: "6px" }}>LEAD COUNT</label>
              <div style={{ display: "flex", gap: "6px" }}>
                {COUNTS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCount(c)}
                    style={{
                      background: count === c ? "#7c3aed" : "#0f0f1e",
                      border: `1px solid ${count === c ? "#7c3aed" : "#2d2d4e"}`,
                      borderRadius: "8px",
                      padding: "4px 14px",
                      color: count === c ? "#fff" : "#94a3b8",
                      fontSize: "13px",
                      cursor: "pointer",
                      fontWeight: count === c ? 600 : 400,
                    }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ background: "#7f1d1d22", border: "1px solid #7f1d1d", borderRadius: "8px", padding: "12px 16px", color: "#fca5a5", fontSize: "13px", marginBottom: "16px" }}>
            ⚠ {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: "center", padding: "40px", color: "#64748b", fontSize: "14px" }}>
            <div style={{ fontSize: "24px", marginBottom: "8px" }}>🔍</div>
            Researching leads…
          </div>
        )}

        {/* Results */}
        {!loading && leads.length > 0 && (
          <div>
            <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "16px" }}>
              Found {leads.length} lead{leads.length !== 1 ? "s" : ""}
            </p>
            {leads.map((lead, i) => (
              <LeadCard key={i} lead={lead} index={i} />
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && leads.length === 0 && !error && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#475569" }}>
            <div style={{ fontSize: "36px", marginBottom: "12px" }}>🎯</div>
            <p style={{ margin: 0, fontSize: "14px" }}>Search for leads above to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}
