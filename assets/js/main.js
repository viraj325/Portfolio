const themeToggle = document.getElementById('themeToggle');
        const heroTerminalCTA = document.getElementById('heroTerminalCTA');
        const terminalClose = document.getElementById('terminalClose');
        const terminalOverlay = document.getElementById('terminalOverlay');
        const terminalBody = document.getElementById('terminalBody');
        const typedText = document.getElementById('typedText');
        const cursor = document.getElementById('cursor');
        const nfcCard = document.getElementById('nfcCard');
        const body = document.body;
        const heroQuote = document.getElementById('heroQuote');

        let currentCommand = '';

        const savedTheme = localStorage.getItem('theme') || 'light';
        body.setAttribute('data-theme', savedTheme);
        const quotes = [
            { text: 'The impediment to action advances action. What stands in the way becomes the way.', author: 'Marcus Aurelius' },
            { text: 'No man is free who is not master of himself.', author: 'Epictetus' },
            { text: 'Luck is what happens when preparation meets opportunity.', author: 'Seneca' },
            { text: 'He who has a why to live can bear almost any how.', author: 'Friedrich Nietzsche' },
            { text: 'Act as if what you do makes a difference. It does.', author: 'William James' },
            { text: 'The only journey is the one within.', author: 'Rainer Maria Rilke' },
            { text: 'Life shrinks or expands in proportion to one’s courage.', author: 'Anaïs Nin' },
            { text: 'It is never too late to be what you might have been.', author: 'George Eliot' }
        ];

        if (heroQuote) {
            const selected = quotes[Math.floor(Math.random() * quotes.length)];
            const quoteText = heroQuote.querySelector('.quote-text');
            const quoteAuthor = heroQuote.querySelector('.quote-author');
            if (quoteText) quoteText.textContent = selected.text;
            if (quoteAuthor) quoteAuthor.textContent = `— ${selected.author}`;
        }

        const companyMarketData = [
            {
                name: 'Wells Fargo',
                status: 'Public',
                symbol: 'WFC',
                ticker: 'NYSE: WFC',
                price: null,
                priceDate: null,
                note: 'Financial services and enterprise banking workflows.'
            },
            {
                name: 'NetJets',
                status: 'Private',
                symbol: 'BRK-B',
                ticker: 'NYSE: BRK.B (Berkshire Hathaway, parent company)',
                price: null,
                priceDate: null,
                note: 'Private subsidiary of Berkshire Hathaway; BRK.B shown as parent market proxy.'
            },
            {
                name: 'JPMorganChase',
                status: 'Public',
                symbol: 'JPM',
                ticker: 'NYSE: JPM',
                price: null,
                priceDate: null,
                note: 'Banking product infrastructure, compliance tooling, and delivery coordination.'
            }
        ];

        async function loadMonthlyQuotes() {
            try {
                const response = await fetch('assets/data/stock-quotes.json', { cache: 'no-store' });
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const snapshot = await response.json();
                if (!Array.isArray(snapshot.quotes)) throw new Error('Invalid quote snapshot');
                for (const company of companyMarketData) {
                    const quote = snapshot.quotes.find(item => item.symbol === company.symbol);
                    if (!quote || !Number.isFinite(quote.price) || quote.price <= 0 ||
                        !Number.isFinite(Date.parse(quote.asOf)) || !['up', 'down', 'unchanged'].includes(quote.direction)) {
                        throw new Error(`Invalid quote for ${company.symbol}`);
                    }
                }
                for (const quote of snapshot.quotes) {
                    const company = companyMarketData.find(item => item.symbol === quote.symbol);
                    if (!company) continue;
                    const date = new Intl.DateTimeFormat('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric', timeZone: 'America/New_York'
                    }).format(new Date(quote.asOf));
                    const price = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(quote.price);
                    company.price = price;
                    company.priceDate = `as of ${date} · monthly snapshot`;
                    const label = quote.symbol === 'BRK-B' ? 'BRK.B' : quote.symbol;
                    document.querySelectorAll(`[data-stock-symbol="${quote.symbol}"]`).forEach(node => {
                        const icon = node.querySelector('.stock-icon');
                        icon.textContent = { up: '▲', down: '▼', unchanged: '•' }[quote.direction];
                        icon.classList.toggle('up', quote.direction === 'up');
                        icon.classList.toggle('down', quote.direction === 'down');
                        node.querySelector('.stock-value').textContent = `${label} · ${price}`;
                        node.setAttribute('aria-label', `${label}, ${price}, ${quote.direction} versus previous close, as of ${date}, monthly snapshot`);
                        node.title = `Monthly snapshot from ${snapshot.source || 'market data'} · Quote time: ${quote.asOf}`;
                    });
                    document.querySelectorAll(`[data-quote-date="${quote.symbol}"]`).forEach(node => {
                        node.textContent = `As of ${date}`;
                    });
                }
            } catch (error) {
                document.querySelectorAll('[data-stock-symbol]').forEach(node => {
                    const label = node.dataset.stockSymbol === 'BRK-B' ? 'BRK.B' : node.dataset.stockSymbol;
                    node.querySelector('.stock-value').textContent = `${label} · Unavailable`;
                    node.setAttribute('aria-label', `${label} quote unavailable`);
                });
                console.info('Monthly quote snapshot unavailable.', error);
            }
        }

        window.portfolioMarketData = companyMarketData;
        const monthlyQuotePromise = loadMonthlyQuotes();

        if (nfcCard) {
            const query = window.location.search.slice(1);
            const hasCardQuery = new URLSearchParams(window.location.search).has('card') ||
                query.split(/[&=]/).includes('card');

            if (hasCardQuery) {
                nfcCard.hidden = false;
                nfcCard.closest('.hero')?.classList.add('has-nfc-card');
            }
        }

        const terminalCommands = {
            help: () => {
                printLines([
                    'Available commands:',
                    '<span class="tag">help</span> Show this command list',
                    '<span class="tag">about</span> Learn about my work and background',
                    '<span class="tag">contact</span> Show contact links',
                    '<span class="tag">products</span> Describe current active applications',
                    '<span class="tag">companies</span> Show company descriptions, sourced metrics, and websites',
                    '<span class="tag">stocks</span> Show public/private company ticker data',
                    '<span class="tag">experience</span> Show employment history and dates',
                    '<span class="tag">news</span> Read company milestones from my employment periods',
                    '<span class="tag">timeline</span> Show all career events in chronological order',
                    '<span class="tag">updates</span> Show monthly overview sync and stock snapshot dates',
                    '<span class="tag">xbox</span> Show my Xbox gamer tag and profile',
                    '<span class="tag">traveling</span> Show travel and globe status',
                    '<span class="tag">version</span> Show last updated and build information',
                    '<span class="tag">open &lt;site&gt;</span> Open links (linkedin, github, email, appstore, presence, seed, ghost, loop, xbox, news, timeline)',
                    '<span class="tag">theme &lt;mode&gt;</span> Switch theme (light, dark)',
                    '<span class="tag">resume</span> Request a resume summary',
                    '<span class="tag">clear</span> Clear terminal output',
                    '<span class="tag">close</span> Exit terminal mode'
                ]);
            },
            about: () => {
                printLines([
                    'I am Viraj Patel, a Senior Software Engineer building mobile-first applications.',
                    'My portfolio highlights Loop Safety, Ghost Finance Terminal, Presence, Seed, and company milestones from my career.',
                    'Try `timeline`, `companies`, `updates`, `experience`, `products`, or `xbox` to explore.'
                ]);
            },
            contact: () => {
                printLines([
                    'Contact information:',
                    '  Email: virajpatel325@gmail.com',
                    '  GitHub: https://github.com/viraj325',
                    '  LinkedIn: https://www.linkedin.com/in/viraj-patel-b9baa3143/',
                    '  Xbox: viraj325 — https://www.xbox.com/play/user/viraj325',
                    '  Location: Columbus, OH'
                ]);
            },
            products: () => {
                printLines([
                    'Active application products:',
                    '  • Loop Safety — a location-based safety app that provides alerts, safety tips, and community-driven updates.',
                    '  • Ghost Finance Terminal — a CLI-first financial terminal with market data, news, sentiment, insider trading, charts, and AI research.',
                    '  • Presence — a native personal life dashboard for iPhone and iPad, bringing work, fitness, travel, notes, and everyday tools together.',
                    '  • Seed — a calm, local-first startup intelligence app for founders and startup explorers.',
                    '  • More projects are coming soon. Stay tuned!'
                ]);
            },
            resume: () => printCareerHistory(true),
            experience: () => printCareerHistory(),
            news: () => printCareerNews(),
            timeline: () => printEntireCareerTimeline(),
            updates: () => printDataUpdates(),
            xbox: () => {
                printLines([
                    'Xbox gamer tag: viraj325',
                    'Profile: https://www.xbox.com/play/user/viraj325',
                    'Use `open xbox` to visit my profile.'
                ]);
            },
            companies: () => printCompanyOverviews(),
            stocks: () => {
                printCompanyData('Company market data:');
            },
            traveling: () => {
                printLines([
                    'Travel status:',
                    '  Active globe tracking is enabled on this portfolio page.',
                    '  Explore locations, routes, and travel history via the interactive map.'
                ]);
            },
            version: () => {
                printLines([
                    'Portfolio CLI v1.4.0',
                    'Last updated: November 25, 2026',
                    'Build: scroll-drawn career pathway, branded company views, monthly overviews and stock snapshots',
                    'Products: Loop Safety, Ghost Finance Terminal, Presence, Seed',
                    'Timeline: company-news/index.html — curved pathway with scroll-revealed event panels',
                    'Views: Entire Timeline (orange), Wells Fargo (neutral whites/grays with red/yellow accents), JPMorganChase (gold/sand), NetJets (navy/neutral)',
                    'Charts: WFC, JPM, and BRK.B (Berkshire Hathaway, NetJets parent company)'
                ]);
            },
            clear: () => {
                terminalBody.innerHTML = '';
            }
        };

        // The page and terminal share the same editable career/news data and date filtering.
        let careerDataPromise;
        function loadCareerData() {
            if (!careerDataPromise) {
                careerDataPromise = Promise.all([
                    fetch('assets/data/company-news.json', { cache: 'no-store' }).then(response => {
                        if (!response.ok) throw new Error(`HTTP ${response.status}`);
                        return response.json();
                    }),
                    import('./company-news.js?v=journey-5'),
                    import('./terminal-company-data.js?v=2026-11-25')
                ]).then(async ([raw, helpers, formatters]) => {
                    let data = helpers.validateData(raw);
                    let overviewsAvailable = false;
                    try {
                        const response = await fetch('assets/data/company-overviews.json', { cache: 'no-store' });
                        if (!response.ok) throw new Error(`HTTP ${response.status}`);
                        data = helpers.validateData(helpers.mergeOverviews(data, await response.json()));
                        overviewsAvailable = true;
                    } catch { /* Curated company figures remain available when the monthly snapshot cannot load. */ }
                    return { data, helpers, formatters, overviewsAvailable };
                })
                    .catch(error => { careerDataPromise = null; throw error; });
            }
            return careerDataPromise;
        }

        function terminalText(value) {
            return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
        }

        function careerDate(value) {
            return new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' })
                .format(new Date(`${value.length === 7 ? value + '-01' : value}T00:00:00Z`));
        }

        async function printCareerHistory(resume = false) {
            try {
                const { data } = await loadCareerData();
                const lines = [resume ? 'Resume summary — Viraj Patel, Senior Software Engineer:' : 'Employment history:'];
                for (const company of data.companies) {
                    const period = `${careerDate(company.employment.start)} — ${company.employment.end ? careerDate(company.employment.end) : 'Present'}`;
                    lines.push(`  • ${terminalText(company.name)}: ${period}`);
                }
                if (resume) lines.push('  Products: Loop Safety, Ghost Finance Terminal, Presence, Seed.', '  Full resume available upon request via email or LinkedIn.');
                lines.push('Use `timeline` for the full career journey, `companies` for current overviews, or `open timeline` for the curved pathway.');
                printLines(lines);
            } catch (error) {
                printLines(['Career history is unavailable. Please try again or use `open news`.']);
            }
        }

        async function printCareerNews() {
            try {
                const { data, helpers } = await loadCareerData();
                const lines = ['Company news during my employment (oldest first per company):'];
                for (const company of data.companies) {
                    lines.push('', terminalText(company.name));
                    const events = helpers.timelineEvents(company);
                    if (!events.length) lines.push('  No milestones added for this chapter yet.');
                    for (const event of events) {
                        lines.push(`  • ${terminalText(event.date)} — ${terminalText(event.title)}`,
                            `    ${terminalText(event.description)}`,
                            `    Source: <a href="${terminalText(event.url)}" target="_blank" rel="noopener noreferrer">${terminalText(event.source)} ↗</a>`);
                    }
                }
                lines.push('', 'Use `open timeline` for the scroll-drawn pathway, or `open news` and select a company for its overview and TradingView chart.', 'This is a curated history, updated by hand.');
                printLines(lines);
            } catch (error) {
                printLines(['Company news is unavailable. Please try again or use `open news`.']);
            }
        }

        async function printCompanyOverviews() {
            try {
                const { data, formatters, overviewsAvailable } = await loadCareerData();
                printLines(formatters.companyOverviewLines(data, overviewsAvailable));
            } catch {
                printLines(['Company overviews are unavailable. Please try again or use `open news`.']);
            }
        }

        async function printEntireCareerTimeline() {
            try {
                const { data, helpers, formatters } = await loadCareerData();
                printLines(formatters.careerTimelineLines(helpers.entireTimeline(data.companies)));
            } catch {
                printLines(['Career timeline is unavailable. Please try again or use `open timeline`.']);
            }
        }

        async function printDataUpdates() {
            try {
                const { data, formatters, overviewsAvailable } = await loadCareerData();
                await monthlyQuotePromise;
                printLines(formatters.companyUpdateLines(data, companyMarketData, overviewsAvailable));
            } catch {
                printLines(['Update status is unavailable. Please try again or use `open news`.']);
            }
        }

        async function printCompanyData(title) {
            await monthlyQuotePromise;
            const lines = [title];

            (window.portfolioMarketData || companyMarketData).forEach((company) => {
                const marketLine = company.price
                    ? `${company.status} — ${company.ticker} — ${company.price} (${company.priceDate})`
                    : `${company.status} — ${company.ticker}`;

                lines.push(`  • ${company.name}: ${marketLine}`);
                lines.push(`    ${company.note}`);
            });

            lines.push('Prices are monthly snapshots, not live quotes. Each price includes its quote date.', 'Use `open news` for company profiles, metrics, and charts.');
            printLines(lines);
        }

        const commandPatterns = {
            theme: (value) => {
                const normalized = value.trim().toLowerCase();
                if (normalized === 'dark' || normalized === 'light') {
                    setTheme(normalized);
                    printLines([`Theme switched to ${normalized}.`]);
                } else {
                    printLines([`Unknown theme: ${value}`, 'Use `theme <mode>` with light or dark.']);
                }
            },
            open: (value) => {
                const normalized = value.trim().toLowerCase();
                const urls = {
                    linkedin: 'https://www.linkedin.com/in/viraj-patel-b9baa3143/',
                    github: 'https://github.com/viraj325',
                    xbox: 'https://www.xbox.com/play/user/viraj325',
                    news: 'company-news/index.html',
                    timeline: 'company-news/index.html',
                    email: 'mailto:virajpatel325@gmail.com',
                    appstore: 'https://apps.apple.com/us/app/seed-venture-beyond/id6443686127',
                    'app store': 'https://apps.apple.com/us/app/seed-venture-beyond/id6443686127',
                    presence: 'presence-app/index.html',
                    seed: 'seed/index.html',
                    ghost: 'ghost-finance-terminal/index.html',
                    loop: 'https://www.loopsafety.online',
                    mail: 'mailto:virajpatel325@gmail.com'
                };

                if (urls[normalized]) {
                    window.open(urls[normalized], '_blank', 'noopener,noreferrer');
                    printLines([`Opening ${normalized} in new tab...`]);
                } else {
                    printLines([`Unknown link: ${value}`, 'Available: linkedin, github, email, appstore, presence, seed, ghost, loop, mail, xbox, news, timeline']);
                }
            }
        };

        function setTheme(themeName) {
            body.setAttribute('data-theme', themeName);
            localStorage.setItem('theme', themeName);
            window.__drawTravelMap?.();
        }

        function printLine(text, className = '') {
            const line = document.createElement('div');
            line.className = `terminal-line ${className}`.trim();
            line.innerHTML = text;
            terminalBody.appendChild(line);
            terminalBody.scrollTop = terminalBody.scrollHeight;
        }

        function printLines(lines, delay = 50) {
            if (lines.length === 0) return;

            let index = 0;
            const printNext = () => {
                if (index < lines.length) {
                    printLine(lines[index]);
                    index++;
                    setTimeout(printNext, delay);
                }
            };
            printNext();
        }

        function openTerminal() {
            body.classList.add('terminal-open');
            terminalOverlay.classList.remove('hidden');
            terminalOverlay.setAttribute('aria-hidden', 'false');
            if (!terminalBody.innerHTML.trim()) {
                const isMobile = window.innerWidth <= 640;
                const introMessage = isMobile ? [
                    '<span class="terminal-command">viraj@portfolio:~$ whoami</span>',
                    'Senior Software Engineer | Product Builder',
                    '',
                    '<span class="terminal-command">viraj@portfolio:~$ ls commands/</span>',
                    '<span class="tag">help</span> <span class="tag">experience</span> <span class="tag">timeline</span> <span class="tag">companies</span> <span class="tag">updates</span> <span class="tag">xbox</span>',
                    '',
                    '<span class="terminal-command">viraj@portfolio:~$ echo "Ready to explore?"</span>',
                    'Ready to explore.'
                ] : [
                    '<span class="terminal-command">viraj@portfolio:~$ whoami</span>',
                    'Senior Software Engineer | Product Builder | Tech Enthusiast',
                    '',
                    '<span class="terminal-command">viraj@portfolio:~$ ls commands/</span>',
                    '<span class="tag">products</span> <span class="tag">experience</span> <span class="tag">timeline</span> <span class="tag">companies</span> <span class="tag">updates</span> <span class="tag">xbox</span>',
                    '',
                    '<span class="terminal-command">viraj@portfolio:~$ cat mission.txt</span>',
                    '"Building useful products."',
                    '"Crafting experiences."',
                    '"Turning ideas into impact."',
                    '',
                    '<span class="terminal-command">viraj@portfolio:~$ echo "Ready to see more?"</span>',
                    'Ready to see more?',
                    '',
                    '<span class="terminal-command">viraj@portfolio:~$ type help to explore my work -></span>'
                ];
                printLines(introMessage);
            }
        }

        function closeTerminal() {
            body.classList.remove('terminal-open');
            terminalOverlay.classList.add('hidden');
            terminalOverlay.setAttribute('aria-hidden', 'true');
            heroTerminalCTA?.focus();
        }

        function handleCommand(command) {
            const trimmed = command.trim();
            if (!trimmed) {
                printLine(`viraj@portfolio:~$ `, 'terminal-command');
                return;
            }

            printLine(`viraj@portfolio:~$ ${trimmed}`, 'terminal-command');

            const normalized = trimmed.toLowerCase();
            if (terminalCommands[normalized]) {
                terminalCommands[normalized]();
                return;
            }

            const [base, ...args] = normalized.split(' ');
            if (commandPatterns[base]) {
                commandPatterns[base](args.join(' '));
                return;
            }

            if (normalized === 'close' || normalized === 'exit') {
                closeTerminal();
                return;
            }

            printLines([
                `Command not found: ${trimmed}`,
                'Type `help` for a list of valid commands.'
            ]);
        }

        function updateTypedText() {
            typedText.textContent = currentCommand;
        }

        function clearInput() {
            currentCommand = '';
            typedText.textContent = '';
            const terminalInput = document.getElementById('terminalInput');
            if (terminalInput) terminalInput.value = '';
        }

        themeToggle.addEventListener('click', () => {
            const currentTheme = body.getAttribute('data-theme');
            const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
            setTheme(nextTheme);
        });

        if (heroTerminalCTA) {
            heroTerminalCTA.addEventListener('click', openTerminal);
        }

        terminalClose.addEventListener('click', closeTerminal);

        const inputRow = document.querySelector('.input-row');
        const terminalInput = document.getElementById('terminalInput');

        if (inputRow && terminalInput) {
            inputRow.addEventListener('click', () => {
                terminalInput.focus({ preventScroll: true });
            });

            terminalInput.addEventListener('input', (event) => {
                currentCommand = event.target.value;
                updateTypedText();
            });

            terminalInput.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    handleCommand(currentCommand);
                    clearInput();
                    terminalInput.value = '';
                }
            });
        }

        function handleKeyDown(event) {
            if (terminalOverlay.classList.contains('hidden')) return;
            if (event.target === terminalInput) return;

            event.preventDefault();

            if (event.key === 'Enter') {
                const command = currentCommand;
                clearInput();
                handleCommand(command);
            } else if (event.key === 'Backspace') {
                currentCommand = currentCommand.slice(0, -1);
                updateTypedText();
            } else if (event.key.length === 1) {
                currentCommand += event.key;
                updateTypedText();
            }
        }

        document.addEventListener('keydown', handleKeyDown);

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && !terminalOverlay.classList.contains('hidden')) {
                closeTerminal();
            } else if (event.key.toLowerCase() === 't' && event.ctrlKey) {
                event.preventDefault();
                if (terminalOverlay.classList.contains('hidden')) {
                    openTerminal();
                } else {
                    closeTerminal();
                }
            }
        });

        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        document.querySelectorAll('.section, .hero').forEach(section => {
            section.style.opacity = '0';
            section.style.transform = 'translateY(20px)';
            section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(section);
        });

        document.querySelector('.hero').style.opacity = '1';
        document.querySelector('.hero').style.transform = 'translateY(0)';
