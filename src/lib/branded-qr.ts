import QRCode from "qrcode";

const RED = "#e4002b";
const INK = "#111111";
const FONT = "Helvetica Neue, Helvetica, Arial, sans-serif";

/** Llama de la marca (viewBox 24x24). */
const FLAME_PATH =
  "M12 2c.6 3 2.2 4.4 3.8 6.2C17.4 10 19 12 19 15a7 7 0 0 1-14 0c0-2 .9-3.8 2.2-5.2.2 1.2.9 2.2 1.9 2.7C8.8 8.6 10 4.7 12 2Zm0 20a3.6 3.6 0 0 1-3.6-3.6c0-1.6 1.1-2.7 2-3.7.5.8 1 1.1 1.6 1.7.9-.7 1.4-1.6 1.5-2.7 1.2 1.1 2.1 2.6 2.1 4.7A3.6 3.6 0 0 1 12 22Z";

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const r = (n: number) => Math.round(n * 100) / 100;

/** Contenido SVG (sin etiqueta <svg>) del QR de marca, en un cuadrado de `size` unidades. */
function qrContent(url: string, size: number) {
  const qr = QRCode.create(url, { errorCorrectionLevel: "H" });
  const n = qr.modules.size;
  const quiet = 2;
  const cell = size / (n + quiet * 2);
  const off = quiet * cell;
  const isDark = (row: number, col: number) => qr.modules.get(row, col) === 1;

  // Zona central libre para la llama (≈ 21% del lado; H tolera hasta ~30%).
  let logo = Math.round(n * 0.21);
  if (logo % 2 === 0) logo++;
  const logoStart = Math.floor((n - logo) / 2);
  const inLogo = (row: number, col: number) =>
    row >= logoStart - 1 && row < logoStart + logo + 1 && col >= logoStart - 1 && col < logoStart + logo + 1;
  const inFinder = (row: number, col: number) =>
    (row < 7 && col < 7) || (row < 7 && col >= n - 7) || (row >= n - 7 && col < 7);

  const parts: string[] = [];

  // Módulos: cuadrados redondeados con un pequeño espacio.
  const gap = cell * 0.025;
  const m = cell - gap * 2;
  for (let row = 0; row < n; row++) {
    for (let col = 0; col < n; col++) {
      if (!isDark(row, col) || inFinder(row, col) || inLogo(row, col)) continue;
      parts.push(
        `<rect x="${r(off + col * cell + gap)}" y="${r(off + row * cell + gap)}" width="${r(m)}" height="${r(m)}" rx="${r(cell * 0.2)}"/>`,
      );
    }
  }
  const modules = `<g fill="${INK}">${parts.join("")}</g>`;

  // Ojos de posición: anillo rojo + centro oscuro.
  const eye = (row: number, col: number) => {
    const x = off + col * cell;
    const y = off + row * cell;
    return (
      `<rect x="${r(x)}" y="${r(y)}" width="${r(cell * 7)}" height="${r(cell * 7)}" rx="${r(cell * 2.2)}" fill="${RED}"/>` +
      `<rect x="${r(x + cell)}" y="${r(y + cell)}" width="${r(cell * 5)}" height="${r(cell * 5)}" rx="${r(cell * 1.5)}" fill="#fff"/>` +
      `<rect x="${r(x + cell * 2)}" y="${r(y + cell * 2)}" width="${r(cell * 3)}" height="${r(cell * 3)}" rx="${r(cell * 1)}" fill="${INK}"/>`
    );
  };
  const eyes = eye(0, 0) + eye(0, n - 7) + eye(n - 7, 0);

  // Insignia central.
  const badge = logo * cell;
  const bx = off + logoStart * cell;
  const by = off + logoStart * cell;
  const pad = badge * 0.12;
  const fs = (badge - pad * 2) / 24;
  const center =
    `<rect x="${r(bx)}" y="${r(by)}" width="${r(badge)}" height="${r(badge)}" rx="${r(badge * 0.28)}" fill="${RED}"/>` +
    `<path d="${FLAME_PATH}" fill="#fff" transform="translate(${r(bx + pad)} ${r(by + pad)}) scale(${r(fs)})"/>`;

  return modules + eyes + center;
}

/** SVG solo del QR de marca (fondo blanco). */
export function brandedQrSvg(url: string, size = 600): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}"><rect width="${size}" height="${size}" fill="#fff"/>${qrContent(url, size)}</svg>`;
}

export const CARD_WIDTH = 600;
export const CARD_HEIGHT = 900;

/** Tarjeta imprimible para la mesa: encabezado rojo, QR de marca e instrucciones. */
export function brandedTableCardSvg(url: string, label: string, zone: string): string {
  const qrSize = 420;
  const qrX = (CARD_WIDTH - qrSize) / 2;
  const qrY = 215;
  const bigLabel = label.length > 4 ? 64 : 92;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CARD_WIDTH} ${CARD_HEIGHT}" width="${CARD_WIDTH}" height="${CARD_HEIGHT}" font-family="${FONT}">
<defs><clipPath id="c"><rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" rx="44"/></clipPath></defs>
<g clip-path="url(#c)">
  <rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" fill="#fff"/>
  <rect width="${CARD_WIDTH}" height="170" fill="${RED}"/>
  <circle cx="540" cy="20" r="110" fill="#fff" opacity="0.08"/>
  <circle cx="60" cy="170" r="70" fill="#fff" opacity="0.08"/>
  <text x="${CARD_WIDTH / 2}" y="62" text-anchor="middle" font-size="26" font-weight="700" letter-spacing="8" fill="#fff" opacity="0.9">${esc(zone.toUpperCase())}</text>
  <text x="${CARD_WIDTH / 2}" y="${bigLabel > 80 ? 150 : 140}" text-anchor="middle" font-size="${bigLabel}" font-weight="900" fill="#fff">MESA ${esc(label)}</text>

  <rect x="${qrX - 24}" y="${qrY - 24}" width="${qrSize + 48}" height="${qrSize + 48}" rx="36" fill="#fff" stroke="#f0d5da" stroke-width="3"/>
  <g transform="translate(${qrX} ${qrY})">${qrContent(url, qrSize)}</g>

  <text x="${CARD_WIDTH / 2}" y="${qrY + qrSize + 92}" text-anchor="middle" font-size="36" font-weight="900" fill="${INK}">Escanea y pide</text>
  <text x="${CARD_WIDTH / 2}" y="${qrY + qrSize + 134}" text-anchor="middle" font-size="26" fill="#666">desde tu mesa, sin esperar</text>

  <rect y="${CARD_HEIGHT - 86}" width="${CARD_WIDTH}" height="86" fill="${INK}"/>
  <g transform="translate(${CARD_WIDTH / 2 - 118} ${CARD_HEIGHT - 70}) scale(2.2)"><path d="${FLAME_PATH}" fill="${RED}"/></g>
  <text x="${CARD_WIDTH / 2 - 56}" y="${CARD_HEIGHT - 31}" font-size="40" font-weight="900" letter-spacing="3" fill="#fff">CORRALES</text>
</g>
</svg>`;
}

export const svgToDataUrl = (svg: string) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

/** Rasteriza un SVG a PNG (2x) para descargar. */
export function svgToPngDataUrl(svg: string, width: number, height: number, scale = 2): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width * scale;
      canvas.height = height * scale;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("canvas"));
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => reject(new Error("No se pudo generar la imagen"));
    img.src = svgToDataUrl(svg);
  });
}
