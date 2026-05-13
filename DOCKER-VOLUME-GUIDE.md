# Hướng dẫn Docker Volume — Toàn tập

> Mọi thứ cần biết về Docker volume: từ khái niệm, 3 loại storage, hands-on, Docker Compose, đến backup/restore.

---

## Mục lục

1. [Vì sao cần Volume](#1-vì-sao-cần-volume)
2. [3 loại storage trong Docker](#2-3-loại-storage-trong-docker)
3. [So sánh chi tiết](#3-so-sánh-chi-tiết)
4. [Cú pháp mount: `-v` vs `--mount`](#4-cú-pháp-mount--v-vs---mount)
5. [Lệnh quản lý volume](#5-lệnh-quản-lý-volume)
6. [Hands-on: 5 thí nghiệm](#6-hands-on-5-thí-nghiệm)
7. [Docker Compose với volume](#7-docker-compose-với-volume)
8. [Backup & Restore volume](#8-backup--restore-volume)
9. [Best practices](#9-best-practices)
10. [Troubleshooting](#10-troubleshooting)
11. [Cheat sheet](#11-cheat-sheet)

---

## 1. Vì sao cần Volume

### Bài toán

Container giống "máy ảo dùng 1 lần". Mọi file ghi bên trong container → biến mất khi container xóa.

```bash
docker run --name db postgres:16
# ... insert data ...
docker rm -f db                    # ← XÓA container
docker run --name db postgres:16   # ← DB mới, trống rỗng
```

→ **Mọi data đã mất.**

### Vì sao container ephemeral?

Docker dùng **UnionFS** (copy-on-write):
- Image = các layer **read-only**.
- Container thêm 1 layer **read-write** ở trên.
- Xóa container = xóa layer read-write đó.

→ Data ghi vào filesystem container = ghi vào layer read-write → mất khi xóa container.

### Giải pháp: Volume

Mount 1 storage **bên ngoài** vào container:

```
┌──────────────────────────┐
│  Container (ephemeral)   │  ← xóa → mất
│                          │
│  /var/lib/postgresql ─┐  │  ← MOUNT điểm
└───────────────────────┼──┘
                        │
                        ▼
              ┌─────────────────┐
              │  Volume         │  ← SỐNG ĐỘC LẬP với container
              └─────────────────┘
```

---

## 2. 3 loại storage trong Docker

| Loại | Lưu ở | Quản lý bởi | Dùng cho |
|------|-------|------------|----------|
| **Volume** | `/var/lib/docker/volumes/` (Docker quản lý) | Docker | Production data (DB, uploads) |
| **Bind mount** | Folder cụ thể trên host | OS | Dev (hot reload), config files |
| **tmpfs mount** | RAM | Kernel | Secrets, cache (mất khi container stop) |

### Volume

```bash
docker volume create my-data
docker run -v my-data:/data alpine
```

### Bind mount

```bash
# Mount folder local vào container
docker run -v /home/user/code:/app node:20
docker run -v "$(pwd):/app" node:20    # current folder

# Trên Windows PowerShell
docker run -v "${PWD}:/app" node:20
```

### tmpfs

```bash
docker run --tmpfs /tmp:size=100M alpine
```

---

## 3. So sánh chi tiết

### Volume vs Bind mount

| Khía cạnh | Volume | Bind mount |
|-----------|--------|-----------|
| **Tạo trước** | `docker volume create` (hoặc auto-create) | Không, folder phải có sẵn |
| **Lifecycle** | Docker quản lý | OS quản lý |
| **Performance** | Tốt trên macOS/Windows | Chậm trên macOS/Windows (do filesystem bridging) |
| **Backup** | `docker run` với tar | Cần copy folder thủ công |
| **Permission** | Container tự quản | Phụ thuộc UID/GID host vs container |
| **Path đồng bộ team** | Tên volume → đồng bộ | Path khác nhau giữa OS |
| **Xem data từ host** | Khó (trong VM với Docker Desktop) | Dễ (folder thật) |
| **Use case** | DB, uploads, production | Dev code, configs |

### Anonymous vs Named volume

```bash
# Named volume (KHUYẾN KHÍCH)
docker run -v my-data:/data alpine
# → tạo volume tên "my-data" nếu chưa có

# Anonymous volume
docker run -v /data alpine
# → tạo volume với tên ngẫu nhiên (hash dài)
# → khó quản lý, dễ leak khi không dùng nữa
```

→ **Luôn đặt tên** volume để dễ identify, backup, xóa.

---

## 4. Cú pháp mount: `-v` vs `--mount`

Docker có 2 cú pháp tương đương nhưng `--mount` rõ ràng hơn.

### `-v` (ngắn gọn, phổ biến)

```bash
docker run -v <source>:<target>[:<options>] image
```

Ví dụ:
```bash
docker run -v my-data:/data alpine                    # volume
docker run -v /home/user/code:/app alpine             # bind mount (path tuyệt đối)
docker run -v my-data:/data:ro alpine                 # read-only
```

### `--mount` (rõ ràng, explicit)

```bash
docker run --mount type=volume,src=my-data,dst=/data alpine
docker run --mount type=bind,src=/home/user/code,dst=/app alpine
docker run --mount type=tmpfs,dst=/tmp alpine
```

### Khi nào dùng cái nào?

| Cú pháp | Nên dùng khi |
|---------|--------------|
| `-v` | Script ngắn, command line interactive |
| `--mount` | CI/CD scripts, Dockerfile, production (rõ ràng hơn) |

### Options thường gặp

| Option | Ý nghĩa |
|--------|---------|
| `ro` | Read-only (container không ghi được) |
| `rw` | Read-write (mặc định) |
| `Z` / `z` | SELinux label (Linux có SELinux) |

```bash
docker run -v config:/etc/app:ro alpine    # Container chỉ đọc /etc/app
```

---

## 5. Lệnh quản lý volume

### Tạo volume

```bash
docker volume create my-data
docker volume create --driver local my-data    # explicit driver
```

### List

```bash
docker volume ls

# Filter
docker volume ls --filter dangling=true     # volume không gắn container nào
docker volume ls --filter name=pg
```

### Inspect

```bash
docker volume inspect my-data
```

Output:
```json
[
  {
    "CreatedAt": "2026-05-13T10:00:00Z",
    "Driver": "local",
    "Mountpoint": "/var/lib/docker/volumes/my-data/_data",
    "Name": "my-data",
    "Options": {},
    "Scope": "local"
  }
]
```

### Xóa

```bash
docker volume rm my-data                # xóa cụ thể
docker volume prune                     # xóa tất cả không dùng
docker volume prune --filter "label!=keep"   # giữ những cái có label keep
```

> ⚠️ Volume đang dùng bởi container (kể cả stopped) → không xóa được. Phải `docker rm` container trước.

### Tìm container đang dùng volume

```bash
docker ps -a --filter volume=my-data
```

---

## 6. Hands-on: 5 thí nghiệm

### Thí nghiệm 1: Volume persist sau khi container bị xóa

```powershell
# 1. Tạo volume
docker volume create test-data

# 2. Container A ghi file
docker run --rm -v test-data:/data alpine sh -c "echo 'Hello' > /data/note.txt"

# 3. Container B (mới hoàn toàn) đọc file
docker run --rm -v test-data:/data alpine cat /data/note.txt
# → "Hello"  ← VẪN CÒN

# 4. Cleanup
docker volume rm test-data
```

**Quan sát**: 2 container khác nhau, chia sẻ volume → data persist.

---

### Thí nghiệm 2: Không dùng volume → mất data

```powershell
# 1. Ghi file vào filesystem container (không volume)
docker run --name temp alpine sh -c "echo 'inside' > /tmp/note.txt; sleep 30"

# Trong 30s, mở terminal khác:
docker exec temp cat /tmp/note.txt
# → "inside"

# 2. Đợi exit hoặc kill
docker rm -f temp

# 3. Container mới
docker run --rm alpine cat /tmp/note.txt
# → cat: can't open '/tmp/note.txt'  ← MẤT
```

---

### Thí nghiệm 3: PostgreSQL với volume persistent

```powershell
# 1. Tạo volume
docker volume create pg-data

# 2. Run PostgreSQL
docker run -d --name mypg `
  -e POSTGRES_PASSWORD=secret123 `
  -e POSTGRES_USER=admin `
  -e POSTGRES_DB=myapp `
  -v pg-data:/var/lib/postgresql/data `
  -p 5432:5432 `
  postgres:16

Start-Sleep 5

# 3. Insert data
docker exec mypg psql -U admin -d myapp -c "CREATE TABLE users (id SERIAL PRIMARY KEY, name TEXT);"
docker exec mypg psql -U admin -d myapp -c "INSERT INTO users (name) VALUES ('Hùng'), ('Nam');"
docker exec mypg psql -U admin -d myapp -c "SELECT * FROM users;"

# 4. XÓA container
docker rm -f mypg

# 5. Container mới, CÙNG volume
docker run -d --name mypg `
  -e POSTGRES_PASSWORD=secret123 `
  -e POSTGRES_USER=admin `
  -e POSTGRES_DB=myapp `
  -v pg-data:/var/lib/postgresql/data `
  -p 5432:5432 `
  postgres:16

Start-Sleep 5

# 6. Verify
docker exec mypg psql -U admin -d myapp -c "SELECT * FROM users;"
# → vẫn thấy Hùng + Nam 🎉

# Cleanup
docker rm -f mypg
docker volume rm pg-data
```

**Điểm mấu chốt**: `/var/lib/postgresql/data` là đường dẫn chuẩn của image `postgres`. Image khác → đường dẫn khác:

| Image | Data path |
|-------|-----------|
| `postgres` | `/var/lib/postgresql/data` |
| `mysql` | `/var/lib/mysql` |
| `mongo` | `/data/db` |
| `redis` | `/data` |
| `mariadb` | `/var/lib/mysql` |

→ Luôn check Docker Hub docs của image trước khi mount.

---

### Thí nghiệm 4: Share volume giữa 2 container

```powershell
# 1. Tạo volume
docker volume create shared

# 2. Container A — writer (ghi mỗi 2s)
docker run -d --name writer -v shared:/data alpine sh -c `
  "while true; do date >> /data/log.txt; sleep 2; done"

# 3. Container B — reader (đọc liên tục)
docker run --rm -v shared:/data alpine sh -c `
  "tail -f /data/log.txt"

# → thấy timestamp do writer ghi, mỗi 2 giây
# Ctrl+C để stop

# Cleanup
docker rm -f writer
docker volume rm shared
```

**Use case thực tế**: log aggregator container đọc logs từ app container.

---

### Thí nghiệm 5: Bind mount cho dev hot reload

Tạo folder local + chạy Node container watch file changes:

```powershell
# 1. Tạo folder + file
mkdir dev-test
cd dev-test
"console.log('Hello v1')" | Out-File -Encoding ascii app.js

# 2. Run node container với bind mount
docker run --rm -v "${PWD}:/app" -w /app node:20 sh -c `
  "while true; do node app.js; sleep 3; done"
# → output "Hello v1" mỗi 3s

# 3. Mở file app.js trên máy, sửa thành: console.log('Hello v2')
# → trong terminal Docker thấy output đổi sang "Hello v2"
# → KHÔNG cần rebuild image, restart container

# Ctrl+C, dọn dẹp
cd ..
rm dev-test -Recurse -Force
```

→ Đây là cách `docker compose up` cho dev environment.

---

## 7. Docker Compose với volume

`docker run -v` dài và khó nhớ. Dùng `docker-compose.yml` khai báo declarative.

### File ví dụ — Next.js + PostgreSQL

```yaml
# docker-compose.yml
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgres://admin:secret123@db:5432/myapp
    depends_on:
      - db
    volumes:
      - app-uploads:/app/uploads          # named volume
      - ./logs:/app/logs                  # bind mount

  db:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: secret123
      POSTGRES_USER: admin
      POSTGRES_DB: myapp
    volumes:
      - pg-data:/var/lib/postgresql/data  # named volume
    ports:
      - "5432:5432"

volumes:
  app-uploads:    # khai báo named volume
  pg-data:        # khai báo named volume
```

### Lệnh chạy

```bash
# Khởi động toàn bộ stack
docker compose up -d

# Xem logs
docker compose logs -f

# Stop (giữ volume)
docker compose down

# Stop + XÓA volume (CẨN THẬN — mất data!)
docker compose down -v

# Chỉ rebuild app, không touch db
docker compose up -d --build app
```

### Volume trong Compose: 3 cú pháp

```yaml
volumes:
  # 1. Named volume
  - pg-data:/var/lib/postgresql/data

  # 2. Bind mount (relative path)
  - ./logs:/app/logs

  # 3. Bind mount (absolute path)
  - /home/user/data:/app/data

  # 4. Read-only
  - ./config:/etc/app:ro

  # 5. Long syntax (rõ ràng hơn)
  - type: volume
    source: pg-data
    target: /var/lib/postgresql/data
```

### External volume (share giữa nhiều compose project)

```yaml
volumes:
  pg-data:
    external: true     # volume đã tạo bằng `docker volume create pg-data` trước đó
```

---

## 8. Backup & Restore volume

### Backup

Volume không có command `docker volume backup`. Cách làm: dùng container tạm `tar` data ra file.

```bash
# Backup volume "pg-data" thành file pg-data.tar.gz trên host
docker run --rm \
  -v pg-data:/source:ro \
  -v "$(pwd):/backup" \
  alpine \
  tar czf /backup/pg-data.tar.gz -C /source .
```

Giải thích:
- `-v pg-data:/source:ro` — mount volume vào `/source` (read-only để an toàn).
- `-v "$(pwd):/backup"` — mount folder hiện tại vào `/backup`.
- `tar czf /backup/pg-data.tar.gz -C /source .` — nén `/source` → `/backup/pg-data.tar.gz`.

→ File `pg-data.tar.gz` xuất hiện ở folder hiện tại trên host.

### Restore

```bash
# Tạo volume mới
docker volume create pg-data-restored

# Extract tar vào volume
docker run --rm \
  -v pg-data-restored:/target \
  -v "$(pwd):/backup" \
  alpine \
  tar xzf /backup/pg-data.tar.gz -C /target
```

### Backup PostgreSQL "đúng cách"

Backup volume `pg-data` khi PostgreSQL đang chạy có thể **corrupt** (data đang được ghi). Cách chuẩn:

```bash
# 1. Dump SQL từ PostgreSQL
docker exec mypg pg_dump -U admin myapp > backup.sql

# 2. Restore
docker exec -i mypg psql -U admin -d myapp < backup.sql
```

→ **Quy tắc**: app-level backup (pg_dump, mysqldump, mongodump) cho DB. Volume backup chỉ dùng khi DB đã stop.

---

## 9. Best practices

### ✅ NÊN làm

1. **Đặt tên volume** rõ ràng (`pg-data`, không `data`).
2. **Named volume cho production data** (DB, uploads).
3. **Bind mount cho dev code** (hot reload).
4. **Document trong README**: volume nào lưu gì, backup thế nào.
5. **Backup định kỳ** với cron + script tar/pg_dump.
6. **Tag image bằng SHA hoặc semver** — restore bằng đúng version của image (schema migration).
7. **Test restore** thường xuyên (backup chưa test = không có backup).

### ❌ KHÔNG nên

1. **Đừng bind mount DB folder lên Windows/macOS host** — slow + permission issues.
2. **Đừng dùng anonymous volume** trong production — khó manage.
3. **Đừng commit dữ liệu volume vào git** — quá to + nhạy cảm.
4. **Đừng dùng `docker compose down -v` trên production** — xóa volume = mất data.
5. **Đừng share volume DB cho nhiều container PostgreSQL** — corruption.
6. **Đừng quên Backup**.

### Mount path trong container — chuẩn convention

```yaml
/app/uploads      # user uploads
/app/logs         # logs (hoặc dùng stdout)
/app/cache        # cache
/etc/app/config   # configs
/var/lib/<service>/data   # DB data (theo image)
```

---

## 10. Troubleshooting

### `Error: volume is in use`

```bash
docker volume rm pg-data
# Error: volume pg-data is in use
```

Fix:
```bash
# Tìm container dùng
docker ps -a --filter volume=pg-data

# Xóa container trước
docker rm -f <container-name>

# Rồi xóa volume
docker volume rm pg-data
```

### Permission denied trong container

Bind mount: user trong container (UID khác) không có quyền ghi vào folder host.

Fix 1: Chmod folder host
```bash
chmod 777 /home/user/data    # tạm thời, không recommended production
```

Fix 2: User trong container khớp UID host (Dockerfile)
```dockerfile
RUN adduser -u 1000 -D myuser
USER myuser
```

Fix 3: Dùng named volume thay vì bind mount.

### Volume không persist sau `docker compose down`

Mặc định `docker compose down` **KHÔNG xóa volume**. Nhưng `docker compose down -v` thì **CÓ**. Đừng nhầm.

### Data biến mất sau `docker compose up`

Có thể:
- Volume bị anonymous (không khai báo trong `volumes:` section) → mỗi lần `up` tạo volume mới.
- Compose project name đổi (đổi tên folder) → volume khác.

Fix: dùng named volume + khai báo external nếu cần share:

```yaml
volumes:
  pg-data:
    name: my-app-pg-data   # tên cố định, không phụ thuộc project
```

### Disk đầy do volume cũ

```bash
docker system df            # xem dung lượng
docker volume prune         # xóa volume không dùng
docker system prune -a --volumes   # CẨN THẬN — xóa tất cả không dùng
```

### Volume vẫn còn data nhưng container không thấy

Có thể mount sai path. Inspect:

```bash
docker inspect <container> --format '{{json .Mounts}}'
```

So `Destination` với expected path trong container.

---

## 11. Cheat sheet

```bash
# === Tạo / List / Inspect ===
docker volume create my-data
docker volume ls
docker volume inspect my-data

# === Mount ===
docker run -v my-data:/data image                  # named volume
docker run -v "$(pwd):/app" image                  # bind mount
docker run -v my-data:/data:ro image               # read-only
docker run --tmpfs /tmp image                      # tmpfs

# === Xóa ===
docker volume rm my-data
docker volume prune                                # xóa không dùng

# === Backup / Restore ===
docker run --rm -v my-data:/src:ro -v "$(pwd):/bkp" alpine \
  tar czf /bkp/my-data.tar.gz -C /src .

docker run --rm -v my-data:/dst -v "$(pwd):/bkp" alpine \
  tar xzf /bkp/my-data.tar.gz -C /dst

# === Docker Compose ===
docker compose up -d              # khởi động
docker compose down               # stop (giữ volume)
docker compose down -v            # stop + XÓA volume

# === Debug ===
docker ps -a --filter volume=my-data        # ai dùng volume
docker inspect <ctn> --format '{{json .Mounts}}'   # mount detail của container
docker system df -v                                # dung lượng volume
```

---

## Tài liệu tham khảo

- [Docker Volumes Documentation](https://docs.docker.com/storage/volumes/)
- [Docker Bind Mounts](https://docs.docker.com/storage/bind-mounts/)
- [Docker Compose Volumes](https://docs.docker.com/compose/compose-file/07-volumes/)
- [PostgreSQL Docker Image](https://hub.docker.com/_/postgres)

---

**Xong! Bạn đã có toàn bộ kiến thức Docker volume từ cơ bản đến production-ready.** 🎉
