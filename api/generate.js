import { createHash } from 'crypto';

// Simple in-memory rate limiting (resets on cold start)
const requests = new Map();

function checkRateLimit(ip) {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const max = 20;

  // Clean old entries
  for (const [key, data] of requests) {
    if (now - data.start > windowMs) {
      requests.delete(key);
    }
  }

  const data = requests.get(ip) || { count: 0, start: now };

  if (now - data.start > windowMs) {
    data.count = 0;
    data.start = now;
  }

  data.count++;
  requests.set(ip, data);

  return data.count <= max;
}

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: { message: 'Method not allowed' } });
  }

  // Rate limiting
  const ip = req.headers['x-forwarded-for'] || 'unknown';
  if (!checkRateLimit(ip)) {
    return res.status(429).json({ error: { message: 'Too many requests' } });
  }

  const { content } = req.body;

  if (!content || typeof content !== 'string') {
    return res.status(400).json({ error: { message: 'Content is required' } });
  }

  if (content.length > 500) {
    return res.status(400).json({ error: { message: 'Content too long' } });
  }

  const sanitizedContent = content.trim();
  if (!sanitizedContent) {
    return res.status(400).json({ error: { message: 'Content cannot be empty' } });
  }

  const prompt = `Write a SHORT funny screenplay in the Keaton Patti "I forced a bot" meme format.

The bot has watched 1,000 hours of ${sanitizedContent} (ONLY public video footage: interviews, TV, speeches, viral clips) and writes a script.

Style:
- Deadpan tone
- Simple, literal misunderstandings
- Include slightly wrong wording and strange combinations
- Repetition of ideas that escalate
- Sometimes confident but incorrect statements
- ALL CAPS character names

Mannerism focus (VERY IMPORTANT):
- Strongly mimic visible and audible patterns from ${sanitizedContent}
- Exaggerate speech habits (e.g. repeated phrases, filler words, strange emphasis)
- Capture cadence and rhythm (pauses, abrupt shifts, overconfidence, repetition)
- Include physical mannerisms as action lines (gestures, posture, reactions)
- Lean into how the person behaves on camera, not just what they say
- If possible, reuse and slightly distort recognizable phrases or patterns

Content constraints:
- Only include things that could be seen on camera (no private scenes, no internal thoughts)
- Humor must come from observable behavior, delivery style, or media format
- Prefer dialogue and performance over narration

Viral constraints:
- The intro must feel slightly off or oddly phrased
- Include at least ONE highly quotable, out-of-context funny line
- Build a clear pattern, then escalate it, then break it
- Include at least one oddly specific or concrete detail about ${sanitizedContent}
- Avoid generic jokes

Length:
- 250-350 words total
- 2-4 scenes

Formatting rules:
- Use straight quotes only (")
- No curly quotes
- No extra text before or after JSON
- No trailing commas

Output JSON:
{
  "intro": "I forced a bot to watch 1,000 hours of ${sanitizedContent} and asked it to write a script. Here is the first page.",
  "scenes": [
    {
      "heading": "INT. LOCATION - TIME",
      "lines": [
        {"type": "action", "text": "Description"},
        {"type": "character", "text": "NAME"},
        {"type": "dialogue", "text": "Line"}
      ]
    }
  ]
}

Final requirement:
- The LAST line must be the strongest joke or absurd punchline. Last line should be action, not dialogue.

If you cannot follow all rules exactly, output:
{}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      signal: controller.signal,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.SITE_URL || 'https://forcedbot.vercel.app',
        'X-Title': 'I Forced A Bot'
      },
      body: JSON.stringify({
        model: process.env.MODEL || 'x-ai/grok-4.1-fast',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 4000,
        temperature: 0.9
      })
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text();
      console.error('OpenRouter error:', response.status, errText);
      throw new Error('API request failed');
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: { message: err.message || 'Failed to generate script' } });
  }
}
