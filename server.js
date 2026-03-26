import express from 'express';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

config();

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Debug: Log directory contents
console.log('__dirname:', __dirname);
console.log('Public path:', path.join(__dirname, 'public'));
console.log('Public exists:', fs.existsSync(path.join(__dirname, 'public')));
if (fs.existsSync(path.join(__dirname, 'public'))) {
  console.log('Public contents:', fs.readdirSync(path.join(__dirname, 'public')));
}

app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Health check for Render
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Serve index.html at root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/api/generate', async (req, res) => {
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ error: { message: 'Content is required' } });
  }

  const prompt = `Write a SHORT funny screenplay in the Keaton Patti "I forced a bot" meme format.

The bot has watched 1,000 hours of ${content} (ONLY public video footage: interviews, TV, speeches, viral clips) and writes a script.

Style:
- Deadpan tone
- Simple, literal misunderstandings
- Slightly wrong wording and strange combinations
- Repetition of ideas that escalate
- Confident but incorrect statements
- ALL CAPS character names
- Short, punchy lines

Mannerism focus (VERY IMPORTANT):
- Strongly mimic visible and audible patterns from ${content}
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
- Include at least one oddly specific or concrete detail about ${content}
- Avoid generic jokes

Length:
- 150–250 words total
- 2–3 scenes

Formatting rules:
- Use straight quotes only (")
- No curly quotes
- No extra text before or after JSON
- No trailing commas

Output JSON:
{
  "intro": "I forced a bot to watch 1,000 hours of ${content} and asked it to write a script. Here is the first page.",
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
- The LAST line must be the strongest joke or absurd punchline.

If you cannot follow all rules exactly, output:
{}`;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://forcedbot.onrender.com',
        'X-Title': 'I Forced A Bot'
      },
      body: JSON.stringify({
        model: process.env.MODEL || 'anthropic/claude-opus-4.6',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 4000,
        temperature: 0.9
      })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || 'API request failed');
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: { message: err.message } });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
