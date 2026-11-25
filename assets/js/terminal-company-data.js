// Terminal formatting stays separate from the visual company experience.
export function escapeTerminalText(value) {
    return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}

function sourceLink(url, label) {
    return `<a href="${escapeTerminalText(url)}" target="_blank" rel="noopener noreferrer">${escapeTerminalText(label)} ↗</a>`;
}

export function companyOverviewLines(data, overviewsAvailable) {
    const lines = ['Company overviews:'];
    for (const company of data.companies) {
        const profile = company.profile;
        lines.push('', escapeTerminalText(company.name));
        if (!profile) continue;
        lines.push(`  ${escapeTerminalText(profile.description)}`, `  Website: ${sourceLink(profile.website, company.name)}`);
        for (const metric of profile.metrics) {
            lines.push(`  • ${escapeTerminalText(metric.label)}: ${escapeTerminalText(metric.value)} (${escapeTerminalText(metric.asOf)})`,
                `    ${sourceLink(metric.url, metric.source)}`);
        }
        for (const strength of profile.strengths || []) {
            lines.push(`  • ${escapeTerminalText(strength.title)} — ${escapeTerminalText(strength.description)}`,
                `    ${escapeTerminalText(strength.asOf)} · ${sourceLink(strength.url, strength.source)}`);
        }
        if (company.marketNote) lines.push(`  ${escapeTerminalText(company.marketNote)}`);
        if (company.sync?.status === 'needs-review') lines.push('  Source refresh needs review; showing the last verified figures.');
    }
    if (!overviewsAvailable) lines.push('', 'Monthly overview snapshot unavailable; showing curated figures.');
    lines.push('', 'Metrics reflect their reporting dates. Use `updates` for refresh status or `open news` for company views.');
    return lines;
}

export function careerTimelineLines(events) {
    return ['Entire Timeline — career and company events:',
        ...events.map(event => `  • ${escapeTerminalText(event.date)} · ${escapeTerminalText(event.companyName)} — ${escapeTerminalText(event.title)}`),
        '', 'Use `open timeline` for the orange curved pathway. Scroll to reveal company and event panels.'];
}

export function companyUpdateLines(data, marketData, overviewsAvailable) {
    const lines = ['Monthly data updates:', '  Scheduled for the first of each month at 17:30 India time (12:00 UTC).',
        '  Company metrics and share prices are snapshots; quarterly figures may stay unchanged between reports.'];
    if (!overviewsAvailable) lines.push('  Company overview snapshot unavailable; curated figures are shown.');
    for (const company of data.companies) {
        const sync = company.sync;
        const checked = sync?.lastSyncedAt ? new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeZone: 'Asia/Kolkata' }).format(new Date(sync.lastSyncedAt)) : 'not yet verified by the monthly sync';
        lines.push(`  • ${escapeTerminalText(company.name)}: ${escapeTerminalText(checked)}${sync?.status === 'needs-review' ? ' — source needs review; previous figures retained' : ''}`);
    }
    lines.push('', 'Share-price snapshots:');
    for (const company of marketData) {
        lines.push(`  • ${escapeTerminalText(company.name)}: ${company.price ? `${escapeTerminalText(company.price)} (${escapeTerminalText(company.priceDate)})` : 'unavailable'}`);
    }
    lines.push('  Use `stocks` for tickers. These prices are not live quotes.');
    return lines;
}
