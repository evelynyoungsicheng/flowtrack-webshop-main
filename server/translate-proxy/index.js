const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.GOOGLE_TRANSLATE_API_KEY;

if (!API_KEY) {
  console.warn('Warning: GOOGLE_TRANSLATE_API_KEY is not set. Proxy will return 500 for translate requests until key is provided.');
}

app.post('/translate', async (req, res) => {
  try {
    const { q, target, format } = req.body || {};
    if (!q || !target) return res.status(400).json({ error: 'Missing q (array|string) or target' });
    if (!API_KEY) return res.status(500).json({ error: 'Server missing API key (set GOOGLE_TRANSLATE_API_KEY)' });

    const endpoint = 'https://translation.googleapis.com/language/translate/v2?key=' + encodeURIComponent(API_KEY);
    const body = JSON.stringify({ q, target, format: format || 'text' });

    const r = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body
    });

    const data = await r.json();
    if (!r.ok) {
      return res.status(r.status).json({ error: data || 'Translate API error' });
    }

    return res.json(data);
  } catch (err) {
    console.error('Translate proxy error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => console.log('Translate proxy running on port', PORT));
