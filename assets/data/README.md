# Company news

Edit `company-news.json` to add companies, change employment dates, or add news. No build step or API key is required. Serve the portfolio over HTTP (for example, `python3 -m http.server 4173` at the repository root); opening the HTML as a local file cannot fetch JSON.

Each company has a unique `id`, `name`, `employment`, `stock`, and `news` array. Employment dates use `YYYY-MM-DD`; `end: null` means present. Dates currently reflect month-level employment information: Wells Fargo March 2026–present, NetJets May 2025–February 2026 (interpreted as the ten months preceding Wells Fargo), and JPMorgan Chase July 2022–May 2025. Adjust exact days as needed.

Append news entries like this to a company's `news` array:

```json
{
  "date": "2026-03-05",
  "title": "A company milestone",
  "description": "Describe what happened and why it matters.",
  "source": "Company newsroom",
  "url": "https://example.com/news/milestone"
}
```

Use `YYYY-MM` when the source gives only a month. Events are automatically sorted oldest first and shown only within employment dates (through today for current employment). Month-only entries are included when their month overlaps employment. Entries outside the range stay in JSON but are hidden.

Use a TradingView exchange-qualified stock symbol such as `NYSE:WFC`, with a display `label`. Set `stock` to `null` for private companies or unavailable symbols and optionally provide `marketNote`. NetJets has no standalone public stock, so it has no stock widget. TradingView tiles show current market context, not historical prices at the time of each event; they require external network access. Each tile keeps a direct chart link available if the widget is blocked.

Initial news is sourced from the Federal Reserve, NetJets newsroom, and JPMorgan Chase, with source links in each entry. This is a curated list, not an automatic news feed. Validate data and date filtering with `node --test tools/company-news.test.mjs`.
