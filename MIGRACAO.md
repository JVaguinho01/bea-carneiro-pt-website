# Passar o site para as contas da Beatriz

Tudo o que está ligado a contas de teste fica em **dois ficheiros**:
`src/environments/environment.ts` (EmailJS e reCAPTCHA) e `src/app/core/config/site.config.ts` (contactos e links).

## 1. EmailJS (formulário)
1. Criar conta em emailjs.com com o email da Beatriz.
2. Email Services → ligar o Gmail dela → copiar o **Service ID**.
3. Email Templates → recriar o template (ver `SECURITY.md`) → copiar o **Template ID**.
4. Account → General → copiar a **Public Key**.
5. Account → Security → Allowed origins: o domínio final (e `http://localhost:4200` para testes).
6. Trocar os 3 valores em `environment.ts` → `emailjs`.

## 2. reCAPTCHA
1. google.com/recaptcha/admin/create com a conta Google dela → v2 "I'm not a robot".
2. Domains: o domínio final (+ `localhost`).
3. **Site Key** → `environment.ts` → `recaptchaSiteKey`.
4. **Secret Key** → EmailJS → template → Settings → reCAPTCHA V2 (nunca no código).

## 3. GitHub
- Opção A: na conta atual, Settings → Transfer ownership → conta da Beatriz.
- Opção B: criar repositório na conta dela e enviar o código (`git remote set-url origin …` + `git push`).
- No novo repositório: Settings → Pages → Source: **GitHub Actions**.

## 4. Domínio
1. Criar `public/CNAME` com o domínio (ex.: `beatrizcarneiro.pt`), uma linha só.
2. No registo do domínio, DNS:
   - `A` @ → 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153
   - `CNAME` www → `<conta-github>.github.io`
3. GitHub → Settings → Pages → Custom domain → ativar **Enforce HTTPS**.
4. Juntar o domínio ao EmailJS (Allowed origins) e ao reCAPTCHA (Domains).

## 5. Quando o site for oficial
- Remover `<meta name="robots" content="noindex, nofollow">` em `src/index.html`.
