export interface WhatsAppMessageInput {
  locale: 'tr' | 'en';
  villaName: string;
  villaCode: number;
  villaUrl?: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  totalTry: number;
  contactName: string;
  contactPhone?: string | null;
  reference: string;
}


export function buildWhatsAppMessage(i: WhatsAppMessageInput): string {
  const fmt = (n: number) => n.toLocaleString(i.locale === 'en' ? 'en-GB' : 'tr-TR');
  const lines =
    i.locale === 'en'
      ? [
          `Hello, I would like to book ${i.villaName} (${i.villaCode}).`,
          `Check-in: ${i.checkIn}`,
          `Check-out: ${i.checkOut} (${i.nights} nights)`,
          `Guests: ${i.guests}`,
          `Estimated total: ₺${fmt(i.totalTry)}`,
          `Name: ${i.contactName}`,
          i.contactPhone ? `Phone: ${i.contactPhone}` : null,
          `Reference: ${i.reference}`,
          i.villaUrl ?? null,
        ]
      : [
          `Merhaba, ${i.villaName} (${i.villaCode}) için rezervasyon yapmak istiyorum.`,
          `Giriş: ${i.checkIn}`,
          `Çıkış: ${i.checkOut} (${i.nights} gece)`,
          `Misafir: ${i.guests}`,
          `Tahmini tutar: ₺${fmt(i.totalTry)}`,
          `Ad Soyad: ${i.contactName}`,
          i.contactPhone ? `Telefon: ${i.contactPhone}` : null,
          `Talep no: ${i.reference}`,
          i.villaUrl ?? null,
        ];
  return lines.filter(Boolean).join('\n');
}

/** https://wa.me/<digits>?text=<urlencoded> — number must be digits only, with country code. */
export function buildWhatsAppUrl(number: string, text: string): string {
  const digits = number.replace(/\D/g, '');
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}
