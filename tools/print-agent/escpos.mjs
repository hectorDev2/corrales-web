// Constructor mínimo de ESC/POS (sin dependencias). Codificación CP858 (acentos en español).
const CP858 = {
  "á": 0xa0, "é": 0x82, "í": 0xa1, "ó": 0xa2, "ú": 0xa3, "ñ": 0xa4, "Ñ": 0xa5,
  "Á": 0xb5, "É": 0x90, "Í": 0xd6, "Ó": 0xe0, "Ú": 0xe9, "ü": 0x81, "Ü": 0x9a,
  "¿": 0xa8, "¡": 0xad, "°": 0xf8, "·": 0xfa, "€": 0xd5,
};

function encode(text) {
  const out = [];
  for (const ch of text) {
    const code = ch.codePointAt(0);
    if (code < 0x80) out.push(code);
    else out.push(CP858[ch] ?? 0x3f);
  }
  return Buffer.from(out);
}

export class Ticket {
  constructor(columns = 48) {
    this.columns = columns;
    this.chunks = [Buffer.from([0x1b, 0x40, 0x1b, 0x74, 19])]; // init + CP858
  }
  raw(...bytes) { this.chunks.push(Buffer.from(bytes)); return this; }
  align(a) { return this.raw(0x1b, 0x61, { left: 0, center: 1, right: 2 }[a]); }
  bold(on) { return this.raw(0x1b, 0x45, on ? 1 : 0); }
  size(w = 1, h = 1) { return this.raw(0x1d, 0x21, ((w - 1) << 4) | (h - 1)); }
  text(s = "") { this.chunks.push(encode(s)); return this; }
  line(s = "") { return this.text(s).raw(0x0a); }
  hr(ch = "-") { return this.line(ch.repeat(this.columns)); }
  feed(n = 1) { return this.raw(0x1b, 0x64, n); }
  /** "izquierda ........ derecha" en una sola línea. */
  row(left, right) {
    const space = Math.max(1, this.columns - left.length - right.length);
    return this.line(left + " ".repeat(space) + right);
  }
  cut() { return this.feed(4).raw(0x1d, 0x56, 0x42, 0x00); }
  drawer() { return this.raw(0x1b, 0x70, 0x00, 0x32, 0xfa); }
  build() { return Buffer.concat(this.chunks); }
}
