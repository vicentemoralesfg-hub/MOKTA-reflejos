"""Motor de maquetación del Manual Mokta (reportlab)."""
import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer,
                                PageBreak, Table, TableStyle, KeepTogether, NextPageTemplate,
                                CondPageBreak, Flowable)
from reportlab.platypus.tableofcontents import TableOfContents

HERE = os.path.dirname(os.path.abspath(__file__))
FD = "/usr/share/fonts/truetype/crosextra/"
pdfmetrics.registerFont(TTFont("C", FD + "Carlito-Regular.ttf"))
pdfmetrics.registerFont(TTFont("CB", FD + "Carlito-Bold.ttf"))
pdfmetrics.registerFont(TTFont("CI", FD + "Carlito-Italic.ttf"))
pdfmetrics.registerFont(TTFont("CBI", FD + "Carlito-BoldItalic.ttf"))
from reportlab.pdfbase.pdfmetrics import registerFontFamily
registerFontFamily("C", normal="C", bold="CB", italic="CI", boldItalic="CBI")

RED = colors.HexColor("#E10600")
INK = colors.HexColor("#111111")
GREY = colors.HexColor("#5A5A5A")
LIGHT = colors.HexColor("#F3F3F3")
LINE = colors.HexColor("#D9D9D9")
TINT = colors.HexColor("#FDECEC")

W, H = A4
ML, MR, MT, MB = 20 * mm, 20 * mm, 20 * mm, 24 * mm
CW = W - ML - MR

S = {}
S["body"] = ParagraphStyle("body", fontName="C", fontSize=10.5, leading=14.6, textColor=INK, spaceAfter=6)
S["small"] = ParagraphStyle("small", parent=S["body"], fontSize=9, leading=12, spaceAfter=0)
S["cell"] = ParagraphStyle("cell", parent=S["body"], fontSize=9.2, leading=11.8, spaceAfter=0)
S["cellh"] = ParagraphStyle("cellh", parent=S["cell"], fontName="CB", textColor=colors.white)
S["bullet"] = ParagraphStyle("bullet", parent=S["body"], leftIndent=13, bulletIndent=2, spaceAfter=3)
S["h1"] = ParagraphStyle("h1", fontName="CB", fontSize=26, leading=30, textColor=INK, spaceAfter=4)
S["h1num"] = ParagraphStyle("h1num", fontName="CB", fontSize=13, leading=16, textColor=RED, spaceAfter=2)
S["h2"] = ParagraphStyle("h2", fontName="CB", fontSize=15, leading=19, textColor=INK, spaceBefore=12, spaceAfter=5)
S["h3"] = ParagraphStyle("h3", fontName="CB", fontSize=11.5, leading=15, textColor=RED, spaceBefore=8, spaceAfter=3)
S["lead"] = ParagraphStyle("lead", parent=S["body"], fontSize=12, leading=16.5, textColor=GREY, spaceAfter=10)
S["boxt"] = ParagraphStyle("boxt", fontName="CB", fontSize=9, leading=11, textColor=RED, spaceAfter=3)
S["boxb"] = ParagraphStyle("boxb", parent=S["body"], fontSize=10, leading=13.8, spaceAfter=2)
S["toc0"] = ParagraphStyle("toc0", fontName="CB", fontSize=10.5, leading=13.5, leftIndent=0, spaceBefore=4)
S["toc1"] = ParagraphStyle("toc1", fontName="C", fontSize=8.8, leading=10.6, leftIndent=16, textColor=GREY)
S["q"] = ParagraphStyle("q", parent=S["body"], fontName="CB", spaceAfter=2, spaceBefore=6)


class Doc(BaseDocTemplate):
    def __init__(self, fn, **kw):
        super().__init__(fn, pagesize=A4, leftMargin=ML, rightMargin=MR, topMargin=MT,
                         bottomMargin=MB, title="Manual del Vendedor Mokta Cars",
                         author="Mokta Cars", subject="Conceptos esenciales del automóvil para la venta", **kw)
        fr = Frame(ML, MB, CW, H - MT - MB, id="f", leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
        self.addPageTemplates([PageTemplate("cover", [fr], onPage=cover_page),
                               PageTemplate("normal", [fr], onPageEnd=normal_page)])
        self._sec = ""

    def beforeDocument(self):
        self._k = 0
        self._sec = ""

    def afterFlowable(self, f):
        if isinstance(f, Paragraph):
            st = f.style.name
            if st == "h1":
                txt = f.getPlainText()
                self._k += 1; key = "k%d" % self._k
                self.canv.bookmarkPage(key)
                self.canv.addOutlineEntry(txt, key, level=0, closed=True)
                self.notify("TOCEntry", (0, txt, self.page, key))
                self._sec = txt
            elif st == "h2":
                txt = f.getPlainText()
                self._k += 1; key = "k%d" % self._k
                self.canv.bookmarkPage(key)
                self.canv.addOutlineEntry(txt, key, level=1, closed=True)
                self.notify("TOCEntry", (1, txt, self.page, key))


LOGO = os.path.join(HERE, "logo.png")
LOGO_W = os.path.join(HERE, "logo_white.png")
LR = 856 / 190.0


def normal_page(c, doc):
    c.saveState()
    # logo abajo a la derecha
    lw = 34 * mm
    c.drawImage(LOGO, W - MR - lw, 8 * mm, lw, lw / LR, mask="auto")
    c.setFont("C", 8.5)
    c.setFillColor(GREY)
    c.drawString(ML, 11 * mm, "Manual del Vendedor  ·  %s" % doc._sec[:70] if doc._sec else "Manual del Vendedor")
    c.setFont("CB", 9)
    c.setFillColor(INK)
    c.drawString(ML, 15.5 * mm, str(doc.page))
    c.setStrokeColor(RED)
    c.setLineWidth(1.2)
    c.line(ML, 19.5 * mm, ML + 12 * mm, 19.5 * mm)
    c.restoreState()


def cover_page(c, doc):
    c.saveState()
    c.setFillColor(colors.HexColor("#0B0B0B"))
    c.rect(0, 0, W, H, stroke=0, fill=1)
    # franjas de velocidad
    c.setFillColor(RED)
    c.rect(0, H * 0.555, W * 0.62, 3.2, stroke=0, fill=1)
    c.setFillColor(colors.HexColor("#222222"))
    for i, (y, l) in enumerate([(0.30, 0.9), (0.285, 0.6), (0.27, 0.35)]):
        c.rect(W * (1 - l), H * y, W * l, 1.2, stroke=0, fill=1)
    c.setFillColor(colors.white)
    c.setFont("CB", 13)
    c.drawString(ML, H * 0.80, "MOKTA CARS  ·  FORMACIÓN COMERCIAL")
    c.setFont("CB", 46)
    c.drawString(ML, H * 0.68, "Manual del")
    c.drawString(ML, H * 0.68 - 50, "Vendedor")
    c.setFont("C", 16)
    c.setFillColor(colors.HexColor("#BBBBBB"))
    c.drawString(ML, H * 0.555 - 30, "Todo lo que necesitas saber para explicar")
    c.drawString(ML, H * 0.555 - 50, "cualquier auto, desde cero.")
    c.setFont("C", 10.5)
    c.setFillColor(colors.HexColor("#8A8A8A"))
    y = H * 0.40
    for t in ["Motor · Distribución · Transmisión · Tracción · Frenos · Suspensión",
              "Neumáticos · Seguridad y ADAS · Híbridos y eléctricos · Tecnología",
              "Mantención · Usados · Trámites · Financiamiento · Preguntas de clientes",
              "Glosario A–Z · Siglas · Conversión de unidades"]:
        c.drawString(ML, y, t)
        y -= 15
    c.setFont("C", 9)
    c.drawString(ML, 14 * mm, "Edición 2026  ·  Uso interno")
    lw = 70 * mm
    c.drawImage(LOGO_W, W - MR - lw, 12 * mm, lw, lw / LR, mask="auto")
    c.restoreState()


# ---------------------------------------------------------------- API de contenido
story = []


def chapter(num, title, lead=None):
    story.append(NextPageTemplate("normal"))
    # salto que no genera páginas en blanco si ya estamos al inicio de una página
    story.append(CondPageBreak(H - MT - MB - 30))
    story.append(Spacer(1, 6 * mm))
    story.append(Paragraph("CAPÍTULO %s" % num if num else "", S["h1num"]))
    story.append(Paragraph(title, S["h1"]))
    story.append(RedRule())
    if lead:
        story.append(Paragraph(lead, S["lead"]))


def h2(t):
    story.append(CondPageBreak(45 * mm))
    story.append(Paragraph(t, S["h2"]))


def h3(t):
    story.append(CondPageBreak(30 * mm))
    story.append(Paragraph(t, S["h3"]))


def p(*ts):
    for t in ts:
        story.append(Paragraph(t, S["body"]))


def bl(items):
    for it in items:
        story.append(Paragraph(it, S["bullet"], bulletText="•"))
    story.append(Spacer(1, 4))


def nl(items):
    for i, it in enumerate(items, 1):
        story.append(Paragraph(it, S["bullet"], bulletText="%d." % i))
    story.append(Spacer(1, 4))


def _box(label, text, bg, bar):
    inner = [Paragraph(label.upper(), S["boxt"])]
    if isinstance(text, (list, tuple)):
        for t in text:
            inner.append(Paragraph(t, S["boxb"]))
    else:
        inner.append(Paragraph(text, S["boxb"]))
    t = Table([[inner]], colWidths=[CW])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), bg),
        ("LINEBEFORE", (0, 0), (0, -1), 3, bar),
        ("LEFTPADDING", (0, 0), (-1, -1), 10), ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 7), ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
    ]))
    story.append(Spacer(1, 3))
    story.append(t)
    story.append(Spacer(1, 8))


def say(text):
    """Cómo explicarlo al cliente."""
    _box("Dilo así al cliente", text, LIGHT, RED)


def key(text):
    _box("Dato clave", text, TINT, RED)


def warn(text):
    _box("Ojo", text, colors.HexColor("#FFF6E0"), colors.HexColor("#E0A100"))


def table(head, rows, widths=None, zebra=True, pad=4):
    n = len(head)
    if widths is None:
        widths = [CW / n] * n
    else:
        tot = sum(widths)
        widths = [CW * w / tot for w in widths]
    data = [[Paragraph(h, S["cellh"]) for h in head]]
    for r in rows:
        data.append([Paragraph(str(x), S["cell"]) for x in r])
    t = Table(data, colWidths=widths, repeatRows=1)
    st = [
        ("BACKGROUND", (0, 0), (-1, 0), INK),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 5), ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ("TOPPADDING", (0, 0), (-1, -1), pad), ("BOTTOMPADDING", (0, 0), (-1, -1), pad),
        ("LINEBELOW", (0, 1), (-1, -1), 0.4, LINE),
        ("LINEBELOW", (0, 0), (-1, 0), 1.5, RED),
    ]
    if zebra:
        for i in range(1, len(data)):
            if i % 2 == 0:
                st.append(("BACKGROUND", (0, i), (-1, i), colors.HexColor("#F8F8F8")))
    t.setStyle(TableStyle(st))
    story.append(Spacer(1, 2))
    story.append(t)
    story.append(Spacer(1, 9))


def qa(q, a):
    blk = [Paragraph(q, S["q"])]
    if isinstance(a, (list, tuple)):
        blk += [Paragraph(x, S["body"]) for x in a]
    else:
        blk.append(Paragraph(a, S["body"]))
    story.append(KeepTogether(blk))


def gl(term, definition):
    story.append(Paragraph("<b>%s</b> — %s" % (term, definition),
                           ParagraphStyle("g", parent=S["body"], fontSize=10, leading=13.4, spaceAfter=3, leftIndent=0)))


def sp(h=6):
    story.append(Spacer(1, h))


def pb():
    story.append(PageBreak())


class RedRule(Flowable):
    def wrap(self, aw, ah):
        return aw, 10

    def draw(self):
        self.canv.setFillColor(RED)
        self.canv.rect(0, 5, 28 * mm, 2.4, stroke=0, fill=1)


class TireCode(Flowable):
    """Diagrama de lectura de la medida de un neumático."""
    parts = [("205", "Ancho (mm)"), ("/", ""), ("55", "Perfil (%)"), (" R", "Radial"),
             ("16", "Aro (pulg.)"), (" 91", "Índice carga"), ("V", "Índice vel.")]

    def wrap(self, aw, ah):
        self.aw = aw
        return aw, 34 * mm

    def draw(self):
        c = self.canv
        c.setFillColor(colors.HexColor("#1A1A1A"))
        c.roundRect(0, 10 * mm, self.aw, 22 * mm, 4, stroke=0, fill=1)
        c.setFont("CB", 30)
        x = 12 * mm
        xs = []
        for txt, lab in self.parts:
            w = pdfmetrics.stringWidth(txt, "CB", 30)
            c.setFillColor(colors.white)
            c.drawString(x, 17 * mm, txt)
            xs.append((x + w / 2, lab))
            x += w + 16
        c.setFont("CB", 8.5)
        j = 0
        for cx, lab in xs:
            if lab:
                low = j % 2 == 1
                j += 1
                c.setFillColor(RED)
                c.rect(cx - 0.4, (4.5 if low else 8) * mm, 0.8, (10.5 if low else 7) * mm, stroke=0, fill=1)
                c.setFillColor(INK)
                c.drawCentredString(cx, (1 if low else 4.5) * mm, lab)


class Cycle(Flowable):
    """Ciclo de 4 tiempos en 4 bloques."""
    def wrap(self, aw, ah):
        self.aw = aw
        return aw, 30 * mm

    def draw(self):
        c = self.canv
        steps = [("1. ADMISIÓN", "Baja el pistón,", "entra aire (+ comb.)"),
                 ("2. COMPRESIÓN", "Sube el pistón,", "comprime la mezcla"),
                 ("3. EXPLOSIÓN", "Chispa o presión:", "empuja el pistón"),
                 ("4. ESCAPE", "Sube el pistón,", "expulsa los gases")]
        gap = 4 * mm
        bw = (self.aw - 3 * gap) / 4
        for i, (t, a, b) in enumerate(steps):
            x = i * (bw + gap)
            c.setFillColor(RED if i == 2 else colors.HexColor("#1A1A1A"))
            c.roundRect(x, 4 * mm, bw, 24 * mm, 3, stroke=0, fill=1)
            c.setFillColor(colors.white)
            c.setFont("CB", 10.5)
            c.drawCentredString(x + bw / 2, 20 * mm, t)
            c.setFont("C", 9)
            c.drawCentredString(x + bw / 2, 14 * mm, a)
            c.drawCentredString(x + bw / 2, 10 * mm, b)
            if i < 3:
                c.setFillColor(GREY)
                c.setFont("CB", 12)
                c.drawCentredString(x + bw + gap / 2, 14.5 * mm, "›")


def toc_block():
    story.append(NextPageTemplate("normal"))
    story.append(PageBreak())
    story.append(Spacer(1, 6 * mm))
    story.append(Paragraph("Contenido", ParagraphStyle("tt", parent=S["h1"])))
    story.append(RedRule())
    toc = TableOfContents()
    toc.levelStyles = [S["toc0"], S["toc1"]]
    toc.dotsMinLevel = 0
    story.append(toc)


def build(fn):
    doc = Doc(fn)
    doc.multiBuild(story)
