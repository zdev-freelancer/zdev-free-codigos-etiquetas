"""Render GUIA-TENANTS.md to a styled PDF using fpdf2 (pure-Python).

Body text in Arial, code/diagrams in Consolas (has box-drawing glyphs).
"""
import re
import sys
from pathlib import Path

from fpdf import FPDF
from fpdf.enums import XPos, YPos
from fpdf.fonts import FontFace

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "supabase" / "indepcommerce" / "GUIA-TENANTS.md"
OUT = ROOT / "supabase" / "indepcommerce" / "GUIA-TENANTS.pdf"
FONTS = Path("C:/Windows/Fonts")

INK = (17, 17, 17)
MUTED = (90, 96, 105)
ACCENT = (27, 159, 224)       # brand cyan
ACCENT2 = (42, 42, 140)       # brand indigo
RULE = (210, 210, 215)
CODE_BG = (245, 246, 248)
TABLE_HEAD_BG = (234, 240, 248)


def strip_links(s: str) -> str:
    return re.sub(r"\[([^\]]+)\]\([^)]*\)", r"\1", s)


def inline_md(s: str) -> str:
    """Keep **bold** for fpdf markdown; drop link syntax, backticks, normalize arrows."""
    s = strip_links(s)
    s = s.replace("`", "")
    s = s.replace("→", "->").replace("↔", "<->")
    return s


def plain(s: str) -> str:
    return inline_md(s).replace("**", "")


class PDF(FPDF):
    def header(self):
        pass

    def footer(self):
        self.set_y(-12)
        self.set_font("Arial", "", 8)
        self.set_text_color(*MUTED)
        self.cell(0, 8, f"IndepCommerce · Guía de tenants — pág. {self.page_no()}",
                  align="C")


def setup_fonts(pdf: PDF):
    pdf.add_font("Arial", "", str(FONTS / "arial.ttf"))
    pdf.add_font("Arial", "B", str(FONTS / "arialbd.ttf"))
    pdf.add_font("Arial", "I", str(FONTS / "ariali.ttf"))
    pdf.add_font("Arial", "BI", str(FONTS / "arialbi.ttf"))
    pdf.add_font("Consolas", "", str(FONTS / "consola.ttf"))
    pdf.add_font("Consolas", "B", str(FONTS / "consolab.ttf"))


def heading(pdf: PDF, level: int, text: str):
    text = plain(text)
    pdf.ln(3 if level > 1 else 4)
    if pdf.will_page_break(16):
        pdf.add_page()
    sizes = {1: 19, 2: 14.5, 3: 11.5}
    pdf.set_font("Arial", "B", sizes.get(level, 11))
    pdf.set_text_color(*(ACCENT2 if level == 1 else INK))
    pdf.multi_cell(0, sizes[level] * 0.5, text, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    if level <= 2:
        pdf.set_draw_color(*(ACCENT if level == 1 else RULE))
        pdf.set_line_width(0.5 if level == 1 else 0.2)
        y = pdf.get_y() + 1
        pdf.line(pdf.l_margin, y, pdf.w - pdf.r_margin, y)
        pdf.ln(2.5)
    else:
        pdf.ln(1)
    pdf.set_text_color(*INK)


def paragraph(pdf: PDF, text: str):
    pdf.set_font("Arial", "", 10)
    pdf.set_text_color(*INK)
    pdf.multi_cell(0, 5, inline_md(text), markdown=True,
                   new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.ln(1.2)


def bullet(pdf: PDF, text: str, ordered_label: str | None = None):
    pdf.set_font("Arial", "", 10)
    pdf.set_text_color(*INK)
    marker = ordered_label if ordered_label else "•"
    x0 = pdf.get_x()
    pdf.cell(7 if ordered_label else 5, 5, marker)
    pdf.set_x(x0 + (8 if ordered_label else 6))
    pdf.multi_cell(0, 5, inline_md(text), markdown=True,
                   new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.ln(0.6)


def blockquote(pdf: PDF, text: str):
    pdf.set_font("Arial", "I", 9.5)
    pdf.set_text_color(*MUTED)
    pdf.set_draw_color(*ACCENT)
    pdf.set_line_width(0.6)
    y0 = pdf.get_y()
    pdf.set_x(pdf.l_margin + 3)
    pdf.multi_cell(0, 4.8, inline_md(text), markdown=True,
                   new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.line(pdf.l_margin + 0.5, y0, pdf.l_margin + 0.5, pdf.get_y())
    pdf.set_text_color(*INK)
    pdf.ln(1.5)


def code_block(pdf: PDF, lines: list[str]):
    pdf.ln(1)
    pdf.set_font("Consolas", "", 7.8)
    pdf.set_fill_color(*CODE_BG)
    pdf.set_text_color(40, 44, 52)
    lh = 3.9
    for ln in lines:
        if pdf.will_page_break(lh):
            pdf.add_page()
        pdf.multi_cell(0, lh, ln if ln else " ", fill=True,
                       new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.set_text_color(*INK)
    pdf.ln(2)


def render_table(pdf: PDF, rows: list[list[str]]):
    if not rows:
        return
    pdf.ln(1)
    ncols = max(len(r) for r in rows)
    rows = [r + [""] * (ncols - len(r)) for r in rows]
    pdf.set_font("Arial", "", 8.5)
    head_style = FontFace(emphasis="BOLD", fill_color=TABLE_HEAD_BG, color=ACCENT2)
    with pdf.table(
        borders_layout="MINIMAL",
        cell_fill_color=(250, 250, 251),
        cell_fill_mode="ROWS",
        headings_style=head_style,
        line_height=4.6,
        text_align="LEFT",
    ) as table:
        for r in rows:
            row = table.row()
            for c in r:
                row.cell(plain(c))
    pdf.ln(2.5)


def main():
    md = SRC.read_text(encoding="utf-8").splitlines()
    pdf = PDF(format="A4")
    pdf.set_margins(16, 16, 16)
    pdf.set_auto_page_break(auto=True, margin=16)
    setup_fonts(pdf)
    pdf.add_page()

    i = 0
    n = len(md)
    para: list[str] = []

    def flush_para():
        nonlocal para
        if para:
            paragraph(pdf, " ".join(para).strip())
            para = []

    while i < n:
        line = md[i]
        stripped = line.strip()

        # fenced code block
        if stripped.startswith("```"):
            flush_para()
            i += 1
            buf = []
            while i < n and not md[i].strip().startswith("```"):
                buf.append(md[i])
                i += 1
            i += 1  # skip closing fence
            code_block(pdf, buf)
            continue

        # table (consecutive lines starting with |)
        if stripped.startswith("|"):
            flush_para()
            tbl = []
            while i < n and md[i].strip().startswith("|"):
                cells = [c.strip() for c in md[i].strip().strip("|").split("|")]
                # skip separator row (|---|:--:|)
                if not all(re.fullmatch(r":?-{2,}:?", c or "-") for c in cells):
                    tbl.append(cells)
                i += 1
            render_table(pdf, tbl)
            continue

        if not stripped:
            flush_para()
            i += 1
            continue

        m = re.match(r"^(#{1,4})\s+(.*)$", stripped)
        if m:
            flush_para()
            heading(pdf, len(m.group(1)), m.group(2))
            i += 1
            continue

        if stripped in ("---", "***", "___"):
            flush_para()
            pdf.ln(1)
            pdf.set_draw_color(*RULE)
            pdf.set_line_width(0.2)
            pdf.line(pdf.l_margin, pdf.get_y(), pdf.w - pdf.r_margin, pdf.get_y())
            pdf.ln(2)
            i += 1
            continue

        if stripped.startswith("> "):
            flush_para()
            blockquote(pdf, stripped[2:])
            i += 1
            continue

        mb = re.match(r"^\s*[-*]\s+(.*)$", line)
        if mb:
            flush_para()
            bullet(pdf, mb.group(1))
            i += 1
            continue

        mo = re.match(r"^\s*(\d+)\.\s+(.*)$", line)
        if mo:
            flush_para()
            bullet(pdf, mo.group(2), ordered_label=mo.group(1) + ".")
            i += 1
            continue

        para.append(stripped)
        i += 1

    flush_para()
    pdf.output(str(OUT))
    print(f"WROTE {OUT} ({OUT.stat().st_size} bytes, {pdf.page_no()} pages)")


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print("ERROR:", e, file=sys.stderr)
        raise
