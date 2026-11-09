"""
IDENTIDADE VISUAL DA ALTO CODE: gera todas as versões da logo a partir de uma única geometria.

    python3 scripts/marca.py        (precisa de fontTools: pip install fonttools brotli)

Símbolo (redesenhado sobre a referência de fundo azul-marinho, com geometria exata):
- "A" branco: duas faixas paralelas com inclinação 0,461 (dx/dy), topo reto com cantos
  arredondados e vértice interno em ponta;
- barra central verde-água: paralelogramo com a mesma inclinação das pernas do A,
  colado ao lado direito e afastado da perna esquerda;
- sinais de código "<" e ">" verde-água: braços a 45°, topo reto e o braço de baixo
  cortado em paralelo à perna do A, sempre com o mesmo afastamento.

O texto "Alto Code" e o slogan são convertidos em contornos a partir das fontes da marca
(Space Grotesk 650 e DM Sans 600, em public/fonts), então os SVGs não dependem de
fonte instalada. Saída em marca/svg/ (kit da marca, fora do site publicado), o favicon em
public/favicon.svg e os caminhos do símbolo em src/components/ui/logo-paths.ts.
Os PNGs são gerados por scripts/marca-png.mjs (navegador do Playwright).
"""
from __future__ import annotations

import math
from pathlib import Path

from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'marca' / 'svg'

# Cores da marca (as mesmas do site: src/styles/index.css)
NIGHT = '#060e1d'   # fundo escuro
INK = '#0d1a30'     # marinho
WHITE = '#ffffff'
TIDE = '#22c3b0'    # verde-água sobre escuro (8,7:1 sobre a Noite)
TIDE_LOGO_LIGHT = '#0e9888'  # verde-água da logo sobre claro (3,6:1 sobre branco: forma gráfica, mínimo 3:1)

THEMES = {
    # nome: (cor do A e de "Alto", cor dos detalhes e de "Code", cor do slogan)
    'escuro': (WHITE, TIDE, '#e2e8f1'),
    'claro': (INK, TIDE_LOGO_LIGHT, '#33425c'),
    'mono-branco': (WHITE, WHITE, WHITE),
    'mono-preto': (INK, INK, INK),
}


# ---------------------------------------------------------------- geometria
def rounded(points: list[tuple[float, float, float]]) -> str:
    """Polígono fechado com cantos arredondados (r = distância do canto ao longo das arestas)."""
    n = len(points)
    out = []
    for i, (x, y, r) in enumerate(points):
        px, py, _ = points[i - 1]
        nx, ny, _ = points[(i + 1) % n]
        if r <= 0:
            out.append(('L', (x, y)))
            continue
        d1 = math.hypot(px - x, py - y)
        d2 = math.hypot(nx - x, ny - y)
        a = (x + (px - x) * r / d1, y + (py - y) * r / d1)
        b = (x + (nx - x) * r / d2, y + (ny - y) * r / d2)
        out.append(('L', a))
        out.append(('Q', (x, y), b))
    f = lambda v: f'{v:.2f}'.rstrip('0').rstrip('.')
    d = ''
    for j, seg in enumerate(out):
        if seg[0] == 'L':
            d += ('M' if j == 0 else 'L') + f(seg[1][0]) + ' ' + f(seg[1][1])
        else:
            d += 'Q' + f(seg[1][0]) + ' ' + f(seg[1][1]) + ' ' + f(seg[2][0]) + ' ' + f(seg[2][1])
    return d + 'Z'


SLOPE = 0.461           # inclinação das pernas do A (dx por dy)
TOP_HALF = 12.7         # meia largura do topo do A
LEG = 22.4              # largura horizontal de cada perna
APEX_IN = 21.2          # altura do vértice interno
CHEV_TIP = -93.0        # ponta externa do "<"
CHEV_W = 15.3           # largura horizontal dos braços (10,8 na perpendicular)
CHEV_TOP = 14.0         # topo reto dos braços de cima
CHEV_MID = 53.5         # altura das pontas
CHEV_GAP = 9.5          # afastamento entre o corte do braço de baixo e a perna do A


def symbol_paths(ox: float, oy: float, s: float = 1.0, bold: float = 0.0, chev: dict | None = None) -> tuple[list[str], list[str]]:
    """Caminhos do símbolo: (partes claras do A, partes verde-água). Origem no topo central do A.
    `bold` engrossa as formas e `chev` aproxima e encurta os sinais de código: só no favicon,
    para o desenho continuar legível em 16 px."""
    c = {'tip': CHEV_TIP, 'top': CHEV_TOP, 'mid': CHEV_MID, 'w': CHEV_W, 'gap': CHEV_GAP, **(chev or {})}
    T = lambda x, y, r=0: (ox + x * s, oy + y * s, r * s)
    outer_b = TOP_HALF + SLOPE * 100
    leg = LEG + bold
    a = rounded([
        T(-TOP_HALF - bold / 2, 0, 4), T(TOP_HALF + bold / 2, 0, 4),
        T(outer_b + bold / 2, 100, 2), T(outer_b + bold / 2 - leg, 100, 2.5),
        T(0, APEX_IN + bold * 1.4, 0),
        T(-(outer_b + bold / 2 - leg), 100, 2.5), T(-outer_b - bold / 2, 100, 2),
    ])
    # barra central: mesma inclinação das pernas, 2 unidades de folga da perna direita
    inner = lambda y: SLOPE * (y - APEX_IN - bold * 1.4)
    top, bot = 65.0 - bold * 0.6, 82.3 + bold * 0.4
    right_top = inner(top) - 2.0
    left_top = -inner(top) + 8.2 - bold * 0.3
    bar = rounded([
        T(left_top, top, 2), T(right_top, top, 2),
        T(right_top - SLOPE * (bot - top), bot, 2), T(left_top - SLOPE * (bot - top), bot, 2),
    ])
    # sinais de código
    w = c['w'] + bold * 1.2
    tip = c['tip'] + bold * 0.6
    ctop, cmid = c['top'], c['mid']
    cut = lambda y: -(TOP_HALF + bold / 2) - SLOPE * y - c['gap']  # corte paralelo à perna esquerda
    # braço de baixo: borda externa x = tip + (y - mid); interna x = tip + w + (y - mid)
    y_out = (cut(0) - tip + cmid) / (1 + SLOPE)
    y_in = (cut(0) - (tip + w) + cmid) / (1 + SLOPE)
    left = [
        (tip + (cmid - ctop), ctop, 3), (tip + w + (cmid - ctop), ctop, 2),
        (tip + w, cmid, 0),
        (tip + w + (y_in - cmid), y_in, 1.5), (tip + (y_out - cmid), y_out, 1.5),
        (tip, cmid, 6),
    ]
    chev_l = rounded([T(x, y, r) for x, y, r in left])
    chev_r = rounded([T(-x, y, r) for x, y, r in reversed(left)])
    return [a], [bar, chev_l, chev_r]


# Caixa do símbolo, em unidades da geometria (origem no topo central do A)
SYM_X0, SYM_X1, SYM_Y0, SYM_Y1 = -94.0, 94.0, 0.0, 100.0


# ---------------------------------------------------------------- texto em contornos
_fonts: dict[tuple[str, int], TTFont] = {}


def font(name: str, wght: int) -> TTFont:
    key = (name, wght)
    if key not in _fonts:
        f = TTFont(ROOT / 'public' / 'fonts' / name)
        _fonts[key] = instancer.instantiateVariableFont(f, {'wght': wght})
    return _fonts[key]


def text_path(text: str, fname: str, wght: int, size: float, x: float, baseline: float, track: float = 0.0) -> tuple[str, float]:
    """Contorno do texto (sem depender de fonte instalada) e a largura final.
    `track` é o espaçamento extra entre letras, em em."""
    f = font(fname, wght)
    gs = f.getGlyphSet()
    cmap = f.getBestCmap()
    scale = size / f['head'].unitsPerEm
    pen = SVGPathPen(gs, ntos=lambda v: f'{v:.2f}'.rstrip('0').rstrip('.'))
    cx = x
    for i, ch in enumerate(text):
        g = cmap[ord(ch)]
        tp = TransformPen(pen, (scale, 0, 0, -scale, cx, baseline))
        gs[g].draw(tp)
        cx += gs[g].width * scale + (track * size if i < len(text) - 1 else 0)
    return pen.getCommands(), cx - x


def text_width(text: str, fname: str, wght: int, size: float, track: float = 0.0) -> float:
    return text_path(text, fname, wght, size, 0, 0, track)[1]


def cap_height(fname: str, wght: int, size: float) -> float:
    f = font(fname, wght)
    return f['OS/2'].sCapHeight * size / f['head'].unitsPerEm


TITLE = 'space-grotesk-latin-wght-v1.woff2'
TEXT = 'dm-sans-latin-wght-v1.woff2'
WORD_TRACK = -0.02
WORD_WEIGHT = 650  # mesmo peso no cabeçalho do site (Logo.tsx)


def svg(w: float, h: float, body: str, title: str, bg: str | None = None) -> str:
    f = lambda v: f'{v:.1f}'.rstrip('0').rstrip('.')
    rect = f'<rect width="{f(w)}" height="{f(h)}" fill="{bg}"/>' if bg else ''
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {f(w)} {f(h)}" role="img" aria-label="{title}">'
            f'<title>{title}</title>{rect}{body}</svg>\n')


def group(paths: list[str], fill: str) -> str:
    return f'<path fill="{fill}" d="{"".join(paths)}"/>'


def symbol_svg(theme: str) -> str:
    fg, accent, _ = THEMES[theme]
    pad = 2
    s = 1.0
    ox, oy = -SYM_X0 + pad, pad
    a, t = symbol_paths(ox, oy, s)
    w, h = (SYM_X1 - SYM_X0) + pad * 2, (SYM_Y1 - SYM_Y0) + pad * 2
    return svg(w, h, group(a, fg) + group(t, accent), 'Alto Code')


def wordmark(x: float, baseline: float, size: float, fg: str, accent: str) -> tuple[str, float]:
    alto, w1 = text_path('Alto', TITLE, WORD_WEIGHT, size, x, baseline, WORD_TRACK)
    space = size * 0.24
    code, w2 = text_path('Code', TITLE, WORD_WEIGHT, size, x + w1 + space, baseline, WORD_TRACK)
    return group([alto], fg) + group([code], accent), w1 + space + w2


def slogan(text: str, cx: float, baseline: float, size: float, fg: str, accent: str, rule: float) -> str:
    track = 0.32
    w = text_width(text, TEXT, 600, size, track)
    x = cx - w / 2
    p, _ = text_path(text, TEXT, 600, size, x, baseline, track)
    mid = baseline - cap_height(TEXT, 600, size) / 2
    gap = size * 1.1
    th = max(size * 0.16, 1.2)
    r1 = f'<rect x="{x - gap - rule:.2f}" y="{mid - th / 2:.2f}" width="{rule:.2f}" height="{th:.2f}" rx="{th / 2:.2f}" fill="{accent}"/>'
    r2 = f'<rect x="{x + w + gap:.2f}" y="{mid - th / 2:.2f}" width="{rule:.2f}" height="{th:.2f}" rx="{th / 2:.2f}" fill="{accent}"/>'
    return group([p], fg) + r1 + r2


SLOGAN = {'pt': 'DESENVOLVIMENTO DIGITAL', 'en': 'DIGITAL DEVELOPMENT'}


def horizontal_svg(theme: str, with_slogan: bool = False, lang: str = 'pt') -> str:
    """Símbolo à esquerda e "Alto Code" à direita. O símbolo tem a altura de 1,5 x a altura das maiúsculas."""
    fg, accent, muted = THEMES[theme]
    size = 100.0
    cap = cap_height(TITLE, WORD_WEIGHT, size)
    s = cap * 1.5 / 100
    pad = 4
    sym_w = (SYM_X1 - SYM_X0) * s
    sym_h = 100 * s
    top = pad
    a, t = symbol_paths(pad - SYM_X0 * s, top, s)
    gap = size * 0.34
    baseline = top + sym_h / 2 + cap / 2
    if with_slogan:
        baseline = top + sym_h / 2 + cap / 2 - size * 0.12
    words, ww = wordmark(pad + sym_w + gap, baseline, size, fg, accent)
    w = pad + sym_w + gap + ww + pad
    h = top + sym_h + pad
    body = group(a, fg) + group(t, accent) + words
    if with_slogan:
        ssize = size * 0.2
        text = SLOGAN[lang]
        tw = text_width(text, TEXT, 600, ssize, 0.32)
        # slogan alinhado à palavra, sem os traços (a palavra já ocupa a largura)
        sx = pad + sym_w + gap
        sp, _ = text_path(text, TEXT, 600, ssize, sx + (ww - tw) / 2 if tw < ww else sx, baseline + size * 0.42, 0.32)
        body += group([sp], muted)
        w = max(w, sx + tw + pad)
        h = max(h, baseline + size * 0.42 + pad)
    return svg(w, h, body, 'Alto Code' + (f' · {SLOGAN[lang].title()}' if with_slogan else ''))


def lockup_paths() -> tuple[float, float, str, str]:
    """Logo horizontal para o site (cabeçalho e rodapé), sem margem: largura, altura,
    contornos na cor do texto (A e "Alto") e contornos verde-água (detalhes e "Code")."""
    size = 100.0
    cap = cap_height(TITLE, WORD_WEIGHT, size)
    s = cap * 1.5 / 100
    sym_w, sym_h = (SYM_X1 - SYM_X0) * s, 100 * s
    a, t = symbol_paths(-SYM_X0 * s, 0, s)
    gap = size * 0.34
    baseline = sym_h / 2 + cap / 2
    alto, w1 = text_path('Alto', TITLE, WORD_WEIGHT, size, sym_w + gap, baseline, WORD_TRACK)
    space = size * 0.24
    code, w2 = text_path('Code', TITLE, WORD_WEIGHT, size, sym_w + gap + w1 + space, baseline, WORD_TRACK)
    return sym_w + gap + w1 + space + w2, sym_h, ''.join(a) + alto, ''.join(t) + code


def vertical_svg(theme: str, lang: str = 'pt') -> str:
    """Símbolo no alto, "Alto Code" abaixo e o slogan entre dois traços (como na referência)."""
    fg, accent, muted = THEMES[theme]
    size = 100.0
    ww = wordmark(0, 0, size, fg, accent)[1]
    ssize = size * 0.205
    st = SLOGAN[lang]
    sw = text_width(st, TEXT, 600, ssize, 0.32)
    rule = size * 0.55
    full_slogan = sw + 2 * (ssize * 1.1 + rule)
    width = max(ww, full_slogan) + 16
    cx = width / 2
    s = ww * 0.62 / (SYM_X1 - SYM_X0)
    top = 8
    a, t = symbol_paths(cx, top, s)
    sym_h = 100 * s
    cap = cap_height(TITLE, WORD_WEIGHT, size)
    baseline = top + sym_h + size * 0.34 + cap
    words, _ = wordmark(cx - ww / 2, baseline, size, fg, accent)
    sb = baseline + size * 0.52
    body = group(a, fg) + group(t, accent) + words + slogan(st, cx, sb, ssize, muted, accent, rule)
    return svg(width, sb + 10, body, f'Alto Code · {st.title()}')


def favicon_svg() -> str:
    """Favicon: símbolo engrossado sobre um quadrado arredondado azul-noite.
    Em 32 e 48 px aparece o símbolo completo. Abaixo de 24 px (aba do navegador em 16 px), uma
    regra de mídia dentro do próprio SVG troca para o A com a barra, maiores e sem os sinais de
    código, que nesse tamanho virariam borrões. Navegadores que ignoram a regra mostram o completo."""
    size = 64
    s = 0.315
    a, t = symbol_paths(size / 2, (size - 100 * s) / 2, s, bold=5.0)
    s2 = 0.44
    a2, t2 = symbol_paths(size / 2, (size - 100 * s2) / 2, s2, bold=9.0)
    style = ('<style>.p{display:none}@media (max-width:24px){.c{display:none}.p{display:inline}}</style>')
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {size} {size}">{style}'
            f'<rect width="{size}" height="{size}" rx="14" fill="{NIGHT}"/>'
            f'<g class="c">{group(a, WHITE)}{group(t, TIDE)}</g>'
            f'<g class="p">{group(a2, WHITE)}{group(t2[:1], TIDE)}</g></svg>\n')


def app_icon_svg(size: int = 512) -> str:
    """Ícone quadrado (apple-touch-icon, perfis): símbolo centralizado com respiro, sem cantos (o sistema arredonda)."""
    s = size * 0.62 / (SYM_X1 - SYM_X0)
    sym_h = 100 * s
    a, t = symbol_paths(size / 2, (size - sym_h) / 2, s, bold=1.5)
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {size} {size}">'
            f'<rect width="{size}" height="{size}" fill="{NIGHT}"/>' + group(a, WHITE) + group(t, TIDE) + '</svg>\n')


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    files = {}
    for theme in THEMES:
        files[f'alto-code-simbolo-{theme}.svg'] = symbol_svg(theme)
        files[f'alto-code-horizontal-{theme}.svg'] = horizontal_svg(theme)
        files[f'alto-code-horizontal-slogan-{theme}.svg'] = horizontal_svg(theme, True, 'pt')
        files[f'alto-code-horizontal-slogan-{theme}-en.svg'] = horizontal_svg(theme, True, 'en')
        files[f'alto-code-vertical-{theme}.svg'] = vertical_svg(theme, 'pt')
        files[f'alto-code-vertical-{theme}-en.svg'] = vertical_svg(theme, 'en')
    files['alto-code-icone.svg'] = app_icon_svg()
    for name, content in files.items():
        (OUT / name).write_text(content)
    (ROOT / 'public' / 'favicon.svg').write_text(favicon_svg())
    # Caminhos do símbolo para o componente React (src/components/ui/logo-paths.ts)
    a, t = symbol_paths(-SYM_X0, 0, 1.0)
    fa, ft = symbol_paths(32, 17.0, 0.305, bold=5.0)
    lw, lh, lfg, lacc = lockup_paths()
    ts = (
        '// Gerado por scripts/marca.py: não edite à mão.\n'
        '// Símbolo da Alto Code: o A (cor do texto) e as partes verde-água.\n'
        f"export const SYMBOL_VIEWBOX = '0 0 {SYM_X1 - SYM_X0:g} {SYM_Y1 - SYM_Y0:g}';\n"
        f"export const SYMBOL_A = '{''.join(a)}';\n"
        f"export const SYMBOL_ACCENT = '{''.join(t)}';\n"
        '// Logo horizontal (símbolo + "Alto Code" em Space Grotesk 650, em contornos).\n'
        f"export const LOCKUP_VIEWBOX = '0 0 {lw:.1f} {lh:.1f}';\n"
        f"export const LOCKUP_FG = '{lfg}';\n"
        f"export const LOCKUP_ACCENT = '{lacc}';\n"
    )
    (ROOT / 'src' / 'components' / 'ui' / 'logo-paths.ts').write_text(ts)
    print(f'{len(files)} arquivos em marca/svg, favicon.svg e logo-paths.ts')


if __name__ == '__main__':
    main()
