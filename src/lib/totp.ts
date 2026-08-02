import 'server-only';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';

authenticator.options = { window: 1 };

export function generateTotpSecret(): string {
  return authenticator.generateSecret();
}

export function verifyTotp(token: string, secret: string): boolean {
  try {
    return authenticator.verify({ token, secret });
  } catch {
    return false;
  }
}

/** Build an otpauth:// URI and a data-URL QR image for authenticator apps. */
export async function buildTotpEnrollment(
  email: string,
  secret: string,
  issuer = 'FUMA LOUNGE',
): Promise<{ otpauth: string; qrDataUrl: string }> {
  const otpauth = authenticator.keyuri(email, issuer, secret);
  const qrDataUrl = await QRCode.toDataURL(otpauth, {
    margin: 1,
    color: { dark: '#0E0E0E', light: '#E8DCC4' },
  });
  return { otpauth, qrDataUrl };
}
