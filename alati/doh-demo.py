# Javni demo DOH-a za /doh/index.html: demo datoteka ostaje ista, na kraj <body> umeće se alati/doh-raspored.js
# (raspored STR. 1-9 po širinama stupaca, visinama redova i području ispisa iz Excel obrasca; logiku i polja ne dira).
# Upotreba: python3 alati/doh-demo.py <nova demo datoteka.html> doh/index.html
import os, sys
src, out = sys.argv[1:3]
s = open(src, encoding='utf-8').read()
raspored = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'doh-raspored.js'), encoding='utf-8').read()
assert 'doh-raspored.js:' not in s, 'raspored je već umetnut'
i = s.rindex('</body>')
s = s[:i] + '<script>' + raspored + '</script>' + s[i:]
open(out, 'w', encoding='utf-8').write(s)
print('demo ok', len(s))
