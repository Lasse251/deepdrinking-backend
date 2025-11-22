// api/chat.js
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Der Key kommt aus den Vercel Settings
});

export default async function handler(req, res) {
  // 1. CORS Headers setzen (WICHTIG, sonst blockiert der Browser)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*'); // '*' erlaubt Zugriff von überall. Für Produktion besser deine URL eintragen.
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // 2. Browser "Preflight" Anfrage beantworten
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 3. Nur POST Anfragen erlauben
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { message } = req.body;

    // 4. Anfrage an OpenAI senden
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Oder "gpt-4" wenn du Zugriff hast
      messages: [
        { role: "system", content: "Du bist ein lustiger Party-Spiel-Bot." },
        { role: "user", content: message }
      ],
    });

    // 5. Antwort zurücksenden
    const reply = completion.choices[0].message.content;
    return res.status(200).json({ text: reply }); // Wir senden { text: ... } zurück

  } catch (error) {
    console.error("OpenAI Error:", error);
    return res.status(500).json({ error: "Error generating response" });
  }
}