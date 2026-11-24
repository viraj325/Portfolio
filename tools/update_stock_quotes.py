"""Refresh shared monthly quote snapshots without browser CORS or API keys."""
import json
import math
import time
from datetime import datetime, timezone
from pathlib import Path
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / 'assets/data/stock-quotes.json'
SYMBOLS = ('WFC', 'BRK-B', 'JPM')


def parse_quote(symbol, payload):
    meta = payload['chart']['result'][0]['meta']
    price = meta['regularMarketPrice']
    previous = meta.get('previousClose', meta.get('chartPreviousClose'))
    timestamp = meta['regularMarketTime']
    if (not isinstance(price, (int, float)) or isinstance(price, bool)
            or not math.isfinite(price) or price <= 0
            or not isinstance(timestamp, (int, float)) or timestamp <= 0):
        raise ValueError(f'Invalid quote for {symbol}')
    direction = 'unchanged'
    if isinstance(previous, (int, float)) and math.isfinite(previous):
        direction = 'up' if price > previous else 'down' if price < previous else 'unchanged'
    return {'symbol': symbol, 'price': round(price, 2), 'direction': direction,
            'asOf': datetime.fromtimestamp(timestamp, timezone.utc).isoformat().replace('+00:00', 'Z')}


def fetch_quote(symbol):
    error = None
    for host in ('query1.finance.yahoo.com', 'query2.finance.yahoo.com'):
        for attempt in range(2):
            request = Request(f'https://{host}/v8/finance/chart/{symbol}?range=1d&interval=1d',
                              headers={'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json'})
            try:
                with urlopen(request, timeout=30) as response:
                    return parse_quote(symbol, json.load(response))
            except (OSError, ValueError, KeyError, IndexError, TypeError) as exc:
                error = exc
                if attempt == 0:
                    time.sleep(2)
    raise RuntimeError(f'Could not refresh {symbol}; existing snapshot is unchanged') from error


def main():
    # Fetch every symbol before writing, so failures preserve the previous snapshot.
    quotes = [fetch_quote(symbol) for symbol in SYMBOLS]
    snapshot = {'updatedAt': datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z'),
                'source': 'Yahoo Finance', 'quotes': quotes}
    OUTPUT.write_text(json.dumps(snapshot, indent=2) + '\n')
    print(f'Updated {len(quotes)} quotes in {OUTPUT.relative_to(ROOT)}')


if __name__ == '__main__':
    main()
