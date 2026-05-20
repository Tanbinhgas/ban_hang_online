(function () {
  const allowedProtocol = window.location.protocol === "file:";
  const allowedHosts = ["", "localhost", "127.0.0.1", "::1"];
  const allowedHost = allowedHosts.includes(window.location.hostname);

  if (!allowedProtocol && !allowedHost) {
    document.documentElement.innerHTML = `
      <head>
        <meta charset="UTF-8" />
        <title>GearHub - Chỉ chạy cục bộ</title>
        <style>
          body {
            margin: 0;
            min-height: 100vh;
            display: grid;
            place-items: center;
            background: #0a0a0f;
            color: #f4f4f8;
            font-family: Arial, sans-serif;
          }
          .box {
            max-width: 520px;
            padding: 28px;
            border: 1px solid rgba(255, 60, 60, 0.35);
            border-radius: 8px;
            background: #16161f;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.45);
          }
          h1 { margin: 0 0 12px; font-size: 24px; }
          p { color: #b8b8c8; line-height: 1.6; }
          code { color: #ff7777; }
        </style>
      </head>
      <body>
        <div class="box">
          <h1>Trang này chỉ chạy trên máy cá nhân</h1>
          <p>Vui lòng mở bằng file trực tiếp hoặc qua địa chỉ <code>localhost</code>/<code>127.0.0.1</code>. Các địa chỉ mạng LAN hoặc Internet đã bị chặn để giữ project chỉ dùng cục bộ.</p>
        </div>
      </body>
    `;
    throw new Error("GearHub local-only guard blocked this host.");
  }

  const imageMap = [
    ["2e53ff46", "assets/img/products/razer-viper-v3-pro.jpg"],
    ["0b8472e6", "assets/img/products/steelseries-apex-pro-tkl.jpg"],
    ["buy_image_4_24", "assets/img/products/steelseries-arctis-nova-pro.webp"],
    ["51sezMIH1iL", "assets/img/products/rgb-mouse-pad.jpg"],
    ["logitech-mouse-910-006636", "assets/img/products/logitech-g-pro-x-superlight-2.jpg"],
    ["31673_1", "assets/img/products/fifine-rgb-speakers-mic.jpg"],
  ];

  const gears = JSON.parse(localStorage.getItem("gears") || "[]");
  let changed = false;
  gears.forEach((gear) => {
    const localImage = imageMap.find(([needle]) => String(gear.image).includes(needle));
    if (localImage) {
      gear.image = localImage[1];
      changed = true;
    }
  });
  if (changed) {
    localStorage.setItem("gears", JSON.stringify(gears));
  }
})();
