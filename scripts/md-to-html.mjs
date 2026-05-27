#!/usr/bin/env node
/**
 * Converte .md do rpg-lotm para .html no padrão do livro (common.css + Mermaid).
 * Uso: npx --yes -p marked node scripts/md-to-html.mjs
 */
import fs from 'fs';
import path from 'path';
import { marked } from 'marked';

const ROOT = path.resolve(import.meta.dirname, '..');

const pages = [
  {
    md: 'livro-mestre/guia-22-caminhos-deuses.md',
    html: 'livro-mestre/guia-22-caminhos-deuses.html',
    title: 'Guia rápido — 22 Caminhos e Deuses · Senhor dos Mistérios RPG',
    css: '../assets/css/common.css',
    printCss: '../assets/css/print.css',
    nav: `
<nav class="book-nav">
  <a href="index.html">&larr; Livro do Mestre</a>
  <a href="01-guia-mestre.html">Capítulo 1 — Guia do Mestre</a>
  <a href="02-mundo.html">Cap. 2 — Lore &rarr;</a>
</nav>`
  },
  {
    md: 'campanhas/exemplo-sessao-iniciantes.md',
    html: 'campanhas/exemplo-sessao-iniciantes.html',
    title: 'Tutorial — Exemplo de sessão · Senhor dos Mistérios RPG',
    css: '../assets/css/common.css',
    printCss: '../assets/css/print.css',
    nav: `
<nav class="book-nav">
  <a href="index.html">&larr; Livro de Campanhas</a>
  <a href="01-sombras-backlund.html">Campanha 1 — Sombras sobre Backlund &rarr;</a>
</nav>`
  },
  {
    md: 'CONTINUIDADE-AGENTE.md',
    html: 'continuidade-agente.html',
    title: 'Continuidade do projeto · Senhor dos Mistérios RPG',
    css: 'assets/css/common.css',
    printCss: 'assets/css/print.css',
    nav: `
<nav class="book-nav">
  <a href="index.html">&larr; Início</a>
  <a href="livro-mestre/index.html">Livro do Mestre</a>
  <a href="campanhas/index.html">Campanhas</a>
</nav>`
  }
];

function escapeHtml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

marked.use({
  gfm: true,
  breaks: false
});

marked.use({
  renderer: {
    code({ text, lang }) {
      if (lang === 'mermaid') {
        return `<div class="mermaid">${text}</div>`;
      }
      const cls = lang ? ` class="language-${lang}"` : '';
      return `<pre><code${cls}>${escapeHtml(text)}</code></pre>`;
    }
  }
});

function slugifyHeading(text) {
  return text
    .replace(/<[^>]+>/g, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

marked.use({
  renderer: {
    heading({ text, depth }) {
      const id = slugifyHeading(text);
      return `<h${depth} id="${id}">${text}</h${depth}>`;
    }
  }
});

function wrapPage(body, cfg) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${cfg.title}</title>
<link rel="stylesheet" href="${cfg.css}">
<link rel="stylesheet" href="${cfg.printCss}">
<style>
.mermaid { margin: 1.5rem auto; max-width: 100%; overflow-x: auto; }
article.md-body pre {
  background: var(--parchment-d, #f5f0e6);
  border: 1px solid var(--gold, #b8860b);
  border-radius: 4px;
  padding: 0.75rem 1rem;
  overflow-x: auto;
  font-size: 0.9em;
  line-height: 1.45;
}
article.md-body pre code { background: none; padding: 0; }
article.md-body hr { border: none; border-top: 1px solid var(--gold, #b8860b); margin: 2rem 0; opacity: 0.5; }
article.md-body table { font-size: 0.92em; }
article.md-body h1:first-child { margin-top: 0; }
</style>
<script type="module">
  import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
  mermaid.initialize({ startOnLoad: true, theme: 'neutral', securityLevel: 'loose' });
</script>
</head>
<body>

<article class="md-body">
${body}
</article>

${cfg.nav}

</body>
</html>
`;
}

for (const cfg of pages) {
  const mdPath = path.join(ROOT, cfg.md);
  const htmlPath = path.join(ROOT, cfg.html);
  const md = fs.readFileSync(mdPath, 'utf8');
  const body = marked.parse(md);
  fs.writeFileSync(htmlPath, wrapPage(body, cfg), 'utf8');
  console.log(`OK ${cfg.html}`);
}
