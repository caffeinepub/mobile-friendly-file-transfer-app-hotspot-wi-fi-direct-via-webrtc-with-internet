const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed ambiguous chars: I, O, 0, 1

export function generateSessionCode(length: number = 6): string {
  let code = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * ALPHABET.length);
    code += ALPHABET[randomIndex];
  }
  return code;
}

export function validateSessionCode(code: string): boolean {
  if (!code || code.length < 4 || code.length > 8) {
    return false;
  }
  return /^[A-Z0-9]+$/.test(code);
}

export function formatSessionCode(code: string): string {
  return code.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export function createQRPayload(code: string): string {
  return `FILEDROP:${code}`;
}

export function parseQRPayload(payload: string): string | null {
  if (payload.startsWith('FILEDROP:')) {
    return payload.substring(9);
  }
  // Also accept plain codes
  if (validateSessionCode(payload)) {
    return payload;
  }
  return null;
}
