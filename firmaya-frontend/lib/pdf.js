// Generador mínimo de PDF (texto) sin dependencias externas — CU-10.
// Contenido: texto del contrato, sección de datos de firma por firmante,
// hash del documento en el pie de cada página y leyenda final.

const PAGE_W = 595;
const PAGE_H = 842;
const MARGIN = 50;
const BODY_SIZE = 10;
const LEADING = 14;
const FOOTER_Y = 30;

const REPLACEMENTS = { "–": "-", "—": "-", "→": "->", "“": '"', "”": '"', "‘": "'", "’": "'", "…": "..." };

function toLatin1(text) {
  return Array.from(text || "")
    .map((ch) => REPLACEMENTS[ch] ?? (ch.charCodeAt(0) < 256 ? ch : "?"))
    .join("");
}

function escapePdf(text) {
  return toLatin1(text).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function wrap(text, size) {
  const maxChars = Math.floor((PAGE_W - MARGIN * 2) / (size * 0.52));
  const lines = [];
  for (const paragraph of (text || "").split("\n")) {
    if (!paragraph.trim()) {
      lines.push("");
      continue;
    }
    let current = "";
    for (const word of paragraph.split(/\s+/)) {
      const candidate = current ? `${current} ${word}` : word;
      if (candidate.length > maxChars && current) {
        lines.push(current);
        current = word;
      } else {
        current = candidate;
      }
    }
    lines.push(current);
  }
  return lines;
}

// blocks: [{ text, bold?, size? }]
export function buildPdf({ title, blocks, footer }) {
  const lines = [];
  for (const block of blocks) {
    const size = block.size || BODY_SIZE;
    for (const line of wrap(block.text, size)) lines.push({ text: line, bold: block.bold, size });
  }

  const perPage = Math.floor((PAGE_H - MARGIN * 2 - 20) / LEADING);
  const pages = [];
  for (let i = 0; i < lines.length; i += perPage) pages.push(lines.slice(i, i + perPage));
  if (!pages.length) pages.push([]);

  const objects = [];
  objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  objects[3] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>";
  objects[4] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>";

  const kids = [];
  pages.forEach((pageLines, index) => {
    const pageObj = 5 + index * 2;
    const contentObj = pageObj + 1;
    kids.push(`${pageObj} 0 R`);
    let y = PAGE_H - MARGIN;
    let stream = "";
    for (const line of pageLines) {
      stream += `BT /${line.bold ? "F2" : "F1"} ${line.size} Tf ${MARGIN} ${y} Td (${escapePdf(line.text)}) Tj ET\n`;
      y -= LEADING;
    }
    stream += `BT /F1 7 Tf ${MARGIN} ${FOOTER_Y} Td (${escapePdf(footer)}) Tj ET\n`;
    stream += `BT /F1 7 Tf ${PAGE_W - MARGIN - 40} ${FOOTER_Y - 10} Td (${index + 1} / ${pages.length}) Tj ET\n`;
    objects[pageObj] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentObj} 0 R >>`;
    objects[contentObj] = `<< /Length ${stream.length} >>\nstream\n${stream}endstream`;
  });
  objects[2] = `<< /Type /Pages /Kids [${kids.join(" ")}] /Count ${pages.length} >>`;

  let out = "%PDF-1.4\n";
  const offsets = [];
  for (let i = 1; i < objects.length; i++) {
    offsets[i] = out.length;
    out += `${i} 0 obj\n${objects[i]}\nendobj\n`;
  }
  const xref = out.length;
  out += `xref\n0 ${objects.length}\n0000000000 65535 f \n`;
  for (let i = 1; i < objects.length; i++) out += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  out += `trailer\n<< /Size ${objects.length} /Root 1 0 R /Info << /Title (${escapePdf(title)}) >> >>\nstartxref\n${xref}\n%%EOF`;

  const bytes = new Uint8Array(out.length);
  for (let i = 0; i < out.length; i++) bytes[i] = out.charCodeAt(i) & 0xff;
  return new Blob([bytes], { type: "application/pdf" });
}
