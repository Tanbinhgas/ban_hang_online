# Dùng Nginx bản nhẹ để phục vụ file tĩnh (HTML/CSS/JS)
FROM nginx:alpine

# Xóa trang mặc định của Nginx
RUN rm -rf /usr/share/nginx/html/*

# Copy toàn bộ source code website vào thư mục phục vụ của Nginx
COPY . /usr/share/nginx/html/

# Nginx mặc định lắng nghe cổng 80
EXPOSE 80

# Nginx tự chạy sẵn, không cần CMD thêm
