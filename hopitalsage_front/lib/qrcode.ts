// lib/qrcode.ts
import QRCode from 'qrcode';

export const generateQrDataUri = async (data: string): Promise<string> => {
  try {
    return await QRCode.toDataURL(data);
  } catch (error) {
    console.error('Erreur lors de la génération du QR code :', error);
    return '';
  }
};
