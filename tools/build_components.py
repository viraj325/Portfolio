from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "index.html"
SECTIONS = ROOT / "components" / "sections"

print("Component files are stored in components/sections for readability.")
print("Current index.html remains source-of-truth to preserve runtime behavior.")
for file in sorted(SECTIONS.glob("*.html")):
    print(f"- {file.relative_to(ROOT)}")
