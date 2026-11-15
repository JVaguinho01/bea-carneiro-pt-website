/**
 * Dados de contacto e ligações do site. Mudar aqui muda em todo o lado.
 * Nada aqui é secreto: são dados públicos que aparecem no site.
 */
export const SITE = {
  email: 'bcarneiro03@gmail.com',
  phoneE164: '+351930400713',
  whatsappUrl: 'https://wa.me/351930400713',
  instagramUrl: 'https://www.instagram.com/bea_carneiro3/',
  /** PDF do CV em public/cv/. Enquanto não existir, o botão fica escondido. */
  cvUrl: 'cv/cv-beatriz-carneiro.pdf',
  /** LinkedIn do autor do site (crédito no rodapé). */
  authorUrl: 'https://www.linkedin.com/in/jvaguinho/',
} as const;

/** Tema ativo (ver src/styles/themes). */
export const THEME = 'forest';
