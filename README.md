# DigiHR

Ứng dụng nhân sự nội bộ của **CÔNG TY CỔ PHẦN CÔNG NGHỆ GREENSOFT**.

Bản này là UI + dữ liệu mẫu (8 nhân sự thật + 1 quản lý + 1 kế toán lương). Không có backend, đăng nhập hay Lark.

Repo công khai: https://github.com/thietkewebdev/digihr

## Chạy local

```bash
git clone https://github.com/thietkewebdev/digihr.git
cd digihr
npm install
npm run dev
```

Dev server mặc định: [http://127.0.0.1:43180](http://127.0.0.1:43180).

Build production (Railway dùng các lệnh này):

```bash
npm run build
npm start
```

`npm start` lắng nghe `0.0.0.0` và cổng `$PORT` (mặc định 3000). Không cần biến môi trường — UI + mock data.

Railway: Nixpacks, Node 22. Repo có `railway.toml` + `nixpacks.toml`.

## Demo

Đổi người xem ở góc phải (Nhân viên / Quản lý / Payroll-Admin).

- **Nhân viên**: trang chủ, tự đánh giá tháng 9/2026, phiếu lương của mình
- **Quản lý**: duyệt đánh giá, nhập doanh thu CKS, thưởng dự án
- **Payroll-Admin**: bảng lương, OT/khấu trừ, phát hành phiếu

Kỳ mẫu: **09/2026**. Dự án BT08 (08/2026) giữ số liệu gốc: Bửu / Duy 2.500.000, Nghĩa 1.500.000.

## Công thức

- KPI = chỉ tiêu KPI × hệ số xếp loại (Xuất sắc 1.2 → Không đạt 0)
- CKS team: một số doanh thu / 300.000.000; hệ số theo % đạt
- Thưởng dự án: điểm = ngày × hệ số vai trò; chia quỹ theo tỷ lệ điểm
- Lương cứng = lương HĐ × ngày công / 26
