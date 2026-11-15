/**
 * Configuração do EmailJS (envio do formulário sem back-end).
 *
 * Estes três valores são PÚBLICOS por natureza (ficam sempre visíveis no browser).
 * A segurança é feita no painel do EmailJS:
 *   - Account → Security → "Allowed origins": só o domínio do site (e http://localhost:4200 para testes).
 *   - Ativar o limite de pedidos e, se quiseres, o reCAPTCHA no template.
 * NUNCA pôr aqui a "Private Key" do EmailJS.
 *
 * Enquanto estiverem vazios, o formulário mostra uma mensagem a pedir contacto por email/WhatsApp.
 */
export const environment = {
  emailjs: {
    serviceId: 'service_9l0e7wh',
    templateId: 'template_2qdgr9v',
    publicKey: '7YXxUpixldRz7D3Kt',
  },
};
