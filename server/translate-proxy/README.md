# Translate Proxy

This small Node/Express server forwards translation requests to the Google Cloud Translate API so you don't have to embed your API key in client-side code.

Usage

1. Install dependencies:

```bash
cd server/translate-proxy
npm install
```

2. Set the environment variable `GOOGLE_TRANSLATE_API_KEY` to your API key.

On Windows PowerShell:

```powershell
$env:GOOGLE_TRANSLATE_API_KEY = 'YOUR_KEY_HERE'
npm start
```

On Linux/macOS:

```bash
export GOOGLE_TRANSLATE_API_KEY='YOUR_KEY_HERE'
npm start
```

The server listens on port `3000` by default and exposes a single endpoint:

POST /translate

Request JSON body: `{ q: [array|string], target: 'en'|'de'|..., format?: 'text' }`

Response: returns the Google Translate API JSON payload.

Security

- Keep the API key secret and only run the proxy on servers you control.
- In production, restrict access and use HTTPS.
