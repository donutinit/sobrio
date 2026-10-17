<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="docs/brand/banner-dark.png">
    <img src="docs/brand/banner-light.png" alt="sobrio. Web の見え方と、ブラウザの使い心地について独自の考えを持つ拡張機能。">
  </picture>
</p>

<p align="center">
  <a href="#何ができるか">何ができるか</a> ·
  <a href="#設定">設定</a> ·
  <a href="#インストール">インストール</a> ·
  <a href="#開発">開発</a>
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
  <b>日本語</b> ·
  <a href="README.ko.md">한국어</a> ·
  <a href="README.zh-CN.md">简体中文</a> ·
  <a href="README.zh-TW.md">繁體中文</a>
</sub></p>

sobrio は [Stylus](https://github.com/openstyles/stylus)、[Dark Reader](https://github.com/darkreader/darkreader)、[Search Bookmarks, History and Tabs](https://github.com/Fannon/search-bookmarks-history-and-tabs)、[Tabliss](https://github.com/joelshepherd/tabliss)、[Global Speed](https://github.com/polywock/globalSpeed) の小さな一部分だけを取り出したもので、ほかは含みません。Firefox、LibreWolf、Chrome に対応する一つの拡張機能です。色は二つだけ、角丸はなく、データはブラウザの外に出ません。

![switcherを開いた Wikipedia。sobrio によって黒くなっています。「ru」と入力すると、一致した文字を太字にした Rust のブックマークが表示されます。](docs/screens/switcher.png)

## 何ができるか

### すべてに一つのスタイルシート

角丸、影、テキストの影、ぼかしをなくします。アニメーションとトランジションは、YouTube のプレーヤーを除いてすべて削除します。スクロールバーをなくし、スムーズスクロールを止め、背景はページと一緒にスクロールします。リンクには下線が引かれ、どのテキストも選択でき、CSS による大文字の強制もなくなります。

それぞれの項目は設定の中のスイッチです（スクロールバーを隠す代わりに細いものを表示することもできます）。さらに二つはデフォルトではオフです。画像と動画をグレースケールにすること、フォーカスした要素に枠を表示することです。その下には独自の CSS を書く欄があります（50,000 文字まで）。これは sobrio のスタイルシートとは別のシートとして、すべてのサイトで後から読み込まれるので、先頭に書いた `@import` も機能します。

### 賢く黒く

![Wikipedia のタイポグラフィの記事。左半分はサイトが本来表示する白い状態、右半分は sobrio によって黒くなった状態。](docs/screens/wikipedia.png)

Dark Reader の動的エンジンが、すべてのサイトを色ごとに黒くします（`#000`）。独自のダークテーマを持つサイトは、そのテーマを保ちます。明るさ、コントラスト、セピア、グレースケール、各色は設定にあります。時間帯によるスケジュールはありません。

### switcher

<kbd>Ctrl</kbd>+<kbd>Space</kbd> を押すと、Obsidian のクイックスイッチャーのように、ページの中央にボックスが開きます。入力するとブックマークを検索します。あいまいさの度合いは設定で選べます（厳密、標準、ゆるい）。一致するものがなければ、<kbd>Enter</kbd> でウェブを検索します。<kbd>Tab</kbd> で Google、DuckDuckGo、YouTube、Wikipedia、GitHub と、独自の検索エンジン（`%s` を含むアドレス、たとえば SearXNG のインスタンス）を順に切り替えます。デフォルトの検索エンジンが先頭に来ます。これらの項目はどれもオフにできます。

switcherから開いたものを記録します。よく開くブックマークや、最近開いたブックマークは、結果の上位に上がります。設定の「統計」タブには、各ページが開かれた回数と重みが表示され、一つずつ、またはすべてリセットできます。

| キー | |
|---|---|
| <kbd>↓</kbd> <kbd>Ctrl</kbd>+<kbd>J</kbd> / <kbd>↑</kbd> <kbd>Ctrl</kbd>+<kbd>K</kbd> | 移動 |
| <kbd>Enter</kbd> | ここで開く |
| <kbd>Ctrl</kbd>/<kbd>Alt</kbd>+<kbd>Enter</kbd> | 新しいタブで開く |
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | 次 / 前の検索エンジン |
| <kbd>Esc</kbd> | 閉じる |

switcherに入力する三つのコマンドです。ツールバーのボタンからも使え、現在のタブのサイトに対して働きます。コマンドの語は設定の「switcher」タブで変更できます。

| コマンド | |
|---|---|
| `td` | 現在のサイトのダークモードのオン・オフ |
| `ta` | 現在のサイトのスタイルシートのオン・オフ |
| `settings` | 設定（`options` でも可） |

### 新しいタブ

![新しいタブの六つのレイアウト: クラシック、時刻のみ、1行、積み重ね、隅、アナログ。](docs/screens/layouts.png)

日付と時刻を整えて表示し、その下に switcherがあります。レイアウトは六種類です。クラシック、時刻のみ、1行、積み重ね（時が分の上）、隅、そしてミニマルなアナログ時計です。書体のスタイルは四種類です。エディトリアル（Instrument Serif と Inter）、スイス（Inter）、マシン（IBM Plex Mono）、ブック（EB Garamond）、またはお使いのマシンにインストールした独自のフォントです。名前を入れられるあいさつも任意で表示できます。言語のリストを設定すると、新しいタブを開くたびに、そのどれかの言語で日付がランダムに表示されます。Firefox と LibreWolf では、新しいタブはホームページにもなります。ブラウザは起動時と新しいウィンドウをそれで開きます。

ブラウザは新しいタブでフォーカスをアドレスバーに置いたままにし、拡張機能はそこからフォーカスを移せません。switcherにすぐ入力できるように、タブは同じ場所の新しいタブに置き換えられ、そのタブはページにフォーカスした状態で始まります。そのためアドレスバーは空のままにならず、ページのアドレスを表示します。Firefox のコンテナータブでは、この動作は行わず、そのままにします。ブラウザの動作を残したい場合は、*アドレスバーからフォーカスを移す* をオフにしてください。

### メディアの速度

すべての動画と音声は、設定した速度、またはサイトごとのルールの速度で再生されます。<kbd>]</kbd> で速く、<kbd>[</kbd> で遅く、<kbd>\\</kbd> で 1× に戻ります。0.91× から 1.09× までの速度は 1× とみなされます。サイト自身のコントロールで速度を変えた場合、sobrio はそのページではそれを変更しません。任意で、ページに触れる前から音を出し始めた動画と音声を一時停止できます。ミュートされたものは再生を続けます。

### 独自のショートカット

設定でキーの組み合わせを記録し、その動作を選びます。switcherを開く、検索エンジンで検索する（または選択したテキストを検索する）、サイトのダークモードやスタイルシートを切り替える、すべてのサイトのダークモード、ここで、または新しいタブでアドレスを開く、メディアの速度を設定する、追跡用のパラメータ（`utm_*`、`fbclid`、`gclid` など）を除いてページのリンクをコピーする、設定を開く、といった動作を割り当てられます。ショートカットには <kbd>Ctrl</kbd>、<kbd>Alt</kbd>、<kbd>Meta</kbd> のいずれか、またはファンクションキーが必要です。埋め込みフレーム（Google ドキュメント、動画プレーヤーなど）の中にフォーカスがあるときも動作し、サイトに関する動作は常にアドレスバーのサイトに対して行われます。

## 設定

![スタイルタブの設定画面。スイッチの一覧の横に、スタイル、ダークモード、例外、switcher、ショートカット、新しいタブ、メディア、統計のタブが並んでいます。](docs/screens/settings.png)

switcherに `settings` と入力するか、`about:addons` または `chrome://extensions` から拡張機能の設定を開きます。タブは部分ごとに分かれています。スタイル、ダークモード、例外、switcher、ショートカット、新しいタブ、メディア、統計です。変更はすべて自動で保存され、開いているタブにすぐ反映されます。

すべてのタブの下にあるバックアップは、設定、例外、ショートカット、switcherの記憶をファイルに保存し、別のブラウザで復元できます。インストール時に一度だけ開かれるようこそガイドも、ここから開けます。

ローカルアドレス（`localhost`、`127.0.0.1`、`192.168.x`、`.local` の名前、そのほかお使いのマシンやネットワークのアドレス）は、デフォルトでそのままにされるので、自分の作業は見えたままの姿で表示されます。これは例外タブの上部にあるスイッチで変更できます。

例外には、`example.com`（そのサイトだけ）または `*.example.com`（サイトとそのサブドメイン）の形式でサイトを指定します。スタイルシートとダークモードは別々に設定します。三つ目のリストでは、スタイルシートの残りが適用される一方で、サイト独自のアニメーションとトランジションを残せます。初期値は `chatgpt.com` で、アニメーションを削除すると、文章の生成中に表示がずれるためです。

### `userContent.css` でテーマを設定

Firefox と LibreWolf では、sobrio は（`toolkit.legacyUserProfileCustomizations.stylesheets` が有効なとき）`userContent.css` から次の変数を読み込み、ダークモード、switcher、設定、新しいタブに使います。これらは設定の色より優先されます。`@-moz-document` のルールにより、拡張機能のページだけで有効になり、どのウェブサイトからも見えません。

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

ブラウザは起動時に `userContent.css` を読み込むため、変更はブラウザを再起動すると反映されます。

## インストール

- **Chrome:** `chrome://extensions` を開き、*デベロッパーモード* をオンにして、*パッケージ化されていない拡張機能を読み込む* でこのフォルダを選びます。
- **LibreWolf:** `about:config` で `xpinstall.signatures.required` を `false` に設定し、`scripts/pack.sh` を実行して、`about:addons` から `dist/sobrio-<version>.xpi` を開きます（*ファイルからアドオンをインストール*）。手早く試すだけなら、`about:debugging` の *一時的なアドオンを読み込む* を使えば、この設定は不要です。
- **Firefox:** リリース版のビルドは署名されたアドオンしかインストールできません。zip を [addons.mozilla.org](https://addons.mozilla.org/developers/) に *非公開* としてアップロードすると、自分用に署名されます。

Firefox は、拡張機能が設定した新しいタブを残すかどうか一度尋ねます。残してください。ショートカットは `about:addons` の *拡張機能のショートカットを管理* または `chrome://extensions/shortcuts` で変更できます。

拡張機能が動作できないページ（`about:` と `chrome://` のページ、アドオンストア、PDF）では、ショートカットはツールバーのボタンから switcherを開きます。ツールバーのボタンは、どこでも switcherを開きます。Firefox では、一部のページが読み込まれてからしか認識されないことがあります（アドレスに `.pdf` が含まれない PDF、エラーページなど）。そうしたページではショートカットは何もしませんが、ツールバーのボタンは動作します。

**ヒント:** ブラウザまたはシステムをダークの外観にしてください。独自のダークテーマを持つサイト（GitHub、YouTube など多数）はそれに切り替わり、sobrio はそれらに手を加えません。

## 開発

ビルドの手順はなく、npm の依存もありません。

```sh
node --test                                   # unit tests
python3 -I tools/marionette.py . <url>...     # headless LibreWolf/Firefox with sobrio loaded
python3 -I tools/cdp.py . <url>...            # headless Chromium with sobrio loaded
python3 -I tools/vendor-darkreader.py 4.9.133 # update the bundled Dark Reader
python3 -I tools/vendor-fonts.py              # update the bundled fonts
python3 -I tools/make-icons.py                # redraw the icons from the isotype's grid
scripts/pack.sh                               # dist/sobrio-<version>.zip and .xpi
```

リリースするには、`manifest.json` のバージョンを上げてコミットし、タグ `v<version>` を push します。リリースのワークフローがテスト、パッケージ化を行い、zip と xpi を含む GitHub リリースを公開します。リポジトリ変数 `AMO_PUBLISH` が `true` の場合は、さらに（シークレット `AMO_JWT_ISSUER` と `AMO_JWT_SECRET` を使って）xpi を addons.mozilla.org に送信します。

ブランド（アイソタイプ、二つの色、書体、アイコン）は [docs/brand](docs/brand/README.md) にあります。

## ライセンス

MIT。Dark Reader（MIT）と、SIL Open Font License の下にある四つのフォントを同梱しています。詳しくは [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) を参照してください。
