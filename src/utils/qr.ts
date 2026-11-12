import QRCode from 'qrcode';

export async function generateQrDataUrl(text: string): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      width: 280,
      margin: 1.5,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    });
  } catch (err) {
    console.error('Failed to generate QR Code:', err);
    return '';
  }
}

export function parseInstrumentFromQr(qrContent: string): string | null {
  // Format can be "LAB-QR-INST-001" or URL or JSON
  const match = qrContent.match(/INST-\d+/i);
  if (match) {
    return match[0].toUpperCase();
  }
  return null;
}
