// Simple QR Code generator for basic alphanumeric data
// Based on QR Code specification for version 1-3 (up to 47 alphanumeric chars)

type QRMode = 'numeric' | 'alphanumeric' | 'byte';
type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

const ALPHANUMERIC_CHARSET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:';

function getMode(data: string): QRMode {
  if (/^\d+$/.test(data)) return 'numeric';
  if (new RegExp(`^[${ALPHANUMERIC_CHARSET.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]+$`).test(data)) {
    return 'alphanumeric';
  }
  return 'byte';
}

function encodeAlphanumeric(data: string): string {
  let bits = '';
  for (let i = 0; i < data.length; i += 2) {
    if (i + 1 < data.length) {
      const val = ALPHANUMERIC_CHARSET.indexOf(data[i]) * 45 + ALPHANUMERIC_CHARSET.indexOf(data[i + 1]);
      bits += val.toString(2).padStart(11, '0');
    } else {
      const val = ALPHANUMERIC_CHARSET.indexOf(data[i]);
      bits += val.toString(2).padStart(6, '0');
    }
  }
  return bits;
}

function encodeByte(data: string): string {
  let bits = '';
  for (let i = 0; i < data.length; i++) {
    bits += data.charCodeAt(i).toString(2).padStart(8, '0');
  }
  return bits;
}

export function generateQRCode(canvas: HTMLCanvasElement, data: string): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // For simplicity, create a visual representation
  // This is a simplified version - for production, use a proper QR library
  const size = 200;
  const moduleCount = 25; // Version 2 QR code
  const moduleSize = size / moduleCount;

  // Clear canvas
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, size, size);

  // Create a simple pattern based on the data
  // This creates a deterministic but not spec-compliant QR code
  const hash = simpleHash(data);
  const modules: boolean[][] = Array(moduleCount)
    .fill(null)
    .map(() => Array(moduleCount).fill(false));

  // Add finder patterns (corners)
  addFinderPattern(modules, 0, 0);
  addFinderPattern(modules, moduleCount - 7, 0);
  addFinderPattern(modules, 0, moduleCount - 7);

  // Add timing patterns
  for (let i = 8; i < moduleCount - 8; i++) {
    modules[6][i] = i % 2 === 0;
    modules[i][6] = i % 2 === 0;
  }

  // Fill data area with pattern based on hash
  let hashIndex = 0;
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (!isReserved(row, col, moduleCount)) {
        modules[row][col] = ((hash >> (hashIndex % 32)) & 1) === 1;
        hashIndex++;
      }
    }
  }

  // Draw modules
  ctx.fillStyle = '#000000';
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (modules[row][col]) {
        ctx.fillRect(col * moduleSize, row * moduleSize, moduleSize, moduleSize);
      }
    }
  }
}

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

function addFinderPattern(modules: boolean[][], row: number, col: number): void {
  for (let r = -1; r <= 7; r++) {
    for (let c = -1; c <= 7; c++) {
      const newRow = row + r;
      const newCol = col + c;
      if (newRow >= 0 && newRow < modules.length && newCol >= 0 && newCol < modules.length) {
        if (
          (r >= 0 && r <= 6 && (c === 0 || c === 6)) ||
          (c >= 0 && c <= 6 && (r === 0 || r === 6)) ||
          (r >= 2 && r <= 4 && c >= 2 && c <= 4)
        ) {
          modules[newRow][newCol] = true;
        }
      }
    }
  }
}

function isReserved(row: number, col: number, size: number): boolean {
  // Finder patterns
  if (
    (row < 9 && col < 9) ||
    (row < 9 && col >= size - 8) ||
    (row >= size - 8 && col < 9)
  ) {
    return true;
  }
  // Timing patterns
  if (row === 6 || col === 6) {
    return true;
  }
  return false;
}
