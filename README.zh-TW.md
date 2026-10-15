<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="docs/brand/banner-dark.png">
    <img src="docs/brand/banner-light.png" alt="sobrio。一款有主見的擴充功能：網頁該是什麼模樣，瀏覽器該給人什麼感覺。">
  </picture>
</p>

<p align="center">
  <a href="#功能說明">功能說明</a> ·
  <a href="#設定">設定</a> ·
  <a href="#安裝">安裝</a> ·
  <a href="#開發">開發</a>
</p>

<p align="center"><sub>
  <a href="README.md">English</a> ·
  <a href="README.es.md">Español</a> ·
  <a href="README.de.md">Deutsch</a> ·
  <a href="README.fr.md">Français</a> ·
  <a href="README.it.md">Italiano</a> ·
  <a href="README.pt-BR.md">Português (Brasil)</a> ·
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
  <b>繁體中文</b>
</sub></p>

sobrio 只取用 [Stylus](https://github.com/openstyles/stylus)、[Dark Reader](https://github.com/darkreader/darkreader)、[Search Bookmarks, History and Tabs](https://github.com/Fannon/search-bookmarks-history-and-tabs)、[Tabliss](https://github.com/joelshepherd/tabliss) 與 [Global Speed](https://github.com/polywock/globalSpeed) 的一小部分，別無其他。它是一個同時適用於 Firefox、LibreWolf 與 Chrome 的擴充功能，只有兩種顏色，沒有圓角，而且資料不會離開你的瀏覽器。

![switcher 開啟於 Wikipedia 上方，sobrio 已將其變黑：輸入「ru」會列出 Rust 書籤，符合的字母會以粗體顯示。](docs/screens/switcher.png)

## 功能說明

### 一份樣式表，到處適用

沒有圓角、陰影、文字陰影或模糊。動畫與轉場效果全部截斷，YouTube 播放器除外。沒有捲軸、沒有平滑捲動，背景隨頁面捲動。連結加底線，任何文字都可以選取，CSS 也不強制大寫。

每一項都是設定中的一個開關（細捲軸也是，可取代隱藏捲軸）。另外兩項預設關閉：圖片與影片改為灰階，以及明顯的焦點外框。在它們下方有一個方框，供你輸入自己的 CSS（最多 50,000 個字元）。它會在每個網站上放在 sobrio 樣式表之後的獨立樣式表中，因此最上方的 `@import` 可以正常運作。

### 聰明的黑色

![Wikipedia 的排版條目：左半邊是網站原本的白色，右半邊是套用 sobrio 後的黑色。](docs/screens/wikipedia.png)

Dark Reader 的動態引擎會把每個網站變成黑色（`#000`），逐色轉換。本來就有自己深色主題的網站會保留它。亮度、對比、棕褐色、灰階與顏色都在設定中調整，沒有排程功能。

### switcher

<kbd>Ctrl</kbd>+<kbd>Space</kbd> 會在頁面中央開啟一個方框，類似 Obsidian 的快速切換器。輸入文字即可搜尋你的書籤；模糊比對的程度是一項設定（嚴格、一般或寬鬆）。如果沒有任何符合的項目，按 <kbd>Enter</kbd> 會改為在網路上搜尋。按 <kbd>Tab</kbd> 可循環切換 Google、DuckDuckGo、YouTube、Wikipedia、GitHub 與你自己的搜尋引擎（任何含有 `%s` 的網址，例如 SearXNG 執行個體）；預設搜尋引擎會排在最前面。以上任何項目都可以關閉。

它會記住你從這裡開啟過的項目：你經常開啟、或最近開啟的書籤，會在結果中往上排。設定中的「統計」分頁會顯示每個頁面被開啟的次數與權重，並可重設單一或全部。

| 按鍵 | |
|---|---|
| <kbd>↓</kbd> <kbd>Ctrl</kbd>+<kbd>J</kbd> / <kbd>↑</kbd> <kbd>Ctrl</kbd>+<kbd>K</kbd> | 移動 |
| <kbd>Enter</kbd> | 在此開啟 |
| <kbd>Ctrl</kbd>/<kbd>Alt</kbd>+<kbd>Enter</kbd> | 在新分頁開啟 |
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | 下一個 / 上一個搜尋引擎 |
| <kbd>Esc</kbd> | 關閉 |

在 switcher 中輸入的三個指令。它們也能從工具列按鈕使用，作用於目前分頁的網站，而指令的文字可以在「設定 › Switcher」中自行更改：

| 指令 | |
|---|---|
| `td` | 開啟或關閉目前網站的深色模式 |
| `ta` | 開啟或關閉目前網站的樣式表 |
| `settings` | 開啟設定（`options` 也可以） |

### 新分頁

![新分頁的六種版面：經典、只顯示時間、一行、堆疊、角落與類比。](docs/screens/layouts.png)

日期與時間經過精心排版，switcher 位於其下方。共有六種版面：經典、只顯示時間、一行、堆疊（小時在上、分鐘在下）、角落，以及極簡的類比時鐘。四種字體風格：編輯風（Instrument Serif 與 Inter）、瑞士風（Inter）、打字機風（IBM Plex Mono）與書本風（EB Garamond），或是安裝在這台電腦上的你自己的字型。可以加上含你名字的問候語。你也可以提供一份語言清單，之後每個新分頁會隨機以其中一種語言顯示日期。

瀏覽器會在新分頁上保留網址列的焦點，而擴充功能無法從那裡取走。為了讓你能立即在 switcher 中輸入，分頁會在同一位置換成一個新的分頁，新分頁一開始就具有焦點；此時網址列會顯示該頁面的網址，而不是保持空白。在 Firefox 的容器分頁中，行為保持不變。若要保留瀏覽器原本的做法，請關閉 *將焦點從網址列移開*。

### 媒體播放速度

每個影片與音訊都會以你設定的速度播放，或依照網站自己的規則。<kbd>]</kbd> 加速，<kbd>[</kbd> 減速，<kbd>\\</kbd> 恢復為 1×。介於 0.91× 與 1.09× 之間的速度視為 1×。如果你用網站自己的控制項改變速度，sobrio 會在該頁面上不去干預。也可以選擇暫停在你碰觸頁面之前就已開始發出聲音的影片與音訊；靜音的則照常播放。

### 你自己的快速鍵

在設定中錄製一組按鍵組合，並選擇它的功能：開啟 switcher、在搜尋引擎中搜尋（或搜尋選取的文字）、切換該網站的深色模式或樣式表、所有網站的深色模式、在此或新分頁開啟網址、設定媒體播放速度、複製頁面的連結並移除追蹤參數（`utm_*`、`fbclid`、`gclid` 等），或開啟設定。快速鍵需要 <kbd>Ctrl</kbd>、<kbd>Alt</kbd> 或 <kbd>Meta</kbd>，或功能鍵。它們在嵌入的框架中（Google 文件、影片播放器）焦點位於其中時也能使用，而且一律作用於網址列中的網站。

## 設定

![設定頁面位於「樣式」分頁：左側是一列開關，旁邊是分頁：樣式、深色模式、例外、Switcher、快速鍵、新分頁、媒體與統計。](docs/screens/settings.png)

在 switcher 中輸入 `settings`，或從 `about:addons` / `chrome://extensions` 開啟擴充功能的偏好設定。每個部分各一個分頁：樣式、深色模式、例外、Switcher、快速鍵、新分頁、媒體與統計。每項變更都會自動儲存，並立即套用到已開啟的分頁。

每個分頁底部的備份會把所有內容（設定、例外、快速鍵與 switcher 的記憶）儲存為一個檔案，並可在另一個瀏覽器中還原。安裝時會開啟一次的歡迎指南也在這裡。

預設情況下，本機網址（`localhost`、`127.0.0.1`、`192.168.x`、`.local` 名稱，以及你電腦或網路上的其他位址）會保持不變，讓你自己的作品以原本的樣子顯示；例外分頁頂端的開關可以改變這點。

例外可以指定為 `example.com`（僅該網站）或 `*.example.com`（該網站及其子網域），樣式表與深色模式各自分開設定。第三個清單會保留某些網站自己的動畫與轉場效果，同時其餘的樣式表照常套用；預設包含 `chatgpt.com`，因為若截斷它的動畫，它在輸出文字時畫面會飄移。

### 用 `userContent.css` 設定主題

在 Firefox 與 LibreWolf 中，sobrio 會從 `userContent.css` 讀取這些變數（需開啟 `toolkit.legacyUserProfileCustomizations.stylesheets`），並用於深色模式、switcher、設定與新分頁。它們會優先於設定中的顏色。`@-moz-document` 規則讓它們只作用於擴充功能頁面：任何網站都看不到。

```css
@-moz-document url-prefix("moz-extension://") {
  :root {
    --sobrio-background: #07090f;   /* dark mode, switcher and new tab background */
    --sobrio-text: #edf1ff;
    --sobrio-text-muted: #7c86a0;
    --sobrio-selection: #171d2b;    /* the selected row, and selected text */
    --sobrio-border: #4a5470;
    --sobrio-accent: #f5a9cf;       /* the selection bar and the matched letters */
    --sobrio-corners: square;       /* square or round: overrides the corners switch */
    --sobrio-font: "SF Pro Text";   /* optional: a font installed on this machine */
  }
}
```

瀏覽器會在啟動時讀取 `userContent.css`，因此變更要重新啟動後才會顯示。

## 安裝

- **Chrome：** 開啟 `chrome://extensions`，開啟*開發人員模式*，點選*載入未封裝項目*，然後選取此資料夾。
- **LibreWolf：** 在 `about:config` 中將 `xpinstall.signatures.required` 設為 `false`，執行 `scripts/pack.sh`，然後從 `about:addons` 開啟 `dist/sobrio-<version>.xpi`（*從檔案安裝附加元件*）。若只想快速試用，`about:debugging` › *載入暫時附加元件* 不需要該偏好設定。
- **Firefox：** 正式版本只會安裝已簽署的附加元件。將 zip 上傳到 [addons.mozilla.org](https://addons.mozilla.org/developers/)，並選擇*未列出*，即可為自己取得簽署。

Firefox 會詢問一次是否保留擴充功能設定的新分頁：請保留。快速鍵可以在 `about:addons` › *管理擴充功能快速鍵* 或 `chrome://extensions/shortcuts` 中更改。

在擴充功能無法執行的頁面上（`about:` 與 `chrome://` 頁面、附加元件商店、PDF），快速鍵會改為從工具列按鈕開啟 switcher。工具列按鈕一律可以開啟它。在 Firefox 中，少數頁面會太晚才被識別（網址中沒有 `.pdf` 的 PDF，或錯誤頁面）：在這些頁面上快速鍵不會有作用，但工具列按鈕仍可使用。

**提示：** 將你的瀏覽器或系統設為深色外觀。自帶深色主題的網站（GitHub、YouTube 等許多網站）會切換過去，而 sobrio 則不會干預。

## 開發

沒有建置步驟，也沒有 npm 相依套件。

```sh
node --test                                   # unit tests
python3 -I tools/marionette.py . <url>...     # headless LibreWolf/Firefox with sobrio loaded
python3 -I tools/cdp.py . <url>...            # headless Chromium with sobrio loaded
python3 -I tools/vendor-darkreader.py 4.9.133 # update the bundled Dark Reader
python3 -I tools/vendor-fonts.py              # update the bundled fonts
python3 -I tools/make-icons.py                # redraw the icons from the isotype's grid
scripts/pack.sh                               # dist/sobrio-<version>.zip and .xpi
```

若要發布，請在 `manifest.json` 中提高版本號、提交變更，然後推送標籤 `v<version>`。發布工作流程會測試、打包，並發布含 zip 與 xpi 的 GitHub 版本；當儲存庫變數 `AMO_PUBLISH` 為 `true`（並設定機密 `AMO_JWT_ISSUER` 與 `AMO_JWT_SECRET`）時，還會把 zip 送到 addons.mozilla.org。

品牌（標誌圖形、兩種顏色、字體與圖示）位於 [docs/brand](docs/brand/README.md)。

## 授權

MIT。內含 Dark Reader（MIT）與四種依 SIL Open Font License 授權的字型：請見 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。
