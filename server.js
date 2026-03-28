import express from 'express';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit';

config();

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests per windowMs
  message: { error: { message: 'Too many requests, please try again later' } },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api/generate', limiter);

// Health check for Render
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Serve index.html at root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Input validation
const MAX_CONTENT_LENGTH = 500;

app.post('/api/generate', async (req, res) => {
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ error: { message: 'Content is required' } });
  }

  if (typeof content !== 'string') {
    return res.status(400).json({ error: { message: 'Content must be a string' } });
  }

  if (content.length > MAX_CONTENT_LENGTH) {
    return res.status(400).json({ error: { message: 'Content too long (max 500 characters)' } });
  }

  const sanitizedContent = content.trim();
  if (!sanitizedContent) {
    return res.status(400).json({ error: { message: 'Content cannot be empty' } });
  }

  const prompt = `Write a SHORT funny screenplay in the Keaton Patti "I forced a bot" meme format.

The bot has watched 1,000 hours of ${sanitizedContent} (ONLY public video footage: interviews, TV, speeches, viral clips) and writes a satirical script.

Style:
- ALL CAPS character names

Mannerism focus (VERY IMPORTANT):
- Strongly mimic visible and audible patterns from ${sanitizedContent}
- Exaggerate speech habits (e.g. repeated phrases, filler words, strange emphasis)
- Capture cadence and rhythm (pauses, abrupt shifts, overconfidence, repetition)
- Include physical mannerisms as action lines (gestures, posture, reactions)

Content constraints:
- Only include things that could be seen on camera (no private scenes, no internal thoughts)
- Humor comes from observable behavior, delivery style, or media format
- Prefer dialogue and performance over narration

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
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      signal: controller.signal,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.SITE_URL || 'https://forcedbot.onrender.com',
        'X-Title': 'I Forced A Bot'
      },
      body: JSON.stringify({
        model: process.env.MODEL || 'anthropic/claude-sonnet-4.6',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 4000,
        temperature: 0.9
      })
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text();
      console.error('OpenRouter error:', response.status, errText);
      let err;
      try {
        err = JSON.parse(errText);
      } catch {
        err = { error: { message: errText } };
      }
      throw new Error(err.error?.message || `API request failed (${response.status})`);
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('Error generating script:', err);
    res.status(500).json({ error: { message: err.message || 'Failed to generate script' } });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
