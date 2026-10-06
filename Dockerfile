# Dùng image Python chính thức, bản slim cho nhẹ
FROM python:3.12-slim

# Thư mục làm việc bên trong container
WORKDIR /app

# Copy requirements trước để tận dụng cache của Docker
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy toàn bộ source code vào container
COPY src/ ./src/
COPY main.py .

# Để Python tìm thấy package myapp nằm trong src/
ENV PYTHONPATH=/app/src

# Mở cổng 5000 cho Flask
EXPOSE 5000

# Lệnh chạy khi container khởi động
CMD ["python", "main.py"]
