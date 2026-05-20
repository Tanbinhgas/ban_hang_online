# GearHub - Web bán gear máy tính chạy cục bộ

Project được chỉnh từ `ban_hang_online` để dùng như một website tĩnh trên máy cá nhân.

## Cách mở

- Mở trực tiếp `index.html`, hoặc
- Chạy server local rồi truy cập `localhost` / `127.0.0.1`.

Website có lớp kiểm tra trong `assets/js/local-only.js`: nếu chạy qua IP mạng LAN hoặc một domain Internet, giao diện sẽ bị chặn.

## Nội dung chính

- Quản lý sản phẩm gear máy tính gaming.
- Giỏ hàng, đặt hàng, mã giảm giá.
- Phân quyền Admin/User bằng `localStorage`.
- Kho hàng và quản lý đơn hàng cho Admin.
- Toàn bộ thư viện và ảnh mặc định đã được lưu trong `assets/`, không cần tải từ CDN khi sử dụng.

## Ghi chú

Các phần liên quan đến shop điện thoại cũ đã được bỏ khỏi project hiện tại. Dữ liệu sản phẩm mặc định chỉ còn gear máy tính như chuột, bàn phím, tai nghe, loa/mic và ghế gaming.
