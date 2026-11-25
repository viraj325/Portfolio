import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const moduleFromFile = async path => import(`data:text/javascript;base64,${Buffer.from(await readFile(new URL(path, import.meta.url), 'utf8')).toString('base64')}`);
const { companyOverviewLines, careerTimelineLines, companyUpdateLines } = await moduleFromFile('../assets/js/terminal-company-data.js');
const { mergeOverviews, validateData, entireTimeline } = await moduleFromFile('../assets/js/company-news.js');
const raw = JSON.parse(await readFile(new URL('../assets/data/company-news.json', import.meta.url)));
const synced = JSON.parse(await readFile(new URL('../assets/data/company-overviews.json', import.meta.url)));
const data = validateData(mergeOverviews(raw, synced));

test('company command uses merged monthly metrics and links each reporting source', () => {
    const lines = companyOverviewLines(data, true).join('\n');
    for (const company of data.companies) {
        assert.ok(lines.includes(company.name));
        for (const metric of company.profile.metrics) {
            assert.ok(lines.includes(metric.value));
            assert.ok(lines.includes(metric.asOf.replaceAll('&', '&amp;')));
            assert.ok(lines.includes(metric.url.replaceAll('&', '&amp;')));
        }
        for (const strength of company.profile.strengths) {
            assert.ok(lines.includes(strength.title));
            assert.ok(lines.includes(strength.url.replaceAll('&', '&amp;')));
        }
    }
    assert.ok(!lines.includes('snapshot unavailable'));
});

test('terminal timeline lists events chronologically and describes the current curved UI', () => {
    const events = entireTimeline(data.companies, '2026-11-25');
    const lines = careerTimelineLines(events);
    assert.equal(lines.filter(line => line.startsWith('  •')).length, events.length);
    assert.ok(lines[1].includes('2022-07'));
    assert.ok(lines.at(-1).includes('curved pathway'));
    assert.ok(!lines.join('\n').includes('horizontal'));
});

test('updates distinguishes unavailable and retained data from fresh data', () => {
    const partial = structuredClone(data);
    partial.companies[0].sync.status = 'needs-review';
    partial.companies[0].sync.lastSyncedAt = '2026-11-24T20:00:00Z';
    const lines = companyUpdateLines(partial, [{name: 'Wells Fargo', price: '$81.19', priceDate: 'Nov 24, 2026 · monthly snapshot'}, {name: 'NetJets', price: null}], false).join('\n');
    assert.ok(lines.includes('17:30 India time'));
    assert.ok(lines.includes('Nov 25, 2026 — source needs review; previous figures retained'));
    assert.ok(lines.includes('overview snapshot unavailable'));
    assert.ok(lines.includes('NetJets: unavailable'));
    assert.ok(lines.includes('not live quotes'));
});

test('external text cannot inject markup into terminal overview lines', () => {
    const altered = structuredClone(data);
    altered.companies[0].profile.description = '<img src=x onerror=alert(1)>';
    const lines = companyOverviewLines(altered, false).join('\n');
    assert.ok(lines.includes('&lt;img'));
    assert.ok(!lines.includes('<img'));
    assert.ok(lines.includes('Monthly overview snapshot unavailable; showing curated figures.'));
});
