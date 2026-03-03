/**
 * Minimal QR Code SVG generator — byte mode, EC Level L, versions 1–13.
 * Zero dependencies. Produces a standalone SVG string.
 */

// ── GF(256) with irreducible polynomial x^8+x^4+x^3+x^2+1 (0x11D) ──

const EXP: number[] = [];
const LOG: number[] = new Array(256).fill(0);
(() => {
  let v = 1;
  for (let i = 0; i < 255; i++) {
    EXP[i] = v;
    LOG[v] = i;
    v <<= 1;
    if (v & 256) v ^= 0x11d;
  }
  for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255];
})();

const gfMul = (a: number, b: number): number => (a && b ? EXP[LOG[a] + LOG[b]] : 0);

// ── Reed-Solomon error correction ──

function rsEncode(data: number[], ecLen: number): number[] {
  // Build generator polynomial in ascending degree order
  let g = [1];
  for (let i = 0; i < ecLen; i++) {
    const ng = new Array(g.length + 1).fill(0);
    for (let j = 0; j < g.length; j++) {
      ng[j] ^= gfMul(g[j], EXP[i]);
      ng[j + 1] ^= g[j];
    }
    g = ng;
  }
  // Polynomial division: remainder of data(x)*x^ecLen / g(x)
  const rem = new Array(ecLen).fill(0);
  for (const d of data) {
    const fb = d ^ rem[0];
    for (let j = 0; j < ecLen - 1; j++) {
      rem[j] = rem[j + 1] ^ gfMul(g[ecLen - 1 - j], fb);
    }
    rem[ecLen - 1] = gfMul(g[0], fb);
  }
  return rem;
}

// ── Version tables (EC Level L only) ──

interface VerInfo {
  total: number; ec: number; g1: number; g1d: number; g2: number; g2d: number; align: number[];
}

const VER: VerInfo[] = [
  { total: 0, ec: 0, g1: 0, g1d: 0, g2: 0, g2d: 0, align: [] }, // dummy
  { total: 26, ec: 7, g1: 1, g1d: 19, g2: 0, g2d: 0, align: [] },
  { total: 44, ec: 10, g1: 1, g1d: 34, g2: 0, g2d: 0, align: [6, 18] },
  { total: 70, ec: 15, g1: 1, g1d: 55, g2: 0, g2d: 0, align: [6, 22] },
  { total: 100, ec: 20, g1: 1, g1d: 80, g2: 0, g2d: 0, align: [6, 26] },
  { total: 134, ec: 26, g1: 1, g1d: 108, g2: 0, g2d: 0, align: [6, 30] },
  { total: 172, ec: 18, g1: 2, g1d: 68, g2: 0, g2d: 0, align: [6, 34] },
  { total: 196, ec: 20, g1: 2, g1d: 78, g2: 0, g2d: 0, align: [6, 22, 38] },
  { total: 242, ec: 24, g1: 2, g1d: 97, g2: 0, g2d: 0, align: [6, 24, 42] },
  { total: 292, ec: 30, g1: 2, g1d: 116, g2: 0, g2d: 0, align: [6, 26, 46] },
  { total: 346, ec: 18, g1: 2, g1d: 68, g2: 2, g2d: 69, align: [6, 28, 50] },
  { total: 404, ec: 20, g1: 4, g1d: 81, g2: 0, g2d: 0, align: [6, 30, 54] },
  { total: 466, ec: 24, g1: 2, g1d: 92, g2: 2, g2d: 93, align: [6, 32, 58] },
  { total: 532, ec: 26, g1: 4, g1d: 107, g2: 0, g2d: 0, align: [6, 34, 62] },
];

function dataCapacity(ver: number): number {
  const v = VER[ver];
  return v.g1 * v.g1d + v.g2 * v.g2d;
}

function pickVersion(byteLen: number): number {
  for (let v = 1; v < VER.length; v++) {
    const headerBits = 4 + (v <= 9 ? 8 : 16); // mode indicator + char count
    const available = dataCapacity(v) * 8 - headerBits;
    if (byteLen * 8 <= available) return v;
  }
  throw new Error(`Data too long for QR code (${byteLen} bytes)`);
}

// ── Data encoding (byte mode) ──

function encodeData(bytes: number[], ver: number): number[] {
  const cap = dataCapacity(ver);
  const countBits = ver <= 9 ? 8 : 16;
  const bits: number[] = [];

  const push = (val: number, len: number) => {
    for (let i = len - 1; i >= 0; i--) bits.push((val >> i) & 1);
  };

  push(0b0100, 4); // byte mode indicator
  push(bytes.length, countBits);
  for (const b of bytes) push(b, 8);
  push(0, Math.min(4, cap * 8 - bits.length)); // terminator

  // Pad to byte boundary
  while (bits.length % 8) bits.push(0);

  // Pad codewords
  const padBytes = [0xec, 0x11];
  let pi = 0;
  while (bits.length < cap * 8) {
    push(padBytes[pi], 8);
    pi ^= 1;
  }

  // Convert bits to codewords
  const cw: number[] = [];
  for (let i = 0; i < bits.length; i += 8) {
    let byte = 0;
    for (let j = 0; j < 8; j++) byte = (byte << 1) | bits[i + j];
    cw.push(byte);
  }
  return cw;
}

// ── EC encoding and interleaving ──

function computeCodewords(ver: number, dataCW: number[]): number[] {
  const v = VER[ver];
  const blocks: number[][] = [];
  const ecBlocks: number[][] = [];
  let offset = 0;

  for (let i = 0; i < v.g1; i++) {
    const block = dataCW.slice(offset, offset + v.g1d);
    blocks.push(block);
    ecBlocks.push(rsEncode(block, v.ec));
    offset += v.g1d;
  }
  for (let i = 0; i < v.g2; i++) {
    const block = dataCW.slice(offset, offset + v.g2d);
    blocks.push(block);
    ecBlocks.push(rsEncode(block, v.ec));
    offset += v.g2d;
  }

  // Interleave data
  const result: number[] = [];
  const maxDataLen = Math.max(v.g1d, v.g2d || 0);
  for (let i = 0; i < maxDataLen; i++) {
    for (const block of blocks) {
      if (i < block.length) result.push(block[i]);
    }
  }
  // Interleave EC
  for (let i = 0; i < v.ec; i++) {
    for (const block of ecBlocks) result.push(block[i]);
  }

  return result;
}

// ── Matrix construction ──

const UNSET = -1;
const DARK = 1;
const LIGHT = 0;

function createMatrix(size: number): number[][] {
  return Array.from({ length: size }, () => new Array(size).fill(UNSET));
}

function setModule(m: number[][], r: number, c: number, dark: boolean) {
  if (r >= 0 && r < m.length && c >= 0 && c < m.length) m[r][c] = dark ? DARK : LIGHT;
}

function placeFinderPattern(m: number[][], row: number, col: number) {
  for (let r = -1; r <= 7; r++) {
    for (let c = -1; c <= 7; c++) {
      const dark =
        r >= 0 && r <= 6 && c >= 0 && c <= 6 &&
        (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4));
      setModule(m, row + r, col + c, dark);
    }
  }
}

function placeAlignmentPattern(m: number[][], row: number, col: number) {
  for (let r = -2; r <= 2; r++) {
    for (let c = -2; c <= 2; c++) {
      const dark = Math.abs(r) === 2 || Math.abs(c) === 2 || (r === 0 && c === 0);
      m[row + r][col + c] = dark ? DARK : LIGHT;
    }
  }
}

function isReserved(m: number[][], r: number, c: number): boolean {
  return m[r][c] !== UNSET;
}

function buildMatrix(ver: number, codewords: number[]): number[][] {
  const size = ver * 4 + 17;
  const m = createMatrix(size);

  // Finder patterns + separators
  placeFinderPattern(m, 0, 0);
  placeFinderPattern(m, 0, size - 7);
  placeFinderPattern(m, size - 7, 0);

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    m[6][i] = i % 2 === 0 ? DARK : LIGHT;
    m[i][6] = i % 2 === 0 ? DARK : LIGHT;
  }

  // Alignment patterns
  const ap = VER[ver].align;
  if (ap.length > 0) {
    for (const r of ap) {
      for (const c of ap) {
        // Skip if overlapping finder patterns
        if (r <= 8 && c <= 8) continue;
        if (r <= 8 && c >= size - 8) continue;
        if (r >= size - 8 && c <= 8) continue;
        placeAlignmentPattern(m, r, c);
      }
    }
  }

  // Dark module
  m[4 * ver + 9][8] = DARK;

  // Reserve format info areas (will be filled after masking)
  for (let i = 0; i < 9; i++) {
    if (m[8][i] === UNSET) m[8][i] = LIGHT; // top-left horizontal
    if (m[i][8] === UNSET) m[i][8] = LIGHT; // top-left vertical
  }
  for (let i = 0; i < 8; i++) {
    if (m[8][size - 1 - i] === UNSET) m[8][size - 1 - i] = LIGHT; // top-right
    if (m[size - 1 - i][8] === UNSET) m[size - 1 - i][8] = LIGHT; // bottom-left
  }

  // Reserve version info areas (version >= 7)
  if (ver >= 7) {
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 3; j++) {
        m[i][size - 11 + j] = LIGHT;
        m[size - 11 + j][i] = LIGHT;
      }
    }
  }

  // Place data in zigzag pattern
  let bitIdx = 0;
  const totalBits = codewords.length * 8;
  let upward = true;

  for (let right = size - 1; right >= 0; right -= 2) {
    if (right === 6) right = 5; // skip timing column
    for (let i = 0; i < size; i++) {
      const row = upward ? size - 1 - i : i;
      for (const dc of [0, -1]) {
        const col = right + dc;
        if (col < 0 || col >= size) continue;
        if (isReserved(m, row, col)) continue;
        if (bitIdx < totalBits) {
          const byteIdx = bitIdx >> 3;
          const bitPos = 7 - (bitIdx & 7);
          m[row][col] = (codewords[byteIdx] >> bitPos) & 1;
          bitIdx++;
        } else {
          m[row][col] = LIGHT;
        }
      }
    }
    upward = !upward;
  }

  return m;
}

// ── Masking ──

type MaskFn = (r: number, c: number) => boolean;

const MASKS: MaskFn[] = [
  (r, c) => (r + c) % 2 === 0,
  (r) => r % 2 === 0,
  (_, c) => c % 3 === 0,
  (r, c) => (r + c) % 3 === 0,
  (r, c) => (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0,
  (r, c) => ((r * c) % 2) + ((r * c) % 3) === 0,
  (r, c) => (((r * c) % 2) + ((r * c) % 3)) % 2 === 0,
  (r, c) => (((r + c) % 2) + ((r * c) % 3)) % 2 === 0,
];

function applyMask(m: number[][], maskIdx: number, template: number[][]): number[][] {
  const size = m.length;
  const result = m.map((row) => [...row]);
  const fn = MASKS[maskIdx];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (template[r][c] !== UNSET) continue; // reserved area
      if (fn(r, c)) result[r][c] ^= 1;
    }
  }
  return result;
}

function penalty(m: number[][]): number {
  const size = m.length;
  let score = 0;

  // Rule 1: consecutive same-color modules
  for (let r = 0; r < size; r++) {
    let count = 1;
    for (let c = 1; c < size; c++) {
      if (m[r][c] === m[r][c - 1]) { count++; } else {
        if (count >= 5) score += count - 2;
        count = 1;
      }
    }
    if (count >= 5) score += count - 2;
  }
  for (let c = 0; c < size; c++) {
    let count = 1;
    for (let r = 1; r < size; r++) {
      if (m[r][c] === m[r - 1][c]) { count++; } else {
        if (count >= 5) score += count - 2;
        count = 1;
      }
    }
    if (count >= 5) score += count - 2;
  }

  // Rule 2: 2x2 blocks
  for (let r = 0; r < size - 1; r++) {
    for (let c = 0; c < size - 1; c++) {
      const v = m[r][c];
      if (v === m[r][c + 1] && v === m[r + 1][c] && v === m[r + 1][c + 1]) score += 3;
    }
  }

  // Rule 3: finder-like patterns
  const pat1 = [1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0];
  const pat2 = [0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c <= size - 11; c++) {
      let match1 = true, match2 = true;
      for (let k = 0; k < 11; k++) {
        if (m[r][c + k] !== pat1[k]) match1 = false;
        if (m[r][c + k] !== pat2[k]) match2 = false;
      }
      if (match1 || match2) score += 40;
    }
  }
  for (let c = 0; c < size; c++) {
    for (let r = 0; r <= size - 11; r++) {
      let match1 = true, match2 = true;
      for (let k = 0; k < 11; k++) {
        if (m[r + k][c] !== pat1[k]) match1 = false;
        if (m[r + k][c] !== pat2[k]) match2 = false;
      }
      if (match1 || match2) score += 40;
    }
  }

  // Rule 4: dark/light ratio
  let dark = 0;
  for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) if (m[r][c]) dark++;
  const pct = (dark * 100) / (size * size);
  const prev5 = Math.floor(pct / 5) * 5;
  const next5 = prev5 + 5;
  score += Math.min(Math.abs(prev5 - 50) / 5, Math.abs(next5 - 50) / 5) * 10;

  return score;
}

// ── Format & version information ──

function bchEncode(data: number, gen: number, dataBits: number): number {
  let d = data << (15 - dataBits); // Shift depends on total - data bits
  const genLen = Math.floor(Math.log2(gen)) + 1;
  const totalBits = dataBits + (genLen - 1);
  d = data << (totalBits - dataBits);
  for (let i = dataBits - 1; i >= 0; i--) {
    if (d & (1 << (i + genLen - 1))) d ^= gen << i;
  }
  return (data << (genLen - 1)) | d;
}

function placeFormatInfo(m: number[][], maskIdx: number) {
  const size = m.length;
  // EC Level L = 01, mask pattern = maskIdx (3 bits)
  const data = (0b01 << 3) | maskIdx;
  let format = bchEncode(data, 0x537, 5);
  format ^= 0x5412;

  // Place around top-left finder
  const bits: number[] = [];
  for (let i = 14; i >= 0; i--) bits.push((format >> i) & 1);

  // Horizontal: left side of top-left finder + right side
  const hPos = [0, 1, 2, 3, 4, 5, 7, 8, size - 8, size - 7, size - 6, size - 5, size - 4, size - 3, size - 2];
  for (let i = 0; i < 15; i++) m[8][hPos[i]] = bits[i];

  // Vertical: bottom side of top-left finder + top side of bottom-left
  const vPos = [size - 1, size - 2, size - 3, size - 4, size - 5, size - 6, size - 7, size - 8, 7, 5, 4, 3, 2, 1, 0];
  for (let i = 0; i < 15; i++) m[vPos[i]][8] = bits[i];
}

function placeVersionInfo(m: number[][], ver: number) {
  if (ver < 7) return;
  const size = m.length;
  let info = bchEncode(ver, 0x1f25, 6);
  for (let i = 0; i < 18; i++) {
    const bit = (info >> i) & 1;
    const r = Math.floor(i / 3);
    const c = size - 11 + (i % 3);
    m[r][c] = bit;
    m[c][r] = bit;
  }
}

// ── Public API ──

export function generateQrSvg(text: string, moduleSize = 4): string {
  const bytes = Array.from(new TextEncoder().encode(text));
  const ver = pickVersion(bytes.length);
  const dataCW = encodeData(bytes, ver);
  const allCW = computeCodewords(ver, dataCW);
  const size = ver * 4 + 17;

  // Build template (tracks reserved areas)
  const template = createMatrix(size);
  placeFinderPattern(template, 0, 0);
  placeFinderPattern(template, 0, size - 7);
  placeFinderPattern(template, size - 7, 0);
  for (let i = 8; i < size - 8; i++) {
    template[6][i] = LIGHT;
    template[i][6] = LIGHT;
  }
  const ap = VER[ver].align;
  for (const r of ap) {
    for (const c of ap) {
      if (r <= 8 && c <= 8) continue;
      if (r <= 8 && c >= size - 8) continue;
      if (r >= size - 8 && c <= 8) continue;
      for (let dr = -2; dr <= 2; dr++) for (let dc = -2; dc <= 2; dc++) template[r + dr][c + dc] = LIGHT;
    }
  }
  template[4 * ver + 9][8] = LIGHT;
  for (let i = 0; i < 9; i++) {
    if (template[8][i] === UNSET) template[8][i] = LIGHT;
    if (template[i][8] === UNSET) template[i][8] = LIGHT;
  }
  for (let i = 0; i < 8; i++) {
    if (template[8][size - 1 - i] === UNSET) template[8][size - 1 - i] = LIGHT;
    if (template[size - 1 - i][8] === UNSET) template[size - 1 - i][8] = LIGHT;
  }
  if (ver >= 7) {
    for (let i = 0; i < 6; i++) for (let j = 0; j < 3; j++) {
      template[i][size - 11 + j] = LIGHT;
      template[size - 11 + j][i] = LIGHT;
    }
  }

  // Build matrix with data
  const base = buildMatrix(ver, allCW);

  // Try all 8 masks, pick lowest penalty
  let bestMask = 0;
  let bestScore = Infinity;
  for (let mask = 0; mask < 8; mask++) {
    const masked = applyMask(base, mask, template);
    placeFormatInfo(masked, mask);
    placeVersionInfo(masked, ver);
    const s = penalty(masked);
    if (s < bestScore) { bestScore = s; bestMask = mask; }
  }

  const final = applyMask(base, bestMask, template);
  placeFormatInfo(final, bestMask);
  placeVersionInfo(final, ver);

  // Render SVG
  const quiet = 4; // quiet zone modules
  const total = size + quiet * 2;
  const px = total * moduleSize;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${total} ${total}" width="${px}" height="${px}" shape-rendering="crispEdges">`;
  svg += `<rect width="${total}" height="${total}" fill="#fff"/>`;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (final[r][c] === DARK) {
        svg += `<rect x="${c + quiet}" y="${r + quiet}" width="1" height="1" fill="#000"/>`;
      }
    }
  }
  svg += '</svg>';
  return svg;
}
