#!/usr/bin/env node
/**
 * Gera fichas preenchidas da mini-campanha Patrulha Noturna.
 * Uso: node scripts/build-pregen-fichas.mjs
 */
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(import.meta.dirname, '..');
const TEMPLATE = path.join(ROOT, 'apendices/ficha-exemplo-leitor-seq9.html');
const OUT_DIR = path.join(ROOT, 'campanhas/pregens');

const templateHtml = fs.readFileSync(TEMPLATE, 'utf8');
const styleMatch = templateHtml.match(/<style>([\s\S]*?)<\/style>/);
if (!styleMatch) throw new Error('Style block not found in template');
const STYLES = styleMatch[1];

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function fmtMod(n) {
  if (n > 0) return `+${n}`;
  return String(n);
}

function attrDots(n) {
  return Array.from({ length: 5 }, (_, i) =>
    `<span class="dot${i < n ? ' dot-filled' : ''}"></span>`
  ).join('');
}

function skillDots(n) {
  return Array.from({ length: 5 }, (_, i) =>
    `<span class="skill-dot${i < n ? ' skill-dot-filled' : ''}"></span>`
  ).join('');
}

function skillModClass(m) {
  return m < 0 ? ' skill-mod-neg' : '';
}

function skillRow(label, sub, val) {
  const mod = val - 2;
  const zero = val === 0 ? ' skill-val-zero' : '';
  return `<div class="skill-row">
          <span class="skill-name">${label} <span style="font-size:5.5pt;color:#888;">${sub}</span></span>
          <span class="skill-dots">${skillDots(val)}</span>
          <span class="skill-val${zero}">${val}</span>
          <span class="skill-mod${skillModClass(mod)}">${fmtMod(mod)}</span>
        </div>`;
}

const SKILLS = {
  combat: [
    ['Luta', 'Melee', 'luta'],
    ['Armas de Fogo', 'Firearms', 'armas'],
    ['Esquiva', 'Dodge', 'esquiva'],
    ['Atletismo', 'Athletics', 'atletismo']
  ],
  social: [
    ['Persuas&atilde;o', 'Persuasion', 'persuasao'],
    ['Intimid.', 'Intim.', 'intimidacao'],
    ['Etiqueta', 'Etiquette', 'etiqueta'],
    ['Dissimul.', 'Subt.', 'dissimulacao'],
    ['Lideran&ccedil;a', 'Leadership', 'lideranca'],
    ['Empatia', 'Empathy', 'empatia'],
    ['Manha', 'Streetwise', 'manha']
  ],
  knowledge: [
    ['Investig.', 'Invest.', 'investigacao'],
    ['Ocultismo', 'Occultism', 'ocultismo'],
    ['Perc.Esp.', 'Spirit.', 'percEsp'],
    ['Medicina', 'Medicine', 'medicina'],
    ['Ci&ecirc;ncias', 'Sciences', 'ciencias'],
    ['Hist&oacute;ria', 'History', 'historia'],
    ['Adivinh.', 'Divin.', 'adivinhacao'],
    ['Ritualismo', 'Ritualism', 'ritualismo'],
    ['Sobreviv.', 'Surv.', 'sobrevivencia']
  ]
};

function skillsBlock(skills) {
  const sections = [
    ['Combate', 'combat'],
    ['Social', 'social'],
    ['Conhecimento', 'knowledge']
  ];
  return sections.map(([title, key]) => {
    const rows = SKILLS[key].map(([label, sub, id]) =>
      skillRow(label, sub, skills[id] ?? 0)
    ).join('\n        ');
    return `<div>
        <div class="attr-category">${title}</div>
        ${rows}
      </div>`;
  }).join('\n\n      ');
}

function digestCells(filled) {
  return Array.from({ length: 10 }, (_, i) =>
    `<span class="digest-cell${i < filled ? ' digest-cell-filled' : ''}"></span>`
  ).join('');
}

function powerBlock(p) {
  if (!p) {
    return `<div class="power-block">
        <div class="power-title-row">
          <span class="power-lbl">Nome</span>
          <span class="power-name power-fill"></span>
          <span class="power-lbl">Custo</span>
          <span class="power-cost power-fill"></span>
        </div>
        <div class="power-meta-row">
          <div class="power-meta"><span class="power-lbl">A&ccedil;&atilde;o</span><span class="power-meta-val power-fill"></span></div>
          <div class="power-meta"><span class="power-lbl">Alcance</span><span class="power-meta-val power-fill"></span></div>
          <div class="power-meta"><span class="power-lbl">Dura&ccedil;&atilde;o</span><span class="power-meta-val power-fill"></span></div>
        </div>
        <div class="power-effect"></div>
      </div>`;
  }
  return `<div class="power-block">
        <div class="power-title-row">
          <span class="power-lbl">Nome</span>
          <span class="power-name">${p.name}</span>
          <span class="power-lbl">Custo</span>
          <span class="power-cost">${p.cost}</span>
        </div>
        <div class="power-meta-row">
          <div class="power-meta"><span class="power-lbl">A&ccedil;&atilde;o</span><span class="power-meta-val">${p.action}</span></div>
          <div class="power-meta"><span class="power-lbl">Alcance</span><span class="power-meta-val">${p.range}</span></div>
          <div class="power-meta"><span class="power-lbl">Dura&ccedil;&atilde;o</span><span class="power-meta-val">${p.duration}</span></div>
        </div>
        <div class="power-effect">${p.effect}</div>
      </div>`;
}

function weaponSlot(w) {
  if (!w) {
    return `<div class="weapon-slot">
        <div><span class="ws-label">Arma</span><span class="ws-line">&mdash;</span></div>
        <div><span class="ws-label">Dano</span><span class="ws-line">&mdash;</span></div>
        <div><span class="ws-label">Alcance</span><span class="ws-line">&mdash;</span></div>
        <div><span class="ws-label">Propriedades</span><span class="ws-line">&mdash;</span></div>
      </div>`;
  }
  return `<div class="weapon-slot">
        <div><span class="ws-label">Arma</span><span class="ws-line">${w.name}</span></div>
        <div><span class="ws-label">Dano</span><span class="ws-line">${w.damage}</span></div>
        <div><span class="ws-label">Alcance</span><span class="ws-line">${w.range}</span></div>
        <div><span class="ws-label">Propriedades</span><span class="ws-line">${w.props}</span></div>
      </div>`;
}

function buildSheet(c) {
  const attrs = c.attrs;
  const attrGroups = [
    ['F&iacute;sicos', [
      ['For&ccedil;a', 'STR', attrs.forca],
      ['Destreza', 'DEX', attrs.destreza],
      ['Vigor', 'STA', attrs.vigor]
    ]],
    ['Sociais', [
      ['Carisma', 'CHA', attrs.carisma],
      ['Manipula&ccedil;&atilde;o', 'MAN', attrs.manipulacao],
      ['Apar&ecirc;ncia', 'APP', attrs.aparencia]
    ]],
    ['Mentais', [
      ['Percep&ccedil;&atilde;o', 'PER', attrs.percepcao],
      ['Intelig&ecirc;ncia', 'INT', attrs.inteligencia],
      ['Determina&ccedil;&atilde;o', 'RES', attrs.determinacao]
    ]]
  ];

  const attrHtml = attrGroups.map(([cat, rows]) => {
    const rowHtml = rows.map(([name, abbr, a]) => {
      const mod = a.val - 2;
      const modStr = mod > 0 ? `+${mod}` : mod === 0 ? '0' : `&minus;${-mod}`;
      return `<div class="attr-row">
          <span class="attr-name">${name} <span style="font-size:6pt;color:#888;">${abbr}</span></span>
          <span class="attr-dots">${attrDots(a.val)}</span>
          <span class="attr-mod">${modStr}</span>
        </div>`;
    }).join('\n        ');
    return `<div>
        <div class="attr-category">${cat}</div>
        ${rowHtml}
      </div>`;
  }).join('\n\n      ');

  const powers = [...c.powers, null, null, null, null, null].slice(0, 6);
  const weapons = [...c.weapons, null, null].slice(0, 3);
  const items = c.items.map(i => `<div class="item-line">${i}</div>`).join('\n        ');
  const conns = c.connections.map(conn => `<div>
        <div class="conn-slot">
          <div class="field"><span class="field-label" style="min-width:30pt;font-size:6.5pt;">Nome</span><span class="field-line-fill">${conn.name}</span></div>
          <div class="field"><span class="field-label" style="min-width:30pt;font-size:6.5pt;">Rela&ccedil;&atilde;o</span><span class="field-line-fill">${conn.rel}</span></div>
        </div>
        <div style="font-size:7pt;min-height:14pt;border-bottom:1px dotted #ccc;"></div>
      </div>`).join('\n      ');

  const history = c.history.map(h => `<div class="n-line">${h}</div>`).join('\n        ');
  const notes = c.notes.map(n => `<div class="n-line">${n}</div>`).join('\n        ');

  const saveCorpo = fmtMod(c.saves.corpo);
  const saveMente = fmtMod(c.saves.mente);
  const saveEsp = fmtMod(c.saves.espirito);

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(c.title)}</title>
<link rel="stylesheet" href="../../assets/css/common.css">
<link rel="stylesheet" href="../../assets/css/print.css">
<style>${STYLES}</style>
</head>
<body>

<div class="screen-instructions no-print">
  <strong>Pregen &mdash; Patrulha Noturna</strong> &middot; <em>${c.name}</em>, ${c.pathLabel}, Seq.&nbsp;9 ${c.seqName}.
  Mini-campanha: <a href="../00-patrulha-noturna.html">Patrulha Noturna</a> &middot;
  Tutorial (Sess&atilde;o 1): <a href="../exemplo-sessao-iniciantes.html">O Sussurro na Oficina</a>.<br>
  <strong>Instru&ccedil;&otilde;es:</strong> <kbd>Ctrl+P</kbd> / <kbd>Cmd+P</kbd> &rarr; A4, margens m&iacute;nimas, gr&aacute;ficos de fundo ativados. Ficha em 2 p&aacute;ginas.
</div>

<div class="sheet" id="page1">
  <div class="sheet-title">Senhor dos Mist&eacute;rios &mdash; Ficha de Personagem</div>
  <div class="sheet-subtitle">PREGEN &middot; ${c.pathLabel} &middot; Seq. 9 &mdash; ${c.seqName}</div>

  <div class="s-box">
    <div class="grid-3">
      <div class="field">
        <span class="field-label">Personagem</span>
        <span class="field-line-fill"><strong>${c.name}</strong> &middot; ${c.age} anos</span>
      </div>
      <div class="field">
        <span class="field-label">Jogador</span>
        <span class="field-line-fill">${c.playerSlot}</span>
      </div>
      <div class="field">
        <span class="field-label">Campanha</span>
        <span class="field-line-fill">Patrulha Noturna &mdash; East Borough</span>
      </div>
    </div>
    <div class="grid-4">
      <div class="field">
        <span class="field-label">Conceito</span>
        <span class="field-line-fill">${c.concept}</span>
      </div>
      <div class="field">
        <span class="field-label">Antecedente</span>
        <span class="field-line-fill">${c.background}</span>
      </div>
      <div class="field">
        <span class="field-label">Caminho</span>
        <span class="field-line-fill">${c.pathFull}</span>
      </div>
      <div class="field">
        <span class="field-label">Seq.</span>
        <span class="field-line-fill"><strong>9</strong> &mdash; ${c.seqName} (<em>${c.seqEn}</em>)</span>
      </div>
    </div>
    <div class="field" style="max-width: 50%;">
      <span class="field-label">Digest&atilde;o</span>
      <span class="digest-bar">${digestCells(c.digestFilled)}<span class="digest-pct">( 0 % )</span></span>
    </div>
  </div>

  <div class="s-box">
    <div class="s-box-title">Atributos <span style="font-weight:400;color:#888;font-size:7pt;"> (${c.attrNote})</span></div>
    <div class="grid-3">
      ${attrHtml}
    </div>
  </div>

  <div class="s-box">
    <div class="s-box-title">Per&iacute;cias <span style="font-weight:400;color:#888;font-size:7pt;"> (&#9679; = valor 0&ndash;5 &middot; Mod = Valor &minus; 2 &middot; ${c.skillNote})</span></div>
    <div class="grid-3 skill-cols">
      ${skillsBlock(c.skills)}
    </div>
  </div>

  <div class="grid-2">
    <div class="s-box">
      <div class="s-box-title">Estat&iacute;sticas Derivadas</div>
      <div class="stat-row">
        <span class="stat-label-box">HP</span>
        <span class="stat-boxes"><span class="stat-box">${c.derived.hp}</span><span class="stat-slash">/</span><span class="stat-box">${c.derived.hp}</span></span>
      </div>
      <div class="stat-row">
        <span class="stat-label-box">Espiritualidade</span>
        <span class="stat-boxes"><span class="stat-box">${c.derived.esp}</span><span class="stat-slash">/</span><span class="stat-box">${c.derived.esp}</span></span>
      </div>
      <div class="stat-row">
        <span class="stat-label-box">Lucidez</span>
        <span class="stat-boxes"><span class="stat-box">${c.derived.lucidez}</span><span class="stat-slash">/</span><span class="stat-box">10</span></span>
      </div>
      <div class="stat-row">
        <span class="stat-label-box">Defesa</span>
        <span class="stat-boxes"><span class="stat-box">${c.derived.defesa}</span></span>
      </div>
      <div class="stat-row">
        <span class="stat-label-box">Iniciativa</span>
        <span class="stat-boxes"><span class="stat-box" title="${c.derived.inicTitle}"><small>${c.derived.iniciativa}</small></span></span>
      </div>
      <div class="stat-row">
        <span class="stat-label-box">Movimento</span>
        <span class="stat-boxes"><span class="stat-box">9</span><span style="font-size:7pt;color:#888;margin-left:2pt;">m</span></span>
      </div>
    </div>
    <div class="s-box">
      <div class="s-box-title">Salvaguardas <span style="font-weight:400;color:#888;font-size:7pt;"> (Mod. m&eacute;dio &middot; ND = 10+Mod.)</span></div>
      <div class="save-row">
        <span class="save-name">Corpo</span>
        <span class="save-formula">Mod. = &lfloor;(For+Vig)&divide;2&rfloor; &middot; ND <strong>${10 + c.saves.corpo}</strong></span>
        <span class="save-box">${saveCorpo}</span>
      </div>
      <div class="save-row">
        <span class="save-name">Mente</span>
        <span class="save-formula">Mod. = &lfloor;(Int+Det)&divide;2&rfloor; &middot; ND <strong>${10 + c.saves.mente}</strong></span>
        <span class="save-box">${saveMente}</span>
      </div>
      <div class="save-row">
        <span class="save-name">Esp&iacute;rito</span>
        <span class="save-formula">Mod. = &lfloor;(Per+Car)&divide;2&rfloor; &middot; ND <strong>${10 + c.saves.espirito}</strong></span>
        <span class="save-box">${saveEsp}</span>
      </div>
      <div style="margin-top: 6pt;">
        <div class="s-box-title" style="font-size:7pt;">F&oacute;rmulas R&aacute;pidas</div>
        <div style="font-size:6.5pt; color:#555; line-height:1.55;">${c.formulaNote}</div>
      </div>
    </div>
  </div>

  <div class="s-box">
    <div class="s-box-title">M&eacute;todo de Atua&ccedil;&atilde;o</div>
    <div class="field">
      <span class="field-label">Princ&iacute;pio</span>
      <span class="field-line-fill"><em>${c.acting}</em></span>
    </div>
    <div class="field">
      <span class="field-label">Posi&ccedil;&atilde;o</span>
      <span class="field-line-fill">${c.position}</span>
    </div>
    <div style="display:flex;align-items:center;gap:8pt;margin-top:3pt;">
      <span style="font-size:7.5pt;font-weight:600;">Pontos de Atua&ccedil;&atilde;o:</span>
      <span class="digest-bar">${digestCells(0)}</span>
      <span style="font-size:6.5pt;color:#888;">/ 10 = +2 Digest&atilde;o</span>
    </div>
  </div>
</div>

<div class="sheet sheet-page-break" id="page2">
  <div class="sheet-title" style="font-size:12pt;margin-bottom:5pt;">${c.name} &mdash; Poderes, Equipamento &amp; Notas</div>

  <div class="s-box">
    <div class="s-box-title">Poderes <em>Beyonder</em> <span style="font-weight:400;color:#888;font-size:7pt;"> Seq. 9 &mdash; ${c.seqName}</span></div>
    <div class="grid-2 power-cols">
      ${powers.map(powerBlock).join('\n      ')}
    </div>
  </div>

  <div class="grid-2">
    <div class="s-box">
      <div class="s-box-title">Armas</div>
      ${weapons.map(weaponSlot).join('\n      ')}
      <div style="margin-top:4pt;">
        <div class="field">
          <span class="field-label" style="min-width:50pt;">Armadura</span>
          <span class="field-line-fill">${c.armor}</span>
        </div>
        <div class="field">
          <span class="field-label" style="min-width:50pt;">Def. B&ocirc;nus</span>
          <span class="field-line-fill">${c.armorBonus}</span>
        </div>
      </div>
    </div>
    <div class="s-box">
      <div class="s-box-title">Itens Gerais</div>
      <div class="item-lines">
        ${items}
      </div>
      <div class="field" style="margin-top:4pt;">
        <span class="field-label" style="min-width:50pt;">Dinheiro</span>
        <span class="field-line-fill">${c.money}</span>
      </div>
    </div>
  </div>

  <div class="s-box">
    <div class="s-box-title">Conex&otilde;es</div>
    <div class="grid-3">
      ${conns}
    </div>
  </div>

  <div class="grid-2">
    <div class="s-box">
      <div class="s-box-title">Hist&oacute;ria</div>
      <div class="notes-lines" style="font-size:7.5pt;line-height:1.4">
        ${history}
      </div>
    </div>
    <div class="s-box">
      <div class="s-box-title">Notas de mesa</div>
      <div class="notes-lines" style="font-size:7.5pt;line-height:1.4">
        ${notes}
      </div>
    </div>
  </div>
</div>

<nav class="book-nav no-print">
  <a href="index.html">&larr; Pregens</a>
  <a href="../00-patrulha-noturna.html">Patrulha Noturna</a>
  <a href="../exemplo-sessao-iniciantes.html">Tutorial Sess&atilde;o 1</a>
  <a href="../../apendices/ficha-personagem.html">Ficha em branco</a>
</nav>

</body>
</html>`;
}

const characters = [
  {
    slug: 'mara-silva',
    title: 'Pregen — Mara Silva (Insone) · Senhor dos Mistérios RPG',
    name: 'Mara Silva',
    age: 28,
    playerSlot: 'Jogador 1 (sugest&atilde;o)',
    concept: 'Ex-patrulheira de rua que n&atilde;o dorme mais; vigia o bairro',
    background: 'Beyonder Irregular (+1 Atletismo, +1 Manha aplicados)',
    pathLabel: 'Caminho das Trevas',
    pathFull: 'Trevas (<em>Darkness</em>)',
    seqName: 'Insone',
    seqEn: 'Sleepless',
    digestFilled: 0,
    attrNote: 'prim&aacute;rio Mental 7 / F&iacute;sico 5 / Social 3',
    skillNote: 'grupos 13/9/5',
    attrs: {
      forca: { val: 2 }, destreza: { val: 3 }, vigor: { val: 3 },
      carisma: { val: 2 }, manipulacao: { val: 2 }, aparencia: { val: 2 },
      percepcao: { val: 4 }, inteligencia: { val: 2 }, determinacao: { val: 4 }
    },
    skills: {
      luta: 2, armas: 2, esquiva: 2, atletismo: 3,
      persuasao: 1, intimidacao: 1, etiqueta: 0, dissimulacao: 0, lideranca: 0, empatia: 1, manha: 2,
      investigacao: 3, ocultismo: 2, percEsp: 2, medicina: 1, ciencias: 1, historia: 1, adivinhacao: 0, ritualismo: 1, sobrevivencia: 2
    },
    derived: { hp: 9, esp: 8, lucidez: 7, defesa: 11, iniciativa: '+2', inicTitle: 'd20 +1 Des +1 Vig&iacute;lia' },
    saves: { corpo: 0, mente: 1, espirito: 1 },
    formulaNote: '<strong>PV</strong> = 8+1+0 = 9 &middot; <strong>Esp.</strong> = 4+4 = 8 &middot; <strong>Lucidez</strong> = 5+2 = 7<br><strong>Furtividade:</strong> Destreza + Atletismo (n&atilde;o h&aacute; per&iacute;cia na ficha)<br><strong>Vig&iacute;lia Incans&aacute;vel:</strong> +1 Iniciativa',
    acting: 'Nunca durma &mdash; vigie enquanto o mundo descansa.',
    position: 'Ereta (protege inocentes)',
    powers: [
      { name: 'Vis&atilde;o Noturna Aprimorada', cost: 'Passivo', action: '&mdash;', range: '&mdash;', duration: '&mdash;', effect: 'V&ecirc; no escuro at&eacute; 30 m; +2 Percep&ccedil;&atilde;o &agrave; noite.' },
      { name: 'Vig&iacute;lia Incans&aacute;vel', cost: 'Passivo', action: '&mdash;', range: '&mdash;', duration: '&mdash;', effect: '2 h medita&ccedil;&atilde;o = descanso completo; +1 Iniciativa; n&atilde;o surpreendida se consciente.' },
      { name: 'Sentido de Perigo', cost: '1 Esp.', action: 'Rea&ccedil;&atilde;o', range: 'Pessoal', duration: 'Inst.', effect: '+3 Defesa contra 1 ataque ou Vantagem em salvaguarda vs. armadilha.' }
    ],
    weapons: [
      { name: 'Rev&oacute;lver .32', damage: '1d6 perf.', range: '18 m', props: '6 tiros; Armas de Fogo 2' },
      { name: 'Bast&atilde;o de patrulha', damage: '1d6 cont.', range: 'Toque', props: 'improvisada' }
    ],
    armor: 'Casaco de couro gasto',
    armorBonus: '+0 (Def. 11)',
    items: [
      'Distintivo discreto das &Aacute;guias Noturnas',
      'Lanterna a &oacute;leo + frasco de reposi&ccedil;&atilde;o',
      'Kit de primeiros socorros b&aacute;sico',
      'Mapa rabiscado do East Borough',
      'Corda de 9 m enrolada',
      'Isqueiro + cigarros (h&aacute;bito nervoso)',
      'Bolsa, f&oacute;sforos e vela',
      'Item sentimental: medalha de patrulheira municipal'
    ],
    money: '5 &pound; + pagamentos da mesa',
    connections: [
      { name: 'Capit&atilde; Elise Ward', rel: 'Patrona &mdash; &Aacute;guias Noturnas' },
      { name: 'Jo&atilde;o &quot;Sombra&quot; Ribeiro', rel: 'Ex-parceiro de ronda &mdash; ainda acorda ela de madrugada' },
      { name: 'Irm&atilde; Marta', rel: 'Fam&iacute;lia &mdash; acha que Mara &quot;trabalha de noite&quot; na f&aacute;brica' }
    ],
    history: [
      'Mara patrulhava becos do East Borough quando uma noite sem sono virou semanas. A po&ccedil;&atilde;o veio de um cultista preso &mdash; ela bebeu para provar coragem e nunca mais fechou os olhos de verdade.',
      'Como Insone, tornou-se auxiliar das &Aacute;guias Noturnas: vigia portas, telhados e sonhos alheios. O bairro a conhece como mulher que &quot;sempre est&aacute; acordada&quot;.',
      'Segredo: uma noite, viu algo no espelho do quartel que n&atilde;o era seu reflexo &mdash; e nunca contou a Elise.'
    ],
    notes: [
      '<strong>Papel na mesa:</strong> combate, furtividade (Dest+Atl), vig&iacute;lia.',
      '<strong>Sentido de Perigo:</strong> rea&ccedil;&atilde;o, 1 Esp.',
      '<strong>Atua&ccedil;&atilde;o:</strong> ficar de guarda, proteger inocentes (+8 a +12 digest&atilde;o).'
    ]
  },
  {
    slug: 'tomas-vargas',
    title: 'Pregen — Tomás Vargas (Leitor) · Senhor dos Mistérios RPG',
    name: 'Tom&aacute;s Vargas',
    age: 34,
    playerSlot: 'Jogador 2 (sugest&atilde;o)',
    concept: 'Rep&oacute;rter do <em>Backlund Observer</em> que &quot;leu demais&quot;',
    background: 'Acad&ecirc;mico (+1 Investiga&ccedil;&atilde;o, +1 Ocultismo aplicados)',
    pathLabel: 'Caminho da Torre Branca',
    pathFull: 'Torre Branca (<em>White Tower</em>)',
    seqName: 'Leitor',
    seqEn: 'Reader',
    digestFilled: 0,
    attrNote: 'prim&aacute;rio Mental 7 / Social 5 / F&iacute;sico 3',
    skillNote: 'grupos 13/9/5',
    attrs: {
      forca: { val: 2 }, destreza: { val: 2 }, vigor: { val: 2 },
      carisma: { val: 3 }, manipulacao: { val: 3 }, aparencia: { val: 2 },
      percepcao: { val: 3 }, inteligencia: { val: 4 }, determinacao: { val: 3 }
    },
    skills: {
      luta: 1, armas: 0, esquiva: 2, atletismo: 2,
      persuasao: 2, intimidacao: 0, etiqueta: 1, dissimulacao: 2, lideranca: 0, empatia: 2, manha: 2,
      investigacao: 4, ocultismo: 1, percEsp: 1, medicina: 1, ciencias: 2, historia: 1, adivinhacao: 1, ritualismo: 1, sobrevivencia: 1
    },
    derived: { hp: 8, esp: 6, lucidez: 6, defesa: 10, iniciativa: '+1', inicTitle: 'd20 +0 Des +1 Per' },
    saves: { corpo: 0, mente: 1, espirito: 1 },
    formulaNote: '<strong>PV</strong> = 8+0+0 = 8 &middot; <strong>Esp.</strong> = 3+3 = 6<br><strong>Mem&oacute;ria Perfeita:</strong> +2 em Int + Inv./Hist./Ci&ecirc;ncias',
    acting: 'Leia tudo, memorize tudo, analise tudo.',
    position: 'Ereta (busca a verdade para publicar)',
    powers: [
      { name: 'Mem&oacute;ria Perfeita', cost: 'Passivo', action: '&mdash;', range: '&mdash;', duration: '&mdash;', effect: '+2 em Int + Inv., Hist. e Ci&ecirc;ncias. 1 p&aacute;g. em 3 s.' },
      { name: 'Leitura R&aacute;pida', cost: '1 Esp.', action: 'Principal', range: 'Toque', duration: 'Inst.', effect: 'Livro at&eacute; 500 p&aacute;g. em 1 min.' },
      { name: 'An&aacute;lise Situacional', cost: '1 Esp.', action: 'B&ocirc;nus', range: '9 m', duration: 'Inst.', effect: 'Narrador revela 1 fato n&atilde;o &oacute;bvio. M&aacute;x. 2&times;/cena.' }
    ],
    weapons: [
      { name: 'Bengala pesada', damage: '1d6 cont.', range: 'Toque', props: 'improvisada' }
    ],
    armor: 'Sobretudo escuro',
    armorBonus: '+0 (Def. 10)',
    items: [
      'Credencial do <em>Backlund Observer</em>',
      'Caderno de campo + 3 l&aacute;pis',
      'Caneta-tinteiro e tinta',
      'Lupa de bolso',
      'Lanterna compacta',
      'Mapa do Dockside e East Borough',
      'Bolsa, f&oacute;sforos e vela',
      'C&oacute;pia de artigo censurado (gancho)'
    ],
    money: '12 &pound; (Acad&ecirc;mico) + honor&aacute;rios da mesa',
    connections: [
      { name: 'Editor Cheswick', rel: '<em>Observer</em> &mdash; quer manchetes, n&atilde;o ocultismo' },
      { name: 'Capit&atilde; Elise Ward', rel: 'Contratante &mdash; troca informa&ccedil;&atilde;o por discri&ccedil;&atilde;o' },
      { name: 'Dra. Helena Ashworth', rel: 'Colega acad&ecirc;mica &mdash; envia recortes estranhos' }
    ],
    history: [
      'Tom&aacute;s cobria corrup&ccedil;&atilde;o municipal at&eacute; encontrar um dossi&ecirc; com s&iacute;mbolos que n&atilde;o deveriam existir em tipografia comum. A po&ccedil;&atilde;o foi &quot;amostra de laborat&oacute;rio&quot; &mdash; mentira que ele registrou tarde demais.',
      'Como Leitor, trata cada depoimento como texto: omiss&otilde;es, repeti&ccedil;&otilde;es e ordem das frases pesam tanto quanto confiss&otilde;es.',
      'Segredo: guarda rascunho de mat&eacute;ria que provaria cultos na Yard &mdash; nunca publicou.'
    ],
    notes: [
      '<strong>Papel na mesa:</strong> investiga&ccedil;&atilde;o, social, an&aacute;lise.',
      '<strong>Mem&oacute;ria Perfeita:</strong> n&atilde;o esque&ccedil;a o +2.',
      '<strong>An&aacute;lise Situacional:</strong> 1 Esp., b&ocirc;nus, 2&times;/cena.'
    ]
  },
  {
    slug: 'lidia-correa',
    title: 'Pregen — Lídia Corrêa (Mistério) · Senhor dos Mistérios RPG',
    name: 'L&iacute;dia Corr&ecirc;a',
    age: 26,
    playerSlot: 'Jogador 3 (sugest&atilde;o)',
    concept: 'Curandeira do bairro que sente &quot;cheiro&quot; de magia errada',
    background: 'Cidad&atilde;o Comum (+1 Of&iacute;cios &rarr; Medicina, +1 Manha aplicados)',
    pathLabel: 'Caminho do Eremita',
    pathFull: 'Eremita (<em>Hermit</em>)',
    seqName: 'Mist&eacute;rio',
    seqEn: 'Mystery Pryer',
    digestFilled: 0,
    attrNote: 'prim&aacute;rio Mental 7 / Social 5 / F&iacute;sico 3',
    skillNote: 'grupos 13/9/5',
    attrs: {
      forca: { val: 2 }, destreza: { val: 2 }, vigor: { val: 2 },
      carisma: { val: 2 }, manipulacao: { val: 2 }, aparencia: { val: 3 },
      percepcao: { val: 3 }, inteligencia: { val: 3 }, determinacao: { val: 3 }
    },
    skills: {
      luta: 1, armas: 0, esquiva: 2, atletismo: 2,
      persuasao: 2, intimidacao: 0, etiqueta: 2, dissimulacao: 1, lideranca: 0, empatia: 2, manha: 2,
      investigacao: 2, ocultismo: 3, percEsp: 2, medicina: 2, ciencias: 1, historia: 0, adivinhacao: 1, ritualismo: 2, sobrevivencia: 0
    },
    derived: { hp: 8, esp: 6, lucidez: 6, defesa: 10, iniciativa: '+1', inicTitle: 'd20 +0 Des +1 Per' },
    saves: { corpo: 0, mente: 1, espirito: 0 },
    formulaNote: '<strong>PV</strong> = 8+0+0 = 8 &middot; <strong>Esp.</strong> = 3+3 = 6<br><strong>Ritual B&aacute;sico:</strong> 10 min (2 Esp.) &mdash; em combate use vers&atilde;o apressada com Mestre',
    acting: 'Investigue o oculto; nunca aceite a primeira resposta.',
    position: 'Ereta',
    powers: [
      { name: 'Ver Auras M&iacute;sticas', cost: '1 Esp.', action: 'B&ocirc;nus', range: 'Pessoal', duration: '10 min', effect: 'Detecta magia, Beyonder e res&iacute;duo ritual&iacute;stico.' },
      { name: 'Ritual B&aacute;sico', cost: '2 Esp.', action: 'Principal', range: '3 m', duration: '10 min', effect: 'Prote&ccedil;&atilde;o, purifica&ccedil;&atilde;o ou consagra&ccedil;&atilde;o (ver Livro do Jogador).' },
      { name: 'Leitura de S&iacute;mbolos', cost: '1 Esp.', action: 'Principal', range: 'Toque', duration: 'Inst.', effect: 'Compreende prop&oacute;sito de selo ou inscri&ccedil;&atilde;o ao tocar.' }
    ],
    weapons: [],
    armor: 'Avental refor&ccedil;ado de ervan&aacute;ria',
    armorBonus: '+0 (Def. 10)',
    items: [
      'Maleta de ervas e bandagens',
      'Frascos de tintura e &oacute;leos essenciais',
      'S&iacute;mbolo de madeira (ora&ccedil;&atilde;o familiar)',
      'Livro de receitas manuscrito',
      'Vela consagrada caseira',
      'Bolsa, f&oacute;sforos e vela comum',
      'Ch&aacute; calmante (roleplay)',
      'Item sentimental: pulseira da av&oacute; curandeira'
    ],
    money: '5 &pound; + pagamentos da mesa',
    connections: [
      { name: 'Sra. Holt', rel: 'Vizinha &mdash; m&atilde;e de Milo (caso Morvan)' },
      { name: 'Padre Brenner', rel: 'Par&oacute;quia local &mdash; desconfia de &quot;rem&eacute;dios&quot; dela' },
      { name: 'Capit&atilde; Elise Ward', rel: 'Contratante ocasional' }
    ],
    history: [
      'L&iacute;dia aprendeu ervas com a av&oacute; e Beyonderismo com um livro que n&atilde;o deveria existir em feira de pulgas. A po&ccedil;&atilde;o veio depois de meses de sintomas que a medicina comum n&atilde;o explicava.',
      'No East Borough, cura febres e ouve segredos. Sente quando um selo est&aacute; &quot;errado&quot; antes de ler a runa.',
      'Segredo: uma vez purificou um objeto amaldi&ccedil;oado sem contar &agrave;s &Aacute;guias &mdash; o res&iacute;duo ainda a segue.'
    ],
    notes: [
      '<strong>Papel na mesa:</strong> ocultismo, rituais, Percep&ccedil;&atilde;o Espiritual.',
      '<strong>Ver Auras:</strong> 1 Esp., 10 min.',
      '<strong>Leitura de S&iacute;mbolos:</strong> essencial na Sess&atilde;o 1 e 3.'
    ]
  },
  {
    slug: 'finn-aldridge',
    title: 'Pregen — Finn Aldridge (Aprendiz) · Senhor dos Mistérios RPG',
    name: 'Finn Aldridge',
    age: 22,
    playerSlot: 'NPC aliado (mesa de 2 PJ) ou Jogador',
    concept: 'Recruta das &Aacute;guias Noturnas; lanterna, bandagens e portas',
    background: 'Membro de Igreja (+1 Hist&oacute;ria &rarr; Ocultismo, +1 Etiqueta aplicados)',
    pathLabel: 'Caminho da Porta',
    pathFull: 'Porta (<em>Door</em>)',
    seqName: 'Aprendiz',
    seqEn: 'Apprentice',
    digestFilled: 0,
    attrNote: 'prim&aacute;rio Mental 5 / F&iacute;sico 5 / Social 3',
    skillNote: 'grupos 13/9/5 (foco suporte)',
    attrs: {
      forca: { val: 2 }, destreza: { val: 2 }, vigor: { val: 3 },
      carisma: { val: 2 }, manipulacao: { val: 2 }, aparencia: { val: 2 },
      percepcao: { val: 2 }, inteligencia: { val: 2 }, determinacao: { val: 3 }
    },
    skills: {
      luta: 1, armas: 0, esquiva: 2, atletismo: 2,
      persuasao: 1, intimidacao: 0, etiqueta: 2, dissimulacao: 0, lideranca: 0, empatia: 1, manha: 1,
      investigacao: 2, ocultismo: 3, percEsp: 1, medicina: 2, ciencias: 0, historia: 2, adivinhacao: 0, ritualismo: 2, sobrevivencia: 1
    },
    derived: { hp: 9, esp: 5, lucidez: 6, defesa: 10, iniciativa: '+0', inicTitle: 'd20 +0 Des +0 Per' },
    saves: { corpo: 0, mente: 0, espirito: 0 },
    formulaNote: '<strong>PV</strong> = 8+1+0 = 9 &middot; <strong>Esp.</strong> = 2+3 = 5<br><strong>Mesa de 2 PJ:</strong> Mestre controla Finn; 1 ataque/rodada se necess&aacute;rio',
    acting: 'Abra caminhos &mdash; literalmente e figurativamente.',
    position: 'Ereta (obedece ordens de Elise)',
    powers: [
      { name: 'Vis&atilde;o Espiritual', cost: '1 Esp.', action: 'B&ocirc;nus', range: 'Pessoal', duration: '10 min', effect: 'Mapeia frestas e v&atilde;os do espa&ccedil;o espiritual (como Vidente).' },
      { name: 'Adivinha&ccedil;&atilde;o Menor', cost: '2 Esp.', action: 'Principal', range: 'Pessoal', duration: 'Inst.', effect: 'Pergunta sim/n&atilde;o; &ecirc;nfase em passagens e trancas.' },
      { name: 'Percep&ccedil;&atilde;o Dimensional', cost: '1 Esp.', action: 'B&ocirc;nus', range: 'Pessoal', duration: '1 min', effect: 'Detecta portais e passagens ocultas em 18 m; +1 em al&ccedil;ap&otilde;es/fechaduras.' }
    ],
    weapons: [
      { name: 'Faca de servi&ccedil;o', damage: '1d4 perf.', range: 'Toque', props: 'discreta' }
    ],
    armor: 'Uniforme simples das &Aacute;guias',
    armorBonus: '+0 (Def. 10)',
    items: [
      'Lanterna das &Aacute;guias Noturnas',
      'Bandagens e &aacute;gua limpa',
      'Chave mestra do quartel (s&oacute; emerg&ecirc;ncia)',
      'Crucif&iacute;culo pequeno da Deusa da Noite',
      'Caderno de patrulha',
      'Bolsa, f&oacute;sforos e vela',
      'S&iacute;mbolo sagrado (antecedente)',
      'Carta eclesi&aacute;stica de identifica&ccedil;&atilde;o'
    ],
    money: '10 &pound; (Igreja) + mesada do posto',
    connections: [
      { name: 'Capit&atilde; Elise Ward', rel: 'Superiora direta' },
      { name: 'Mara Silva', rel: 'Colega de patrulha &mdash; admira de longe' },
      { name: 'Padre Brenner', rel: 'Forma&ccedil;&atilde;o eclesi&aacute;stica' }
    ],
    history: [
      'Finn entrou para a Igreja da Deusa da Noite jovem demais para semin&aacute;rio e velho demais para ignorar o sobrenatural no East Borough. A po&ccedil;&atilde;o foi ritual de passagem mal explicado.',
      'Como Aprendiz da Porta, abre fechaduras, encontra al&ccedil;ap&otilde;es e sente quando o espa&ccedil;o &quot;cede&quot;. Ainda aprende a não entrar em cada porta.',
      'Segredo: uma vez abriu passagem que deveria ficar fechada &mdash; Elise cobriu o incidente.'
    ],
    notes: [
      '<strong>Uso:</strong> mesa de 2 jogadores &mdash; Mestre controla.',
      '<strong>Combate:</strong> d20+0, 1d4; priorize suporte.',
      '<strong>Percep&ccedil;&atilde;o Dimensional:</strong> &uacute;til na oficina e casa 14.'
    ]
  }
];

fs.mkdirSync(OUT_DIR, { recursive: true });

for (const c of characters) {
  const out = path.join(OUT_DIR, `${c.slug}.html`);
  fs.writeFileSync(out, buildSheet(c), 'utf8');
  console.log(`OK campanhas/pregens/${c.slug}.html`);
}

const indexHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Pregens — Patrulha Noturna · Senhor dos Mistérios RPG</title>
<link rel="stylesheet" href="../../assets/css/common.css">
<link rel="stylesheet" href="../../assets/css/print.css">
<style>
.pregen-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin: 1.5rem 0; }
.pregen-card { border: 2px solid var(--gold); border-radius: 6px; padding: 1rem; text-decoration: none; color: inherit; background: linear-gradient(135deg, var(--parchment) 0%, var(--parchment-d) 100%); }
.pregen-card:hover { color: var(--gold-dark); transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.12); }
.pregen-card h3 { margin-top: 0; color: var(--gold-dark); font-size: 1.05em; }
.pregen-card p { font-size: 0.88em; margin-bottom: 0; }
.pregen-role { font-size: 0.8em; color: var(--spirit); margin-top: 0.4em; }
</style>
</head>
<body>

<h1>Fichas prontas &mdash; Patrulha Noturna</h1>

<p>Personagens <strong>Seq.&nbsp;9</strong> para a mini-campanha <a href="../00-patrulha-noturna.html">Patrulha Noturna</a>.
A <strong>Sess&atilde;o&nbsp;1</strong> usa o <a href="../exemplo-sessao-iniciantes.html">tutorial</a>; imprima as fichas abaixo antes de jogar.</p>

<div class="box box-rule">
  <div class="box-title">Mesa de 3 jogadores</div>
  <p>Mara + Tom&aacute;s + L&iacute;dia (cada um cobre combate, investiga&ccedil;&atilde;o e ocultismo).</p>
</div>

<div class="box box-lore">
  <div class="box-title">Mesa de 2 jogadores</div>
  <p>Escolha <strong>duas</strong> fichas abaixo e adicione <strong>Finn Aldridge</strong> (NPC aliado controlado pelo Mestre).</p>
</div>

<div class="pregen-grid">
  <a class="pregen-card" href="mara-silva.html">
    <h3>Mara Silva</h3>
    <p>Trevas &middot; Insone &middot; ex-patrulheira</p>
    <p class="pregen-role">Combate, vig&iacute;lia, furtividade</p>
  </a>
  <a class="pregen-card" href="tomas-vargas.html">
    <h3>Tom&aacute;s Vargas</h3>
    <p>Torre Branca &middot; Leitor &middot; jornalista</p>
    <p class="pregen-role">Investiga&ccedil;&atilde;o, an&aacute;lise, social</p>
  </a>
  <a class="pregen-card" href="lidia-correa.html">
    <h3>L&iacute;dia Corr&ecirc;a</h3>
    <p>Eremita &middot; Mist&eacute;rio &middot; curandeira</p>
    <p class="pregen-role">Ocultismo, rituais, auras</p>
  </a>
  <a class="pregen-card" href="finn-aldridge.html">
    <h3>Finn Aldridge</h3>
    <p>Porta &middot; Aprendiz &middot; recruta &Aacute;guias</p>
    <p class="pregen-role">NPC aliado (mesa de 2) &middot; suporte</p>
  </a>
</div>

<p class="text-small">Tamb&eacute;m pode criar fichas com o <a href="../../apendices/guia-criacao-ficha.html">Guia de Cria&ccedil;&atilde;o de Ficha</a>.</p>

<nav class="book-nav">
  <a href="../index.html">&larr; Livro de Campanhas</a>
  <a href="../00-patrulha-noturna.html">Patrulha Noturna</a>
  <a href="../exemplo-sessao-iniciantes.html">Tutorial Sess&atilde;o 1</a>
</nav>

</body>
</html>`;

fs.writeFileSync(path.join(OUT_DIR, 'index.html'), indexHtml, 'utf8');
console.log('OK campanhas/pregens/index.html');
