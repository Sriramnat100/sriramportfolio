// Foellinger Auditorium on the Main Quad, as line art. Drawn from the front,
// in a 1200-wide coordinate space: lawn and balustrade, the stepped podium,
// the six-column portico (1-2-2-1), the brick attic, the copper cornice, and
// the ribbed dome with its lantern — flanked by trees. The scene draws the
// groups in this order as the page scrolls.

export type Stroke = { d: string; o: number; fill?: boolean };
export type Group = { key: string; strokes: Stroke[] };

const f = (n: number) => Math.round(n * 10) / 10;
const rect = (x0: number, y0: number, x1: number, y1: number) => `M${x0} ${y0} H${x1} V${y1} H${x0} Z`;

// ------------------------------------------------------------------- ground
const ground: Stroke[] = [
  { d: "M0 700 H1200", o: 0.5 },
  // Walkways crossing the lawn toward the auditorium.
  { d: "M600 702 L40 770", o: 0.28 },
  { d: "M612 702 L1170 770", o: 0.28 },
  { d: "M150 770 L700 704", o: 0.22 },
  { d: "M1060 770 L520 704", o: 0.22 },
  // Balustrade in front of the building.
  { d: "M40 668 H1160 M40 690 H1160", o: 0.55 },
  {
    d: Array.from({ length: 21 }, (_, i) => 40 + i * 56)
      .map((x) => `M${x} 668 V690`)
      .join(" "),
    o: 0.4,
  },
];

// ------------------------------------------------------------------- body
const COLS = [418, 520, 553, 654, 688, 788];
const body: Stroke[] = [
  // Podium and steps.
  { d: "M300 630 H910 M300 630 V668 M910 630 V668", o: 0.8 },
  { d: "M360 640 H850 M352 650 H858 M344 660 H866", o: 0.55 },
  // Main block and the portico edges.
  { d: "M285 364 V630 M925 364 V630", o: 0.9 },
  { d: "M398 432 V630 M812 432 V630", o: 0.6 },
  // Entablature.
  { d: "M272 370 H938 M278 380 H932", o: 0.9 },
  { d: "M285 392 H925 M285 432 H925", o: 0.7 },
  // Columns: shaft, capital, base.
  ...COLS.map((c) => ({
    d: `M${c - 12} 442 V622 M${c + 12} 442 V622 M${c - 17} 436 H${c + 17} M${c - 15} 442 H${c + 15} M${c - 16} 622 H${c + 16} M${c - 18} 630 H${c + 18}`,
    o: 0.95,
  })),
  // Side wings, set back.
  { d: "M150 392 H285 M150 402 H285 M150 392 V668", o: 0.5 },
  { d: "M925 392 H1060 M925 402 H1060 M1060 392 V668", o: 0.5 },
];

// ------------------------------------------------------------------- details
const BAYS = [469, 603, 738];
const details: Stroke[] = [
  ...BAYS.map((c) => ({ d: rect(c - 30, 450, c + 30, 494), o: 0.55 })),
  ...BAYS.map((c) => ({
    d: `M${c - 30} 628 V556 A30 30 0 0 1 ${c + 30} 556 V628 M${c - 30} 574 H${c + 30} M${c - 10} 574 V628 M${c + 10} 574 V628`,
    o: 0.75,
  })),
  ...BAYS.map((c) => ({ d: `M${c - 5} 530 a5 5 0 1 0 10 0 a5 5 0 1 0 -10 0`, o: 0.6 })),
  // Side-bay windows and plaques.
  { d: rect(322, 440, 362, 492) + " " + rect(322, 556, 362, 612) + " " + rect(326, 516, 358, 534), o: 0.6 },
  { d: rect(848, 440, 888, 492) + " " + rect(848, 556, 888, 612) + " " + rect(852, 516, 884, 534), o: 0.6 },
  // Wing windows.
  { d: rect(182, 450, 216, 500) + " " + rect(182, 560, 216, 610), o: 0.4 },
  { d: rect(994, 450, 1028, 500) + " " + rect(994, 560, 1028, 610), o: 0.4 },
  // Attic and its five panels.
  { d: "M285 322 V364 M925 322 V364", o: 0.8 },
  { d: [340, 470, 603, 737, 866].map((c) => rect(c - 30, 336, c + 30, 352)).join(" "), o: 0.5 },
  // Lamp posts at the steps.
  { d: "M383 668 V568 M376 562 a7 7 0 1 0 14 0 a7 7 0 1 0 -14 0", o: 0.6 },
  { d: "M825 668 V568 M818 562 a7 7 0 1 0 14 0 a7 7 0 1 0 -14 0", o: 0.6 },
];

// ------------------------------------------------------------------- dome
const CX = 605;
const BASE = 272;
const TOP = 150;
const RX = 305;
const RTOP = 117;
const PHI_TOP = Math.asin(RTOP / RX);
const domePoint = (phi: number, theta: number) => {
  const x = CX + RX * Math.sin(phi) * Math.sin(theta);
  const y = BASE - (BASE - TOP) * (Math.cos(phi) / Math.cos(PHI_TOP)) + 14 * Math.cos(theta) * Math.pow(Math.sin(phi), 6);
  return `${f(x)} ${f(y)}`;
};
const meridian = (theta: number) =>
  Array.from({ length: 16 }, (_, k) => domePoint(PHI_TOP + ((Math.PI / 2 - PHI_TOP) * k) / 15, theta))
    .map((p, i) => `${i ? "L" : "M"}${p}`)
    .join(" ");

const dome: Stroke[] = [
  // Copper cornice, with a row of dentils.
  { d: "M258 298 H952 M262 306 H948 M270 322 H940", o: 0.85 },
  {
    d: Array.from({ length: 38 }, (_, i) => 276 + i * 17.6)
      .map((x) => `M${f(x)} 310 V318`)
      .join(" "),
    o: 0.4,
  },
  // Silhouette and base of the dome.
  { d: meridian(-Math.PI / 2), o: 0.95 },
  { d: meridian(Math.PI / 2), o: 0.95 },
  { d: "M300 272 Q605 300 910 272", o: 0.8 },
  // Ribs.
  ...Array.from({ length: 13 }, (_, i) => ({ d: meridian(((-80 + (i * 160) / 12) * Math.PI) / 180), o: 0.55 })),
  // Lantern and finial.
  { d: "M488 150 Q605 160 722 150 M492 150 V136 M718 150 V136 M492 136 Q605 126 718 136", o: 0.9 },
  { d: "M605 128 V104 M601 98 a4 4 0 1 0 8 0 a4 4 0 1 0 -8 0", o: 0.9 },
];

// ------------------------------------------------------------------- trees
// Canopies are irregular closed curves filled with black, so they sit in
// front of the building and hide the lines behind them.
function canopy(cx: number, cy: number, rx: number, ry: number, seed: number) {
  // Several overlapping frequencies give lobes of different sizes, which
  // reads as foliage rather than a round blob.
  const n = 30;
  const pts = Array.from({ length: n }, (_, k) => {
    const a = (k / n) * Math.PI * 2;
    const r =
      1 +
      0.09 * Math.sin(3 * a + seed) +
      0.06 * Math.sin(7 * a + seed * 2.1) +
      0.045 * Math.sin(13 * a + seed * 3.3) +
      0.03 * Math.cos(19 * a + seed);
    return [cx + Math.cos(a) * rx * r, cy + Math.sin(a) * ry * r];
  });
  const mid = (a: number[], b: number[]) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  let d = `M${f(mid(pts[n - 1], pts[0])[0])} ${f(mid(pts[n - 1], pts[0])[1])}`;
  for (let k = 0; k < n; k++) {
    const p = pts[k];
    const m = mid(p, pts[(k + 1) % n]);
    d += ` Q${f(p[0])} ${f(p[1])} ${f(m[0])} ${f(m[1])}`;
  }
  return d + " Z";
}
function tree(cx: number, cy: number, rx: number, ry: number, seed: number): Stroke[] {
  const top = cy + ry * 0.55;
  return [
    { d: canopy(cx, cy, rx, ry, seed), o: 0.55, fill: true },
    {
      d: `M${cx - 7} 700 L${cx - 5} ${f(top)} M${cx + 7} 700 L${cx + 5} ${f(top)} M${cx} ${f(top)} L${f(cx - rx * 0.32)} ${f(cy)} M${cx} ${f(top + 10)} L${f(cx + rx * 0.36)} ${f(cy - ry * 0.12)}`,
      o: 0.45,
    },
  ];
}
// Back trees first, so the nearer ones overlap them.
const trees: Stroke[] = [
  ...tree(95, 430, 115, 155, 4.1),
  ...tree(215, 480, 95, 125, 1.3),
  ...tree(1115, 425, 118, 160, 5.6),
  ...tree(1010, 485, 92, 120, 2.2),
];

export const FOELLINGER: Group[] = [
  { key: "ground", strokes: ground },
  { key: "body", strokes: body },
  { key: "details", strokes: details },
  { key: "dome", strokes: dome },
  { key: "trees", strokes: trees },
];
