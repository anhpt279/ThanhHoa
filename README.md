# Web Quản Lý Hội Chơi Hoa

Hệ thống quản lý thành viên, danh mục hoa và kho hoa cá nhân (đang có / gốc trồng / chờ bồi).

## Công nghệ

- **Frontend:** React 18 + Vite + React Router
- **Backend:** Node.js + Express
- **Database:** MongoDB Atlas

## Cài đặt

### 1. Cấu hình MongoDB

Tạo file `server/.env` từ mẫu:

```bash
cp server/.env.example server/.env
```

Sửa `server/.env`:

- Thay `<db_password>` bằng mật khẩu MongoDB thật
- Đổi `JWT_SECRET` thành chuỗi bí mật riêng

```env
PORT=5000
MONGODB_URI=mongodb+srv://anhpt279_db_user:MAT_KHAU_THAT@cluster0.kacspxx.mongodb.net/hoi_choi_hoa?appName=Cluster0
JWT_SECRET=chuoi-bi-mat-cua-ban
```

> Trên MongoDB Atlas: **Network Access** → thêm IP máy bạn (hoặc `0.0.0.0/0` khi dev).

### 2. Cài dependency

```bash
npm run install:all
```

### 3. Seed dữ liệu mẫu (lần đầu)

```bash
npm run seed
```

Tài khoản mẫu:

| Vai trò | Username | Mật khẩu |
|---------|----------|----------|
| Admin | `admin` | `admin123` |
| Thành viên | `member_a` | `123456` |
| Thành viên | `member_b` | `123456` |

### 4. Chạy dev

```bash
npm run dev
```

- Frontend: http://localhost:5173
- API: http://localhost:5000

## Chức năng

| Module | Admin | Thành viên |
|--------|-------|------------|
| Dashboard thống kê | ✅ | ✅ |
| Quản lý thành viên | ✅ | ❌ |
| Danh mục hoa master | ✅ | ❌ (chỉ xem khi chọn) |
| Hồ sơ & hoa cá nhân | ✅ tất cả | ✅ của mình |
| Tìm kiếm thành viên / hoa | ✅ | ✅ |

## Cấu trúc database

- **users** — tài khoản, tên hiển thị, liên hệ, role
- **flowers** — danh mục loại hoa
- **userflowers** — hoa của từng thành viên (`owning` | `root_stock` | `waiting_graft`)

## API chính

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/auth/login` | Đăng nhập |
| GET | `/api/dashboard` | Thống kê |
| CRUD | `/api/users` | Thành viên |
| CRUD | `/api/flowers` | Danh mục hoa |
| CRUD | `/api/user-flowers` | Hoa của member |
| GET | `/api/search/members?q=` | Tìm thành viên |
| GET | `/api/search/flowers?q=` | Ai đang có loại hoa |

## Deploy lên Vercel (full-stack)

Repo đã có `vercel.json` + `api/index.js` (Express serverless) + build React từ `client/`.

### 1. Import project trên [Vercel](https://vercel.com)

- Connect GitHub repo `anhpt279/ThanhHoa`
- **Root Directory:** để mặc định (root repo)
- Vercel tự đọc `vercel.json` (không cần đổi Build Command)

### 2. Environment Variables (bắt buộc)

Trong **Project → Settings → Environment Variables**:

| Biến | Giá trị |
|------|---------|
| `MONGODB_URI` | Connection string Atlas (thay mật khẩu thật) |
| `JWT_SECRET` | Chuỗi bí mật dài, ngẫu nhiên |
| `USE_MEMORY_DB` | `false` |

> Atlas → **Network Access** → Allow `0.0.0.0/0` (Vercel dùng IP động).

### 3. Seed dữ liệu lần đầu (chạy trên máy local)

```bash
# Trong server/.env đặt MONGODB_URI trỏ Atlas (giống Vercel)
npm run seed
```

Tạo admin `admin` / `admin123` trên database production.

### 4. Kiểm tra sau deploy

- `https://your-app.vercel.app/api/health` → `{"ok":true}`
- Đăng nhập tại `https://your-app.vercel.app/login`

### Cấu trúc deploy

```
/              → React (client/dist)
/api/*         → Express serverless (api/index.js)
```
