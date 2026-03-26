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

app.post('/api/chat', async (req, res) => {
  const { messages } = req.body;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'I Forced A Bot'
      },
      body: JSON.stringify({
        model: process.env.MODEL || 'anthropic/claude-opus-4.6',
        messages,
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
