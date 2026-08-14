# Câu hỏi phỏng vấn Backend (Mid–Senior)

> Stack: **Node.js · MongoDB · Redis · RabbitMQ · Kafka**
> Bộ câu hỏi chọn lọc — đủ để cover các chủ đề hay hỏi nhất ở level mid–senior. Mỗi câu có câu trả lời mẫu + ý ăn điểm.

---

## 1. Node.js

### 1.1. Node.js xử lý nhiều request đồng thời thế nào khi nó single-threaded?

Node chạy JavaScript trên **một thread duy nhất** (call stack), nhưng I/O (network, file, DB) được giao cho **libuv** xử lý bất đồng bộ — phần lớn là non-blocking I/O của OS, một số việc (như `fs`, DNS, crypto) chạy trên **thread pool** của libuv (mặc định 4 thread).

Nhờ vậy, khi một request đang chờ I/O, thread chính **không bị block** mà tiếp tục xử lý request khác. Callback/promise được đưa vào **event loop** và chạy khi I/O xong.

> Ý ăn điểm: Node nhanh với workload **I/O-bound**, nhưng **CPU-bound** (tính toán nặng) sẽ block event loop → phải tách ra `worker_threads`, child process, hoặc service riêng.

### 1.2. Event loop có những phase nào?

Theo thứ tự mỗi vòng lặp:
1. **timers** — callback của `setTimeout` / `setInterval`
2. **pending callbacks** — một số callback I/O bị hoãn
3. **idle/prepare** — nội bộ
4. **poll** — lấy I/O events mới, thực thi callback I/O
5. **check** — callback của `setImmediate`
6. **close callbacks** — vd `socket.on('close')`

Xen giữa các phase, Node làm sạch **microtask queue**: `process.nextTick()` (ưu tiên cao nhất) rồi tới **Promise callbacks** (`.then`/`await`).

> Câu hỏi gài: `setTimeout(fn, 0)` vs `setImmediate(fn)` — thứ tự không đảm bảo nếu gọi ở top-level, nhưng trong một I/O callback thì `setImmediate` luôn chạy trước.

### 1.3. `cluster` vs `worker_threads` — khi nào dùng cái nào?

- **`cluster`**: fork nhiều **process** Node (mỗi process 1 event loop, bộ nhớ riêng), thường để tận dụng nhiều CPU core cho server HTTP. Master phân phối connection. Phù hợp **scale I/O / throughput**.
- **`worker_threads`**: nhiều **thread** trong cùng process, **chia sẻ bộ nhớ** qua `SharedArrayBuffer`. Phù hợp **CPU-bound** (xử lý ảnh, mã hóa, parse lớn) mà không muốn tốn chi phí tạo process.

> Production thường dùng **PM2** hoặc orchestrator (K8s) thay vì tự code `cluster`.

### 1.4. Stream và backpressure là gì?

**Stream** xử lý dữ liệu theo từng chunk thay vì nạp toàn bộ vào RAM (vd đọc file lớn, proxy response). 4 loại: Readable, Writable, Duplex, Transform.

**Backpressure** = cơ chế chống "nguồn ghi nhanh hơn đích xử lý". Khi `writable.write()` trả về `false` (buffer đầy), bạn nên **dừng đọc** cho tới khi có event `drain`. Dùng `pipe()` hoặc `pipeline()` thì Node **tự xử lý backpressure** cho bạn — đó là lý do nên ưu tiên `pipeline()` (còn tự dọn dẹp khi lỗi).

### 1.5. Bạn debug memory leak trong Node thế nào?

- Theo dõi `process.memoryUsage()` (`heapUsed` tăng dần không giảm).
- Chụp **heap snapshot** (Chrome DevTools / `--inspect`, `v8.writeHeapSnapshot()`), so sánh 2 snapshot để tìm object giữ lại.
- Nguyên nhân hay gặp: **closure giữ reference**, listener không gỡ (`emitter.on` không `off`), cache (Map/object) phình mãi, biến global, timer không clear.
- Công cụ: `clinic.js`, `--max-old-space-size`, `--trace-gc`.

### 1.6. Xử lý lỗi trong async/await đúng cách?

- Bọc `try/catch` quanh `await`; với nhiều promise độc lập dùng `Promise.allSettled` để không "fail-fast" oan.
- **Unhandled rejection**: bắt ở mức process (`process.on('unhandledRejection')`) để log + (cân nhắc) thoát process — không nên nuốt lỗi âm thầm.
- Trong Express, lỗi async phải `next(err)` (hoặc dùng wrapper) để vào error-handling middleware.
- Phân biệt **operational error** (mất kết nối DB → retry/xử lý) vs **programmer error** (bug → để crash + restart bằng PM2/K8s).

---

## 2. MongoDB

### 2.1. Index hoạt động thế nào? Quy tắc ESR cho compound index?

Index là **B-tree** giúp tránh full collection scan. Với **compound index**, thứ tự field tuân theo quy tắc **ESR**:
- **E**quality trước (field lọc bằng `=`),
- **S**ort tiếp theo,
- **R**ange (`$gt`, `$lt`, `$in`) sau cùng.

Lý do: index sắp xếp theo thứ tự field; range "phá vỡ" tính sắp xếp cho field sau nó, nên đặt range cuối để vẫn tận dụng được index cho sort.

> Dùng `.explain('executionStats')` → xem `IXSCAN` (tốt) vs `COLLSCAN` (xấu), và `totalDocsExamined` so với `nReturned`.

### 2.2. Embedding vs Referencing — chọn thế nào?

- **Embed (nhúng document con vào cha)** khi: quan hệ "chứa/sở hữu", luôn đọc cùng nhau, dữ liệu con **bị giới hạn kích thước** (vd địa chỉ trong user). Ưu: 1 query lấy hết, atomic update document.
- **Reference (lưu `ObjectId` trỏ sang collection khác)** khi: quan hệ **many-to-many**, dữ liệu con **tăng không giới hạn** (vd comment của bài viết), hoặc dùng chung bởi nhiều cha.

> Bẫy: nhúng mảng tăng vô hạn → document vượt **16MB** và update chậm. Senior trả lời theo **access pattern** (đọc/ghi thế nào) chứ không theo "lý thuyết quan hệ".

### 2.3. MongoDB có transaction / ACID không?

Có. Từ **4.0** hỗ trợ **multi-document ACID transaction** trên replica set; **4.2** mở rộng cho sharded cluster. Một document đơn lẻ thì update **luôn atomic** sẵn.

Lưu ý: transaction có **chi phí** (giữ lock, oplog), nên thiết kế schema để **hạn chế cần transaction** (vd nhúng dữ liệu liên quan vào 1 document). Chỉ dùng transaction cho thao tác đa-document thật sự cần nhất quán (chuyển tiền, trừ kho + tạo đơn).

### 2.4. Aggregation pipeline là gì? Vài stage quan trọng?

Pipeline xử lý dữ liệu qua chuỗi **stage**, output stage này là input stage sau:
- `$match` (lọc — đặt **sớm nhất** để giảm dữ liệu, dùng được index),
- `$group` (gom nhóm + tính tổng/đếm),
- `$lookup` (join sang collection khác),
- `$project` / `$addFields`, `$sort`, `$limit`, `$unwind` (tách mảng).

> Tối ưu: `$match` và `$sort` đặt đầu để tận dụng index; tránh `$lookup` trên dataset lớn không index.

### 2.5. Replica set và sharding khác nhau gì? Read/Write concern?

- **Replica set**: nhiều bản sao (1 primary + secondaries) → **high availability** + đọc scale. Primary chết → bầu primary mới (failover).
- **Sharding**: chia dữ liệu theo **shard key** ra nhiều node → **scale ghi/dung lượng** theo chiều ngang. Chọn shard key sai → "hot shard".

**Write concern** (`w`): số node phải xác nhận ghi (`w:1` nhanh nhưng rủi ro mất; `w:'majority'` an toàn). **Read concern** / **read preference**: đọc từ primary (mới nhất) hay secondary (có thể trễ — eventual consistency).

---

## 3. Redis

### 3.1. Redis dùng vào những việc gì trong hệ thống thực?

- **Cache** (giảm tải DB) — phổ biến nhất.
- **Session store** (chia sẻ session giữa nhiều instance).
- **Rate limiting** (đếm request theo `INCR` + `EXPIRE`).
- **Distributed lock**.
- **Pub/Sub** hoặc **Streams** (hàng đợi nhẹ).
- **Leaderboard / ranking** (`Sorted Set`).
- **Counter, deduplication** (Set, HyperLogLog).

### 3.2. Các chiến lược cache phổ biến?

- **Cache-aside (lazy)**: app đọc cache, miss thì query DB rồi set lại cache. Đơn giản, phổ biến nhất.
- **Write-through**: ghi DB **và** cache cùng lúc → cache luôn mới nhưng ghi chậm hơn.
- **Write-behind**: ghi cache trước, đẩy xuống DB sau (async) → nhanh nhưng rủi ro mất dữ liệu.

**Eviction policy** khi đầy bộ nhớ: `noeviction`, `allkeys-lru`, `volatile-lru`, `allkeys-lfu`... Cache thường dùng `allkeys-lru`.

### 3.3. Cache stampede (cache avalanche) là gì? Cách chống?

Khi một key hot **hết hạn cùng lúc**, hàng loạt request cùng miss → đập thẳng vào DB cùng lúc → DB sập.

Cách chống:
- **Lock / single-flight**: chỉ 1 request được rebuild cache, các request khác chờ.
- **TTL jitter**: thêm random vào TTL để key không hết hạn đồng loạt.
- **Early/background refresh**: làm mới cache trước khi hết hạn.

### 3.4. Distributed lock với Redis — có an toàn không?

Cách cơ bản: `SET key value NX PX 30000` (chỉ set nếu chưa có + TTL). Giải phóng phải dùng **Lua script** kiểm tra đúng owner mới xóa (tránh xóa nhầm lock của người khác).

**Redlock** (multi-node) được đề xuất nhưng **gây tranh cãi** (Martin Kleppmann): trong môi trường có GC pause / clock drift, lock có thể không an toàn cho việc **đòi hỏi đúng tuyệt đối**. Giải pháp đúng cần **fencing token** (số tăng dần) ở phía resource.

> Ý ăn điểm: "Redis lock ổn cho hiệu năng/giảm trùng việc, nhưng không nên là cơ chế duy nhất bảo đảm tính đúng đắn trong giao dịch tài chính."

### 3.5. Persistence: RDB vs AOF?

- **RDB**: snapshot toàn bộ dữ liệu theo chu kỳ → file nhỏ, restore nhanh, nhưng **mất dữ liệu** giữa 2 snapshot nếu crash.
- **AOF**: ghi log mọi lệnh ghi → an toàn hơn (mất tối đa ~1s với `appendfsync everysec`), nhưng file lớn, restore chậm.
- Production thường **bật cả hai**.

---

## 4. RabbitMQ vs Kafka

### 4.1. Khác biệt cốt lõi giữa RabbitMQ và Kafka? Khi nào dùng cái nào?

| | **RabbitMQ** | **Kafka** |
|---|---|---|
| Mô hình | **Message broker** truyền thống (queue) | **Distributed commit log** (append-only) |
| Sau khi consume | Message **bị xóa** (sau ack) | Message **giữ lại** theo retention → replay được |
| Định tuyến | Mạnh (exchange: direct/topic/fanout/headers) | Đơn giản (topic + partition) |
| Throughput | Vừa phải, latency thấp | **Rất cao** (hàng triệu msg/s) |
| Mô hình đẩy/kéo | **Push** tới consumer | **Pull** (consumer tự kéo) |
| Hợp với | Task queue, RPC, định tuyến phức tạp, công việc cần xử lý 1 lần | Event streaming, log, analytics, cần replay/nhiều consumer độc lập |

> Tóm: **RabbitMQ** = "giao việc cho worker, xử lý xong là xong". **Kafka** = "dòng sự kiện lưu lại, nhiều hệ thống cùng đọc, đọc lại được".

### 4.2. (Kafka) Partition, consumer group, ordering hoạt động thế nào?

- Một **topic** chia thành nhiều **partition** → cho phép song song & scale.
- **Thứ tự chỉ đảm bảo TRONG một partition**, không đảm bảo toàn topic. Muốn giữ thứ tự theo entity → set **key** (vd `userId`) để cùng key vào cùng partition.
- **Consumer group**: mỗi partition chỉ được **một consumer trong group** đọc → số consumer hữu ích tối đa = số partition. Nhiều group đọc độc lập cùng dữ liệu.
- **Offset**: vị trí đã đọc; commit offset để biết đọc tới đâu (đọc lại bằng cách reset offset).

### 4.3. (RabbitMQ) Exchange, ack, DLQ là gì?

- **Exchange** nhận message từ producer và định tuyến vào queue theo **binding**: `direct` (khớp routing key), `topic` (khớp pattern `*`/`#`), `fanout` (broadcast tất cả), `headers`.
- **Ack**: consumer phải `ack` sau khi xử lý xong; nếu chết trước khi ack → message được **requeue**. `prefetch` giới hạn số message chưa ack mỗi consumer (chống quá tải).
- **DLQ (Dead Letter Queue)**: message bị `nack`/hết hạn/quá số lần retry sẽ được đẩy sang queue chết để xử lý sau (tránh kẹt queue chính).

### 4.4. Các mức delivery guarantee? Làm sao đạt "exactly-once"?

- **At-most-once**: gửi 1 lần, có thể mất (fire-and-forget).
- **At-least-once**: đảm bảo tới, nhưng **có thể trùng** (do retry) — phổ biến nhất.
- **Exactly-once**: không mất, không trùng — khó & tốn kém.

Thực tế: thiết kế **at-least-once + consumer idempotent** (xem 5.1) là cách bền vững nhất. Kafka có hỗ trợ exactly-once **trong nội bộ Kafka** (idempotent producer + transactions), nhưng khi tác động ra ngoài (ghi DB, gọi API) thì vẫn cần idempotency ở phía bạn.

---

## 5. Câu hỏi tổng hợp / System Design

### 5.1. Idempotency là gì và tại sao quan trọng trong hệ phân tán?

**Idempotent** = thực hiện nhiều lần cho **kết quả như một lần**. Quan trọng vì message queue (at-least-once), retry mạng, double-click... đều có thể gây xử lý **trùng**.

Cách làm:
- **Idempotency key** (vd `orderId`/`requestId`) — lưu key đã xử lý vào DB/Redis, gặp lại thì bỏ qua.
- Dùng `upsert` thay vì `insert`; thao tác mang tính "set giá trị" thay vì "tăng/giảm".
- Ràng buộc **unique index** để chống tạo trùng.

### 5.2. Dual-write problem và Outbox pattern?

**Dual-write problem**: cần vừa ghi DB vừa publish event lên Kafka/RabbitMQ. Nếu ghi DB xong mà publish lỗi (hoặc ngược lại) → **dữ liệu và event lệch nhau**.

**Outbox pattern**: trong **cùng một transaction DB**, ghi dữ liệu nghiệp vụ **và** một bản ghi vào bảng `outbox`. Một tiến trình riêng (poller hoặc **CDC** như Debezium) đọc `outbox` rồi publish lên broker. Nhờ vậy việc ghi DB và "ý định gửi event" là **atomic** → không mất/không lệch.

### 5.3. Thiết kế một endpoint đặt hàng chịu tải cao (kết hợp cả stack)?

Một câu trả lời "kết nối mọi thứ":
1. **API (Node.js)** nhận request, validate, sinh `idempotencyKey`.
2. **Redis**: check rate limit + check idempotency key (chống double-submit); có thể giữ **lock** theo `userId`/`productId` để tránh oversell.
3. **MongoDB transaction**: trừ tồn kho + tạo đơn (atomic), đồng thời ghi **outbox**.
4. **Kafka/RabbitMQ**: publish event `order.created` (qua outbox) → các service khác (gửi mail, thanh toán, phân tích) xử lý **bất đồng bộ**, không chặn response.
5. Consumer **idempotent**, có **DLQ** cho message lỗi.

> Ý ăn điểm: tách **đường ghi đồng bộ** (phải nhất quán) khỏi **việc phụ bất đồng bộ** (qua queue), cộng với cache đọc bằng Redis.

### 5.4. Eventual consistency là gì? Khi nào chấp nhận được?

Dữ liệu giữa các service/replica **không nhất quán tức thời** mà **hội tụ sau một khoảng thời gian** (do replicate, do xử lý event async). Chấp nhận được khi nghiệp vụ **không yêu cầu chính xác tuyệt đối ngay** (số like, feed, thống kê, gửi mail). Không chấp nhận cho **giao dịch tiền/tồn kho tại điểm bán** → cần strong consistency (transaction, lock).

---

## 6. API Design & Microservices

### 6.1. REST vs gRPC vs GraphQL — chọn cái nào?

| | **REST** | **gRPC** | **GraphQL** |
|---|---|---|---|
| Giao thức | HTTP/JSON | HTTP/2 + Protobuf (binary) | HTTP/JSON |
| Ưu | Đơn giản, phổ biến, cache HTTP dễ | Nhanh, type-safe, streaming 2 chiều | Client lấy đúng field cần, 1 request nhiều resource |
| Nhược | Over-fetch / under-fetch | Khó debug, không thân thiện browser | Caching khó, dễ query nặng (N+1) |
| Hợp với | Public API, CRUD | Giao tiếp **service-to-service** nội bộ, độ trễ thấp | Frontend nhiều loại client, data graph phức tạp |

> Ý ăn điểm: nội bộ microservices ưu tiên **gRPC** (hiệu năng + contract rõ); API ra ngoài thường **REST**; GraphQL khi client cần linh hoạt field.

### 6.2. Versioning API thế nào?

- **URI versioning**: `/v1/users` (rõ ràng, phổ biến nhất).
- **Header versioning**: `Accept: application/vnd.api.v2+json` (URL sạch nhưng khó test).
- Nguyên tắc: **không phá vỡ (breaking change)** version cũ khi client còn dùng; thêm field thì **backward-compatible**, bỏ/đổi field thì lên version mới + có **deprecation policy**.

### 6.3. Pagination: offset vs cursor?

- **Offset** (`?page=2&limit=20` / `skip`): dễ làm, nhảy trang được, **nhưng** chậm khi offset lớn (DB phải đếm/bỏ qua nhiều row) và **dữ liệu lệch** khi có insert/delete giữa chừng.
- **Cursor (keyset)** (`?after=<last_id>`): truyền con trỏ của item cuối, query `WHERE id > cursor LIMIT n`. **Nhanh & ổn định** với dataset lớn, real-time feed. Nhược: không nhảy thẳng tới trang N.

> Senior chọn **cursor** cho danh sách lớn / infinite scroll; offset cho admin table nhỏ cần nhảy trang.

### 6.4. Distributed transaction giữa các service — Saga pattern?

Trong microservices, không thể dùng 1 DB transaction xuyên nhiều service. **Saga** = chuỗi transaction cục bộ, mỗi bước phát event cho bước sau; nếu một bước fail thì chạy **compensating transaction** (hoàn tác) các bước trước.
- **Choreography**: các service tự lắng nghe event của nhau (phi tập trung, dễ rối khi nhiều bước).
- **Orchestration**: một **orchestrator** điều phối tuần tự (dễ theo dõi/kiểm soát hơn).

> Ví dụ đặt hàng: trừ kho → thanh toán → giao hàng; nếu thanh toán fail → hoàn kho.

### 6.5. Resilience: circuit breaker, retry, timeout?

Khi gọi service khác:
- **Timeout**: luôn đặt timeout, tránh treo vô hạn.
- **Retry**: thử lại lỗi tạm thời, **kèm exponential backoff + jitter** (tránh "retry storm"); chỉ retry với thao tác **idempotent**.
- **Circuit breaker**: khi service đích lỗi liên tục → "mở mạch", **fail nhanh** một thời gian thay vì dồn request vào service đang chết, rồi thử "half-open" để phục hồi.
- **Bulkhead**: cô lập tài nguyên (pool riêng) để 1 service lỗi không kéo sập toàn bộ.

---

## 7. Security

### 7.1. Authentication vs Authorization? JWT vs session?

- **Authentication** = "bạn là ai" (đăng nhập). **Authorization** = "bạn được làm gì" (quyền/role).
- **Session (stateful)**: server lưu session (thường trong Redis), client giữ session ID trong cookie. **Thu hồi dễ** (xóa session), nhưng cần storage chia sẻ giữa các instance.
- **JWT (stateless)**: token tự chứa thông tin, server không cần lưu → scale dễ. **Nhưng khó thu hồi** trước khi hết hạn.

### 7.2. Những "bẫy" khi dùng JWT?

- **Không thể revoke** token đã phát → dùng **access token ngắn hạn** (vài phút) + **refresh token** dài hạn (lưu server/DB, có thể thu hồi) + **rotation**.
- Lưu token: tránh `localStorage` (dễ XSS) → ưu tiên cookie **HttpOnly + Secure + SameSite**.
- **Không để thông tin nhạy cảm** trong payload (JWT chỉ encode base64, ai cũng đọc được).
- Phải verify chữ ký đúng thuật toán; chặn lỗ hổng `alg: none`.

### 7.3. Các lỗ hổng OWASP hay gặp ở backend? (đặc biệt với Node + Mongo)

- **Injection / NoSQL injection**: với Mongo, query nhận trực tiếp object từ body có thể bị `{ "$gt": "" }` để bypass → **validate & sanitize input** (Zod/Joi), không truyền raw user input vào query operator.
- **Broken access control**: thiếu check quyền ở **mỗi** endpoint (IDOR — truy cập tài nguyên người khác qua đổi ID).
- **XSS / CSRF**: escape output; CSRF token hoặc SameSite cookie.
- **SSRF**: validate URL khi server gọi ra ngoài theo input người dùng.
- **Sensitive data exposure**: HTTPS, không log secret/PII.

### 7.4. Lưu password và secret đúng cách?

- **Password**: hash bằng **bcrypt** / **argon2** (có salt, chậm có chủ đích) — **không bao giờ** dùng MD5/SHA thuần hay lưu plaintext.
- **Secret/API key**: để trong **env var** / secret manager (Vault, AWS Secrets Manager), **không hardcode**, không commit vào git.
- **Rate limit** đăng nhập + khóa tạm sau nhiều lần sai (chống brute-force).

---

## 8. Observability & Logging

### 8.1. "Three pillars of observability" là gì?

1. **Logs** — sự kiện rời rạc (lỗi, request). Nên dùng **structured logging** (JSON) thay vì text thường để máy parse/lọc được.
2. **Metrics** — số liệu tổng hợp theo thời gian (latency, request rate, CPU). Nhẹ, hợp để alert.
3. **Traces** — theo dõi **một request đi qua nhiều service** (distributed tracing), tìm bottleneck ở đâu.

### 8.2. Correlation ID / request ID để làm gì?

Mỗi request gắn một **ID duy nhất** (sinh ở API gateway/đầu vào), truyền qua mọi service và log + message queue kèm theo. Khi debug, lọc theo ID này để **ghép toàn bộ hành trình** của một request xuyên nhiều service/log → cực kỳ quan trọng trong microservices. Chuẩn hóa bằng **OpenTelemetry** (trace context).

### 8.3. Nên monitor những metric nào? (RED / USE)

- **RED** (cho service/request): **R**ate (req/s), **E**rrors (tỉ lệ lỗi), **D**uration (latency — quan trọng nhất là **p95/p99**, không chỉ trung bình vì trung bình che giấu đuôi chậm).
- **USE** (cho tài nguyên): **U**tilization, **S**aturation, **E**rrors (CPU, memory, connection pool, queue depth).
- Đặt **alert** theo ngưỡng SLO (vd p99 < 300ms, error rate < 1%) chứ không alert mọi thứ (tránh alert fatigue).

### 8.4. Health check: liveness vs readiness?

- **Liveness**: app còn "sống" không? Fail → orchestrator (K8s) **restart** pod.
- **Readiness**: app **sẵn sàng nhận traffic** chưa? (đã kết nối DB/Redis chưa). Fail → tạm **ngừng route traffic** vào nhưng không restart.

> Phân biệt rõ 2 cái này là điểm hay được hỏi khi nói về deploy trên K8s.

---

## Gợi ý ôn tập
- Mỗi câu, tự trả lời **to thành tiếng** trong 1–2 phút trước khi xem đáp án.
- Chuẩn bị **1 ví dụ thực tế** từ dự án của bạn cho mỗi công nghệ (interviewer rất hay hỏi "bạn đã dùng X để giải quyết vấn đề gì?").
- Nắm chắc phần **trade-off** (RabbitMQ vs Kafka, embed vs reference, cache strategy) — đây là thứ phân biệt mid với senior.
