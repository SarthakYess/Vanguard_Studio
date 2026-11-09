# AI assistant proxy (keeps your API key secret)

1. Cloudflare dashboard -> Workers & Pages -> Create -> Worker. Paste `worker.js`, Deploy.
2. Worker -> Settings -> Variables and Secrets. Add:
   - `API_KEY`  (secret)  your key
   - `MODEL`    the model name from your provider's model list
   - `API_BASE` (optional) default is OpenAI: https://api.openai.com/v1
                 Groq (free tier, OpenAI-compatible): https://api.groq.com/openai/v1
   - `ALLOWED_ORIGIN` (recommended) your site's address, e.g. https://yoursite.com
3. Copy the Worker URL into `assets/js/config.js` -> `assistantApi`.
4. Leave `assistantApi` empty and the site uses the built-in rule-based assistant (no AI, no key).

Tip: add a Cloudflare rate-limiting rule on the Worker so nobody can burn your credits.
