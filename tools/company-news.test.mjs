import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

// Import the browser module without changing the repository's module settings.
const code = await readFile(new URL('../assets/js/company-news.js', import.meta.url), 'utf8');
const { validDate, timelineEvents, validateData, entireTimeline, mergeOverviews, enableDrag } = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
const data = JSON.parse(await readFile(new URL('../assets/data/company-news.json', import.meta.url)));

test('curated news data is valid and every seeded event falls within employment', () => {
    validateData(data);
    for (const company of data.companies) {
        assert.equal(timelineEvents(company, '2026-11-15').length, company.news.length);
    }
});

test('date validation rejects impossible dates and accepts month precision', () => {
    for (const value of ['2025-02-29', '2026-13', '2026-04-31', 'not-a-date']) assert.equal(validDate(value), false);
    for (const value of ['2024-02-29', '2026-03', '2026-03-01']) assert.equal(validDate(value), true);
});

test('timeline includes boundaries and month overlaps, excludes outside tenure, sorts chronologically', () => {
    const company = { employment: { start: '2025-05-15', end: '2026-02-10' }, news: ['2026-03-01', '2026-02', '2025-05-14', '2025-05-15', '2026-02-10', '2025-05', '2026-02-11'].map(date => ({ date })) };
    assert.deepEqual(timelineEvents(company).map(e => e.date), ['2025-05', '2025-05-15', '2026-02', '2026-02-10']);
});

test('present employment excludes future stories and handles an empty list', () => {
    const company = { employment: { start: '2026-03-01', end: null }, news: [{ date: '2026-11-16' }, { date: '2026-11-15' }] };
    assert.deepEqual(timelineEvents(company, '2026-11-15'), [{ date: '2026-11-15' }]);
    assert.deepEqual(timelineEvents({ ...company, news: [] }), []);
});

test('unsafe source links, duplicate company IDs, and reversed employment dates are rejected', () => {
    const unsafe = structuredClone(data);
    unsafe.companies[0].news[0].url = 'javascript:alert(1)';
    assert.throws(() => validateData(unsafe));
    const duplicate = structuredClone(data);
    duplicate.companies.push(duplicate.companies[0]);
    assert.throws(() => validateData(duplicate));
    const reversed = structuredClone(data);
    reversed.companies[0].employment.end = '2020-01-01';
    assert.throws(() => validateData(reversed));
});

test('company metric sources must be safe web URLs and include reporting context', () => {
    const unsafe = structuredClone(data);
    unsafe.companies[0].profile.metrics[0].url = 'javascript:alert(1)';
    assert.throws(() => validateData(unsafe));
    const undated = structuredClone(data);
    delete undated.companies[0].profile.metrics[0].asOf;
    assert.throws(() => validateData(undated));
});


test('entire timeline combines employer chapters and tenure-filtered news in date order', () => {
    const timeline = entireTimeline(data.companies, '2026-11-25');
    assert.equal(timeline.length, 9);
    assert.equal(timeline[0].title, 'Joined JPMorganChase');
    assert.equal(timeline.at(-1).companyId, 'wells-fargo');
    assert.deepEqual(timeline.map(item => item.date), timeline.map(item => item.date).toSorted());
    assert.ok(timeline.filter(item => item.kind === 'career').every(item => item.date.length === 7));
});

test('monthly overview merge updates metrics while preserving curated news, descriptions, and employment', () => {
    const old = structuredClone(data);
    const metrics = [{value: '$9T', label: 'Test metric', asOf: '2026-09-30', source: 'Official report', url: 'https://example.com/report'}];
    const merged = mergeOverviews(data, {companies: {'wells-fargo': {metrics, status: 'ok', lastSyncedAt: '2026-11-25T00:00:00Z'}}});
    validateData(merged);
    assert.deepEqual(merged.companies[0].profile.metrics, metrics);
    assert.deepEqual(merged.companies[0].news, data.companies[0].news);
    assert.equal(merged.companies[0].profile.description, data.companies[0].profile.description);
    assert.deepEqual(merged.companies[0].employment, data.companies[0].employment);
    assert.deepEqual(data, old);
});

test('synced report links cannot introduce executable URLs', () => {
    const merged = mergeOverviews(data, {companies: {'wells-fargo': {latestReport: {title: 'Report', url: 'javascript:alert(1)'}}}});
    assert.throws(() => validateData(merged));
});


test('mouse drag scrolls the timeline and suppresses the resulting card click', () => {
    const handlers = {};
    const rail = {scrollLeft: 100, classList: {add() {}, remove() {}}, addEventListener(type, fn) {handlers[type] = fn;}, setPointerCapture() {}};
    enableDrag(rail);
    handlers.pointerdown({pointerType: 'mouse', button: 0, pointerId: 1, clientX: 200});
    let prevented = false;
    handlers.pointermove({buttons: 1, clientX: 100, preventDefault() {prevented = true;}});
    assert.equal(rail.scrollLeft, 200);
    assert.equal(prevented, true);
    handlers.pointerup();
    let suppressed = false;
    handlers.click({preventDefault() {}, stopImmediatePropagation() {suppressed = true;}});
    assert.equal(suppressed, true);
});
