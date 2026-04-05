/**
 * Build a WhatsApp deep link (wa.me). `phone` may include +, spaces, dashes.
 */
export function buildWhatsAppUrl(phone: string, text: string): string {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return "";
  const encoded = encodeURIComponent(text);
  return `https://wa.me/${digits}?text=${encoded}`;
}
