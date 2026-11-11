import { buildWhatsAppMessage, buildWhatsAppUrl } from './whatsapp.js';

describe('whatsapp', () => {
  const base = {
    villaName: 'Villa Test',
    villaCode: 7,
    checkIn: '2030-05-01',
    checkOut: '2030-05-04',
    nights: 3,
    guests: 2,
    totalTry: 15600,
    contactName: 'Ali',
    reference: 'ABC123',
  };

  it('builds a Turkish message with TR number formatting', () => {
    const msg = buildWhatsAppMessage({ ...base, locale: 'tr' });
    expect(msg).toContain('Villa Test (7) için rezervasyon');
    expect(msg).toContain('Tahmini tutar: ₺15.600');
    expect(msg).not.toContain('Telefon');
  });

  it('builds an English message', () => {
    const msg = buildWhatsAppMessage({ ...base, locale: 'en', contactPhone: '+90 555' });
    expect(msg).toContain('Estimated total: ₺15,600');
    expect(msg).toContain('Phone: +90 555');
  });

  it('strips non-digits from the number and encodes the text', () => {
    expect(buildWhatsAppUrl('+90 (500) 000-0000', 'a b\nc')).toBe('https://wa.me/905000000000?text=a%20b%0Ac');
  });
});
