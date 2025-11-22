export default async function handler(req, res) {
  // 1. CORS Headers (Standard)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // 2. Preflight Anfrage beantworten
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 3. Nur POST erlauben
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // API Key prüfen
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Server Fehler: GEMINI_API_KEY fehlt in Vercel" });
  }

  try {
    const { message } = req.body;

    // --- HIER IST DER TRICK: DIREKTER AUFRUF OHNE BIBLIOTHEK ---
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: `Du bist ein lustiger Party-Spiel-Bot. Antworte kurz. User Nachricht: ${message}` }]
        }]
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Google API Fehler: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    
    // Die Antwort aus der komplexen Google-Struktur holen
    const reply = data.candidates[0].content.parts[0].text;

    return res.status(200).json({ text: reply });

  } catch (error) {
    console.error("Backend Error:", error);
    return res.status(500).json({ error: error.message || "Fehler im Backend" });
  }
}