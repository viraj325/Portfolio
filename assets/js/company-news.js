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

export function entireTimeline(companies, today) {
    return companies.flatMap(company => {
        const entries = timelineEvents(company, today).map(event => ({ ...event, companyId: company.id, companyName: company.name, kind: 'news' }));
        entries.push({ date: company.employment.start.slice(0, 7), title: `Joined ${company.name}`, description: `A new chapter at ${company.name}.`, companyId: company.id, companyName: company.name, kind: 'career' });
        if (company.employment.end) entries.push({ date: company.employment.end.slice(0, 7), title: `${company.name} chapter completed`, description: `The end of my time at ${company.name}.`, companyId: company.id, companyName: company.name, kind: 'career' });
        return entries;
    }).sort((a, b) => a.date.localeCompare(b.date));
}

export function mergeOverviews(data, snapshot) {
    return { ...data, companies: data.companies.map(company => {
        const overview = snapshot?.companies?.[company.id];
        if (!overview) return company;
        return { ...company, profile: { ...company.profile, metrics: overview.metrics || company.profile.metrics }, sync: overview };
    }) };
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
        if (company.sync?.latestReport && (!company.sync.latestReport.title || !/^https?:$/.test(new URL(company.sync.latestReport.url).protocol))) throw new Error(`Invalid synced source for ${company.name}.`);
        if (company.sync?.lastSyncedAt && !Number.isFinite(Date.parse(company.sync.lastSyncedAt))) throw new Error(`Invalid sync date for ${company.name}.`);
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

function renderCompany(company, theme, includeEvents = true) {
    const section = element('section', 'news-company');
    section.id = company.id;
    section.dataset.company = company.id;
    section.setAttribute('aria-labelledby', `${company.id}-title`);
    const heading = element('div', 'company-heading');
    const details = element('div');
    details.append(element('p', 'eyebrow', company.employment.end ? 'Previous chapter' : 'Current chapter'));
    const title = element('h2', 'company-wordmark');
    title.setAttribute('aria-label', company.name);
    const wordmark = element('img');
    wordmark.alt = company.name;
    wordmark.src = `../assets/brands/${company.id === 'wells-fargo' ? 'wells-fargo.png' : company.id === 'netjets' ? 'netjets.svg' : (theme === 'dark' ? 'jpmorgan-chase-white.svg' : 'jpmorgan-chase.svg')}`;
    title.append(wordmark);
    title.id = `${company.id}-title`;
    const identity = element('div', 'company-identity');
    identity.append(title);
    details.append(identity, element('p', 'tenure', `${formatDate(company.employment.start, true)} — ${company.employment.end ? formatDate(company.employment.end, true) : 'Present'}`));
    const metrics = companyProfile(company, details);
    heading.append(details, marketTile(company, theme));
    section.append(heading);
    if (metrics) section.append(metrics, element('p', 'metric-context', 'Business scale reflects the dates shown, independently of my employment period. AUM, client assets, and balance-sheet assets are different measures.'));
    if (company.sync) {
        const sync = company.sync;
        section.append(element('p', 'overview-sync', sync.lastSyncedAt ? `Overview synced ${new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(sync.lastSyncedAt))} · ${sync.status === 'ok' ? 'Official sources' : 'Some sources need review; showing last verified figures'}` : 'Overview sync pending'));
        if (sync.latestReport) section.append(externalLink(sync.latestReport.url, sync.latestReport.title + ' ↗', 'latest-report'));
    }
    if (!includeEvents) return section;
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
    enableDrag(list);
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

export function enableDrag(rail) {
    let origin = null;
    let moved = false;
    rail.addEventListener('pointerdown', event => {
        if (event.pointerType !== 'mouse' || event.button !== 0) return;
        origin = { x: event.clientX, left: rail.scrollLeft, id: event.pointerId };
        moved = false;
    });
    rail.addEventListener('pointermove', event => {
        if (!origin) return;
        if (!event.buttons) { origin = null; rail.classList.remove('is-dragging'); return; }
        const distance = event.clientX - origin.x;
        if (Math.abs(distance) > 6 && !moved) {
            moved = true;
            rail.setPointerCapture(origin.id);
            rail.classList.add('is-dragging');
        }
        if (moved) { rail.scrollLeft = origin.left - distance; event.preventDefault(); }
    });
    const end = () => { origin = null; rail.classList.remove('is-dragging'); };
    rail.addEventListener('pointerup', end);
    rail.addEventListener('pointercancel', end);
    rail.addEventListener('lostpointercapture', end);
    rail.addEventListener('click', event => { if (moved) { event.preventDefault(); event.stopImmediatePropagation(); moved = false; } }, true);
}

function renderEntireTimeline(data, theme, selectCompany) {
    const view = element('section', 'entire-timeline');
    view.setAttribute('aria-label', 'Entire career timeline');
    const top = element('div', 'timeline-heading');
    const intro = element('div');
    intro.append(element('p', 'eyebrow', 'One journey / every chapter'), element('h2', '', 'Entire Timeline'), element('p', 'timeline-help', 'Drag or scroll to travel through time. Select a moment to open its story.'));
    const controls = element('div', 'timeline-controls');
    const rail = element('ol', 'career-rail');
    rail.id = 'entireTimelineRail';
    rail.tabIndex = 0;
    rail.setAttribute('aria-label', 'Chronological career events. Scroll horizontally or use arrow keys.');
    enableDrag(rail);
    const overview = element('div', 'active-overview');
    const events = entireTimeline(data.companies);
    let activeCompany = '';
    const cards = [];
    function activate(index) {
        cards.forEach((card, i) => card.classList.toggle('is-current', i === index));
        const company = data.companies.find(item => item.id === events[index].companyId);
        if (activeCompany === company.id) return;
        activeCompany = company.id;
        overview.replaceChildren(renderCompany(company, theme, false));
    }
    function showStory(event, trigger) {
        const company = data.companies.find(item => item.id === event.companyId);
        const dialog = document.getElementById('eventDialog');
        const content = element('div', 'story-content');
        content.dataset.company = company.id;
        const close = element('button', 'dialog-close', 'Close ×');
        close.type = 'button';
        close.addEventListener('click', () => dialog.close());
        const title = element('h2', '', event.title);
        title.id = 'storyTitle';
        content.append(close, element('p', 'eyebrow', company.name), element('time', '', formatDate(event.date)), title, element('p', 'story-description', event.description));
        if (event.url) content.append(externalLink(event.url, `${event.source} ↗`));
        const companyButton = element('button', 'story-company', `Explore ${company.name}`);
        companyButton.type = 'button';
        companyButton.addEventListener('click', () => { dialog.close(); selectCompany(company.id); });
        content.append(companyButton);
        dialog.replaceChildren(content);
        dialog.onclose = () => { if (trigger.isConnected) trigger.focus({ preventScroll: true }); };
        dialog.showModal();
    }
    for (const [index, event] of events.entries()) {
        const item = element('li', 'career-moment');
        item.dataset.company = event.companyId;
        const card = element('button', 'moment-card');
        card.type = 'button';
        card.setAttribute('aria-haspopup', 'dialog');
        const date = element('time', '', formatDate(event.date));
        date.dateTime = event.date;
        card.append(element('span', 'moment-company', event.companyName), date, element('h3', '', event.title), element('span', 'moment-kind', event.kind === 'career' ? 'Career milestone' : 'Company news'), element('span', 'moment-open', 'Read the story ↗'));
        card.addEventListener('click', () => { activate(index); showStory(event, card); });
        card.addEventListener('focus', () => activate(index));
        item.append(card);
        rail.append(item);
        cards.push(item);
    }
    for (const [label, direction] of [['Earlier events', -1], ['Later events', 1]]) {
        const button = element('button', '', direction < 0 ? '←' : '→');
        button.type = 'button';
        button.setAttribute('aria-label', label);
        button.setAttribute('aria-controls', rail.id);
        button.addEventListener('click', () => rail.scrollBy({ left: direction * 310, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }));
        controls.append(button);
    }
    top.append(intro, controls);
    view.append(top, rail, overview);
    let frame;
    rail.addEventListener('scroll', () => {
        if (frame) return;
        frame = requestAnimationFrame(() => {
            frame = null;
            const x = rail.getBoundingClientRect().left + 80;
            let nearest = 0, distance = Infinity;
            cards.forEach((card, index) => { const delta = Math.abs(card.getBoundingClientRect().left - x); if (delta < distance) { nearest = index; distance = delta; } });
            activate(nearest);
        });
    }, { passive: true });
    rail.addEventListener('keydown', event => {
        if (event.target !== rail) return;
        if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
            event.preventDefault();
            rail.scrollBy({ left: event.key === 'ArrowRight' ? 310 : -310, behavior: 'auto' });
        }
    });
    const reveal = new IntersectionObserver(entries => entries.forEach(entry => entry.target.classList.toggle('is-visible', entry.isIntersecting)), { root: rail, threshold: .15 });
    cards.forEach(card => reveal.observe(card));
    timelineObservers.push(reveal);
    activate(0);
    return view;
}

async function init() {
    const status = document.getElementById('newsStatus');
    let theme = 'light';
    try { theme = localStorage.getItem('theme') === 'dark' ? 'dark' : 'light'; } catch { /* Optional persistence. */ }
    document.body.dataset.theme = theme;
    const themeButton = document.getElementById('newsTheme');
    const updateThemeLabel = () => { themeButton.textContent = theme === 'light' ? 'Dark mode' : 'Light mode'; };
    updateThemeLabel();
    let data;
    let selected = 'all';
    const filters = document.getElementById('companyFilters');
    function selectCompany(id) {
        selected = id;
        for (const button of filters.children) button.setAttribute('aria-pressed', String(button.dataset.companyId === selected));
        render();
    }
    function render() {
        for (const observer of timelineObservers.splice(0)) observer.disconnect();
        const host = document.getElementById('companyNews');
        if (selected === 'all') {
            document.body.dataset.company = 'entire';
            host.replaceChildren(renderEntireTimeline(data, theme, selectCompany));
        }
        else {
            document.body.dataset.company = selected;
            host.replaceChildren(renderCompany(data.companies.find(company => company.id === selected), theme));
        }
    }
    themeButton.addEventListener('click', () => {
        theme = theme === 'light' ? 'dark' : 'light';
        document.body.dataset.theme = theme;
        try { localStorage.setItem('theme', theme); } catch { /* Optional persistence. */ }
        updateThemeLabel();
        if (data) render();
    });
    const dialog = document.getElementById('eventDialog');
    dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
    try {
        const response = await fetch('../assets/data/company-news.json', { cache: 'no-store' });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        data = validateData(await response.json());
        try {
            const syncResponse = await fetch('../assets/data/company-overviews.json', { cache: 'no-store' });
            if (!syncResponse.ok) throw new Error('Overview sync unavailable');
            const merged = mergeOverviews(data, await syncResponse.json());
            data = validateData(merged);
        } catch (error) { status.textContent = 'Monthly overview sync unavailable; showing curated company figures.'; }
        for (const item of [{ id: 'all', name: 'Entire Timeline' }, ...data.companies]) {
            const button = element('button', '', item.name);
            button.type = 'button';
            button.dataset.companyId = item.id;
            button.setAttribute('aria-pressed', String(item.id === selected));
            button.addEventListener('click', () => selectCompany(item.id));
            filters.append(button);
        }
        render();
        if (status.textContent === 'Loading company history…') status.textContent = '';
    } catch (error) {
        status.textContent = 'Company history could not be loaded. Please try again later.';
        console.error('Company news:', error);
    }
}

if (typeof document !== 'undefined' && document.getElementById('newsStatus')) init();
