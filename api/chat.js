import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Das muss der OPENAI Key sein (für ChatGPT)
});

export default async function handler(req, res) {
  // 1. CORS Headers erlauben (damit dein Frontend zugreifen darf)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // 2. WICHTIG: Die "Darf ich?"-Anfrage (OPTIONS) sofort mit OK (200) beantworten
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 3. Nur POST Anfragen für den echten Chat durchlassen
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { message } = req.body;

    // Anfrage an ChatGPT
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
    return res.status(500).json({ error: "Fehler bei der KI-Anfrage" });
  }
}