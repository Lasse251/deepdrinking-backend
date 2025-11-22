export default async function handler(req, res) {
  // 1. CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // 2. Preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 3. POST Check
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Server Fehler: GEMINI_API_KEY fehlt" });
  }

  try {
    const { message } = req.body;

    // --- ÄNDERUNG: WIR NEHMEN "gemini-pro" STATT "flash" ---
    // Das ist das stabilste Standard-Modell
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
    
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
      // Wir geben den genauen Google Fehler zurück, damit wir ihn sehen
      throw new Error(`Google API Fehler: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    
    // Antwort extrahieren
    // Fallback, falls die Struktur mal anders ist
    let reply = "Keine Antwort.";
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        reply = data.candidates[0].content.parts[0].text;
    }

    return res.status(200).json({ text: reply });

  } catch (error) {
    console.error("Backend Error:", error);
    // Der Fehler wird an dein Minispiel geschickt
    return res.status(500).json({ error: error.message });
  }
}