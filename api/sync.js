import { google } from "googleapis";

const SHEET_ID = "1EnsSDh5lLUmesP_-wwwTZQBtooXrjKLSCwg3gFDCIYc";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { leads } = req.body;
  if (!leads || !leads.length) return res.status(400).json({ error: "No leads provided" });

  try {
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    const today = new Date().toISOString().split("T")[0];

    const rows = leads.map(lead => [
      lead.company || "",
      lead.industry || "",
      lead.location || "",
      lead.website || "",
      lead.contact || "",
      lead.fit_score || "",
      lead.pitch || "",
      today,
    ]);

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: "Sheet1!A:H",
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      requestBody: { values: rows },
    });

    res.status(200).json({ success: true, count: rows.length });
  } catch (err) {
    res.status(500).json({ error: err.message || "Sync failed" });
  }
}
