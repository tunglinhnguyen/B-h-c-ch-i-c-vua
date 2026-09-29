# Vương quốc Cờ vua 3D

Game/PWA nhỏ bằng tiếng Việt giúp trẻ làm quen cách đi của 6 quân cờ.

## Công nghệ
- Three.js / WebGL
- JavaScript + HTML + CSS thuần
- PWA + Service Worker
- localStorage để lưu tiến độ trên iPad
- Không cần backend/database

## Chạy
Phải mở qua HTTP(S), không mở `index.html` trực tiếp bằng `file://`.

Ví dụ local:
`python3 -m http.server 8080`

## Đưa lên GitHub Pages
1. Tạo repository Public.
2. Upload **toàn bộ nội dung** thư mục này vào root của repository.
3. Settings → Pages.
4. Source: Deploy from a branch.
5. Branch: `main`, folder: `/ (root)` → Save.
6. Mở URL GitHub Pages được GitHub cung cấp bằng Safari trên iPad.
7. Share → Add to Home Screen.

## Offline
Lần đầu cần mạng để tải app và Three.js. Service Worker sẽ cache các file cần thiết; sau đó app có thể mở lại khi offline.

## Nội dung MVP
- Thế giới 3D dạng đồ chơi xếp khối.
- 6 khu: Tốt, Xe, Mã, Tượng, Hậu, Vua.
- Chạm công trình để mở bài học.
- Bàn cờ tương tác, tô sáng nước đi hợp lệ.
- Thưởng sao và lưu tiến độ trên thiết bị.

Lưu ý: thiết kế dùng phong cách đồ chơi xếp khối nguyên bản, không dùng logo/tài sản LEGO hoặc Minecraft.
