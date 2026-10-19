import * as THREE from "three";

/**
 * Packaging artwork painted onto canvases at runtime. This keeps the 3D view
 * free of heavy texture downloads while still reading as the real products.
 */

const cache = new Map<string, THREE.Texture>();
const PX = 96; // canvas pixels per 2 cm grid cell

function canvas(width: number, height: number) {
  const el = document.createElement("canvas");
  el.width = Math.round(width);
  el.height = Math.round(height);
  const ctx = el.getContext("2d")!;
  return { el, ctx, w: el.width, h: el.height };
}

function toTexture(el: HTMLCanvasElement, repeat = false) {
  const texture = new THREE.CanvasTexture(el);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  if (repeat) {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
  }
  texture.needsUpdate = true;
  return texture;
}

function cached(key: string, make: () => THREE.Texture) {
  let texture = cache.get(key);
  if (!texture) {
    texture = make();
    cache.set(key, texture);
  }
  return texture;
}

/** Seeded random so textures are identical between renders. */
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function foilSheen(ctx: CanvasRenderingContext2D, w: number, h: number, strength: number) {
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, `rgba(255,255,255,${0.18 * strength})`);
  g.addColorStop(0.35, "rgba(255,255,255,0)");
  g.addColorStop(0.55, `rgba(255,255,255,${0.12 * strength})`);
  g.addColorStop(0.7, "rgba(0,0,0,0)");
  g.addColorStop(1, `rgba(0,0,0,${0.18 * strength})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

/** Crimped seal at both short ends of a flow-wrapped bar. */
function crimpEnds(ctx: CanvasRenderingContext2D, w: number, h: number, color: string) {
  const horizontal = w >= h;
  const len = (horizontal ? w : h) * 0.055;
  ctx.save();
  ctx.fillStyle = color;
  const ridges = 18;
  const across = horizontal ? h : w;
  for (const start of [0, (horizontal ? w : h) - len]) {
    if (horizontal) ctx.fillRect(start, 0, len, h);
    else ctx.fillRect(0, start, w, len);
    ctx.strokeStyle = "rgba(0,0,0,0.25)";
    ctx.lineWidth = 2;
    for (let i = 0; i <= ridges; i++) {
      const p = (i / ridges) * across;
      ctx.beginPath();
      if (horizontal) {
        ctx.moveTo(start, p);
        ctx.lineTo(start + len, p);
      } else {
        ctx.moveTo(p, start);
        ctx.lineTo(p, start + len);
      }
      ctx.stroke();
    }
  }
  ctx.restore();
}

function fitText(ctx: CanvasRenderingContext2D, text: string, font: (size: number) => string, maxWidth: number, start: number) {
  let size = start;
  ctx.font = font(size);
  while (ctx.measureText(text).width > maxWidth && size > 8) {
    size -= 2;
    ctx.font = font(size);
  }
  return size;
}

export function kraftTexture() {
  return cached("kraft", () => {
    const { el, ctx, w, h } = canvas(512, 512);
    ctx.fillStyle = "#c79f71";
    ctx.fillRect(0, 0, w, h);
    const rand = rng(7);
    for (let i = 0; i < 9000; i++) {
      const shade = rand() > 0.5 ? 255 : 60;
      ctx.fillStyle = `rgba(${shade},${shade * 0.8},${shade * 0.6},${rand() * 0.06})`;
      ctx.fillRect(rand() * w, rand() * h, 1 + rand() * 2, 1 + rand() * 2);
    }
    ctx.lineWidth = 1;
    for (let i = 0; i < 420; i++) {
      ctx.strokeStyle = `rgba(110,72,38,${0.05 + rand() * 0.08})`;
      const x = rand() * w;
      const y = rand() * h;
      const a = rand() * Math.PI;
      const l = 6 + rand() * 22;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l);
      ctx.stroke();
    }
    return toTexture(el, true);
  });
}

type WrapperLabel = "dairy-milk" | "kitkat" | "snickers" | "mars";

export function wrapperTexture(label: WrapperLabel, color: string, shade: string, cols: number, rows: number) {
  return cached(`wrap-${label}-${cols}x${rows}`, () => {
    const { el, ctx, w, h } = canvas(cols * PX, rows * PX);
    const g = ctx.createLinearGradient(0, 0, w * 0.4, h);
    g.addColorStop(0, color);
    g.addColorStop(1, shade);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    if (label === "dairy-milk") {
      ctx.fillStyle = "#f7f1ff";
      ctx.font = `italic 600 ${w * 0.17}px Georgia, serif`;
      ctx.fillText("Cadbury", cx, h * 0.2);
      const size = fitText(ctx, "Dairy", (s) => `700 ${s}px "Helvetica Neue", Arial, sans-serif`, w * 0.8, w * 0.3);
      ctx.fillText("Dairy", cx, h * 0.4);
      ctx.font = `700 ${size}px "Helvetica Neue", Arial, sans-serif`;
      ctx.fillText("Milk", cx, h * 0.4 + size * 1.02);
      // pouring glass of milk motif
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.beginPath();
      ctx.ellipse(cx + w * 0.12, h * 0.8, w * 0.1, h * 0.05, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#6b3b1f";
      ctx.beginPath();
      ctx.ellipse(cx - w * 0.08, h * 0.82, w * 0.14, h * 0.06, -0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#e7b53c";
      ctx.font = `700 ${w * 0.07}px Georgia, serif`;
      ctx.fillText("CHOCOLATE", cx, h * 0.93);
    }

    if (label === "kitkat") {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(-0.12);
      const rx = Math.min(w * 0.36, h * 0.55);
      const ry = rx * 0.48;
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#d7121f";
      const size = fitText(ctx, "KitKat", (s) => `italic 900 ${s}px "Arial Black", Arial, sans-serif`, rx * 1.75, ry * 1.2);
      ctx.font = `italic 900 ${size}px "Arial Black", Arial, sans-serif`;
      ctx.fillText("KitKat", 0, ry * 0.08);
      ctx.restore();
      ctx.fillStyle = "#ffffff";
      ctx.font = `700 ${h * 0.09}px Arial, sans-serif`;
      ctx.textAlign = "left";
      ctx.fillText("Nestlé", w * 0.09, h * 0.14);
      // wafer fingers
      ctx.fillStyle = "#8a4a1f";
      ctx.fillRect(w * 0.68, h * 0.72, w * 0.2, h * 0.1);
      ctx.fillStyle = "#c27a3c";
      ctx.fillRect(w * 0.68, h * 0.72, w * 0.2, h * 0.03);
    }

    if (label === "snickers") {
      const bw = w * 0.62;
      const bh = h * 0.58;
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.roundRect(cx - bw / 2, cy - bh / 2, bw, bh, bh * 0.25);
      ctx.fill();
      ctx.save();
      ctx.translate(cx, cy);
      ctx.transform(1, 0, -0.18, 1, 0, 0);
      const size = fitText(ctx, "SNICKERS", (s) => `900 ${s}px Impact, "Arial Black", sans-serif`, bw * 0.86, bh * 0.85);
      ctx.font = `900 ${size}px Impact, "Arial Black", sans-serif`;
      ctx.lineWidth = size * 0.12;
      ctx.strokeStyle = "#c8102e";
      ctx.strokeText("SNICKERS", 0, 0);
      ctx.fillStyle = "#1d3f99";
      ctx.fillText("SNICKERS", 0, 0);
      ctx.restore();
      // peanuts
      ctx.fillStyle = "#d9a865";
      for (const [px, py] of [[0.1, 0.3], [0.13, 0.7], [0.88, 0.35], [0.9, 0.72]]) {
        ctx.beginPath();
        ctx.ellipse(w * px, h * py, h * 0.07, h * 0.05, 0.6, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    if (label === "mars") {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.transform(1, 0, -0.25, 1, 0, 0);
      const size = fitText(ctx, "Mars", (s) => `italic 900 ${s}px Georgia, "Times New Roman", serif`, w * 0.55, h * 0.95);
      ctx.font = `italic 900 ${size}px Georgia, "Times New Roman", serif`;
      ctx.lineWidth = size * 0.1;
      ctx.strokeStyle = "#e3b23c";
      ctx.strokeText("Mars", 0, size * 0.05);
      ctx.fillStyle = "#e3142b";
      ctx.fillText("Mars", 0, size * 0.05);
      ctx.restore();
    }

    foilSheen(ctx, w, h, 1);
    crimpEnds(ctx, w, h, shade);
    return toTexture(el);
  });
}

export function kunafaTexture(cols: number, rows: number) {
  return cached(`kunafa-${cols}x${rows}`, () => {
    const { el, ctx, w, h } = canvas(cols * PX, rows * PX);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
    // polka dots
    ctx.fillStyle = "#d9ebb7";
    for (let y = h * 0.6; y < h; y += w * 0.12) {
      for (let x = (y / (w * 0.12)) % 2 ? 0 : w * 0.06; x < w; x += w * 0.12) {
        ctx.beginPath();
        ctx.arc(x, y, w * 0.035, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    const top = ctx.createLinearGradient(0, 0, 0, h * 0.55);
    top.addColorStop(0, "#9ccd45");
    top.addColorStop(1, "#7fb53a");
    ctx.fillStyle = top;
    ctx.fillRect(0, 0, w, h * 0.55);
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const lines = ["PISTACHIO", "DUBAI KUNAFA", "CHOCOLATE"];
    const size = fitText(ctx, "DUBAI KUNAFA", (s) => `700 ${s}px "Arial Narrow", "Helvetica Neue", Arial, sans-serif`, w * 0.82, w * 0.14);
    ctx.font = `700 ${size}px "Arial Narrow", "Helvetica Neue", Arial, sans-serif`;
    lines.forEach((line, i) => ctx.fillText(line, w / 2, h * 0.24 + i * size * 1.05));
    ctx.font = `600 ${size * 0.55}px Arial, sans-serif`;
    ctx.fillText("كنافة دبي بالفستق", w / 2, h * 0.1);
    // kunafa bar illustration
    ctx.save();
    ctx.translate(w * 0.5, h * 0.76);
    ctx.rotate(-0.15);
    ctx.fillStyle = "#4a2615";
    ctx.fillRect(-w * 0.3, -h * 0.06, w * 0.6, h * 0.12);
    ctx.fillStyle = "#a6c94a";
    ctx.fillRect(-w * 0.3, -h * 0.015, w * 0.6, h * 0.03);
    ctx.restore();
    ctx.strokeStyle = "#e7c35a";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(w * 0.05, h * 0.96);
    ctx.bezierCurveTo(w * 0.3, h * 0.9, w * 0.6, h * 0.99, w * 0.95, h * 0.93);
    ctx.stroke();
    return toTexture(el);
  });
}

export function heartLabelTexture(label: string, sublabel?: string) {
  return cached(`heart-${label}`, () => {
    const { el, ctx, w, h } = canvas(512, 512);
    ctx.fillStyle = "#fbf3e4";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#c58f4e";
    ctx.lineWidth = 10;
    ctx.strokeRect(12, 12, w - 24, h - 24);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#8a4d24";
    const size = fitText(ctx, label, (s) => `italic 600 ${s}px Georgia, serif`, w * 0.7, 120);
    ctx.font = `italic 600 ${size}px Georgia, serif`;
    ctx.fillText(label, w / 2, h * 0.36);
    if (sublabel) {
      ctx.font = `italic 400 ${Math.min(42, size * 0.38)}px Georgia, serif`;
      ctx.fillStyle = "#b07a3c";
      ctx.fillText(sublabel, w / 2, h * 0.52);
    }
    // little chocolate cluster
    ctx.fillStyle = "#5a2e17";
    ctx.beginPath();
    ctx.arc(w * 0.46, h * 0.68, 34, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#d9a441";
    ctx.beginPath();
    ctx.arc(w * 0.56, h * 0.7, 26, 0, Math.PI * 2);
    ctx.fill();
    return toTexture(el);
  });
}

export function sachetTexture(color: string, accent: string, label: string, cols: number, rows: number) {
  return cached(`sachet-${label}-${cols}x${rows}`, () => {
    const { el, ctx, w, h } = canvas(cols * PX, rows * PX);
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, color);
    g.addColorStop(1, accent);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    const rand = rng(label.length * 31);
    for (let i = 0; i < 6; i++) {
      ctx.fillStyle = `rgba(255,255,255,${0.25 + rand() * 0.3})`;
      ctx.beginPath();
      ctx.arc(rand() * w, rand() * h, 6 + rand() * w * 0.12, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.rotate(h > w ? -Math.PI / 2 : 0);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const span = Math.max(w, h);
    const size = fitText(ctx, label, (s) => `italic 800 ${s}px Georgia, serif`, span * 0.7, Math.min(w, h) * 0.4);
    ctx.font = `italic 800 ${size}px Georgia, serif`;
    ctx.fillStyle = "#3b2a4a";
    ctx.fillText(label, 0, 0);
    ctx.restore();
    foilSheen(ctx, w, h, 0.7);
    crimpEnds(ctx, w, h, "rgba(255,255,255,0.9)");
    return toTexture(el);
  });
}

export function cardTexture(cols: number, rows: number) {
  return cached(`card-${cols}x${rows}`, () => {
    const { el, ctx, w, h } = canvas(cols * PX, rows * PX);
    ctx.fillStyle = "#fbf6ec";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#c9a35b";
    ctx.lineWidth = 6;
    ctx.strokeRect(14, 14, w - 28, h - 28);
    ctx.lineWidth = 2;
    ctx.strokeRect(26, 26, w - 52, h - 52);
    ctx.fillStyle = "#8a5634";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `italic 500 ${h * 0.2}px Georgia, serif`;
    ctx.fillText("With love", w / 2, h * 0.47);
    ctx.fillStyle = "#c9a35b";
    ctx.beginPath();
    const s = h * 0.05;
    const x = w / 2;
    const y = h * 0.68;
    ctx.moveTo(x, y + s);
    ctx.bezierCurveTo(x - s * 2, y - s * 0.4, x - s * 0.6, y - s * 1.8, x, y - s * 0.5);
    ctx.bezierCurveTo(x + s * 0.6, y - s * 1.8, x + s * 2, y - s * 0.4, x, y + s);
    ctx.fill();
    return toTexture(el);
  });
}

export function glowTexture() {
  return cached("glow", () => {
    const { el, ctx, w, h } = canvas(256, 256);
    const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    g.addColorStop(0, "rgba(255,226,160,1)");
    g.addColorStop(0.45, "rgba(232,190,110,0.45)");
    g.addColorStop(1, "rgba(201,163,91,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    return toTexture(el);
  });
}
