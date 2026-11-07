import { site } from '@/config/site';

const onlyDigits = (value: string) => value.replace(/\D/g, '');

export const contact = {
  whatsapp: onlyDigits(site.contact.whatsapp),
  email: site.contact.email.trim(),
  profiles: site.contact.profiles
    .map((p) => ({ label: p.label, url: p.url.trim() }))
    .filter((p) => /^https?:\/\//.test(p.url)),
};

export const hasWhatsapp = contact.whatsapp.length >= 10;
export const hasEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email);
export const hasProfile = contact.profiles.length > 0;
export const hasAnyChannel = hasWhatsapp || hasEmail;

export function whatsappLink(message: string = site.contact.whatsappGreeting) {
  return `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(message)}`;
}

export function mailtoLink(subject: string, body: string) {
  return `mailto:${contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/** Formata o número para exibição: 55 11 99999-8888 → +55 (11) 99999-8888 */
export function formatPhone(digits: string) {
  const match = digits.match(/^(\d{2})(\d{2})(\d{4,5})(\d{4})$/);
  return match ? `+${match[1]} (${match[2]}) ${match[3]}-${match[4]}` : `+${digits}`;
}
