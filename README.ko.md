<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="docs/brand/banner-dark.png">
    <img src="docs/brand/banner-light.png" alt="sobrio. 웹이 어떻게 보여야 하고 브라우저가 어떤 느낌이어야 하는지에 대한 확고한 의견을 담은 확장 기능.">
  </picture>
</p>

<p align="center">
  <a href="#무엇을-하는가">무엇을 하는가</a> ·
  <a href="#설정">설정</a> ·
  <a href="#설치">설치</a> ·
  <a href="#개발">개발</a>
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
  <b>한국어</b> ·
  <a href="README.zh-CN.md">简体中文</a> ·
  <a href="README.zh-TW.md">繁體中文</a>
</sub></p>

sobrio는 [Stylus](https://github.com/openstyles/stylus), [Dark Reader](https://github.com/darkreader/darkreader), [Search Bookmarks, History and Tabs](https://github.com/Fannon/search-bookmarks-history-and-tabs), [Tabliss](https://github.com/joelshepherd/tabliss), [Global Speed](https://github.com/polywock/globalSpeed)의 작은 일부만 가져오고, 그 밖의 것은 가져오지 않습니다. Firefox, LibreWolf, Chrome용 확장 기능 하나이며, 색은 두 가지뿐이고, 둥근 모서리가 없으며, 데이터는 브라우저 밖으로 나가지 않습니다.

![switcher가 열린 Wikipedia 화면. sobrio가 페이지를 검게 바꾸었고, "ru"를 입력하면 일치하는 글자를 굵게 표시한 Rust 북마크 목록이 나타납니다.](docs/screens/switcher.png)

## 무엇을 하는가

### 하나의 스타일시트, 어디서나

둥근 모서리, 그림자, 텍스트 그림자, 흐림 효과가 없습니다. 애니메이션과 전환 효과는 모두 없어지며, YouTube 플레이어만 예외입니다. 스크롤바도, 부드러운 스크롤도 없고, 배경은 페이지와 함께 스크롤됩니다. 링크에는 밑줄이 있고, 모든 텍스트를 선택할 수 있으며, CSS로 강제된 대문자는 없습니다.

각 항목은 설정의 스위치입니다. 스크롤바도 아예 없애는 대신 얇게 보이게 할 수 있습니다. 기본으로 꺼져 있는 두 가지는 이미지와 비디오를 회색조로 보는 것과 포커스된 요소에 보이는 테두리입니다. 그 아래에는 직접 쓰는 CSS 칸이 있습니다(최대 50,000자). 이 CSS는 모든 사이트에서 sobrio 스타일 뒤에 별도의 시트로 적용되므로, 맨 위의 `@import`도 동작합니다.

### 똑똑하게 검게

![Wikipedia의 타이포그래피 문서. 왼쪽 절반은 사이트가 원래 보여 주는 흰색이고, 오른쪽 절반은 sobrio를 적용한 검은색입니다.](docs/screens/wikipedia.png)

Dark Reader의 동적 엔진이 모든 사이트를 색상별로 검게(`#000`) 바꿉니다. 이미 고유한 어두운 테마가 있는 사이트는 그 테마를 유지합니다. 밝기, 대비, 세피아, 회색조와 색상은 설정에서 조절하며, 일정에 따라 바뀌는 기능은 없습니다.

### switcher

<kbd>Ctrl</kbd>+<kbd>Space</kbd>를 누르면 Obsidian의 빠른 전환기처럼 페이지 가운데에 상자가 열립니다. 입력하면 북마크를 검색합니다. 얼마나 느슨하게 맞출지는 설정에서 정합니다(엄격, 보통, 느슨함). 일치하는 항목이 없으면 <kbd>Enter</kbd>로 웹에서 검색합니다. <kbd>Tab</kbd>으로 Google, DuckDuckGo, YouTube, Wikipedia, GitHub와 직접 추가한 검색 엔진(`%s`가 들어간 주소라면 무엇이든, 예: SearXNG 인스턴스)을 차례로 바꿀 수 있습니다. 기본 검색 엔진이 맨 앞에 옵니다. 이 중 어느 것이든 끌 수 있습니다.

switcher는 여기서 연 항목을 기억합니다. 자주 열거나 최근에 연 북마크는 결과에서 위로 올라갑니다. 설정의 통계 탭은 각 페이지를 몇 번 열었는지와 그 가중치를 보여 주며, 하나씩 또는 전체를 초기화할 수 있습니다.

| 키 | |
|---|---|
| <kbd>↓</kbd> <kbd>Ctrl</kbd>+<kbd>J</kbd> / <kbd>↑</kbd> <kbd>Ctrl</kbd>+<kbd>K</kbd> | 이동 |
| <kbd>Enter</kbd> | 여기서 열기 |
| <kbd>Ctrl</kbd>/<kbd>Alt</kbd>+<kbd>Enter</kbd> | 새 탭에서 열기 |
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | 다음 / 이전 검색 엔진 |
| <kbd>Esc</kbd> | 닫기 |

switcher에 입력하는 명령은 세 가지입니다. 도구 모음 버튼에서도 동작하며, 현재 탭의 사이트에 적용됩니다. 명령어는 설정의 switcher 탭에서 바꿀 수 있습니다.

| 명령 | |
|---|---|
| `td` | 현재 사이트의 다크 모드 켜기 또는 끄기 |
| `ta` | 현재 사이트의 스타일시트 켜기 또는 끄기 |
| `settings` | 설정 열기 (`options`도 동작합니다) |

### 새 탭

![새 탭의 여섯 가지 배치: 클래식, 시간만, 한 줄, 쌓기, 모서리, 아날로그.](docs/screens/layouts.png)

날짜와 시간을 정갈하게 보여 주고, 그 아래에 switcher가 있습니다. 배치는 여섯 가지입니다. 클래식, 시간만, 한 줄, 쌓기(시간 위에 분), 모서리, 단순한 아날로그 시계입니다. 서체는 네 가지입니다. Editorial(Instrument Serif와 Inter), Swiss(Inter), Machine(IBM Plex Mono), Book(EB Garamond)입니다. 이 기기에 설치한 글꼴을 쓸 수도 있습니다. 이름을 넣은 인사말을 선택할 수 있고, 언어 목록을 주면 새 탭마다 그중 하나의 언어로, 무작위로 날짜를 보여 줍니다. Firefox와 LibreWolf에서 새 탭은 홈페이지이기도 합니다. 브라우저는 이 탭으로 시작하며, 새 창마다 이 탭이 열립니다.

브라우저는 새 탭에서 포커스를 주소창에 둡니다. 확장 기능은 거기서 포커스를 가져올 수 없습니다. 그래서 switcher에 바로 입력할 수 있도록, 탭을 같은 자리의 새 탭으로 바꿉니다. 새 탭은 포커스가 페이지에 있는 상태로 시작하며, 주소창은 빈칸 대신 페이지 주소를 보여 줍니다. Firefox 컨테이너 탭에서는 그대로 둡니다. 브라우저의 방식을 유지하려면 *주소창에서 포커스 빼앗기*를 끄세요.

### 미디어 속도

모든 비디오와 오디오가 설정한 속도로, 또는 사이트의 고유한 규칙에 따라 재생됩니다. <kbd>]</kbd>는 빠르게, <kbd>[</kbd>는 느리게, <kbd>\\</kbd>는 1×로 되돌립니다. 0.91×에서 1.09× 사이는 모두 1×로 봅니다. 사이트 자체 컨트롤로 속도를 바꾸면, 그 페이지에서는 sobrio가 건드리지 않습니다. 선택 사항으로, 페이지를 건드리기 전에 소리가 나기 시작한 비디오와 오디오를 일시정지할 수 있습니다. 음소거된 것은 그대로 재생됩니다.

### 나만의 단축키

설정에서 키 조합을 기록하고 동작을 고르세요. switcher 열기, 검색 엔진에서 검색(또는 선택한 텍스트 검색), 이 사이트의 다크 모드나 스타일시트 켜고 끄기, 모든 사이트에서 다크 모드, 여기서 또는 새 탭에서 주소 열기, 미디어 속도 지정, 추적 매개변수(`utm_*`, `fbclid`, `gclid` 등)를 뺀 페이지 링크 복사, 설정 열기 중에서 고를 수 있습니다. 조합에는 <kbd>Ctrl</kbd>, <kbd>Alt</kbd> 또는 <kbd>Meta</kbd>가 들어 있거나 기능 키여야 합니다. 임베드된 프레임 안에 포커스가 있을 때(Google Docs, 비디오 플레이어)도 동작하며, 항상 주소창의 사이트에 적용됩니다.

## 설정

![설정 화면의 스타일 탭. 왼쪽에는 스위치 목록이, 위에는 스타일, 다크 모드, 예외, switcher, 단축키, 새 탭, 미디어, 통계 탭이 있습니다.](docs/screens/settings.png)

switcher에 `settings`를 입력하거나, `about:addons` / `chrome://extensions`에서 확장 기능의 환경 설정을 여세요. 부분마다 탭이 하나씩 있습니다. 스타일, 다크 모드, 예외, switcher, 단축키, 새 탭, 미디어, 통계입니다. 모든 변경은 자동으로 저장되며 열린 탭에 바로 적용됩니다.

모든 탭 아래쪽의 백업은 설정, 예외, 단축키, switcher의 기억을 파일로 저장하고, 다른 브라우저에서 복원할 수 있게 합니다. 설치할 때 한 번 열리는 시작 안내도 여기에 있습니다.

`localhost`, `127.0.0.1`, `192.168.x`, `.local` 이름 등 내 기기나 네트워크의 주소는 기본적으로 건드리지 않으므로, 내 작업은 원래 모습 그대로 보입니다. 예외 탭 위쪽의 스위치로 이를 바꿀 수 있습니다.

예외는 `example.com`(그 사이트만) 또는 `*.example.com`(사이트와 하위 도메인)의 형식으로 적습니다. 스타일시트와 다크 모드에 대해 따로 적용됩니다. 세 번째 목록은 나머지 sobrio 스타일은 적용하되 사이트의 고유한 애니메이션과 전환 효과는 그대로 둡니다. 기본으로 `chatgpt.com`이 들어 있는데, 애니메이션을 잘라 내면 답변을 쓰는 동안 화면이 흔들리기 때문입니다.

### `userContent.css`에서 테마 설정하기

Firefox와 LibreWolf에서 sobrio는 (`toolkit.legacyUserProfileCustomizations.stylesheets`가 켜져 있으면) `userContent.css`에서 이 변수들을 읽어 다크 모드, switcher, 설정, 새 탭에 사용합니다. 이 값은 설정의 색상보다 우선합니다. `@-moz-document` 규칙은 확장 기능 페이지에만 적용하므로, 어떤 웹사이트도 이 값을 볼 수 없습니다.

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

브라우저는 시작할 때 `userContent.css`를 읽으므로, 변경 사항은 다시 시작한 뒤에 나타납니다.

## 설치

- **Chrome:** `chrome://extensions`에서 *개발자 모드*를 켜고 *압축해제된 확장 프로그램을 로드합니다*를 누른 다음 이 폴더를 고르세요.
- **LibreWolf:** `about:config`에서 `xpinstall.signatures.required`를 `false`로 설정하고, `scripts/pack.sh`를 실행한 다음 `about:addons`에서 `dist/sobrio-<version>.xpi`를 엽니다(*파일에서 부가 기능 설치*). 빠르게 시험해 보려면 이 설정 없이 `about:debugging`의 *임시 부가 기능 로드*를 쓸 수 있습니다.
- **Firefox:** 정식 빌드는 서명된 부가 기능만 설치합니다. zip 파일을 [addons.mozilla.org](https://addons.mozilla.org/developers/)에 *비공개(unlisted)*로 올려 나만을 위한 서명을 받으세요.

Firefox가 확장 기능이 설정한 새 탭을 유지할지 한 번 물으면 유지하세요. 단축키는 `about:addons`의 *확장 기능 단축키 관리* 또는 `chrome://extensions/shortcuts`에서 바꿀 수 있습니다.

확장 기능이 실행될 수 없는 페이지(`about:`와 `chrome://` 페이지, 부가 기능 스토어, PDF)에서는 단축키 대신 도구 모음 버튼으로 switcher를 엽니다. 도구 모음 버튼은 언제나 switcher를 엽니다. Firefox에서는 일부 페이지가 너무 늦게 인식됩니다(주소에 `.pdf`가 없는 PDF, 오류 페이지). 그런 곳에서는 단축키가 동작하지 않지만 도구 모음 버튼은 동작합니다.

**팁:** 브라우저나 시스템을 어두운 모양으로 설정하세요. 고유한 어두운 테마가 있는 사이트(GitHub, YouTube 등 많은 곳)는 그 테마로 바뀌고, sobrio는 그 사이트를 건드리지 않습니다.

## 개발

빌드 단계가 없고 npm 의존성도 없습니다.

```sh
node --test                                   # unit tests
python3 -I tools/marionette.py . <url>...     # headless LibreWolf/Firefox with sobrio loaded
python3 -I tools/cdp.py . <url>...            # headless Chromium with sobrio loaded
python3 -I tools/vendor-darkreader.py 4.9.133 # update the bundled Dark Reader
python3 -I tools/vendor-fonts.py              # update the bundled fonts
python3 -I tools/make-icons.py                # redraw the icons from the isotype's grid
scripts/pack.sh                               # dist/sobrio-<version>.zip and .xpi
```

릴리스하려면 `manifest.json`의 버전을 올리고, 커밋한 다음 `v<version>` 태그를 푸시하세요. 릴리스 워크플로는 테스트하고 패키징한 뒤 zip과 xpi가 담긴 GitHub 릴리스를 만듭니다. 저장소 변수 `AMO_PUBLISH`가 `true`이면(시크릿 `AMO_JWT_ISSUER`와 `AMO_JWT_SECRET`과 함께) xpi를 addons.mozilla.org로 보냅니다.

브랜드(아이소타입, 두 가지 색, 서체, 아이콘)는 [docs/brand](docs/brand/README.md)에 있습니다.

## 라이선스

MIT 라이선스입니다. Dark Reader(MIT)와 SIL Open Font License에 따른 네 가지 글꼴을 포함합니다. 자세한 내용은 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)를 보세요.
