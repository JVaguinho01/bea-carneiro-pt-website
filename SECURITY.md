# Segurança

O site é estático (HTML, CSS, JS e imagens): não tem servidor próprio, base de dados nem contas,
por isso a superfície de ataque é pequena. O que foi feito:

## No código
- **Sem segredos no bundle.** O único valor de terceiros é a *Public Key* do EmailJS, que é pública por
  natureza. Nunca colocar a *Private Key* do EmailJS no projeto.
- **Content Security Policy** em `src/index.html`: só scripts, estilos, fontes e imagens do próprio site;
  o único pedido externo permitido é `https://api.emailjs.com`. Sem `eval`, sem iframes, sem plugins.
- **Fontes e imagens servidas localmente** (sem Google Fonts nem embeds do Instagram): sem cookies nem
  rastreio de terceiros.
- **Fotos sem metadados** (EXIF/GPS removidos na conversão para WebP).
- **Angular** escapa todo o texto nos templates (proteção contra XSS); não se usa `innerHTML`.
- **Links externos** com `rel="noopener noreferrer"`.
- **Formulário:** validação de todos os campos (tamanho, formato), limpeza de caracteres de controlo,
  campo isco escondido (honeypot), tempo mínimo de preenchimento, limite de 3 envios / 10 min por browser,
  1 envio / 30 s (EmailJS `limitRate`) e bloqueio de browsers automáticos (`blockHeadless`).
- **Ficheiros sensíveis:** nada fora de `public/` é publicado. O build de produção não gera *source maps*.

## EmailJS (configurar uma vez)
1. Criar conta grátis em <https://www.emailjs.com>.
2. *Email Services* → ligar o Gmail da Beatriz (bcarneiro03@gmail.com) → copiar o **Service ID**.
3. *Email Templates* → criar um template com:
   - Assunto: `[Site] {{subject}}`
   - Corpo: `Nome: {{from_name}}` / `Email: {{reply_to}}` / `Língua: {{site_language}}` / `{{message}}`
   - *Reply To*: `{{reply_to}}` (para responder diretamente ao visitante)
   - copiar o **Template ID**.
4. *Account → General* → copiar a **Public Key**.
5. *Account → Security*:
   - **Allowed origins / domains:** só o domínio final do site (e `http://localhost:4200` enquanto se testa).
   - Ativar o limite de pedidos.
6. Pôr os três valores em `src/environments/environment.ts`.

## No alojamento (quando se publicar)
A CSP já vai no HTML, mas estes cabeçalhos devem ser enviados pelo servidor/alojamento:

```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self' https://api.emailjs.com; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
```

E ainda: servir só por HTTPS; redirecionar todos os caminhos desconhecidos para `index.html`
(as rotas `/pt` e `/en` são do Angular); não publicar nada além de `dist/bea-pt-website/browser`.
