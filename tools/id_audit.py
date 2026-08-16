#!/usr/bin/env python3
"""Cross-check DOM id references in main-js.js / mobile-ux.js against ids present in index.html (static + dynamically created)."""
import re, sys, pathlib

root = pathlib.Path('/home/tetsuya/development/fudoki')
html = (root / 'index.html').read_text()
js_main = (root / 'static/main-js.js').read_text()
js_ux = (root / 'static/js/mobile-ux.js').read_text()
js_ui = (root / 'static/js/ui-utils.js').read_text()

# ids in static html
html_ids = set(re.findall(r'id="([^"]+)"', html))

# ids created dynamically in JS (innerHTML/createElement templates)
dyn_ids = set()
for js in (js_main, js_ux, js_ui):
    dyn_ids |= set(re.findall(r'id=\\?"([^"\\$]+)\\?"', js))

print("HTML ids:", len(html_ids), "| dynamic ids in JS strings:", len(dyn_ids))

# referenced ids
for name, js in [('main-js.js', js_main), ('mobile-ux.js', js_ux)]:
    refs = re.findall(r"\$\('([^']+)'\)", js)
    refs += re.findall(r"getElementById\('([^']+)'\)", js)
    refs += re.findall(r'querySelector\("#([A-Za-z][\w-]*)"\)', js)
    missing = sorted({r for r in refs if r not in html_ids and r not in dyn_ids})
    print(f"\n[{name}] referenced but NOT in html nor dynamic: {len(missing)}")
    for m in missing:
        # find line numbers
        lines = [i+1 for i, line in enumerate(js.splitlines()) if f"$('{m}')" in line or f"getElementById('{m}')" in line or f'#{m}' in line]
        print(f"  {m}  -> lines {lines[:6]}")
