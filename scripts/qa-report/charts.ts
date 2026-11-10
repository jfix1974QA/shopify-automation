/**
 * Small, dependency-free SVG chart helpers for the QA reports.
 * Colours are referenced by role (CSS custom properties), so the same SVG works
 * inline in the HTML reports and as a standalone .svg (which embeds its own palette,
 * including a dark-mode variant, so it reads correctly on GitHub in light or dark).
 */

export const PALETTE_CSS = `
  --surface:#fcfcfb; --ink:#0b0b0b; --ink-2:#52514e; --grid:#e4e3df;
  --good:#0ca30c; --critical:#d03b3b; --serious:#ec835a; --warning:#fab219; --neutral:#b5b4ae;
  --s1:#2a78d6;
  --seq-0:#f0efec; --seq-1:#cde2fb; --seq-2:#9ec5f4; --seq-3:#5598e7; --seq-4:#256abf; --seq-5:#104281;`;
export const PALETTE_DARK_CSS = `
  --surface:#1a1a19; --ink:#f0efec; --ink-2:#c3c2b7; --grid:#383835; --neutral:#6b6a65;
  --s1:#3987e5;
  --seq-0:#2a2a28; --seq-1:#0d366b; --seq-2:#184f95; --seq-3:#256abf; --seq-4:#3987e5; --seq-5:#86b6ef;`;

export type Key = { key: string; label: string; color: string };

export const STATUS_KEYS: Key[] = [
  { key: 'passed', label: 'Passed', color: 'var(--good)' },
  { key: 'failed', label: 'Failed', color: 'var(--critical)' },
  { key: 'blocked', label: 'Blocked', color: 'var(--serious)' },
  { key: 'flaky', label: 'Flaky', color: 'var(--warning)' },
  { key: 'skipped', label: 'Skipped', color: 'var(--neutral)' },
];

export const SEVERITY_KEYS: Key[] = [
  { key: 'Critical', label: 'Critical', color: 'var(--critical)' },
  { key: 'High', label: 'High', color: 'var(--serious)' },
  { key: 'Medium', label: 'Medium', color: 'var(--warning)' },
  { key: 'Low', label: 'Low', color: 'var(--neutral)' },
];

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
const FONT = `font-family="system-ui,-apple-system,Segoe UI,sans-serif"`;

function svg(w: number, h: number, body: string, title: string) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${esc(title)}" class="viz" ${FONT} style="max-width:100%;height:auto">
<title>${esc(title)}</title>
<rect width="${w}" height="${h}" rx="8" fill="var(--surface)"/>
${body}
</svg>`;
}

function legend(keys: Key[], x: number, y: number) {
  let cx = x;
  return keys
    .map((k) => {
      const item = `<rect x="${cx}" y="${y - 9}" width="10" height="10" rx="2" fill="${k.color}"/><text x="${cx + 15}" y="${y}" font-size="12" fill="var(--ink-2)">${esc(k.label)}</text>`;
      cx += 26 + k.label.length * 7;
      return item;
    })
    .join('');
}

/** Donut chart with a centre figure and a legend listing value and share. */
export function donut(title: string, data: { key: Key; value: number }[], centre: { value: string; label: string }) {
  const W = 460, H = 220, cx = 110, cy = 110, r = 80, ring = 26;
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  let angle = -Math.PI / 2;
  const arcs = data
    .filter((d) => d.value > 0)
    .map((d) => {
      const a = (d.value / total) * Math.PI * 2;
      const a0 = angle, a1 = angle + a;
      angle = a1;
      const large = a > Math.PI ? 1 : 0;
      const p = (ang: number, rad: number) => `${(cx + rad * Math.cos(ang)).toFixed(2)},${(cy + rad * Math.sin(ang)).toFixed(2)}`;
      const path = a >= Math.PI * 2 - 1e-6
        ? `M ${p(0, r)} A ${r} ${r} 0 1 1 ${p(Math.PI, r)} A ${r} ${r} 0 1 1 ${p(0, r)} M ${p(0, r - ring)} A ${r - ring} ${r - ring} 0 1 0 ${p(Math.PI, r - ring)} A ${r - ring} ${r - ring} 0 1 0 ${p(0, r - ring)} Z`
        : `M ${p(a0, r)} A ${r} ${r} 0 ${large} 1 ${p(a1, r)} L ${p(a1, r - ring)} A ${r - ring} ${r - ring} 0 ${large} 0 ${p(a0, r - ring)} Z`;
      return `<path d="${path}" fill="${d.key.color}" stroke="var(--surface)" stroke-width="2" fill-rule="evenodd"><title>${esc(d.key.label)}: ${d.value} (${Math.round((d.value / total) * 100)}%)</title></path>`;
    })
    .join('');
  const rows = data
    .map((d, i) => {
      const y = 62 + i * 28;
      return `<rect x="240" y="${y - 10}" width="12" height="12" rx="2" fill="${d.key.color}"/>
<text x="260" y="${y}" font-size="13" fill="var(--ink)">${esc(d.key.label)}</text>
<text x="440" y="${y}" font-size="13" fill="var(--ink)" text-anchor="end" font-weight="600">${d.value} <tspan fill="var(--ink-2)" font-weight="400">(${Math.round((d.value / total) * 100)}%)</tspan></text>`;
    })
    .join('');
  return svg(W, H, `${arcs}
<text x="${cx}" y="${cy + 2}" text-anchor="middle" font-size="26" font-weight="700" fill="var(--ink)">${esc(centre.value)}</text>
<text x="${cx}" y="${cy + 22}" text-anchor="middle" font-size="11" fill="var(--ink-2)">${esc(centre.label)}</text>
${rows}`, title);
}

/** Horizontal stacked bars (e.g. pass/fail per pack). Total shown at the end of each bar. */
export function stackedBars(title: string, rows: { label: string; values: Record<string, number> }[], keys: Key[], opts: { labelWidth?: number } = {}) {
  const LW = opts.labelWidth ?? 170, W = 720, BAR = 18, GAP = 12, TOP = 40, RIGHT = 60;
  const H = TOP + rows.length * (BAR + GAP) + 12;
  const max = Math.max(1, ...rows.map((r) => keys.reduce((s, k) => s + (r.values[k.key] ?? 0), 0)));
  const scale = (W - LW - RIGHT) / max;
  const body = rows
    .map((r, i) => {
      const y = TOP + i * (BAR + GAP);
      let x = LW;
      const total = keys.reduce((s, k) => s + (r.values[k.key] ?? 0), 0);
      const segs = keys
        .filter((k) => (r.values[k.key] ?? 0) > 0)
        .map((k) => {
          const w = Math.max(2, (r.values[k.key] ?? 0) * scale);
          const seg = `<rect x="${x.toFixed(1)}" y="${y}" width="${Math.max(1, w - 2).toFixed(1)}" height="${BAR}" rx="3" fill="${k.color}"><title>${esc(r.label)} - ${esc(k.label)}: ${r.values[k.key]}</title></rect>`;
          x += w;
          return seg;
        })
        .join('');
      return `<text x="${LW - 10}" y="${y + 13}" font-size="12" fill="var(--ink)" text-anchor="end">${esc(r.label)}</text>${segs}
<text x="${(x + 6).toFixed(1)}" y="${y + 13}" font-size="12" fill="var(--ink-2)">${total}</text>`;
    })
    .join('');
  return svg(W, H, `${legend(keys, LW, 22)}${body}`, title);
}

/** Single-series horizontal bars (e.g. duration per pack). */
export function bars(title: string, rows: { label: string; value: number; display?: string }[], opts: { labelWidth?: number; color?: string } = {}) {
  const LW = opts.labelWidth ?? 170, W = 720, BAR = 16, GAP = 10, TOP = 16, RIGHT = 80;
  const H = TOP + rows.length * (BAR + GAP) + 8;
  const max = Math.max(1, ...rows.map((r) => r.value));
  const scale = (W - LW - RIGHT) / max;
  const body = rows
    .map((r, i) => {
      const y = TOP + i * (BAR + GAP);
      const w = Math.max(2, r.value * scale);
      return `<text x="${LW - 10}" y="${y + 12}" font-size="12" fill="var(--ink)" text-anchor="end">${esc(r.label.length > 34 ? r.label.slice(0, 33) + '…' : r.label)}</text>
<rect x="${LW}" y="${y}" width="${w.toFixed(1)}" height="${BAR}" rx="3" fill="${opts.color ?? 'var(--s1)'}"><title>${esc(r.label)}: ${esc(r.display ?? String(r.value))}</title></rect>
<text x="${(LW + w + 6).toFixed(1)}" y="${y + 12}" font-size="12" fill="var(--ink-2)">${esc(r.display ?? String(r.value))}</text>`;
    })
    .join('');
  return svg(W, H, body, title);
}

/** Heatmap: counts on a single-hue sequential scale, with the value printed in each cell. */
export function heatmap(title: string, rowLabels: string[], colLabels: string[], matrix: number[][]) {
  const LW = 150, CW = 92, CH = 30, TOP = 44, W = LW + colLabels.length * CW + 16, H = TOP + rowLabels.length * CH + 12;
  const max = Math.max(1, ...matrix.flat());
  const step = (v: number) => (v === 0 ? 0 : Math.min(5, 1 + Math.floor((v / max) * 4.999)));
  const head = colLabels.map((c, j) => `<text x="${LW + j * CW + CW / 2}" y="${TOP - 12}" font-size="11" fill="var(--ink-2)" text-anchor="middle">${esc(c)}</text>`).join('');
  const cells = rowLabels
    .map((r, i) => `<text x="${LW - 10}" y="${TOP + i * CH + 19}" font-size="12" fill="var(--ink)" text-anchor="end">${esc(r)}</text>` +
      colLabels.map((c, j) => {
        const v = matrix[i][j], s = step(v);
        return `<rect x="${LW + j * CW + 1}" y="${TOP + i * CH + 1}" width="${CW - 2}" height="${CH - 2}" rx="3" fill="var(--seq-${s})"><title>${esc(r)} × ${esc(c)}: ${v} test${v === 1 ? '' : 's'}</title></rect>
<text x="${LW + j * CW + CW / 2}" y="${TOP + i * CH + 19}" font-size="12" text-anchor="middle" fill="${s >= 4 ? '#ffffff' : 'var(--ink)'}">${v || ''}</text>`;
      }).join(''))
    .join('');
  return svg(W, H, head + cells, title);
}

/** Wrap an inline chart SVG as a standalone file with its own light/dark palette. */
export function standalone(svgMarkup: string) {
  const style = `<style>svg{${PALETTE_CSS}} @media (prefers-color-scheme:dark){svg{${PALETTE_DARK_CSS}}}</style>`;
  return svgMarkup.replace(/(<svg[^>]*>)/, `$1\n${style}`);
}
