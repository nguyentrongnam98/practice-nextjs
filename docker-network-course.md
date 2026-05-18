# Khóa học Docker Network: Từ Cơ Bản đến Nâng Cao

> Tài liệu này dành cho người mới bắt đầu, đi từng bước nhỏ. Mỗi phần đều có **ví dụ chạy được** và **bài tập** để bạn tự thực hành.

## Mục lục

- [Phần 0: Chuẩn bị](#phần-0-chuẩn-bị)
- [Phần 1: Docker Network là gì?](#phần-1-docker-network-là-gì)
- [Phần 2: Các loại Network Driver](#phần-2-các-loại-network-driver)
- [Phần 3: Bridge Network (chi tiết)](#phần-3-bridge-network-chi-tiết)
- [Phần 4: DNS & Service Discovery](#phần-4-dns--service-discovery)
- [Phần 5: Port Publishing & Expose](#phần-5-port-publishing--expose)
- [Phần 6: Host Network & None Network](#phần-6-host-network--none-network)
- [Phần 7: Docker Compose Networking](#phần-7-docker-compose-networking)
- [Phần 8: Overlay Network (Swarm)](#phần-8-overlay-network-swarm)
- [Phần 9: Macvlan & IPvlan](#phần-9-macvlan--ipvlan)
- [Phần 10: Bảo mật & Network Policies](#phần-10-bảo-mật--network-policies)
- [Phần 11: Troubleshooting](#phần-11-troubleshooting)
- [Phần 12: Dự án tổng hợp](#phần-12-dự-án-tổng-hợp)

---

## Phần 0: Chuẩn bị

### Yêu cầu
- Docker Desktop hoặc Docker Engine đã cài đặt
- Terminal (PowerShell trên Windows cũng được)
- Kiến thức cơ bản: biết chạy `docker run`, `docker ps`

### Kiểm tra Docker hoạt động

```powershell
docker --version
docker network ls
```

Bạn sẽ thấy 3 network mặc định:
```
NETWORK ID     NAME      DRIVER    SCOPE
xxxxxxxxxxxx   bridge    bridge    local
xxxxxxxxxxxx   host      host      local
xxxxxxxxxxxx   none      null      local
```

---

## Phần 1: Docker Network là gì?

### 1.1 Khái niệm

**Docker network** là lớp ảo (virtual network) cho phép các container giao tiếp với nhau, với host, và với thế giới bên ngoài.

Hãy tưởng tượng:
- Mỗi container giống như một **máy tính nhỏ**
- Docker network giống như một **switch mạng ảo** kết nối các máy tính này lại
- Bạn có thể tạo nhiều mạng riêng biệt, mỗi mạng cô lập với nhau

### 1.2 Tại sao cần Docker network?

| Vấn đề | Giải pháp Docker network |
|--------|--------------------------|
| App container muốn nói chuyện với DB container | Cho cả 2 vào cùng 1 network |
| Muốn cô lập group container A khỏi group B | Tạo 2 network riêng |
| Muốn truy cập từ trình duyệt vào container | Publish port ra host |
| Microservices gọi nhau bằng tên thay vì IP | DNS resolution của Docker |

### 1.3 Ví dụ đầu tiên

Chạy 2 container và xem chúng có "thấy" nhau không:

```powershell
# Tạo container 1
docker run -d --name web nginx

# Tạo container 2
docker run -d --name client alpine sleep 3600

# Thử ping từ client sang web
docker exec client ping -c 3 web
```

**Câu hỏi:** Bạn nghĩ lệnh ping có thành công không? Hãy chạy thử và ghi nhớ kết quả — chúng ta sẽ giải thích ở [Phần 3](#phần-3-bridge-network-chi-tiết).

### 📝 Bài tập 1

1. Liệt kê tất cả network hiện có bằng `docker network ls`
2. Xem chi tiết network `bridge` bằng `docker network inspect bridge`
3. Tìm địa chỉ IP của 2 container `web` và `client` ở ví dụ trên
4. Dọn dẹp: `docker rm -f web client`

---

## Phần 2: Các loại Network Driver

Docker hỗ trợ nhiều "driver" — mỗi driver là một cách triển khai network khác nhau.

### 2.1 Bảng so sánh

| Driver | Mục đích | Scope |
|--------|----------|-------|
| **bridge** | Mặc định, container trên cùng 1 host | local |
| **host** | Container dùng chung mạng với host | local |
| **none** | Không có mạng (cô lập hoàn toàn) | local |
| **overlay** | Nhiều container trên nhiều host (Swarm) | swarm |
| **macvlan** | Container có MAC address riêng như máy thật | local |
| **ipvlan** | Tương tự macvlan nhưng dùng chung MAC | local |

### 2.2 Khi nào dùng driver nào?

```
Bạn chỉ có 1 máy?                    → bridge (90% trường hợp)
Cần hiệu năng tối đa, chấp nhận rủi ro? → host
Container chạy script offline?        → none
Có cluster nhiều máy?                 → overlay
Cần container "trông như máy thật"?   → macvlan / ipvlan
```

### 📝 Bài tập 2

1. Tạo 1 network mới tên `my-net` với driver `bridge`:
   ```powershell
   docker network create my-net
   ```
2. Inspect xem driver mặc định khi tạo mới là gì
3. Xóa network: `docker network rm my-net`

---

## Phần 3: Bridge Network (chi tiết)

### 3.1 Default bridge vs User-defined bridge

Đây là **điểm gây nhầm lẫn nhất** với người mới.

**Default bridge** (`bridge`): tự động có sẵn, KHÔNG có DNS resolution giữa các container.

**User-defined bridge** (do bạn tạo): có DNS resolution tự động — container gọi nhau bằng tên!

### 3.2 Chứng minh sự khác biệt

#### Trên default bridge (KHÔNG hoạt động)

```powershell
docker run -d --name a alpine sleep 3600
docker run -d --name b alpine sleep 3600

docker exec a ping -c 2 b
# Kết quả: ping: bad address 'b' ❌
```

#### Trên user-defined bridge (HOẠT ĐỘNG)

```powershell
docker network create demo-net

docker run -d --name a --network demo-net alpine sleep 3600
docker run -d --name b --network demo-net alpine sleep 3600

docker exec a ping -c 2 b
# Kết quả: 64 bytes from b.demo-net (172.x.x.x): icmp_seq=0 ✅
```

> **Bài học cốt lõi:** Luôn dùng user-defined bridge thay vì default bridge trong dự án thật.

### 3.3 Connect/Disconnect động

Một container có thể thuộc nhiều network cùng lúc:

```powershell
docker network create net-a
docker network create net-b

docker run -d --name multi --network net-a alpine sleep 3600

# Gắn thêm vào net-b
docker network connect net-b multi

# Xem container đang ở mạng nào
docker inspect multi --format "{{json .NetworkSettings.Networks}}"

# Gỡ khỏi net-a
docker network disconnect net-a multi
```

### 3.4 Tùy chỉnh subnet

```powershell
docker network create --subnet=10.10.0.0/24 --gateway=10.10.0.1 custom-net

docker run -d --name fixed --network custom-net --ip 10.10.0.100 nginx

docker inspect fixed --format "{{.NetworkSettings.Networks.custom-net.IPAddress}}"
# 10.10.0.100
```

### 📝 Bài tập 3

1. Tạo network `app-net` với subnet `192.168.50.0/24`
2. Chạy container `redis` với image `redis:alpine` trên network này, IP cố định `192.168.50.10`
3. Chạy container `app` với image `alpine`, cùng network
4. Từ `app`, ping vào `redis` bằng tên — phải thành công
5. Disconnect `app` khỏi `app-net`, ping lại — phải thất bại
6. Dọn dẹp

---

## Phần 4: DNS & Service Discovery

### 4.1 Cơ chế

Mỗi user-defined bridge có một **embedded DNS server** ở địa chỉ `127.0.0.11`. Container hỏi DNS này để phân giải tên container thành IP.

```powershell
docker network create dns-demo
docker run -d --name api --network dns-demo nginx

# Kiểm tra resolv.conf trong container
docker run --rm --network dns-demo alpine cat /etc/resolv.conf
# nameserver 127.0.0.11
```

### 4.2 Network alias

Container có thể có nhiều "tên" trong cùng một network:

```powershell
docker run -d --name db1 \
  --network dns-demo \
  --network-alias database \
  --network-alias primary-db \
  postgres:16

# Bây giờ ping được cả 3 tên: db1, database, primary-db
docker run --rm --network dns-demo alpine ping -c 1 database
```

> **Ứng dụng:** Khi blue/green deploy, bạn có 2 container `db-blue` và `db-green` cùng alias `database` — chuyển traffic chỉ bằng việc connect/disconnect.

### 4.3 Internal-only network

Network không có internet:

```powershell
docker network create --internal isolated-net

docker run --rm --network isolated-net alpine ping -c 2 8.8.8.8
# bad address — không ra ngoài được ✅
```

### 📝 Bài tập 4

1. Tạo network `microservices`
2. Chạy 3 container: `auth`, `payment`, `orders` (đều dùng image `nginx`)
3. Container `orders` phải có thêm alias `order-service`
4. Từ `auth`, dùng `nslookup` (hoặc `getent hosts`) để tra cứu tên `order-service`
5. Đảm bảo `auth` ping được cả `orders` lẫn `order-service`

---

## Phần 5: Port Publishing & Expose

### 5.1 Khác biệt giữa EXPOSE và PUBLISH

| | EXPOSE | PUBLISH (`-p`) |
|---|--------|----------------|
| Tác dụng | Chỉ là metadata/documentation | Mở port ra host thật |
| Truy cập từ ngoài host | ❌ | ✅ |
| Trong Dockerfile | `EXPOSE 80` | Không có |
| Khi `docker run` | `--expose 80` | `-p 8080:80` |

### 5.2 Các kiểu publish

```powershell
# Map host port 8080 -> container port 80
docker run -d -p 8080:80 nginx

# Random port trên host
docker run -d -p 80 nginx
docker ps  # xem port nào được map

# Bind chỉ vào 127.0.0.1 (an toàn hơn)
docker run -d -p 127.0.0.1:8080:80 nginx

# UDP
docker run -d -p 53:53/udp my-dns-server

# Tất cả port EXPOSE đều random publish
docker run -d -P nginx
```

### 5.3 Cảnh báo bảo mật

```powershell
docker run -d -p 5432:5432 postgres  # ❌ Mở Postgres ra cả internet
docker run -d -p 127.0.0.1:5432:5432 postgres  # ✅ Chỉ localhost
```

### 📝 Bài tập 5

1. Chạy nginx với port 80, map ra host port 9090
2. Mở trình duyệt: `http://localhost:9090` — phải thấy trang Welcome nginx
3. Dùng `docker port <container>` để xem mapping
4. Thử chạy 2 nginx cùng map port 9090 — báo lỗi gì?
5. Sửa lại để chạy được 2 nginx song song

---

## Phần 6: Host Network & None Network

### 6.1 Host network

Container dùng chung network stack với host — KHÔNG cần `-p`.

```powershell
docker run -d --network host nginx
# Truy cập http://localhost:80 trực tiếp
```

**Ưu điểm:**
- Hiệu năng cao nhất (không qua NAT)
- Phù hợp với app cần nhiều port hoặc port động (VoIP, game)

**Nhược điểm:**
- Mất cô lập
- Không chạy được 2 container cùng dùng port 80
- **Trên Docker Desktop (Windows/Mac), host mode hoạt động khác Linux** — bạn không thực sự thấy `localhost` của host từ container

### 6.2 None network

```powershell
docker run -d --network none alpine sleep 3600
docker exec <id> ip addr
# Chỉ có lo (loopback), không có eth0
```

**Khi nào dùng:** Batch job xử lý file mount từ ngoài, không cần internet, cần an toàn tuyệt đối.

### 📝 Bài tập 6

1. Chạy nginx với `--network host`, truy cập từ trình duyệt host
2. So sánh `ip addr` trong container host-mode và container bridge-mode
3. Chạy busybox với `--network none`, thử ping `8.8.8.8` — kết quả?

---

## Phần 7: Docker Compose Networking

### 7.1 Mặc định trong Compose

Compose tự động tạo **một user-defined bridge network** cho mỗi project, các service trong đó tự động thấy nhau bằng tên service.

`docker-compose.yml`:
```yaml
services:
  web:
    image: nginx
    ports:
      - "8080:80"

  api:
    image: node:20-alpine
    command: sh -c "while true; do sleep 1000; done"

  db:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: secret
```

Chạy:
```powershell
docker compose up -d
docker compose exec api ping -c 2 db   # ✅
docker compose exec api ping -c 2 web  # ✅
```

### 7.2 Multiple networks

```yaml
services:
  frontend:
    image: nginx
    networks:
      - public

  api:
    image: my-api
    networks:
      - public
      - private

  db:
    image: postgres
    networks:
      - private   # frontend KHÔNG thấy db

networks:
  public:
  private:
    internal: true   # không có internet
```

### 7.3 External network

Dùng network đã tồn tại sẵn (chia sẻ giữa nhiều project):

```yaml
networks:
  shared-net:
    external: true
```

### 📝 Bài tập 7

Tạo file `docker-compose.yml` mô phỏng kiến trúc 3 tầng:
- `web` (nginx, public port 8080)
- `api` (alpine, chỉ thấy `web` và `db`)
- `db` (postgres, chỉ thấy `api`)
- `web` **không được** ping được `db`

Verify bằng `docker compose exec` từng container.

---

## Phần 8: Overlay Network (Swarm)

> Phần này yêu cầu nhiều máy hoặc nhiều VM. Có thể skip nếu chỉ học một mình.

### 8.1 Khái niệm

Overlay network cho phép container ở **nhiều máy host khác nhau** giao tiếp như đang trên cùng một mạng LAN. Bên dưới dùng **VXLAN** để encapsulate packet.

### 8.2 Khởi tạo Swarm

```powershell
# Trên manager node
docker swarm init --advertise-addr <MANAGER-IP>

# Lấy join token cho worker
docker swarm join-token worker

# Trên worker node, paste lệnh được in ra
docker swarm join --token SWMTKN-... <MANAGER-IP>:2377
```

### 8.3 Tạo overlay network và deploy

```powershell
docker network create -d overlay --attachable my-overlay

docker service create \
  --name web \
  --network my-overlay \
  --replicas 3 \
  -p 8080:80 \
  nginx
```

3 replica có thể được phân bổ ở 3 máy khác nhau, nhưng cùng "thấy" nhau qua `my-overlay`.

### 8.4 Routing Mesh

Khi bạn publish port `8080` trên service, **bất kỳ node nào** trong swarm cũng nhận request ở port 8080 và route đến replica phù hợp — không cần load balancer ngoài.

### 📝 Bài tập 8 (optional)

- Dùng `docker-machine` hoặc 2 VM (Multipass / VirtualBox) tạo cluster 1 manager + 1 worker
- Deploy service nginx 4 replica trên overlay
- Curl IP của worker tại port publish — vẫn ra response (chứng minh routing mesh)

---

## Phần 9: Macvlan & IPvlan

### 9.1 Khi nào cần?

Khi bạn muốn container **trông như một máy vật lý** trong LAN — có IP riêng cùng dải với router nhà bạn, các thiết bị khác trong LAN thấy nó.

Ví dụ thực tế: chạy **Pi-hole** trong container và muốn nó có IP `192.168.1.50` để các thiết bị trong nhà trỏ DNS tới.

### 9.2 Tạo macvlan

```powershell
docker network create -d macvlan \
  --subnet=192.168.1.0/24 \
  --gateway=192.168.1.1 \
  -o parent=eth0 \
  lan-net

docker run -d --name pihole \
  --network lan-net \
  --ip 192.168.1.50 \
  pihole/pihole
```

### 9.3 Lưu ý

- **Không hoạt động với Wi-Fi** ở nhiều case (driver hạn chế)
- Host **không ping được** container macvlan của chính mình (cần workaround)
- Cần card mạng hỗ trợ promiscuous mode

### 📝 Bài tập 9

- Tạo macvlan trên một LAN bạn có quyền (ví dụ LAN gia đình)
- Đặt IP cố định cho 1 container
- Từ máy khác trong LAN, ping vào IP đó — phải thành công
- Cleanup sau khi xong

---

## Phần 10: Bảo mật & Network Policies

### 10.1 Nguyên tắc

1. **Không bao giờ** publish port DB ra `0.0.0.0` trừ khi thật sự cần
2. Dùng **internal network** cho service không cần internet
3. Tách network theo **bậc tin cậy** (DMZ, app, data)
4. Disable inter-container communication trên `bridge` mặc định:
   ```
   dockerd --icc=false
   ```

### 10.2 Ví dụ tách tầng

```yaml
services:
  web:
    networks: [edge, app-tier]
    ports: ["443:443"]

  api:
    networks: [app-tier, data-tier]

  db:
    networks: [data-tier]

networks:
  edge: {}
  app-tier:
    internal: true
  data-tier:
    internal: true
```

Tấn công từ internet:
- Vào được `web` (cổng vào)
- Không thấy trực tiếp `db` (khác network)
- Phải đi qua `api` (có thể audit/rate-limit ở đây)

### 10.3 Iptables tự generate

Docker tự thêm rule `iptables` vào host. **Đừng tự sửa các chain `DOCKER-*`** — chúng bị overwrite. Nếu cần custom, dùng chain `DOCKER-USER`.

### 📝 Bài tập 10

- Audit một dự án có sẵn của bạn: liệt kê các port đang publish ra `0.0.0.0`
- Xác định cái nào có thể bind về `127.0.0.1` mà không ảnh hưởng chức năng
- Refactor `docker-compose.yml` để chỉ `web` (reverse proxy) có port public

---

## Phần 11: Troubleshooting

### 11.1 Công cụ debug

Cài image `nicolaka/netshoot` — Swiss-army knife của Docker network:

```powershell
docker run -it --rm --network <target-net> nicolaka/netshoot
```

Bên trong có: `ping`, `dig`, `nslookup`, `traceroute`, `tcpdump`, `iperf`, `nmap`, ...

### 11.2 Checklist debug khi 2 container không nói chuyện được

```
1. docker network ls  → cả 2 có cùng network không?
2. docker inspect <ctn> | grep NetworkMode  → mode đúng chưa?
3. Container target đang up?  → docker ps
4. Tên container đúng?  → DNS phân biệt hoa thường
5. Firewall trong container?  → ufw, iptables
6. App có listen 0.0.0.0 không?  → chứ không phải 127.0.0.1
7. Port đúng?  → app trong container nghe port nào, không phải port host
```

Lỗi kinh điển: app listen `127.0.0.1:3000` → từ container khác KHÔNG vào được, dù cùng network.

### 11.3 Lệnh hay dùng

```powershell
# Xem ai đang ở network nào
docker network inspect <net> --format "{{range .Containers}}{{.Name}} {{.IPv4Address}}{{println}}{{end}}"

# Bắt gói tin vào/ra container
docker run --rm --net=container:<target> nicolaka/netshoot tcpdump -i any

# Test connectivity
docker exec <ctn> nc -zv <target> <port>
```

### 📝 Bài tập 11

Tự tạo một bug rồi tự sửa:
1. Chạy 2 container trên 2 network khác nhau
2. Cố ping — sẽ fail
3. Dùng `nicolaka/netshoot` để debug từng bước
4. Sửa bằng `docker network connect`
5. Verify lại

---

## Phần 12: Dự án tổng hợp

### Đề bài

Triển khai một **blog system** với kiến trúc sau:

```
                   ┌─────────────┐
                   │   Internet   │
                   └──────┬───────┘
                          │ 443
                   ┌──────▼───────┐
                   │   nginx       │ (reverse proxy)
                   │   public-net  │
                   └──────┬───────┘
                          │
              ┌───────────┼───────────┐
              │           │           │
        ┌─────▼───┐  ┌────▼────┐  ┌──▼────┐
        │ blog-api│  │ admin   │  │ static│
        │  (Node)  │  │  (Next) │  │ files │
        └─────┬───┘  └────┬────┘  └───────┘
              │           │
              │  app-net  │
              └─────┬─────┘
                    │
              ┌─────▼──────┐
              │  postgres  │
              │  data-net  │
              │ (internal) │
              └────────────┘
```

### Yêu cầu

1. **3 network:** `public-net`, `app-net`, `data-net` (data-net là internal)
2. **nginx** publish port 80, có ở `public-net`
3. **blog-api** và **admin** ở `app-net` (nginx cần thấy chúng → cũng phải ở `public-net`?). Hint: cho nginx ở cả 2 network.
4. **postgres** chỉ ở `data-net`
5. Chỉ `blog-api` và `admin` thấy `postgres`
6. nginx **không** ping được postgres
7. postgres **không** ra được internet

### Deliverable

- File `docker-compose.yml` hoàn chỉnh
- Một file `verify.md` ghi lại 5 lệnh `docker compose exec ... ping ...` chứng minh các ràng buộc trên đúng

---

## Tổng kết

Sau khóa học bạn nên tự tin:

- ✅ Phân biệt được 6 driver network và biết khi nào dùng cái nào
- ✅ Hiểu vì sao **luôn dùng user-defined bridge**, không dùng default
- ✅ Dùng được DNS resolution và network alias
- ✅ Thiết kế multi-tier network cho ứng dụng thật
- ✅ Debug được các lỗi network thường gặp
- ✅ Áp dụng nguyên tắc least-privilege cho network

### Tài liệu tham khảo

- [Docker official: Networking overview](https://docs.docker.com/network/)
- [Docker Compose networking](https://docs.docker.com/compose/networking/)
- Lệnh `docker network --help` luôn là bạn tốt

### Bước tiếp theo

- Học **Kubernetes networking** (Service, Ingress, NetworkPolicy, CNI)
- Học **service mesh** (Istio, Linkerd)
- Đọc về **BPF / Cilium** — tương lai của container networking

---

> 🎯 **Lời khuyên cuối:** Đừng học chay. Mỗi phần đều có ví dụ và bài tập — hãy mở terminal và gõ từng lệnh. Sai → sửa → hiểu. Đó là cách nhanh nhất.
