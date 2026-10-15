<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="docs/brand/banner-dark.png">
    <img src="docs/brand/banner-light.png" alt="sobrio。一个有主见的扩展：网页该是什么样子，浏览器该是什么感觉。">
  </picture>
</p>

<p align="center">
  <a href="#功能">功能</a> ·
  <a href="#设置">设置</a> ·
  <a href="#安装">安装</a> ·
  <a href="#开发">开发</a>
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
  <b>简体中文</b> ·
  <a href="README.zh-TW.md">繁體中文</a>
</sub></p>

sobrio 只取用 [Stylus](https://github.com/openstyles/stylus)、[Dark Reader](https://github.com/darkreader/darkreader)、[Search Bookmarks, History and Tabs](https://github.com/Fannon/search-bookmarks-history-and-tabs)、[Tabliss](https://github.com/joelshepherd/tabliss) 和 [Global Speed](https://github.com/polywock/globalSpeed) 中的一小部分，除此之外别无其他。它是一个同时适用于 Firefox、LibreWolf 和 Chrome 的扩展：两种颜色，没有圆角，数据不会离开你的浏览器。

![switcher 打开在 Wikipedia 上方，sobrio 已将其变为黑色：输入 "ru" 会列出 Rust 相关书签，匹配的字母加粗显示。](docs/screens/switcher.png)

## 功能

### 一个样式表，处处生效

没有圆角、阴影、文字阴影和模糊。动画和过渡效果全部剪除，YouTube 播放器除外。没有滚动条，没有平滑滚动，背景随页面滚动。链接加下划线，任何文字都可以选中，不强制 CSS 大写。

每一项都是设置中的一个开关（细滚动条也是，而非完全没有滚动条），另外两项默认关闭：图片和视频使用灰度，以及可见的焦点边框。下方是你自己的 CSS 输入框（最多 50,000 个字符），它位于 sobrio 样式之后、独立的样式表中，应用于每个网站，因此其顶部的 `@import` 可以生效。

### 智能的黑色

![Wikipedia 关于字体排版的文章：左半边是网站原本的样子，白色；右半边是 sobrio 处理后的效果，黑色。](docs/screens/wikipedia.png)

Dark Reader 的动态引擎会逐色把每个网站变为黑色（`#000`）。已经拥有自己深色主题的网站会保留它。亮度、对比度、褐色调、灰度和颜色都在设置中；没有定时计划。

### 一个 switcher

<kbd>Ctrl</kbd>+<kbd>Space</kbd> 会在页面中央打开一个框，类似 Obsidian 的快速切换器。输入即可搜索你的书签；模糊程度是一项设置（严格、普通或宽松）。如果没有匹配项，<kbd>Enter</kbd> 会改为搜索网页。<kbd>Tab</kbd> 会依次切换 Google、DuckDuckGo、YouTube、Wikipedia、GitHub 以及你自己的搜索引擎（任何包含 `%s` 的地址，比如 SearXNG 实例）；默认搜索引擎排在最前面。以上任何一项都可以关闭。

它会记住你通过它打开过的内容：经常打开、最近打开的书签会在结果中排得更靠前。设置中的“统计”标签页会显示每个页面被打开的次数及其权重，并可以重置单个或全部。

| 按键 | 作用 |
|---|---|
| <kbd>↓</kbd> <kbd>Ctrl</kbd>+<kbd>J</kbd> / <kbd>↑</kbd> <kbd>Ctrl</kbd>+<kbd>K</kbd> | 移动 |
| <kbd>Enter</kbd> | 在此打开 |
| <kbd>Ctrl</kbd>/<kbd>Alt</kbd>+<kbd>Enter</kbd> | 在新标签页中打开 |
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | 下一个 / 上一个搜索引擎 |
| <kbd>Esc</kbd> | 关闭 |

在 switcher 中输入以下三个命令即可使用。它们也可以通过工具栏按钮使用，作用于当前标签页的网站；命令的文字可以在设置 › Switcher 中修改：

| 命令 | 作用 |
|---|---|
| `td` | 开启或关闭当前网站的深色模式 |
| `ta` | 开启或关闭当前网站的样式表 |
| `settings` | 打开设置（`options` 同样有效） |

### 新标签页

![新标签页的六种布局：经典、只显示时间、单行、堆叠、角落和模拟。](docs/screens/layouts.png)

日期和时间经过精心排版，switcher 位于其下方。六种布局：经典、只显示时间、单行、堆叠（小时在上，分钟在下）、角落，以及极简的模拟时钟。四种字体风格：社论（Instrument Serif 与 Inter）、瑞士风格（Inter）、机器风格（IBM Plex Mono）和书籍风格（EB Garamond），也可以使用安装在你设备上的字体。可选的问候语会带上你的名字。给它一个语言列表，每个新标签页都会随机用其中一种语言显示日期。

浏览器会把新标签页的焦点保留在地址栏中，扩展无法从那里将其移开。为了让你可以立即在 switcher 中输入，标签页会在原位置被替换为一个新标签页，新标签页一开始就获得焦点；此时地址栏会显示该页面的地址，而不是保持空白。在 Firefox 容器标签页中则保持原样。如果你想保留浏览器的方式，请关闭 *将焦点从地址栏移开*。

### 媒体速度

每个视频和音频都会以你设置的速度播放，或遵循网站自己的规则。<kbd>]</kbd> 加速，<kbd>[</kbd> 减速，<kbd>\\</kbd> 恢复为 1×。0.91× 到 1.09× 之间的速度都视为 1×。如果你使用网站自带的控件更改速度，sobrio 会在该页面上不予干预。可选择暂停在你触碰页面之前就开始发声的视频和音频；静音的会继续播放。

### 你自己的快捷键

在设置中录制按键组合，并选择它的作用：打开 switcher、在搜索引擎中搜索（或搜索选中的文字）、切换此网站的深色模式或样式表、在所有网站开启深色模式、在此处或新标签页中打开一个地址、设置媒体速度、复制页面的链接并去除追踪参数（`utm_*`、`fbclid`、`gclid` 等），或打开设置。快捷键需要 <kbd>Ctrl</kbd>、<kbd>Alt</kbd> 或 <kbd>Meta</kbd>，或一个功能键。它们在嵌入框架（Google 文档、视频播放器）内获得焦点时同样有效，并且始终作用于地址栏中的网站。

## 设置

![设置页面，位于样式标签页：一排开关，旁边是标签页：样式、深色模式、例外、switcher、快捷键、新标签页、媒体和统计。](docs/screens/settings.png)

在 switcher 中输入 `settings`，或在 `about:addons` / `chrome://extensions` 中打开扩展的首选项。每个部分一个标签页：样式、深色模式、例外、switcher、快捷键、新标签页、媒体和统计。每项更改都会自动保存，并立即应用到已打开的标签页。

每个标签页底部的备份功能会将所有内容（设置、例外、快捷键和 switcher 的记忆）保存到一个文件中，并可在另一个浏览器中恢复。首次安装时会打开一次的欢迎指南也在这里。

本地地址（`localhost`、`127.0.0.1`、`192.168.x`、`.local` 名称，以及你的设备或网络中的其余地址）默认不做处理，因此你自己的工作会保持原样显示；例外标签页顶部的开关可以改变这一点。

例外可以按 `example.com`（仅该网站）或 `*.example.com`（该网站及其子域名）来设置，分别用于样式表和深色模式。第三个列表会保留某个网站自身的动画和过渡效果，同时其余样式表照常生效；它默认包含 `chatgpt.com`，因为如果剪除它的动画，它在输出文字时画面会漂移。

### 通过 `userContent.css` 设置主题

在 Firefox 和 LibreWolf 中（需开启 `toolkit.legacyUserProfileCustomizations.stylesheets`），sobrio 会从 `userContent.css` 读取以下变量，并将它们用于深色模式、switcher、设置和新标签页。它们优先于设置中的颜色。`@-moz-document` 规则使它们仅作用于扩展页面：任何网站都无法看到它们。

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

浏览器在启动时读取 `userContent.css`，因此更改需要重启后才能生效。

## 安装

- **Chrome：** 打开 `chrome://extensions`，开启 *开发者模式*，点击 *加载已解压的扩展程序*，然后选择此文件夹。
- **LibreWolf：** 在 `about:config` 中将 `xpinstall.signatures.required` 设为 `false`，运行 `scripts/pack.sh`，然后在 `about:addons` 中打开 `dist/sobrio-<version>.xpi`（*从文件安装附加组件*）。若只想快速试用，`about:debugging` › *临时载入附加组件* 无需该设置即可使用。
- **Firefox：** 正式版本只会安装经过签名的附加组件。将压缩包作为 *未列出* 的附加组件上传到 [addons.mozilla.org](https://addons.mozilla.org/developers/)，即可为自己获取签名。

Firefox 会询问一次是否保留扩展设置的新标签页：请保留。快捷键可以在 `about:addons` › *管理扩展快捷键* 或 `chrome://extensions/shortcuts` 中修改。

在扩展无法运行的页面上（`about:` 和 `chrome://` 页面、附加组件商店、PDF），快捷键会改为从工具栏按钮打开 switcher。工具栏按钮始终可以打开它。在 Firefox 中，少数页面的识别时间过晚（地址中不含 `.pdf` 的 PDF，错误页面）：在这些页面上快捷键无效，但工具栏按钮仍然可用。

**提示：** 将浏览器或系统设为深色外观。自带深色主题的网站（GitHub、YouTube 等更多）会切换到该主题，sobrio 则不作干预。

## 开发

无需构建步骤，也没有 npm 依赖。

```sh
node --test                                   # unit tests
python3 -I tools/marionette.py . <url>...     # headless LibreWolf/Firefox with sobrio loaded
python3 -I tools/cdp.py . <url>...            # headless Chromium with sobrio loaded
python3 -I tools/vendor-darkreader.py 4.9.133 # update the bundled Dark Reader
python3 -I tools/vendor-fonts.py              # update the bundled fonts
python3 -I tools/make-icons.py                # redraw the icons from the isotype's grid
scripts/pack.sh                               # dist/sobrio-<version>.zip and .xpi
```

要发布新版本，请在 `manifest.json` 中提升版本号，提交，并推送标签 `v<version>`。发布工作流会测试、打包，并发布包含 zip 和 xpi 的 GitHub 发布版本；当仓库变量 `AMO_PUBLISH` 为 `true` 时（并配置了密钥 `AMO_JWT_ISSUER` 和 `AMO_JWT_SECRET`），还会将 zip 发送至 addons.mozilla.org。

品牌标识（图形标志、两种颜色、字体和图标）位于 [docs/brand](docs/brand/README.md)。

## 许可证

MIT。内含 Dark Reader（MIT 许可证）以及四种字体，它们采用 SIL 开放字体许可证：参见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。
