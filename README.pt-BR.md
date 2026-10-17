<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="docs/brand/banner-dark.png">
    <img src="docs/brand/banner-light.png" alt="sobrio. Uma extensão com opinião sobre como a web deve parecer e como um navegador deve se sentir.">
  </picture>
</p>

<p align="center">
  <a href="#o-que-faz">O que faz</a> ·
  <a href="#configurações">Configurações</a> ·
  <a href="#instalar">Instalar</a> ·
  <a href="#desenvolvimento">Desenvolvimento</a>
</p>

<p align="center"><sub>
  <a href="README.md">English</a> ·
  <a href="README.es.md">Español</a> ·
  <a href="README.de.md">Deutsch</a> ·
  <a href="README.fr.md">Français</a> ·
  <a href="README.it.md">Italiano</a> ·
  <b>Português (Brasil)</b> ·
  <a href="README.nl.md">Nederlands</a> ·
  <a href="README.sv.md">Svenska</a> ·
  <a href="README.pl.md">Polski</a> ·
  <a href="README.cs.md">Čeština</a> ·
  <a href="README.hu.md">Magyar</a> ·
  <a href="README.ro.md">Română</a> ·
  <a href="README.tr.md">Türkçe</a> ·
  <a href="README.ru.md">Русский</a> ·
  <a href="README.uk.md">Українська</a> ·
  <a href="README.id.md">Bahasa Indonesia</a> ·
  <a href="README.vi.md">Tiếng Việt</a> ·
  <a href="README.ja.md">日本語</a> ·
  <a href="README.ko.md">한국어</a> ·
  <a href="README.zh-CN.md">简体中文</a> ·
  <a href="README.zh-TW.md">繁體中文</a>
</sub></p>

O sobrio pega uma pequena parte de [Stylus](https://github.com/openstyles/stylus), [Dark Reader](https://github.com/darkreader/darkreader), [Search Bookmarks, History and Tabs](https://github.com/Fannon/search-bookmarks-history-and-tabs), [Tabliss](https://github.com/joelshepherd/tabliss) e [Global Speed](https://github.com/polywock/globalSpeed), e nada mais. Uma extensão para Firefox, LibreWolf e Chrome, duas cores, sem cantos arredondados, e nada sai do seu navegador.

![O switcher aberto sobre a Wikipedia, que o sobrio deixou preta: digitar "ru" lista os favoritos de Rust com as letras encontradas em negrito.](docs/screens/switcher.png)

## O que faz

### Uma folha de estilo para todos os sites

Sem cantos arredondados, sombras, sombras de texto nem desfoque. Animações e transições cortadas, exceto no player do YouTube. Sem barras de rolagem, sem rolagem suave, fundos que rolam com a página. Links sublinhados, qualquer texto selecionável, sem maiúsculas forçadas pelo CSS.

Cada item é um interruptor nas configurações (barras de rolagem finas em vez de nenhuma, também), e outros dois começam desligados: imagens e vídeos em escala de cinza, e um contorno visível no elemento em foco. Abaixo deles, uma caixa para o seu próprio CSS (até 50.000 caracteres), em uma folha própria depois da do sobrio em todos os sites, então um `@import` no topo funciona.

### Preto, com critério

![A página de tipografia da Wikipedia: a metade esquerda como o site a desenha, branca, e a metade direita com o sobrio, preta.](docs/screens/wikipedia.png)

O motor dinâmico do Dark Reader deixa cada site preto (`#000`), cor por cor. Sites que já têm um tema escuro próprio mantêm esse tema. Brilho, contraste, sépia, escala de cinza e as cores estão nas configurações; não há agendamentos.

### Um switcher

<kbd>Ctrl</kbd>+<kbd>Space</kbd> abre uma caixa no meio da página, como o quick switcher do Obsidian. Digite para buscar nos seus favoritos; o quanto a busca tolera erros é uma configuração (estrita, normal ou flexível). Se nada corresponder, <kbd>Enter</kbd> pesquisa na web. <kbd>Tab</kbd> percorre Google, DuckDuckGo, YouTube, Wikipedia, GitHub e os mecanismos que você criar (qualquer endereço com `%s`, como uma instância do SearXNG); o mecanismo padrão vem primeiro. Qualquer um desses itens pode ser desligado.

Ele lembra o que você abre por ele: um favorito que você abre com frequência, e de forma recente, sobe nos resultados. A aba Estatísticas das configurações mostra quantas vezes cada página foi aberta e o peso dela, e zera uma ou todas.

| Tecla | |
|---|---|
| <kbd>↓</kbd> <kbd>Ctrl</kbd>+<kbd>J</kbd> / <kbd>↑</kbd> <kbd>Ctrl</kbd>+<kbd>K</kbd> | mover |
| <kbd>Enter</kbd> | abrir aqui |
| <kbd>Ctrl</kbd>/<kbd>Alt</kbd>+<kbd>Enter</kbd> | abrir em nova aba |
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | próximo / anterior mecanismo |
| <kbd>Esc</kbd> | fechar |

Três comandos, digitados no switcher. Eles também funcionam pelo botão da barra de ferramentas, no site da aba ativa, e as palavras deles podem ser trocadas em Configurações › Switcher:

| Comando | |
|---|---|
| `td` | modo escuro ligado ou desligado no site atual |
| `ta` | a folha de estilo ligada ou desligada no site atual |
| `settings` | as configurações (`options` também funciona) |

### Uma nova aba

![Os seis layouts da nova aba: clássico, só a hora, em uma linha, empilhado, canto e analógico.](docs/screens/layouts.png)

A data e a hora, bem compostas, e o switcher embaixo. Seis layouts: clássico, só a hora, em uma linha, empilhado (horas sobre minutos), canto e um relógio analógico minimalista. Quatro estilos tipográficos: Editorial (Instrument Serif e Inter), Suíço (Inter), Máquina (IBM Plex Mono) e Livro (EB Garamond), ou fontes próprias instaladas na máquina. Uma saudação opcional com o seu nome. Dê uma lista de idiomas e cada nova aba mostra a data em um deles, ao acaso. No Firefox e no LibreWolf, a nova aba também é a página inicial: o navegador abre nela, e assim toda janela nova.

Os navegadores mantêm o foco na barra de endereços em uma nova aba, e nenhuma extensão consegue tirá-lo de lá. Para que você possa digitar no switcher de imediato, a aba é trocada por uma nova no mesmo lugar, que começa com a página em foco; a barra de endereços então mostra o endereço da página em vez de ficar vazia. Em uma aba de contêiner do Firefox, ela continua como está. Desligue *Tirar o foco da barra de endereços* para manter o jeito do navegador.

### Velocidade de mídia

Cada vídeo e áudio toca na velocidade que você define, ou na regra própria de um site. <kbd>]</kbd> mais rápido, <kbd>[</kbd> mais lento, <kbd>\\</kbd> volta a 1×. Qualquer valor entre 0,91× e 1,09× é só 1×. Se você mudar a velocidade pelos controles próprios de um site, o sobrio não mexe nela naquela página. Opcionalmente, vídeos e áudios que começam a tocar som antes de você interagir com a página são pausados; os que estão sem som continuam.

### Atalhos próprios

Grave uma combinação de teclas nas configurações e escolha o que ela faz: abrir o switcher, pesquisar em um mecanismo (ou pesquisar o texto selecionado), ligar ou desligar o modo escuro ou a folha de estilo no site, modo escuro em todos os sites, abrir um endereço aqui ou em nova aba, definir a velocidade de mídia, copiar o link da página sem parâmetros de rastreamento (`utm_*`, `fbclid`, `gclid` e similares) ou abrir as configurações. Elas precisam de <kbd>Ctrl</kbd>, <kbd>Alt</kbd> ou <kbd>Meta</kbd>, ou de uma tecla de função. Também funcionam com o foco dentro de um quadro incorporado (Google Docs, um player de vídeo), e sempre agem sobre o site da barra de endereços.

## Configurações

![As configurações, na aba Estilo: uma lista de interruptores ao lado das abas Estilo, Modo escuro, Exceções, Switcher, Atalhos, Nova aba, Mídia e Estatísticas.](docs/screens/settings.png)

`settings` no switcher, ou as preferências da extensão em `about:addons` / `chrome://extensions`. Uma aba para cada parte: Estilo, Modo escuro, Exceções, Switcher, Atalhos, Nova aba, Mídia e Estatísticas. Cada alteração é salva sozinha e aplicada na hora nas abas abertas.

Um backup no fim de cada aba salva tudo (configurações, exceções, atalhos e a memória do switcher) em um arquivo, e o restaura em outro navegador. O guia de boas-vindas, que abre uma vez ao instalar, também está aqui.

Endereços locais (`localhost`, `127.0.0.1`, `192.168.x`, nomes `.local` e o restante da sua máquina ou rede) são deixados em paz por padrão, para que o seu próprio trabalho apareça como é; um interruptor no topo da aba Exceções muda isso.

As exceções aceitam sites como `example.com` (só esse site) ou `*.example.com` (o site e os subdomínios dele), para a folha de estilo e para o modo escuro, separadamente. Uma terceira lista mantém as animações e transições próprias de um site enquanto o resto da folha de estilo se aplica; ela começa com `chatgpt.com`, cuja tela se desloca enquanto ele escreve se as animações forem cortadas.

### Personalize com `userContent.css`

No Firefox e no LibreWolf, o sobrio lê estas variáveis do `userContent.css` (com `toolkit.legacyUserProfileCustomizations.stylesheets` ligado) e as usa no modo escuro, no switcher, nas configurações e na nova aba. Elas têm prioridade sobre as cores das configurações. A regra `@-moz-document` as mantém só nas páginas da extensão: nenhum site as vê.

```css
@-moz-document url-prefix("moz-extension://") {
  :root {
    --sobrio-background: #07090f;   /* fundo do modo escuro, do switcher e da nova aba */
    --sobrio-text: #edf1ff;
    --sobrio-text-muted: #7c86a0;
    --sobrio-selection: #171d2b;    /* a linha selecionada, e o texto selecionado */
    --sobrio-border: #4a5470;
    --sobrio-accent: #f5a9cf;       /* a barra de seleção e as letras encontradas */
    --sobrio-corners: square;       /* square ou round: tem prioridade sobre o interruptor de cantos */
    --sobrio-font: "SF Pro Text";   /* opcional: uma fonte instalada nesta máquina */
  }
}
```

O navegador lê o `userContent.css` ao iniciar, então as mudanças aparecem depois de reiniciar.

## Instalar

- **Chrome:** `chrome://extensions`, ligue o *Modo do desenvolvedor*, *Carregar sem compactação* e escolha esta pasta.
- **LibreWolf:** defina `xpinstall.signatures.required` como `false` em `about:config`, execute `scripts/pack.sh` e abra `dist/sobrio-<version>.xpi` em `about:addons` (*Instalar complemento de arquivo*). Para um teste rápido, `about:debugging` › *Carregar complemento temporário* funciona sem essa preferência.
- **Firefox:** as versões de lançamento só instalam complementos assinados. Envie o zip para [addons.mozilla.org](https://addons.mozilla.org/developers/) como *não listado* para obter uma assinatura para você.

O Firefox pergunta uma vez se você quer manter a nova aba definida por uma extensão; mantenha. O atalho pode ser alterado em `about:addons` › *Gerenciar atalhos de extensões* ou em `chrome://extensions/shortcuts`.

Em páginas onde extensões não podem rodar (páginas `about:` e `chrome://`, as lojas de complementos, PDFs), o atalho abre o switcher pelo botão da barra de ferramentas. O botão da barra de ferramentas também o abre sempre. No Firefox, algumas páginas são reconhecidas tarde demais (um PDF sem `.pdf` no endereço, páginas de erro): nelas o atalho não faz nada, e o botão da barra de ferramentas continua funcionando.

**Dica:** coloque o seu navegador ou o sistema na aparência escura. Os sites com tema escuro próprio (GitHub, YouTube e muitos outros) passam a usá-lo, e o sobrio os deixa em paz.

## Desenvolvimento

Sem etapa de build e sem dependências npm.

```sh
node --test                                   # testes unitários
python3 -I tools/marionette.py . <url>...     # LibreWolf/Firefox sem interface com o sobrio carregado
python3 -I tools/cdp.py . <url>...            # Chromium sem interface com o sobrio carregado
python3 -I tools/vendor-darkreader.py 4.9.133 # atualiza o Dark Reader incluído
python3 -I tools/vendor-fonts.py              # atualiza as fontes incluídas
python3 -I tools/make-icons.py                # redesenha os ícones a partir da grade do isótipo
scripts/pack.sh                               # dist/sobrio-<version>.zip e .xpi
```

Para lançar uma versão, aumente a versão em `manifest.json`, faça o commit e envie uma tag `v<version>`. O workflow de lançamento testa, empacota e publica uma versão no GitHub com o zip e o xpi, e envia o xpi ao addons.mozilla.org quando a variável do repositório `AMO_PUBLISH` for `true` (com os segredos `AMO_JWT_ISSUER` e `AMO_JWT_SECRET`).

A identidade visual (o isótipo, as duas cores, a tipografia e os ícones) está em [docs/brand](docs/brand/README.md).

## Licença

MIT. Inclui o Dark Reader (MIT) e quatro fontes sob a SIL Open Font License: veja [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
