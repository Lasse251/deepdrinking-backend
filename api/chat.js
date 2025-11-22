import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  // 1. Erlaube dem Browser den Zugriff (CORS)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // 2. WICHTIG: Wenn der Browser fragt "Darf ich?", antworte sofort mit JA (200 OK)
  // Das hat beim Fehler 405 gefehlt!
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 3. Nur POST-Anfragen verarbeiten
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { message } = req.body;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "Du bist ein lustiger Party-Spiel-Bot. Antworte kurz." },
        { role: "user", content: message }
      ],
    });

    const reply = completion.choices[0].message.content;
    return res.status(200).json({ text: reply });

  } catch (error) {
    console.error("OpenAI Error:", error);
    return res.status(500).json({ error: error.message });
  }
}