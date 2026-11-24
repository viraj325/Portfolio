const datePattern = /^\d{4}-\d{2}(?:-\d{2})?$/;

export function validDate(value) {
    if (typeof value !== 'string' || !datePattern.test(value)) return false;
    const full = value.length === 7 ? `${value}-01` : value;
    const date = new Date(`${full}T00:00:00Z`);
    return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === full;
}

export function timelineEvents(company, today = new Date().toISOString().slice(0, 10)) {
    const start = company.employment.start;
    const end = company.employment.end || today;
    return company.news.filter(event => {
        // Month-only sources retain their actual precision; compare overlapping months.
        const lower = event.date.length === 7 ? start.slice(0, 7) : start;
        const upper = event.date.length === 7 ? end.slice(0, 7) : end;
        return event.date >= lower && event.date <= upper;
    }).sort((a, b) => a.date.localeCompare(b.date));
}

export function validateData(data) {
    if (!Array.isArray(data.companies)) throw new Error('Expected a companies array.');
    const ids = new Set();
    for (const company of data.companies) {
        if (!/^[a-z0-9-]+$/.test(company.id) || ids.has(company.id) || !company.name) throw new Error('Company IDs must be unique and names must be present.');
        ids.add(company.id);
        if (!validDate(company.employment?.start) || company.employment.start.length !== 10 ||
            (company.employment.end !== null && (!validDate(company.employment.end) || company.employment.end.length !== 10 || company.employment.end < company.employment.start))) {
            throw new Error(`Invalid employment dates for ${company.name}.`);
        }
        if (company.stock && (!/^[A-Z0-9_]+:[A-Z0-9_.-]+$/.test(company.stock.symbol) || !company.stock.label)) throw new Error(`Invalid stock for ${company.name}.`);
        if (company.profile) {
            const profile = company.profile;
            const isWebUrl = value => /^https?:$/.test(new URL(value).protocol);
            if (!isWebUrl(profile.website) || !profile.description || !Array.isArray(profile.highlights) || !Array.isArray(profile.metrics)) throw new Error(`Invalid profile for ${company.name}.`);
            for (const metric of profile.metrics) {
                if (!metric.value || !metric.label || !metric.asOf || !metric.source || !isWebUrl(metric.url)) throw new Error(`Invalid metric for ${company.name}.`);
            }
        }
        if (!Array.isArray(company.news)) throw new Error(`Expected news for ${company.name}.`);
        for (const event of company.news) {
            if (!validDate(event.date) || !event.title || !event.description || !event.source || !/^https?:$/.test(new URL(event.url).protocol)) {
                throw new Error(`Invalid news entry for ${company.name}.`);
            }
        }
    }
    return data;
}

function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
}

function formatDate(value, monthOnly = false) {
    const date = new Date(`${value.length === 7 ? `${value}-01` : value}T00:00:00Z`);
    return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', ...(!monthOnly && value.length === 10 ? { day: 'numeric' } : {}), timeZone: 'UTC' }).format(date);
}

function externalLink(url, label, className) {
    const link = element('a', className, label);
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    return link;
}

function marketTile(company, theme) {
    const tile = element('aside', 'market-tile');
    tile.setAttribute('aria-label', `${company.name} stock information`);
    tile.append(element('p', 'market-label', company.stock ? 'Market snapshot / today' : 'Private company'));
    if (!company.stock) {
        tile.append(element('p', 'news-note', company.marketNote || 'No publicly traded stock available.'));
        return tile;
    }
    if (company.marketNote) tile.append(element('p', 'news-note', company.marketNote));
    const container = element('div', 'tradingview-widget-container');
    container.append(element('div', 'tradingview-widget-container__widget'));
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js';
    script.async = true;
    script.textContent = JSON.stringify({ symbol: company.stock.symbol, width: '100%', height: 220, locale: 'en', dateRange: '12M', colorTheme: theme, isTransparent: true, autosize: false });
    script.addEventListener('error', () => {
        container.replaceChildren(element('p', 'news-note', 'Stock tile unavailable. Open the chart below.'));
    });
    container.append(script);
    tile.append(container, externalLink(`https://www.tradingview.com/symbols/${company.stock.symbol.replace(':', '-')}/`, `${company.stock.label} on TradingView ↗`, 'market-link'));
    return tile;
}

function profileIcon(kind) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '1.5');
    svg.setAttribute('aria-hidden', 'true');
    svg.classList.add('company-profile-icon');
    const path = document.createElementNS(svg.namespaceURI, 'path');
    const paths = {
        bank: 'M3 9h18L12 3 3 9Zm2 3v7m5-7v7m4-7v7m5-7v7M2 22h20',
        plane: 'm22 2-7 20-4-9-9-4 20-7ZM11 13l6-6',
        globe: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM3 12h18M12 3c5 5 5 13 0 18-5-5-5-13 0-18Z'
    };
    path.setAttribute('d', paths[kind] || paths.bank);
    svg.append(path);
    return svg;
}

function companyProfile(company, details) {
    const profile = company.profile;
    if (!profile) return null;
    const website = externalLink(profile.website, new URL(profile.website).hostname.replace(/^www\./, '') + ' ↗', 'company-website');
    website.prepend(profileIcon('globe'));
    website.setAttribute('aria-label', `${company.name} official website`);
    details.append(website);
    const overview = element('div', 'company-overview');
    overview.append(element('p', 'company-summary', profile.description));
    const highlights = element('ul', 'company-highlights');
    for (const text of profile.highlights) highlights.append(element('li', '', text));
    overview.append(highlights);
    details.append(overview);
    const metrics = element('div', 'company-metrics');
    metrics.setAttribute('aria-label', `${company.name} business scale`);
    for (const metric of profile.metrics) {
        const card = element('div', 'company-metric');
        card.append(element('strong', '', metric.value), element('p', '', metric.label),
            element('small', '', metric.asOf), externalLink(metric.url, metric.source + ' ↗'));
        metrics.append(card);
    }
    return metrics;
}

const timelineObservers = [];

function renderCompany(company, theme) {
    const section = element('section', 'news-company');
    section.id = company.id;
    section.setAttribute('aria-labelledby', `${company.id}-title`);
    const heading = element('div', 'company-heading');
    const details = element('div');
    details.append(element('p', 'eyebrow', company.employment.end ? 'Previous chapter' : 'Current chapter'));
    const title = element('h2', '', company.name);
    title.id = `${company.id}-title`;
    const identity = element('div', 'company-identity');
    identity.append(profileIcon(company.profile?.icon), title);
    details.append(identity, element('p', 'tenure', `${formatDate(company.employment.start, true)} — ${company.employment.end ? formatDate(company.employment.end, true) : 'Present'}`));
    const metrics = companyProfile(company, details);
    heading.append(details, marketTile(company, theme));
    section.append(heading);
    if (metrics) section.append(metrics, element('p', 'metric-context', 'Business scale reflects the dates shown, independently of my employment period. AUM, client assets, and balance-sheet assets are different measures.'));
    const events = timelineEvents(company);
    const timelineHeading = element('div', 'timeline-heading');
    timelineHeading.append(element('h3', '', `During my time · ${events.length} ${events.length === 1 ? 'event' : 'events'}`));
    section.append(timelineHeading);
    if (!events.length) {
        section.append(element('p', 'empty-timeline', 'No milestones added for this chapter yet.'));
        return section;
    }
    const list = element('ol', 'event-timeline');
    list.id = `${company.id}-events`;
    list.tabIndex = 0;
    list.setAttribute('aria-label', `${company.name} news timeline, chronological order`);
    for (const event of events) {
        const card = element('li', 'event-card');
        const time = element('time', '', formatDate(event.date));
        time.dateTime = event.date;
        card.append(time, element('h4', '', event.title), element('p', 'event-description', event.description), externalLink(event.url, `${event.source} ↗`));
        list.append(card);
    }
    const controls = element('div', 'timeline-controls');
    const previous = element('button', '', '←');
    const next = element('button', '', '→');
    for (const [button, direction, label] of [[previous, -1, 'Earlier'], [next, 1, 'Later']]) {
        button.type = 'button';
        button.setAttribute('aria-label', `${label} ${company.name} events`);
        button.setAttribute('aria-controls', list.id);
        button.addEventListener('click', () => list.scrollBy({ left: direction * 330, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }));
        controls.append(button);
    }
    function updateControls() {
        previous.disabled = list.scrollLeft <= 1;
        next.disabled = list.scrollLeft + list.clientWidth >= list.scrollWidth - 1;
    }
    list.addEventListener('scroll', updateControls, { passive: true });
    const observer = new ResizeObserver(updateControls);
    observer.observe(list);
    timelineObservers.push(observer);
    timelineHeading.append(controls);
    section.append(list);
    return section;
}

async function init() {
    const status = document.getElementById('newsStatus');
    let theme = 'light';
    try { theme = localStorage.getItem('theme') === 'dark' ? 'dark' : 'light'; } catch { /* Theme remains usable without storage. */ }
    document.body.dataset.theme = theme;
    const themeButton = document.getElementById('newsTheme');
    const updateThemeLabel = () => { themeButton.textContent = theme === 'light' ? 'Dark mode' : 'Light mode'; };
    updateThemeLabel();
    let data;
    let selected = 'all';
    function render() {
        for (const observer of timelineObservers.splice(0)) observer.disconnect();
        const sections = data.companies.map(company => {
            const section = renderCompany(company, theme);
            section.hidden = selected !== 'all' && company.id !== selected;
            return section;
        });
        document.getElementById('companyNews').replaceChildren(...sections);
    }
    themeButton.addEventListener('click', () => {
        theme = theme === 'light' ? 'dark' : 'light';
        document.body.dataset.theme = theme;
        try { localStorage.setItem('theme', theme); } catch { /* Optional persistence. */ }
        updateThemeLabel();
        if (data) render();
    });
    try {
        const response = await fetch('../assets/data/company-news.json');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        data = validateData(await response.json());
        const filters = document.getElementById('companyFilters');
        for (const item of [{ id: 'all', name: 'All companies' }, ...data.companies]) {
            const button = element('button', '', item.name);
            button.type = 'button';
            button.setAttribute('aria-pressed', String(item.id === selected));
            button.addEventListener('click', () => {
                selected = item.id;
                for (const sibling of filters.children) sibling.setAttribute('aria-pressed', String(sibling === button));
                for (const section of document.querySelectorAll('.news-company')) section.hidden = selected !== 'all' && section.id !== selected;
            });
            filters.append(button);
        }
        render();
        status.textContent = '';
    } catch (error) {
        status.textContent = 'Company history could not be loaded. Please try again later.';
        console.error('Company news:', error);
    }
}

if (typeof document !== 'undefined' && document.getElementById('newsStatus')) init();
