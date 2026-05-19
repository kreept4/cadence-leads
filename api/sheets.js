import { google } from "googleapis";

export const config = { maxDuration: 30 };

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { leads } = req.body;
  if (!leads || !leads.length) return res.status(400).json({ error: "No leads provided" });

  try {
    const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    const spreadsheetId = "1EnsSDh5lLUmesP_-wwwTZQBtooXrjKLSCwg3gFDCIYc";

    const rows = leads.map((l) => [
      l.company || "", l.industry || "", l.location || "",
      l.contactName || "", l.contactTitle || "", l.email || "",
      l.website || "", l.linkedin || "",
      l.fitScore || "", l.fitReason || "",
      l.regulation || "", l.pitch || "", l.followUp || "",
    ]);

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "Sheet1!A1",
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      requestBody: { values: rows },
    });

    return res.status(200).json({ success: true, count: rows.length });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || "Sheets error" });
  }
}
