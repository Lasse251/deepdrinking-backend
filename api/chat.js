import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  // 1. CORS Headers (damit der Browser zugreifen darf)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // 2. Preflight-Anfrage (OPTIONS) sofort mit OK beantworten
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 3. Nur POST erlauben
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // WICHTIG: Key prüfen
  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: "Server Fehler: GEMINI_API_KEY fehlt" });
  }

  try {
    const { message } = req.body;

    // Google Gemini initialisieren
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Wir nutzen "gemini-1.5-flash", das ist schnell und kostenlos
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Prompt senden
    const prompt = `Du bist ein lustiger Party-Spiel-Bot. Antworte kurz. User Nachricht: ${message}`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return res.status(200).json({ text: text });

  } catch (error) {
    console.error("Gemini Error:", error);
    return res.status(500).json({ error: "Fehler bei der KI-Anfrage" });
  }
}