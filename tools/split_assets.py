from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "index.html"
ASSETS = ROOT / "assets"
ASSETS.mkdir(exist_ok=True)

html = INDEX.read_text()
style = re.search(r"<style>\n([\s\S]*?)\n\s*</style>", html)
script = re.search(r"<script>\n([\s\S]*?)\n\s*</script>", html)

if not style or not script:
    raise SystemExit("Expected inline <style> and <script> blocks in index.html")

(ASSETS / "styles" / "main.css").parent.mkdir(parents=True, exist_ok=True)
(ASSETS / "styles" / "main.css").write_text(style.group(1).strip() + "\n")
(ASSETS / "js" / "main.js").parent.mkdir(parents=True, exist_ok=True)
(ASSETS / "js" / "main.js").write_text(script.group(1).strip() + "\n")

html = html.replace(style.group(0), '    <link rel="stylesheet" href="assets/styles/main.css">')
html = html.replace(script.group(0), '    <script src="assets/js/main.js"></script>')
INDEX.write_text(html)
print("Split inline assets into assets/styles.css and assets/app.js")
