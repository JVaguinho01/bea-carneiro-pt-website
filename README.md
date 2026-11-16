# Beatriz Carneiro Acro — website

Site de página única em **Angular 22** (só front-end, sem back-end nem base de dados).

## Correr localmente

```bash
npm install        # só da primeira vez
npm start          # abre em http://localhost:4200
```

No Windows, se o PowerShell bloquear o `npm`, usa `npm.cmd start`.
No IntelliJ: *File › Open* nesta pasta e corre o script `start` do `package.json`.

Build de produção: `npm run build` → pasta `dist/bea-pt-website/browser` (é isto que se publica).

> Node recomendado: 24 LTS (o Angular 22 não suporta oficialmente o Node 25).

## Onde mexer

| O quê | Onde |
|---|---|
| Cores do site (tema Light e Dark) | `src/styles/_colors.scss` (Light no `:root`, Dark no bloco `prefers-color-scheme: dark`) |
| Tipografia, espaçamentos, raios, breakpoints | `src/styles/_tokens.scss` |
| Classes partilhadas (botões, títulos…) | `src/styles/_components.scss` |
| Textos PT / EN | `src/i18n/pt.json` e `src/i18n/en.json` |
| Contactos, Instagram, CV, LinkedIn | `src/app/core/config/site.config.ts` |
| EmailJS (formulário) | `src/environments/environment.ts` |
| Que foto vai em cada secção | `src/app/data/content.ts` |
| Ícones | `src/app/shared/icons/icons.ts` |

### Fotos
As fotos estão em `public/images/<categoria>/` (`retratos`, `competicao`, `treino`, `pessoal`), cada uma com
versão grande (`nome.webp`) e pequena (`nome-sm.webp`). Depois de acrescentar ou apagar fotos, corre:

```bash
npm run photos
```

As fotos que não estão atribuídas a uma secção em `content.ts` aparecem automaticamente na Galeria.

### Línguas
A língua inicial é a guardada pelo visitante; senão a do browser (português → PT, qualquer outra → EN).
Não há língua no URL. Todas as chaves existem nos dois ficheiros JSON.

## Formulário de contacto (EmailJS)
Ver `SECURITY.md` → secção EmailJS. Enquanto `environment.ts` estiver vazio, o formulário mostra um aviso
e os contactos diretos (email, telefone, WhatsApp) continuam a funcionar.
