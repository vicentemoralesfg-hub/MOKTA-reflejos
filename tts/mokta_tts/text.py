"""Parseo de guiones, normalización de texto en español y segmentación prosódica.

Formato de guion (.md o .txt):

    # Título (opcional, se ignora)

    ## intro [tension]
    En 2019 nadie le prestó atención a este dato.
    [pausa 1.0]
    {sorpresa} ¿Casualidad? No.

    ## escena-02
    Texto de la escena dos...

- `## <id> [emocion]`   inicia una escena (archivo WAV propio). Emoción opcional.
- `{emocion}`           cambia la emoción desde ese punto dentro de la escena.
- `[pausa 0.8]`         silencio explícito en segundos (`[pausa]` = 0.8 s).
- Una línea en blanco   separa párrafos (pausa algo más larga).
- `// comentario`       se ignora.
Si no hay ningún `##`, cada párrafo se trata como una escena.
"""
from __future__ import annotations
import re
from dataclasses import dataclass, field

from num2words import num2words

EMOTIONS = ["neutral", "tension", "sorpresa", "enfasis"]
EMOTION_ALIASES = {
    "analitico": "neutral", "analítico": "neutral", "normal": "neutral", "serio": "neutral",
    "tensión": "tension", "suspenso": "tension", "misterio": "tension", "intriga": "tension",
    "asombro": "sorpresa", "revelacion": "sorpresa", "revelación": "sorpresa",
    "énfasis": "enfasis", "contundente": "enfasis", "firme": "enfasis", "cierre": "enfasis",
}

PAUSE_SENTENCE = 0.28
PAUSE_QUESTION = 0.38
PAUSE_ELLIPSIS = 0.55
PAUSE_PARAGRAPH = 0.70
PAUSE_DEFAULT_TAG = 0.80


def canon_emotion(e: str | None) -> str:
    if not e:
        return "neutral"
    e = e.strip().lower()
    e = EMOTION_ALIASES.get(e, e)
    if e not in EMOTIONS:
        raise ValueError(f"Emoción desconocida '{e}'. Válidas: {EMOTIONS} (o alias {list(EMOTION_ALIASES)})")
    return e


# ---------------------------------------------------------------- normalización
ABBREV = {
    r"\bEE\.\s?UU\.?": "Estados Unidos", r"\bEEUU\b": "Estados Unidos", r"\bvs\.?(?=\s)": "versus",
    r"\baprox\.": "aproximadamente", r"\bp\.\s?ej\.": "por ejemplo", r"\betc\.": "etcétera",
    r"\bDr\.": "doctor", r"\bDra\.": "doctora", r"\bSr\.": "señor", r"\bSra\.": "señora",
    r"\bkm/h\b": "kilómetros por hora", r"\bkm\b": "kilómetros", r"\bkg\b": "kilos",
    r"\bm²": "metros cuadrados", r"\bIA\b": "inteligencia artificial",
    r"\bnº\b|\bN\.º": "número", r"\bOK\b": "okey",
}
SCALE = {"mil": "mil", "millón": "millón", "millones": "millones"}


def _n2w(n: str) -> str:
    try:
        if "." in n:
            ent, dec = n.split(".")
            return f"{num2words(int(ent), lang='es')} coma {' '.join(num2words(int(d), lang='es') for d in dec) if dec.startswith('0') else num2words(int(dec), lang='es')}"
        return num2words(int(n), lang="es")
    except Exception:
        return n


def _clean_number(tok: str) -> str:
    """'1.200.000' / '1,200' -> '1200000'; '3,5' -> '3.5'."""
    if re.fullmatch(r"\d{1,3}([.,]\d{3})+", tok):
        return re.sub(r"[.,]", "", tok)
    if re.fullmatch(r"\d+[.,]\d+", tok):
        return tok.replace(",", ".")
    return tok


NUM = r"\d+(?:[.,]\d+)*"

FEM_EXCEPT = {w + s for w in ["día", "dia", "mapa", "problema", "sistema", "tema", "programa", "planeta", "idioma", "clima",
              "dálmata", "esquema", "dilema", "poema", "drama", "fantasma", "pijama", "virus", "diploma", "lema"] for s in ("", "s")}


def _num_with_noun(m) -> str:
    num, sp, word = m.group(1), m.group(2), m.group(3)
    w = _n2w(_clean_number(num))
    if word:
        lw = word.lower()
        fem = (lw.endswith("as") or lw.endswith("a")) and lw not in FEM_EXCEPT and len(lw) > 2 \
            and lw not in {"la", "las", "una", "para", "contra", "hasta", "sobra", "ya"}
        if fem:
            w = re.sub(r"ientos\b", "ientas", w)
            w = re.sub(r"\buno$", "una", w).replace("veintiuno", "veintiuna")
        elif lw not in {"y", "o", "de", "a", "en", "por", "mil", "millones", "millón"}:
            w = re.sub(r"uno$", lambda x: "ún" if w.endswith("veintiuno") else "un", w)
            w = w.replace("veintiún", "veintiún")
        return f"{w}{sp}{word}"
    return f"{w}{sp}"


def normalize(text: str) -> str:
    t = text
    t = re.sub(r"[\U0001F000-\U0001FAFF☀-➿]", "", t)          # emojis
    t = t.replace("...", "…").replace("—", ", ").replace("–", ", ")
    t = re.sub(r"[*_#`>]", "", t)                                         # restos de markdown
    for pat, rep in ABBREV.items():
        t = re.sub(pat, rep, t)
    # monedas
    t = re.sub(rf"(?:US\$|USD\s?)\s?({NUM})(\s?(?:mil millones|millones|millón|mil))?",
               lambda m: f"{_n2w(_clean_number(m.group(1)))}{m.group(2) or ''} de dólares"
               if m.group(2) else f"{_n2w(_clean_number(m.group(1)))} dólares", t)
    t = re.sub(rf"€\s?({NUM})", lambda m: f"{_n2w(_clean_number(m.group(1)))} euros", t)
    t = re.sub(rf"\$\s?({NUM})(\s?(?:mil millones|millones|millón|mil))?",
               lambda m: f"{_n2w(_clean_number(m.group(1)))}{m.group(2) or ''} de dólares"
               if m.group(2) else f"{_n2w(_clean_number(m.group(1)))} dólares", t)
    # porcentajes
    t = re.sub(rf"({NUM})\s?%", lambda m: f"{_n2w(_clean_number(m.group(1)))} por ciento", t)
    # siglos / ordinales simples
    t = re.sub(r"\b(\d{1,2})º(?=\s+\w)", lambda m: re.sub(r"(primero|tercero)$", lambda x: x.group(1)[:-1], num2words(int(m.group(1)), lang="es", to="ordinal")), t)
    t = re.sub(r"\b(\d{1,2})º", lambda m: num2words(int(m.group(1)), lang="es", to="ordinal"), t)
    t = re.sub(r"\b(\d{1,2})ª", lambda m: re.sub(r"o$", "a", num2words(int(m.group(1)), lang="es", to="ordinal")), t)
    # horas 14:30
    t = re.sub(r"\b(\d{1,2}):(\d{2})\b", lambda m: f"{_n2w(m.group(1))} {('y ' + _n2w(m.group(2))) if m.group(2) != '00' else 'en punto'}", t)
    # rangos 2010-2020
    t = re.sub(r"\b(\d{4})\s?[-–]\s?(\d{4})\b", lambda m: f"{_n2w(m.group(1))} a {_n2w(m.group(2))}", t)
    # resto de números (con concordancia de género/apócope según la palabra siguiente)
    t = re.sub(rf"({NUM})(\s*)([^\W\d_]+)?", _num_with_noun, t)
    t = re.sub(r"\s+([,.;:!?…])", r"\1", t)
    t = re.sub(r"\s{2,}", " ", t)
    return t.strip()


# ---------------------------------------------------------------- estructura
@dataclass
class Segment:
    """Unidad mínima: texto a sintetizar o pausa."""
    kind: str                 # "speech" | "pause"
    text: str = ""
    emotion: str = "neutral"
    pause_after: float = 0.0  # pausa natural tras el segmento (s)
    seconds: float = 0.0      # para kind == pause


@dataclass
class Scene:
    id: str
    emotion: str
    raw: str = ""
    segments: list[Segment] = field(default_factory=list)


def _slug(s: str) -> str:
    s = re.sub(r"[^\w\-]+", "-", s.strip().lower(), flags=re.UNICODE)
    return re.sub(r"-{2,}", "-", s).strip("-") or "escena"


def _end_pause(sentence: str) -> float:
    s = sentence.rstrip()
    if s.endswith("…"):
        return PAUSE_ELLIPSIS
    if s.endswith(("?", "!")):
        return PAUSE_QUESTION
    return PAUSE_SENTENCE


SENT_SPLIT = re.compile(r"(?<=[.!?…])[\"”»)]?\s+(?=[¿¡\"“«(A-ZÁÉÍÓÚÑ0-9])")


def split_sentences(par: str) -> list[str]:
    return [s.strip() for s in SENT_SPLIT.split(par) if s.strip()]


def chunk_sentences(sents: list[str], max_chars: int) -> list[str]:
    """Agrupa oraciones en bloques <= max_chars para conservar prosodia continua
    sin pasar del rango donde el modelo es más estable (~15-20 s)."""
    chunks, cur = [], ""
    for s in sents:
        if len(s) > max_chars:  # oración muy larga: cortar por comas/;:
            parts = re.split(r"(?<=[,;:])\s+", s)
            for p in parts:
                if cur and len(cur) + len(p) + 1 > max_chars:
                    chunks.append(cur); cur = p
                else:
                    cur = f"{cur} {p}".strip()
            continue
        if cur and len(cur) + len(s) + 1 > max_chars:
            chunks.append(cur); cur = s
        else:
            cur = f"{cur} {s}".strip()
    if cur:
        chunks.append(cur)
    return chunks


TAG_RE = re.compile(r"(\[pausa(?:\s+[\d.,]+)?\s*s?\]|\{[^}]+\})", re.I)


def parse_script(src: str, max_chars: int = 240) -> list[Scene]:
    lines = [l for l in src.splitlines() if not l.strip().startswith("//")]
    has_headers = any(l.startswith("## ") for l in lines)
    blocks: list[tuple[str, str | None, list[str]]] = []
    if has_headers:
        cur = None
        for l in lines:
            if l.startswith("## "):
                h = l[3:].strip()
                m = re.match(r"(.*?)\s*\[([^\]]+)\]\s*$", h)
                name, emo = (m.group(1), m.group(2)) if m else (h, None)
                cur = (name, emo, []); blocks.append(cur)
            elif l.startswith("# ") or cur is None:
                continue
            else:
                cur[2].append(l)
    else:
        text = "\n".join(l for l in lines if not l.startswith("# "))
        for i, p in enumerate(re.split(r"\n\s*\n", text)):
            if p.strip():
                blocks.append((f"escena-{i + 1:02d}", None, p.splitlines()))

    scenes, used = [], set()
    for idx, (name, emo, body) in enumerate(blocks, 1):
        sid = _slug(name)
        if not re.match(r"^\d", sid):
            sid = f"{idx:02d}-{sid}"
        while sid in used:
            sid += "-b"
        used.add(sid)
        scene_emo = canon_emotion(emo)
        sc = Scene(id=sid, emotion=scene_emo, raw="\n".join(body).strip())
        emotion = scene_emo
        paragraphs = re.split(r"\n\s*\n", "\n".join(body))
        for pi, par in enumerate(paragraphs):
            par = " ".join(x.strip() for x in par.splitlines() if x.strip())
            if not par:
                continue
            # recorrer etiquetas en orden
            pending = ""
            pieces = TAG_RE.split(par)

            def flush():
                nonlocal pending
                txt = pending.strip()
                pending = ""
                if not txt:
                    return
                for ch in chunk_sentences(split_sentences(normalize(txt)), max_chars):
                    sc.segments.append(Segment("speech", ch, emotion, _end_pause(ch)))

            for piece in pieces:
                if not piece:
                    continue
                if TAG_RE.fullmatch(piece):
                    flush()
                    if piece.lower().startswith("[pausa"):
                        num = re.search(r"[\d.,]+", piece)
                        secs = float(num.group(0).replace(",", ".")) if num else PAUSE_DEFAULT_TAG
                        sc.segments.append(Segment("pause", seconds=secs))
                    else:
                        emotion = canon_emotion(piece[1:-1])
                else:
                    pending += piece
            flush()
            # pausa de párrafo
            if pi < len(paragraphs) - 1 and sc.segments and sc.segments[-1].kind == "speech":
                sc.segments[-1].pause_after = max(sc.segments[-1].pause_after, PAUSE_PARAGRAPH)
        if any(s.kind == "speech" for s in sc.segments):
            scenes.append(sc)
    return scenes
