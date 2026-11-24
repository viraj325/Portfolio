"""Monthly official-source overview sync; curated career/news JSON is never overwritten."""
import json
import re
from datetime import datetime, timezone
from html.parser import HTMLParser
from io import BytesIO
from pathlib import Path
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / 'assets/data/company-overviews.json'
HEADERS = {'User-Agent': 'PortfolioCompanyOverview/1.0 public-source-check', 'Accept': '*/*'}


def fetch(url):
    with urlopen(Request(url, headers=HEADERS), timeout=45) as response:
        return response.read()


def latest_assets(payload, today):
    facts = payload['facts']['us-gaap']['Assets']['units']['USD']
    reports = [fact for fact in facts if fact.get('form') in ('10-Q', '10-K')
               and fact.get('end', '') <= today and fact.get('filed', '') <= today
               and isinstance(fact.get('val'), (int, float)) and fact['val'] > 0]
    if not reports:
        raise ValueError('No dated balance-sheet assets found')
    return max(reports, key=lambda fact: (fact['end'], fact['filed']))


def money(value):
    return f'${value / 1e12:.2f}T' if value >= 1e12 else f'${value / 1e9:.1f}B'


def parse_aum(text):
    text = re.sub(r'\s+', ' ', text)
    aum = re.search(r'Assets under management (?:were|was)\s*\$\s*([\d.]+)\s*trillion', text, re.I)
    client = re.search(r'client assets (?:were|was)\s*\$\s*([\d.]+)\s*trillion', text, re.I)
    if not aum or not client:
        raise ValueError('Quarterly report format changed; AUM/client assets need review')
    values = [float(aum[1]), float(client[1])]
    if not all(0 < value < 100 for value in values):
        raise ValueError('AUM figures are outside the supported range')
    return values


class PageText(HTMLParser):
    def __init__(self):
        super().__init__()
        self.parts = []
        self.skip = 0

    def handle_starttag(self, tag, attrs):
        if tag in ('script', 'style'):
            self.skip += 1

    def handle_endtag(self, tag):
        if tag in ('script', 'style'):
            self.skip = max(0, self.skip - 1)

    def handle_data(self, value):
        if not self.skip:
            self.parts.append(value)


def parse_fleet(html):
    parser = PageText()
    parser.feed(html)
    text = re.sub(r'\s+', ' ', ' '.join(parser.parts))
    fleet = re.search(r'(?:maintains and operates|fleet of)\s*([\d,]+\+?)\s*(?:aircraft|jets)', text, re.I)
    airports = re.search(r'(?:more than|over)\s*([\d,]+)\s*airports', text, re.I)
    if not fleet or not airports:
        raise ValueError('Fleet/airport figures need source review')
    return fleet[1], airports[1] + '+'


def financial_overview(company_id, cik, today):
    url = f'https://data.sec.gov/api/xbrl/companyfacts/CIK{cik:010d}.json'
    fact = latest_assets(json.loads(fetch(url)), today)
    metrics = [{'value': money(fact['val']), 'label': 'Total company assets',
                'asOf': fact['end'], 'source': 'SEC company facts', 'url': url}]
    latest_report = {'title': f"Financial report · {fact['end']}",
                     'url': f'https://www.sec.gov/Archives/edgar/data/{cik}/{fact["accn"].replace("-", "")}/'}
    if company_id == 'jpmorgan-chase':
        from pypdf import PdfReader
        year, month, _ = fact['end'].split('-')
        quarter = (int(month) + 2) // 3
        # JPMorganChase publishes standardized full quarterly reports under this path.
        report_root = 'https://www.jpmorganchase.com/content/dam/jpmc/jpmorgan-chase-and-co/investor-relations/documents/'
        if quarter == 4:
            report_url = report_root + f'annualreport-{year}.pdf'
        else:
            ordinal = {1: '1st', 2: '2nd', 3: '3rd'}[quarter]
            report_url = report_root + f'quarterly-earnings/{year}/{ordinal}-quarter/corp-q{quarter}-{year}.pdf'
        reader = PdfReader(BytesIO(fetch(report_url)))
        aum, clients = parse_aum(' '.join(page.extract_text() or '' for page in reader.pages))
        metrics = [{'value': f'${value:g}T', 'label': label, 'asOf': f"{fact['end']} · Asset & Wealth Management",
                    'source': f'JPMorganChase Q{quarter} {year} report', 'url': report_url}
                   for value, label in [(aum, 'Assets under management (AUM)'), (clients, 'Client assets')]] + metrics
        latest_report = {'title': f'Q{quarter} {year} quarterly report', 'url': report_url}
    return {'metrics': metrics, 'latestReport': latest_report}


def netjets_overview(today):
    url = 'https://www.netjets.com/en-gb/choosing-aviation-provider'
    try:
        fleet, airports = parse_fleet(fetch(url).decode('utf-8'))
    except ValueError:
        # The official Gatsby page publishes its body as public page data.
        page = json.loads(fetch('https://www.netjets.com/page-data/en-gb/choosing-aviation-provider/page-data.json'))
        def strings(value):
            if isinstance(value, str):
                yield value
            elif isinstance(value, dict):
                for child in value.values():
                    yield from strings(child)
            elif isinstance(value, list):
                for child in value:
                    yield from strings(child)
        fleet, airports = parse_fleet(' '.join(strings(page['result'])))
    metrics = [{'value': value, 'label': label, 'asOf': f'Company website · checked {today}',
                'source': 'NetJets aviation provider guide', 'url': url}
               for value, label in [(fleet, 'Aircraft maintained and operated'), (airports, 'Airports accessible worldwide')]]
    return {'metrics': metrics, 'latestReport': {'title': 'Official aviation overview', 'url': url}}


def main():
    now = datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')
    today = now[:10]
    old = json.loads(OUTPUT.read_text()) if OUTPUT.exists() else {'companies': {}}
    snapshot = {'updatedAt': now, 'companies': dict(old.get('companies', {}))}
    failures = []
    for company_id, loader in [('wells-fargo', lambda: financial_overview('wells-fargo', 72971, today)),
                               ('netjets', lambda: netjets_overview(today)),
                               ('jpmorgan-chase', lambda: financial_overview('jpmorgan-chase', 19617, today))]:
        try:
            snapshot['companies'][company_id] = {**loader(), 'lastSyncedAt': now, 'lastAttemptAt': now, 'status': 'ok'}
            print(f'Synced {company_id}')
        except Exception as error:
            prior = dict(snapshot['companies'].get(company_id, {}))
            snapshot['companies'][company_id] = {**prior, 'lastAttemptAt': now, 'status': 'needs-review'}
            failures.append(company_id)
            print(f'Keeping previous {company_id} figures: {type(error).__name__}: {error}')
    temporary = OUTPUT.with_suffix('.tmp')
    temporary.write_text(json.dumps(snapshot, indent=2, ensure_ascii=False) + '\n')
    temporary.replace(OUTPUT)
    if failures:
        raise SystemExit('Some sources need review: ' + ', '.join(failures))


if __name__ == '__main__':
    main()
