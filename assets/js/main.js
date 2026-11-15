const themeToggle = document.getElementById('themeToggle');
        const terminalToggle = document.getElementById('terminalToggle');
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
                price: '$80.90',
                priceDate: 'May 1, 2026 close',
                note: 'Financial services and enterprise banking workflows.'
            },
            {
                name: 'NetJets',
                status: 'Private',
                symbol: 'BRK-B',
                ticker: 'NYSE: BRK.B (Berkshire Hathaway, parent company)',
                price: '$473.01',
                priceDate: 'May 1, 2026 close',
                note: 'Private subsidiary of Berkshire Hathaway; BRK.B shown as parent market proxy.'
            },
            {
                name: 'JPMorgan Chase',
                status: 'Public',
                symbol: 'JPM',
                ticker: 'NYSE: JPM',
                price: '$312.47',
                priceDate: 'May 1, 2026 close',
                note: 'Banking product infrastructure, compliance tooling, and delivery coordination.'
            }
        ];

        const marketCacheKey = 'portfolio-market-data-v1';
        const marketRefreshInterval = 7 * 24 * 60 * 60 * 1000;

        function readMarketCache() {
            try {
                const cache = JSON.parse(localStorage.getItem(marketCacheKey));
                return cache && Array.isArray(cache.quotes) ? cache : null;
            } catch {
                return null;
            }
        }

        function applyMarketQuotes(quotes) {
            quotes.forEach((quote) => {
                const company = companyMarketData.find((item) => item.symbol === quote.symbol);
                if (company) {
                    company.price = `$${quote.price.toFixed(2)}`;
                    company.priceDate = `${quote.priceDate} close`;
                    company.direction = quote.direction;
                }

                document.querySelectorAll(`[data-stock-symbol="${quote.symbol}"]`).forEach((node) => {
                    const icon = node.querySelector('.stock-icon');
                    const displaySymbol = quote.symbol === 'BRK-B' ? 'BRK.B (Berkshire Hathaway · parent)' : quote.symbol;
                    const isUp = quote.direction !== 'down';
                    if (icon) {
                        icon.textContent = isUp ? '▲' : '▼';
                        icon.classList.toggle('up', isUp);
                        icon.classList.toggle('down', !isUp);
                    }
                    node.lastChild.textContent = ` ${displaySymbol} · $${quote.price.toFixed(2)}`;
                    node.title = `Latest market close: ${quote.priceDate}`;
                });
            });
            window.portfolioMarketData = companyMarketData;
        }

        async function refreshWeeklyMarketData() {
            const cache = readMarketCache();
            if (cache) applyMarketQuotes(cache.quotes);
            if (cache && Date.now() - cache.updatedAt < marketRefreshInterval) return;

            try {
                const quotes = await Promise.all(companyMarketData.map(async (company) => {
                    const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${company.symbol}?range=5d&interval=1d`, { cache: 'no-store' });
                    if (!response.ok) throw new Error(`Market request failed for ${company.symbol}`);
                    const chart = (await response.json()).chart?.result?.[0];
                    const price = chart?.meta?.regularMarketPrice;
                    const previousClose = chart?.meta?.chartPreviousClose ?? chart?.meta?.previousClose;
                    if (!Number.isFinite(price)) throw new Error(`No market price for ${company.symbol}`);
                    const timestamp = chart?.meta?.regularMarketTime || chart?.timestamp?.at(-1) || Date.now() / 1000;
                    return {
                        symbol: company.symbol,
                        price,
                        direction: Number.isFinite(previousClose) && price < previousClose ? 'down' : 'up',
                        priceDate: new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'America/New_York' }).format(new Date(timestamp * 1000))
                    };
                }));
                localStorage.setItem(marketCacheKey, JSON.stringify({ updatedAt: Date.now(), quotes }));
                applyMarketQuotes(quotes);
            } catch (error) {
                console.info('Live market data is unavailable; keeping the most recent saved prices.', error);
            }
        }

        window.portfolioMarketData = companyMarketData;
        refreshWeeklyMarketData();

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
                    '<span class="tag">companies</span> Show notable company work and market status',
                    '<span class="tag">stocks</span> Show public/private company ticker data',
                    '<span class="tag">experience</span> Show employment history and dates',
                    '<span class="tag">news</span> Read company milestones from my employment periods',
                    '<span class="tag">xbox</span> Show my Xbox gamer tag and profile',
                    '<span class="tag">traveling</span> Show travel and globe status',
                    '<span class="tag">version</span> Show last updated and build information',
                    '<span class="tag">open &lt;site&gt;</span> Open links (linkedin, github, email, appstore, presence, seed, ghost, loop, xbox, news)',
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
                    'Try `experience`, `news`, `contact`, `products`, or `xbox` to explore.'
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
                    '  • Loop — a location-based safety app that provides alerts, safety tips, and community-driven updates.',
                    '  • Ghost Finance Terminal — a CLI-first financial terminal with market data, news, sentiment, insider trading, charts, and AI research.',
                    '  • Presence — a native personal life dashboard for iPhone and iPad, bringing work, fitness, travel, notes, and everyday tools together.',
                    '  • Seed — a calm, local-first startup intelligence app for founders and startup explorers.',
                    '  • More projects are coming soon. Stay tuned!'
                ]);
            },
            resume: () => printCareerHistory(true),
            experience: () => printCareerHistory(),
            news: () => printCareerNews(),
            xbox: () => {
                printLines([
                    'Xbox gamer tag: viraj325',
                    'Profile: https://www.xbox.com/play/user/viraj325',
                    'Use `open xbox` to visit my profile.'
                ]);
            },
            companies: () => {
                printCompanyData('Company highlights:');
            },
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
                    'Portfolio CLI v1.2.0',
                    'Last updated: November 15, 2026',
                    'Build: career history, curated company news, Xbox profile, and weekly market-data refresh',
                    'Products: Loop Safety, Ghost Finance Terminal, Presence, Seed',
                    'News: company-news/index.html (TradingView tiles for WFC, JPM, and Berkshire Hathaway parent BRK.B)'
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
                    fetch('assets/data/company-news.json').then(response => {
                        if (!response.ok) throw new Error(`HTTP ${response.status}`);
                        return response.json();
                    }),
                    import('./company-news.js')
                ]).then(([data, helpers]) => ({ data: helpers.validateData(data), helpers }))
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
                lines.push('Use `news` for company milestones or `open news` for the visual timeline.');
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
                lines.push('', 'Use `open news` for horizontal timelines and current TradingView stock tiles.', 'This is a curated history, updated by hand.');
                printLines(lines);
            } catch (error) {
                printLines(['Company news is unavailable. Please try again or use `open news`.']);
            }
        }

        function printCompanyData(title) {
            const lines = [title];

            (window.portfolioMarketData || companyMarketData).forEach((company) => {
                const marketLine = company.price
                    ? `${company.status} — ${company.ticker} — ${company.price} (${company.priceDate})`
                    : `${company.status} — ${company.ticker}`;

                lines.push(`  • ${company.name}: ${marketLine}`);
                lines.push(`    ${company.note}`);
            });

            lines.push('Prices refresh at most once every seven days and may show the latest cached close. Not investment advice.');
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
            terminalToggle.classList.add('active');
            if (!terminalBody.innerHTML.trim()) {
                const isMobile = window.innerWidth <= 640;
                const introMessage = isMobile ? [
                    '<span class="terminal-command">viraj@portfolio:~$ whoami</span>',
                    'Senior Software Engineer | Product Builder',
                    '',
                    '<span class="terminal-command">viraj@portfolio:~$ ls commands/</span>',
                    '<span class="tag">help</span> <span class="tag">experience</span> <span class="tag">news</span> <span class="tag">xbox</span>',
                    '',
                    '<span class="terminal-command">viraj@portfolio:~$ echo "Ready to explore?"</span>',
                    'Ready to explore.'
                ] : [
                    '<span class="terminal-command">viraj@portfolio:~$ whoami</span>',
                    'Senior Software Engineer | Product Builder | Tech Enthusiast',
                    '',
                    '<span class="terminal-command">viraj@portfolio:~$ ls commands/</span>',
                    '<span class="tag">products</span> <span class="tag">experience</span> <span class="tag">news</span> <span class="tag">xbox</span>',
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
            terminalToggle.classList.remove('active');
            terminalToggle.focus();
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

        terminalToggle.addEventListener('click', () => {
            if (terminalOverlay.classList.contains('hidden')) {
                openTerminal();
            } else {
                closeTerminal();
            }
        });

        const heroTerminalCTA = document.getElementById('heroTerminalCTA');
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
