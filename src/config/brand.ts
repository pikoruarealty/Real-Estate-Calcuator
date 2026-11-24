export const BRAND = {
  name: 'PIKORUA Realty',
  tagline: 'Know the real price of your Ahmedabad home',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  advisorWhatsApp: process.env.NEXT_PUBLIC_ADVISOR_WHATSAPP ?? '916354359222', // country code + number; set the env var to '' to hide the button
  logoPath: '/logo.svg', // TODO(owner): replace placeholder logo
};
