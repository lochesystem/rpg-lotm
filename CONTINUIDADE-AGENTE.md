# Resumo para continuidade — conversa `pacto-sombrio` / `rpg-lotm`

> Documento de handoff para retomar o trabalho em outro agente ou sessão.  
> Última atualização: maio de 2026.

---

## Objetivo geral do projeto

Criar e manter o **Senhor dos Mistérios RPG** (`rpg-lotm`), sistema fan híbrido **VtM (atributos 1–5, Lucidez) + D&D (d20)** em PT-BR, baseado em *Lord of the Mysteries*. Terminologia: **“Caminhos”** (não “Vias”).

---

## Repositórios e URLs

| Repo | Pasta local | GitHub Pages |
|------|-------------|--------------|
| Completo (Jogador + Mestre + Campanhas) | `c:\Users\adria\OneDrive\Documentos\Cursor\pacto-sombrio\rpg-lotm\` | https://lochesystem.github.io/rpg-lotm/ |
| Só jogadores | `c:\Users\adria\OneDrive\Documentos\Cursor\pacto-sombrio\rpg-lotm-jogadores\` | https://lochesystem.github.io/rpg-lotm-jogadores/ |

- Conta GitHub: **lochesystem**
- Workspace pai: `pacto-sombrio` (projeto separado `pacto-sombrio/index.html` — outro jogo, não confundir)

---

## Estrutura principal `rpg-lotm`

```
rpg-lotm/
├── index.html
├── README.md
├── CONTINUIDADE-AGENTE.md          ← este arquivo
├── assets/css/ (common.css, print.css)
├── livro-jogador/     01-introducao … 10-mundo.html
├── livro-mestre/      01-guia-mestre … 09-aventuras.html
├── campanhas/         01–03 campanhas + exemplos .md
└── apendices/         ficha-personagem.html, glossário, tabelas
```

### Livro do Jogador — arquivos reais (sumários foram corrigidos)

| Cap | Arquivo |
|-----|---------|
| 1–2 | `01-introducao.html`, `02-criacao.html` |
| 3 | `03-atributos.html` |
| 4–5 | `04-pathways.html`, `05-sequencias.html` |
| 6–10 | `06-atuacao.html`, `07-combate.html`, `08-equipamento.html`, `09-misticismo.html`, `10-mundo.html` |

### Livro do Mestre

| Cap | Arquivo | Conteúdo principal |
|-----|---------|-------------------|
| 2 | `02-mundo.html` | Sefirot, eras, True Gods, Outer Deities |
| 3 | `03-organizacoes.html` | 7 igrejas ortodoxas |

### Apêndices e guias Markdown

| Arquivo | Uso |
|---------|-----|
| `livro-mestre/guia-22-caminhos-deuses.md` | Guia rápido Mestre: 22 Caminhos, deuses, deidades |
| `campanhas/exemplo-sessao-iniciantes.md` | Tutorial: 1 sessão jogada (3 PJs + Mestre) |
| `apendices/ficha-personagem.html` | Ficha interativa |

---

## Trabalho realizado

### 1. Correção tabela 22 Caminhos — Cap. 2 criação

**Problema:** Em `livro-jogador/02-criacao.html`, a coluna “Caminho” trazia nomes de **Sequência** (ex.: Vidente, Palhaço, Coveiro).

**Correção:**

- Coluna **Caminho** = nome do pathway (Tolo, Erro, Trevas…)
- Coluna **Seq. 9** = nome da sequência 9 (Vidente, Aprendiz, Insone…)
- **Tolo** e **Porta** compartilham Seq. 9 **Vidente**
- Typo “Cado” → “Cada”
- Rodapé aponta Cap. **5** (poderes) e **6** (Método de Atuação)

**Commits (já pushed):**

| Repo | Hash | Mensagem |
|------|------|----------|
| `rpg-lotm` | `7c69dca` | Corrigir tabela dos 22 Caminhos e Seq 9 no cap 2 de criacao |
| `rpg-lotm-jogadores` | `67d30e6` | idem |

**Pendência menor:** Exemplo **Edmund Harker** no cap. 2 ainda diz “Caminho do Vidente” — canonicamente seria **Caminho do Tolo** + Sequência **Vidente** (não alterado).

---

### 2. Guia do Mestre — 22 Caminhos e deuses

**Arquivo:** `livro-mestre/guia-22-caminhos-deuses.md`

**Conteúdo:**

- Mapas Mermaid e tabelas
- Tabela-mestre dos 22 caminhos (Seq. 9, Sefirah, Seq. 0, igreja)
- 9 Sefirot e fichas por caminho
- 7 Deuses Verdadeiros (segredos: Adam/Visionário, elfo Tempestades, deus artificial Vapor)
- 6 caminhos de origem Exterior:
  - **Mãe Deusa da Depravação** → Mãe, Lua
  - **Árvore-Mãe do Desejo** → Demonesa, Sacerdote Vermelho
  - **Filho do Caos** → Imperador Negro, Justiceiro
- Caminhos sem igreja, escada Seq 9→0, notas de mesa

**Links:** `livro-mestre/index.html`, `README.md`

---

### 3. Exemplo de sessão para iniciantes

**Arquivo:** `campanhas/exemplo-sessao-iniciantes.md`

| Item | Detalhe |
|------|---------|
| Duração | ~2 h |
| Mesa | 3 jogadores + 1 mestre |
| Aventura | “O Sussurro na Oficina” — Backlund, East Borough |
| PJs Seq. 9 | Mara (Trevas/Insone), Tomás (Torre Branca/Leitor), Lídia (Eremita/Mistério) |
| Ensina | d20, poderes, Espiritualidade, Lucidez, digestão, combate |

**Links:** `campanhas/index.html`, `README.md`

---

## Regras-chave (fonte de verdade mecânica)

| Conceito | Regra |
|----------|--------|
| Teste | `d20 + mod. Atributo + mod. Perícia ≥ CD` |
| Modificador | valor − 2 (atributos/perícias 1–5; perícia 0 = −2) |
| PV | `8 + mod. Vigor + bônus Sequência` (Seq 9 = 0) |
| Espiritualidade | **soma dos valores** de Percepção + Determinação |
| Lucidez | `5 + mod. Determinação` (máx. 10) |
| Caminho vs Sequência | Caminho = pathway (ex. Tolo); Sequência = nome do cargo (ex. Vidente na Seq 9) |
| Método de Atuação | 100 pts digestão/sequência; roleplay 5–15 pts por ação relevante |
| Nomes dos 22 | `livro-jogador/05-sequencias.html` + `04-pathways.html` |

---

## Commits Git relevantes

| Hash | Descrição |
|------|-----------|
| `040d57d` | Links sumário Livro do Jogador |
| `7adc906` | Links sumário Livro do Mestre |
| `7c69dca` | Tabela 22 Caminhos cap. 2 (`rpg-lotm`) |
| `67d30e6` | Tabela 22 Caminhos cap. 2 (`rpg-lotm-jogadores`) |
| `bdbdb1a` | Subtítulo ficha “RPG” (repo jogadores) |

---

## Pendências para o próximo agente

1. **`git status`** em `rpg-lotm` — commit/push se ainda não feito:
   - `livro-mestre/guia-22-caminhos-deuses.md`
   - `livro-mestre/index.html`
   - `campanhas/exemplo-sessao-iniciantes.md`
   - `campanhas/index.html`
   - `README.md`
   - `CONTINUIDADE-AGENTE.md`

2. **Corrigir Edmund Harker** em `livro-jogador/02-criacao.html` (Tolo + Sequência Vidente).

3. **Sincronizar `rpg-lotm-jogadores`** apenas se o usuário pedir (guia do Mestre não vai no repo de jogadores).

4. **HTML/PDF** dos `.md` — só se o usuário pedir.

---

## Regras do usuário (importantes)

- **Não commitar** sem pedido explícito.
- **Não push** sem pedido explícito.
- Minimizar escopo; seguir convenções existentes do projeto.
- Terminologia: **Caminhos**, PT-BR com inglês em `<span class="en">` nos HTML.

---

## Transcript da conversa

```
C:\Users\adria\.cursor\projects\c-Users-adria-OneDrive-Documentos-Cursor-pacto-sombrio\agent-transcripts\0ac7b485-5bc3-439d-b260-b48b3e0d4393\0ac7b485-5bc3-439d-b260-b48b3e0d4393.jsonl
```

---

## Prompt sugerido para retomar

```
Continuar o projeto rpg-lotm em c:\Users\adria\OneDrive\Documentos\Cursor\pacto-sombrio\rpg-lotm.
Leia CONTINUIDADE-AGENTE.md. Verificar git status e commit/push pendente dos .md novos
se o usuário pedir. Corrigir exemplo "Caminho do Vidente" no cap. 2 para Tolo + Sequência Vidente.
```

---

*Senhor dos Mistérios RPG — material fan, derivado da obra de Cuttlefish That Loves Diving.*
