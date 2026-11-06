import re,sys
oldp,newp,outp=sys.argv[1:4]
old=open(oldp,encoding='utf-8').read()
new=open(newp,encoding='utf-8').read()
def rep(a,b):
    global new
    assert new.count(a)==1,(a[:80],new.count(a)); new=new.replace(a,b)
rep(re.search(r'<title>.*?</title>',new).group(0),'<title>Završni račun i GFI-POD obrazac za knjigovođe | RetroAppLab</title>')
rep(re.search(r'<meta name="description" content="[^"]*">',new).group(0),re.search(r'<meta name="description" content="[^"]*">',old).group(0))
assert new.count('<link rel="canonical" href="https://retroapplab.com/zavrsni/">')==1
rep("  if (g('C29')) document.title = g('C29') + ' – Završni račun ' + year;",
    "  document.title = (g('C29') ? g('C29') + ' – ' : '') + 'Završni račun ' + year + ' — GFI-POD obrazac | RetroAppLab';")
i=old.index('/* Opis aplikacije za posjetitelje i tražilice'); j=old.index('#gate{position:fixed;inset:0;z-index:100;')
rep('#gate{position:fixed;inset:0;z-index:100;',old[i:j]+'#gate{position:fixed;inset:0;z-index:100;')
i=old.index('<section id="o-aplikaciji"'); j=old.index('</section>',i)+len('</section>\n')
rep('<main id="main"></main>\n','<main id="main"></main>\n\n'+old[i:j])
rep("function renderLicence() {\n  const el = document.getElementById('hLic'); if (!el) return;",
    "function renderLicence() {\n  document.body.classList.toggle('zr-licenced', !!LIC.ok);\n  const el = document.getElementById('hLic'); if (!el) return;")
rep("function showGate(kind, msg) {\n  let g = document.getElementById('gate');","function showGate(kind, msg) {\n  aboutHome();\n  let g = document.getElementById('gate');")
rep("  g.replaceChildren(card);\n}\nfunction hideGate() { const g = document.getElementById('gate'); if (g) g.hidden = true; renderLicence(); }",
    """  g.replaceChildren(card);
  if (kind !== 'loading' && !LIC.ok && aboutEl()) g.append(aboutEl());
}
function aboutEl() { return aboutEl.n || (aboutEl.n = document.getElementById('o-aplikaciji')); }
function aboutHome() { const a = aboutEl(), m = document.getElementById('main'); if (a && m && a.previousElementSibling !== m) m.after(a); }
function hideGate() { const g = document.getElementById('gate'); if (g) g.hidden = true; aboutHome(); renderLicence(); }""")
rep("""      h('p', { class: 'note', style: 'border:none;padding:8px 0 0;text-align:center' }, 'Licenca vrijedi za jedno računalo. Podaci iz bilanci ostaju na Vašem računalu.'));""",
"""      h('p', { class: 'note', style: 'border:none;padding:8px 0 0;text-align:center' }, 'Licenca vrijedi za jedno računalo. Podaci iz bilanci ostaju na Vašem računalu.'),
      h('a', { href: 'upute.html', style: 'align-self:center;font-size:12px;color:var(--muted)' }, 'Upute za aplikaciju'));""")
open(outp,'w',encoding='utf-8').write(new); print('ok')
