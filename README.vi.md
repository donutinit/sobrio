<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="docs/brand/banner-dark.png">
    <img src="docs/brand/banner-light.png" alt="sobrio. Một tiện ích có quan điểm riêng về cách web nên trông và trình duyệt nên cảm giác thế nào.">
  </picture>
</p>

<p align="center">
  <a href="#tính-năng">Tính năng</a> ·
  <a href="#cài-đặt">Cài đặt</a> ·
  <a href="#cài-đặt-vào-trình-duyệt">Cài đặt vào trình duyệt</a> ·
  <a href="#phát-triển">Phát triển</a>
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
  <b>Tiếng Việt</b> ·
  <a href="README.ja.md">日本語</a> ·
  <a href="README.ko.md">한국어</a> ·
  <a href="README.zh-CN.md">简体中文</a> ·
  <a href="README.zh-TW.md">繁體中文</a>
</sub></p>

sobrio lấy một phần nhỏ từ [Stylus](https://github.com/openstyles/stylus), [Dark Reader](https://github.com/darkreader/darkreader), [Search Bookmarks, History and Tabs](https://github.com/Fannon/search-bookmarks-history-and-tabs), [Tabliss](https://github.com/joelshepherd/tabliss) và [Global Speed](https://github.com/polywock/globalSpeed), và không lấy gì khác. Một tiện ích cho Firefox, LibreWolf và Chrome, hai màu, không bo góc, và không có gì rời khỏi trình duyệt của bạn.

![Switcher mở trên Wikipedia, trang mà sobrio đã chuyển sang màu đen: gõ "ru" sẽ liệt kê các dấu trang Rust, với các chữ cái khớp được in đậm.](docs/screens/switcher.png)

## Tính năng

### Một stylesheet cho mọi nơi

Không bo góc, bóng đổ, bóng chữ hay làm mờ. Hoạt ảnh và chuyển động bị cắt hết, trừ trong trình phát của YouTube. Không thanh cuộn, không cuộn mượt, nền cuộn cùng trang. Liên kết có gạch chân, mọi văn bản đều chọn được, không ép CHỮ HOA bằng CSS.

Mỗi mục là một công tắc trong cài đặt (thanh cuộn mỏng thay vì không có), và hai mục khác mặc định tắt: hình ảnh và video thang xám, và viền tiêu điểm rõ ràng. Bên dưới là một ô cho CSS riêng của bạn (tối đa 50.000 ký tự), đặt trong một trang kiểu riêng sau kiểu của sobrio trên mọi trang web, nên một `@import` ở đầu vẫn hoạt động.

### Đen, thông minh

![Bài viết về kiểu chữ trên Wikipedia: nửa bên trái như trang web hiển thị, màu trắng, và nửa bên phải có sobrio, màu đen.](docs/screens/wikipedia.png)

Động cơ động của Dark Reader biến mọi trang web thành màu đen (`#000`), từng màu một. Các trang đã có giao diện tối riêng sẽ giữ nguyên. Độ sáng, độ tương phản, sepia, thang xám và màu sắc nằm trong cài đặt; không có lịch hẹn giờ.

### Một switcher

<kbd>Ctrl</kbd>+<kbd>Space</kbd> mở một hộp ở giữa trang, giống quick switcher của Obsidian. Gõ để tìm trong dấu trang; mức độ tìm gần đúng là một cài đặt (chặt, bình thường hoặc lỏng). Nếu không có gì khớp, <kbd>Enter</kbd> sẽ tìm trên web. <kbd>Tab</kbd> lần lượt qua Google, DuckDuckGo, YouTube, Wikipedia, GitHub và các công cụ của riêng bạn (bất kỳ địa chỉ nào có `%s`, như một instance SearXNG); công cụ mặc định đứng đầu. Có thể tắt bất kỳ phần nào trong số đó.

Nó ghi nhớ những gì bạn mở từ đây: dấu trang bạn mở thường xuyên, và mở gần đây, sẽ lên cao hơn trong kết quả. Thẻ Thống kê trong cài đặt cho biết mỗi trang đã được mở bao nhiêu lần và trọng số của nó, và có thể đặt lại từng trang hoặc tất cả.

| Phím | |
|---|---|
| <kbd>↓</kbd> <kbd>Ctrl</kbd>+<kbd>J</kbd> / <kbd>↑</kbd> <kbd>Ctrl</kbd>+<kbd>K</kbd> | di chuyển |
| <kbd>Enter</kbd> | mở tại đây |
| <kbd>Ctrl</kbd>/<kbd>Alt</kbd>+<kbd>Enter</kbd> | mở trong thẻ mới |
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | công cụ tiếp theo / trước |
| <kbd>Esc</kbd> | đóng |

Ba lệnh, gõ trong switcher. Chúng cũng hoạt động từ nút trên thanh công cụ, trên trang của thẻ đang dùng, và các từ của chúng do bạn đổi trong Cài đặt › Switcher:

| Lệnh | |
|---|---|
| `td` | bật hoặc tắt chế độ tối cho trang hiện tại |
| `ta` | bật hoặc tắt kiểu CSS cho trang hiện tại |
| `settings` | cài đặt (`options` cũng được) |

### Một thẻ mới

![Sáu bố cục của thẻ mới: cổ điển, chỉ giờ, một dòng, xếp chồng, góc và đồng hồ kim tối giản.](docs/screens/layouts.png)

Ngày và giờ, được sắp đặt cẩn thận, với switcher ở bên dưới. Sáu bố cục: cổ điển, chỉ giờ, một dòng, xếp chồng (giờ trên phút), góc và đồng hồ kim tối giản. Bốn kiểu chữ: Biên tập (Instrument Serif và Inter), Thụy Sĩ (Inter), Máy (IBM Plex Mono) và Sách (EB Garamond), hoặc các phông của riêng bạn đã cài trên máy. Một lời chào tùy chọn kèm tên bạn. Đưa vào một danh sách ngôn ngữ, và mỗi thẻ mới sẽ hiển thị ngày bằng một trong số đó, ngẫu nhiên. Trong Firefox và LibreWolf, thẻ mới cũng là trang chủ: trình duyệt mở ra nó khi khởi động, và mỗi cửa sổ mới cũng vậy.

Trình duyệt giữ tiêu điểm ở thanh địa chỉ trên thẻ mới, và không tiện ích nào có thể lấy nó khỏi đó. Để bạn gõ vào switcher ngay, thẻ được thay bằng một thẻ mới ở cùng vị trí, bắt đầu với trang đã có tiêu điểm; khi đó thanh địa chỉ hiển thị địa chỉ của trang thay vì để trống. Trong thẻ container của Firefox, nó giữ nguyên như cũ. Tắt *Lấy tiêu điểm khỏi thanh địa chỉ* để giữ cách làm của trình duyệt.

### Tốc độ phương tiện

Mọi video và âm thanh đều phát ở tốc độ bạn đặt, hoặc theo quy tắc riêng của trang. <kbd>]</kbd> nhanh hơn, <kbd>[</kbd> chậm hơn, <kbd>\\</kbd> về 1×. Mọi tốc độ từ 0.91× đến 1.09× đều là 1×. Nếu bạn đổi tốc độ bằng điều khiển của chính trang, sobrio sẽ không can thiệp trên trang đó. Tùy chọn: video và âm thanh bắt đầu phát có tiếng trước khi bạn chạm vào trang sẽ bị tạm dừng; các mục tắt tiếng vẫn phát.

### Phím tắt riêng

Ghi một tổ hợp phím trong cài đặt và chọn nó làm gì: mở switcher, tìm trong một công cụ (hoặc tìm phần văn bản đã chọn), bật hoặc tắt chế độ tối hay kiểu CSS trên trang, chế độ tối ở mọi nơi, mở một địa chỉ tại đây hoặc trong thẻ mới, đặt tốc độ phương tiện, sao chép liên kết của trang không kèm tham số theo dõi (`utm_*`, `fbclid`, `gclid` và các tham số tương tự), hoặc mở cài đặt. Phím phải có <kbd>Ctrl</kbd>, <kbd>Alt</kbd> hoặc <kbd>Meta</kbd>, hoặc một phím chức năng. Chúng cũng hoạt động khi tiêu điểm nằm trong một khung nhúng (Google Docs, trình phát video), và luôn tác động đến trang trong thanh địa chỉ.

## Cài đặt

![Cài đặt, ở thẻ Kiểu: danh sách công tắc bên cạnh các thẻ Kiểu, Chế độ tối, Ngoại lệ, Switcher, Phím tắt, Thẻ mới, Phương tiện và Thống kê.](docs/screens/settings.png)

`settings` trong switcher, hoặc tùy chọn của tiện ích tại `about:addons` / `chrome://extensions`. Mỗi phần một thẻ: Kiểu, Chế độ tối, Ngoại lệ, Switcher, Phím tắt, Thẻ mới, Phương tiện và Thống kê. Mọi thay đổi được lưu tự động và áp dụng ngay cho các thẻ đang mở.

Một bản sao lưu ở cuối mỗi thẻ lưu mọi thứ (cài đặt, ngoại lệ, phím tắt và bộ nhớ của switcher) vào một tệp, và khôi phục nó trên trình duyệt khác. Hướng dẫn bắt đầu, mở một lần khi cài đặt, cũng nằm ở đó.

Địa chỉ cục bộ (`localhost`, `127.0.0.1`, `192.168.x`, các tên `.local` và phần còn lại của máy hoặc mạng của bạn) mặc định được để yên, để công việc của bạn hiện đúng như vốn có; một công tắc ở đầu thẻ Ngoại lệ thay đổi điều đó.

Ngoại lệ nhận các trang dạng `example.com` (chỉ trang đó) hoặc `*.example.com` (trang và các tên miền phụ của nó), cho kiểu CSS và chế độ tối riêng biệt. Một danh sách thứ ba giữ hoạt ảnh và chuyển động riêng của trang trong khi phần còn lại của kiểu CSS vẫn áp dụng; danh sách này bắt đầu với `chatgpt.com`, vì khung hiển thị của nó sẽ trôi khi đang viết nếu hoạt ảnh bị cắt.

### Đổi giao diện bằng `userContent.css`

Trong Firefox và LibreWolf, sobrio đọc các biến này từ `userContent.css` (khi `toolkit.legacyUserProfileCustomizations.stylesheets` được bật) và dùng chúng cho chế độ tối, switcher, cài đặt và thẻ mới. Chúng ghi đè các màu trong cài đặt. Quy tắc `@-moz-document` chỉ giữ chúng trên các trang của tiện ích: không trang web nào nhìn thấy chúng.

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

Trình duyệt đọc `userContent.css` khi khởi động, nên thay đổi chỉ hiện sau khi khởi động lại.

## Cài đặt vào trình duyệt

- **Chrome:** `chrome://extensions`, bật *Chế độ dành cho nhà phát triển*, *Tải tiện ích đã giải nén* và chọn thư mục này.
- **LibreWolf:** đặt `xpinstall.signatures.required` thành `false` trong `about:config`, chạy `scripts/pack.sh` và mở `dist/sobrio-<version>.xpi` từ `about:addons` (*Cài đặt tiện ích từ tệp*). Để thử nhanh, `about:debugging` › *Tải tiện ích tạm thời* hoạt động mà không cần tùy chọn này.
- **Firefox:** các bản phát hành chỉ cài đặt tiện ích đã được ký. Tải tệp zip lên [addons.mozilla.org](https://addons.mozilla.org/developers/) dưới dạng *không công khai* (unlisted) để tự ký cho mình.

Firefox hỏi một lần có giữ thẻ mới mà một tiện ích đã đặt không; hãy giữ lại. Phím tắt có thể đổi trong `about:addons` › *Quản lý phím tắt tiện ích* hoặc `chrome://extensions/shortcuts`.

Trên các trang mà tiện ích không chạy được (trang `about:` và `chrome://`, kho tiện ích, PDF), phím tắt sẽ mở switcher từ nút trên thanh công cụ. Nút trên thanh công cụ luôn mở nó. Trong Firefox, một số trang chỉ được nhận ra quá muộn (PDF không có `.pdf` trong địa chỉ, trang lỗi): ở đó phím tắt không làm gì, nhưng nút trên thanh công cụ vẫn hoạt động.

**Mẹo:** đặt trình duyệt hoặc hệ thống sang giao diện tối. Các trang có giao diện tối riêng (GitHub, YouTube và nhiều trang khác) sẽ chuyển sang giao diện đó, và sobrio để yên cho chúng.

## Phát triển

Không có bước build và không có phụ thuộc npm.

```sh
node --test                                   # unit tests
python3 -I tools/marionette.py . <url>...     # headless LibreWolf/Firefox with sobrio loaded
python3 -I tools/cdp.py . <url>...            # headless Chromium with sobrio loaded
python3 -I tools/vendor-darkreader.py 4.9.133 # update the bundled Dark Reader
python3 -I tools/vendor-fonts.py              # update the bundled fonts
python3 -I tools/make-icons.py                # redraw the icons from the isotype's grid
scripts/pack.sh                               # dist/sobrio-<version>.zip and .xpi
```

Để phát hành, tăng phiên bản trong `manifest.json`, commit, rồi đẩy một tag `v<version>`. Quy trình phát hành sẽ kiểm thử, đóng gói và xuất bản một bản phát hành GitHub kèm tệp zip và xpi, và gửi tệp xpi lên addons.mozilla.org khi biến kho `AMO_PUBLISH` là `true` (cùng các secret `AMO_JWT_ISSUER` và `AMO_JWT_SECRET`).

Thương hiệu (biểu tượng, hai màu, kiểu chữ và các biểu tượng nhỏ) nằm trong [docs/brand](docs/brand/README.md).

## Giấy phép

MIT. Đi kèm Dark Reader (MIT) và bốn phông theo SIL Open Font License: xem [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
