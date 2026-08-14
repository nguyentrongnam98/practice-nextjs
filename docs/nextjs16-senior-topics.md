# Next.js 16 — Topics cần nắm chắc ở level Senior

> Verified với **Next.js 16.2.3** (`node_modules/next/dist/docs/`), project đã bật `cacheComponents: true` + `output: 'standalone'`.
> **Quan trọng:** Next.js 16 khác đáng kể so với 13/14. Trước khi build mỗi topic, đọc doc gốc trong `node_modules/next/dist/docs/01-app/` — đừng tra Google, kết quả top thường là Next 13/14.

## Cách dùng doc này

Mỗi topic có 5 phần:

| Phần | Ý nghĩa |
|---|---|
| **Phải nắm** | Khái niệm cốt lõi — nếu không giải thích được thì chưa nắm |
| **API / file convention** | Tên chính xác trong v16 (đã verify), để không gọi sai tên khi phỏng vấn |
| **Trap hay sai** | Kiến thức Next 13/14 hoặc Pages Router đã lỗi thời |
| **Build để chứng minh** | 1 feature nhỏ, độc lập. Làm được = hiểu thật, không phải đọc hiểu |
| **Tự test** | Câu hỏi không kèm đáp án. Tự trả lời trước, rồi đối chiếu doc |

**Nguyên tắc khi build:** mỗi topic 1 project riêng (hoặc 1 route riêng), nhỏ nhất có thể để cô lập đúng khái niệm đó. Mục tiêu không phải app đẹp — mà là **quan sát được hành vi** (xem build log, Network tab, DevTools).

**Thứ tự đề xuất:** 1 → 2 → 3 → 4 (nền tảng, phải làm trước) → sau đó 5-11 theo thứ tự nào cũng được.

---

## 1. Rendering model — static/dynamic là spectrum

**Phải nắm**

- Phần lớn framework đặt biên static/dynamic ở **mức route**. Next.js đặt ở **mức component**. Một page có thể có shell tĩnh load tức thì + nhiều vùng dynamic stream vào sau, trong **cùng một response**.
- **Static shell** = mọi thứ render được **trước khi** bất kỳ async work nào resolve: layouts, navigation, và các `<Suspense>` fallback. Với Cache Components, shell được prerender ở build time và serve từ edge.
- Initial load có **2 stream chạy song song**: HTML stream (cái user *thấy*) và **component payload** (RSC payload — bản serialize của cây component để React hydrate). Khi một Server Component async resolve, React stream HTML của nó kèm inline `<script>` để swap DOM node — **swap xảy ra ngay, không cần chờ JS bundle load hay hydrate xong**.
- **Client-side navigation chỉ fetch component payload** (request có header `rsc: 1`), **không transfer HTML**.
- Mỗi `<Suspense>` boundary là một **streaming point độc lập** — các component ở boundary khác nhau không block nhau.
- Component trở thành dynamic khi dùng **Request-time API**: `cookies()`, `headers()`, `searchParams`, `connection()`.

**API / file convention**

- `cacheComponents: true` trong `next.config.ts` — từ 16.0.0, flag này **gộp `ppr` + `useCache` + `dynamicIO`** thành một config duy nhất
- `<Suspense>`, `loading.tsx`
- `connection()` từ `next/server` — chủ động opt vào dynamic
- Doc: `01-app/02-guides/rendering-philosophy.md`, `01-app/02-guides/streaming.md`, `01-app/04-glossary.md`

**Trap hay sai**

- ❌ "SSR vs SSG vs ISR — chọn 1 cho mỗi page". Sai ở v16: một page có cả 3 tính chất cùng lúc.
- ❌ "Streaming cần cấu hình thêm". Không — App Router tích hợp sẵn.
- ❌ Nghĩ user phải chờ hydrate xong mới thấy content stream vào. Không: DOM swap chạy trước hydration.

**Build để chứng minh**

Một dashboard: header + sidebar tĩnh, và 3 widget cố tình `await sleep(1000/2000/3000)` — mỗi widget một `<Suspense>` riêng.

- Chạy `pnpm build` → đọc build log, xác định route thuộc loại gì, phần nào vào prerender.
- Dùng `curl -N http://localhost:3000/dashboard` (đã `pnpm start`) để **thấy HTML về theo từng chunk**, không phải một cục.
- Sau đó gộp 3 widget vào **một** `<Suspense>` chung → so sánh: giờ widget nhanh nhất phải chờ widget chậm nhất.

**Tự test**

1. Static shell của route này gồm chính xác những gì?
2. Khi user click `<Link>` sang route khác, browser tải HTML hay tải gì?
3. Bỏ `<Suspense>` quanh component có `await cookies()` thì điều gì xảy ra ở build time?
4. Vì sao Suspense fallback nằm *trong* static shell chứ không phải ngoài?

---

## 2. Server vs Client Components

**Phải nắm**

- **RSC ≠ SSR.** Default trong App Router là **Server Component**. Một Client Component (`'use client'`) **vẫn được server-render (SSR) ở lần load đầu** — `'use client'` không có nghĩa "chỉ chạy ở browser", nó nghĩa là "code này cũng được gửi xuống browser và hydrate".
- `'use client'` là một **boundary, không phải nhãn dán một file**: mọi module được import từ đó trở xuống đều vào client bundle.
- Props truyền từ Server → Client phải **serializable**. Function và class **đã bị block sẵn** by default.
- **Interleaving**: để giữ một Server Component nằm *trong* cây của Client Component → truyền qua `children` (hoặc prop chứa element), không import trực tiếp.
- Context provider **phải** ở Client Component; đặt càng sâu trong cây càng tốt để không kéo cả app sang client.
- Third-party component chưa có `'use client'` → tự wrap lại.

**API / file convention**

- `'use client'`, `'use server'`
- Package `server-only` / `client-only` (đã có trong `package.json` của bạn) — chống **environment poisoning**
- Doc: `01-app/01-getting-started/05-server-and-client-components.md` (mục *Interleaving*, *Context providers*, *Preventing environment poisoning*)

**Trap hay sai**

- ❌ "`'use client'` = component render ở client, không SSR". Sai — vẫn SSR lần đầu.
- ❌ "Đặt `'use client'` ở root layout cho tiện". Đó là cách biến cả app thành SPA và mất hết lợi ích RSC.
- ❌ Truyền hàm callback từ Server xuống Client Component qua props.

**Build để chứng minh**

Một trang có `<ClientTabs>` (Client Component, quản lý state tab đang chọn) mà **nội dung mỗi tab là Server Component** fetch data — truyền qua `children`.

- Chạy `pnpm build`, ghi lại **First Load JS** của route.
- Sau đó cố tình sửa: import Server Component trực tiếp vào file có `'use client'` → xem lỗi.
- Đẩy `'use client'` từ page xuống chỉ đúng component cần interactive → so sánh First Load JS trước/sau.
- Thêm `import 'server-only'` vào file DAL, rồi cố import nó từ Client Component → đọc thông báo lỗi.

**Tự test**

1. File `utils.ts` không có directive nào, được import bởi cả Server Component và một file `'use client'` — nó chạy ở đâu?
2. Client Component có được khai báo `async` không? Vì sao?
3. Truyền một instance `Date` qua props Server → Client được không? Còn `Map`? Còn một class instance?
4. `server-only` khác gì với việc chỉ đặt file trong folder `_lib`?

---

## 3. Cache Components — `'use cache'`

**Phải nắm**

- `'use cache'` cache **giá trị trả về của async function hoặc component**. Hai mức dùng:
  - **Data-level**: cache hàm fetch/compute (`getProducts()`)
  - **UI-level**: cache cả component / page / layout
  - Đặt `'use cache'` ở **đầu file** → **mọi export trong file** đều được cache.
- **Cache key = arguments + mọi biến closed-over từ scope cha.** Nên input phải serializable, và một biến vô tình bị "bắt" vào closure sẽ làm nổ số cache entry.
- **`cacheLife`** đặt vòng đời, gồm 3 mốc `stale` / `revalidate` / `expire`:

  | Profile | stale | revalidate | expire |
  |---|---|---|---|
  | `seconds` | 0 | 1s | 60s |
  | `minutes` | 5m | 1m | 1h |
  | `hours` | 5m | 1h | 1d |
  | `days` | 5m | 1d | 1w |
  | `weeks` | 5m | 1w | 30d |
  | `max` | 5m | 30d | ~vô hạn |

- **Cache "short-lived"** (profile `seconds`, hoặc `revalidate: 0`, hoặc `expire` < 5 phút) **bị loại khỏi prerender** và trở thành dynamic hole. Đây là chỗ rất nhiều người tưởng đã cache mà thực ra không vào static shell.
- **`'use cache'` lưu in-memory** → có thể bị evict, không persist qua restart. Nhưng nó **vẫn có giá trị ngoài việc cache ở server**: nó cho Next.js biết cái gì **prefetch được**, và định **stale time cho client-side navigation**.
- **`'use cache: private'`** — cho phép đọc `cookies()` / `headers()` / `searchParams` **bên trong** scope cached. Kết quả **không bao giờ lưu trên server**, chỉ cache trong **memory của browser** và **không persist qua reload**. Vì đọc runtime data nên hàm chạy lại ở **mỗi server render** và **bị loại khỏi việc sinh static shell**. Không dùng được trong Route Handlers. Không cấu hình được custom cache handler. (experimental)
- **`'use cache: remote'`** — lưu ở remote cache, **durable + shared giữa mọi server instance**. Trade-off: tốn hạ tầng + latency khi lookup. Đáng dùng khi: upstream API bị rate-limit, backend chậm, hoặc content nằm ngoài static shell (serverless mỗi instance có memory riêng → hit rate thấp). **Không** đáng dùng khi: operation đã < 50ms, cache key gần như unique mỗi request (search filter, price range), hoặc data đổi theo giây/phút.

**API / file convention**

- Directive: `'use cache'`, `'use cache: private'`, `'use cache: remote'`
- `cacheLife()`, `cacheTag()` từ `next/cache`
- Config: `cacheComponents`, `cacheHandlers`
- Doc: `01-app/01-getting-started/08-caching.md`, `01-app/03-api-reference/01-directives/use-cache*.md`

**Trap hay sai**

- ❌ **`fetch()` KHÔNG được cache mặc định ở v16.** Ngược hoàn toàn với Next 13/14 (nơi fetch cached by default và bạn dùng `cache: 'no-store'` để opt out). Giờ default là dynamic, phải **opt in** bằng `'use cache'`.
- ❌ `getStaticProps` / `getServerSideProps` **không tồn tại** trong App Router. ISR giờ là `'use cache'` + `cacheLife`.
- ❌ `export const revalidate = 60` là model cũ (segment config). Với Cache Components thì dùng `cacheLife`.
- ❌ Tưởng `'use cache: private'` là "cache riêng cho từng user ở server". Không — server không lưu gì cả.

**Build để chứng minh**

Một trang product detail, cùng một nội dung nhưng làm **3 biến thể** để so sánh trong build log:

1. `ProductInfo` — `'use cache'` + `cacheLife('hours')`
2. `ThemedGreeting` — `'use cache: private'`, đọc `cookies()` lấy theme
3. `LiveInventory` — không cache, bọc `<Suspense>`

Sau đó: đổi `cacheLife('hours')` → `cacheLife('seconds')` và chạy lại `pnpm build`. Xác nhận component (1) **rơi khỏi static shell**.
Bài phụ: tạo `getProducts(filter)` rồi gọi với 5 filter khác nhau → quan sát số cache entry sinh ra.

**Tự test**

1. Cache key của một hàm `'use cache'` gồm chính xác những gì?
2. Vì sao `cacheLife('seconds')` khiến component không vào static shell?
3. `'use cache: private'` lưu data ở đâu, sống được bao lâu?
4. Nếu `'use cache'` chỉ là in-memory và có thể bị evict, thì nó còn tác dụng gì?
5. Khi nào bạn từ chối dùng `'use cache: remote'` dù backend chậm?

---

## 4. Revalidation & invalidation

**Phải nắm**

- Ba API, ba mục đích khác nhau — đây là câu hỏi phân loại rất hay gặp:

  | | Gọi được ở đâu | Hành vi | Dùng khi |
  |---|---|---|---|
  | `revalidateTag(tag, 'max')` | Server Actions **và** Route Handlers | Mark stale → **stale-while-revalidate**: request kế tiếp vẫn nhận data cũ, fresh data fetch ở background | Blog, catalog, docs — chậm vài giây không sao |
  | `updateTag(tag)` | **Chỉ** Server Actions | **Expire ngay**. Request kế tiếp *chờ* data mới, không serve stale | **Read-your-own-writes**: user vừa sửa, phải thấy ngay |
  | `refresh()` | **Chỉ** Server Actions | Refresh client router | Cần cập nhật UI mà không invalidate cache server |

- `revalidateTag` với `'max'` **chỉ mark stale** — fresh data chỉ được fetch khi page dùng tag đó **được visit lần tới**. Nên gọi nó **không** gây bão revalidation.
- Tag: tối đa **256 ký tự**, **case-sensitive**.
- `revalidatePath` hoạt động bên dưới bằng **soft tags** do Next tự sinh theo path, prefix `_N_T_`. Ví dụ `/blog/hello` → `_N_T_/layout`, `_N_T_/blog/layout`, `_N_T_/blog/hello/layout`, `_N_T_/blog/hello`.
- **Client cache** (in-memory ở browser, chứa RSC payload của route đã visit/prefetch): page **không** được cache mặc định nhưng **được reuse khi back/forward**. Bị clear khi refresh trang. Invalidate được bằng `revalidateTag`, `revalidatePath`, `updateTag`, `router.refresh`, `cookies.set`, `cookies.delete`. Cấu hình thời gian bằng `staleTimes` (global) hoặc `stale` trong `cacheLife` (**khuyến nghị**).
- **Multi-instance**: revalidation **local by default** — gọi `revalidateTag()` ở instance A **không** invalidate cache của instance B. Cache handler API có 2 hook để phối hợp: `updateTags()` (ghi event vào shared storage như Redis) và `refreshTags()` (đọc lại trước mỗi request).

**API / file convention**

- `revalidateTag`, `revalidatePath`, `updateTag` từ `next/cache`; `refresh` từ `next/cache`
- `cacheTag()` trong scope `'use cache'`; hoặc `fetch(url, { next: { tags: [...] } })` cho một fetch đơn lẻ
- Config: `cacheHandlers`, `staleTimes`
- Doc: `01-app/01-getting-started/09-revalidating.md`, `01-app/02-guides/how-revalidation-works.md`

**Trap hay sai**

- ❌ **`revalidateTag(tag)` một tham số đã deprecated.** Nó hiện vẫn chạy nếu bạn tắt lỗi TS, nhưng có thể bị bỏ. Dùng `revalidateTag(tag, 'max')` hoặc chuyển sang `updateTag`.
- ❌ Gọi `updateTag` trong Route Handler → không được, phải dùng `revalidateTag`.
- ❌ Gọi `revalidateTag` trong Proxy → không được (chỉ chạy ở server environment của app).
- ❌ `cacheTag()` (tag cho cả hàm/component cached) bị lẫn với `fetch(url,{next:{tags}})` cũ (chỉ tag đúng một fetch).

**Build để chứng minh**

Một blog `/posts` (list `'use cache'` + `cacheTag('posts')`) và một form admin sửa title.

- Nút A: `revalidateTag('posts', 'max')`
- Nút B: `updateTag('posts')`

Sau khi submit, **reload ngay lập tức** và ghi lại: nút nào cho thấy title mới ngay, nút nào còn thấy title cũ (rồi lần reload sau mới mới). Đây là bài thực nghiệm quan trọng nhất của topic 4.
Bài phụ: thêm một Route Handler `POST /api/webhook` cũng invalidate `posts` → xác nhận `updateTag` không dùng được ở đây.

**Tự test**

1. `revalidateTag('posts','max')` khi có 10 route dùng tag đó — 10 route regenerate ngay?
2. `revalidatePath('/blog/hello')` invalidate chính xác những tag nào?
3. Vì sao `updateTag` bị giới hạn chỉ trong Server Actions?
4. App chạy 3 pod trên K8s, gọi `revalidateTag` — điều gì xảy ra ở 2 pod còn lại?
5. `refresh()` khác `router.refresh()` ở chỗ nào?

---

## 5. Routing — cấu trúc file

**Phải nắm**

- **Route groups** `(marketing)` — nhóm route mà **không** thêm vào URL; dùng để có nhiều root layout khác nhau.
- **Parallel routes** `@slot` — render nhiều page cùng lúc trong một layout. `default.tsx` là thứ được dùng khi Next **không** khôi phục được state của slot (điển hình: hard navigation / full reload).
- **Intercepting routes** `(.)`, `(..)`, `(...)` — chặn một route để hiển thị trong context hiện tại (modal), nhưng URL vẫn share được và reload ra full page.
- **Dynamic segments** `[slug]`, catch-all `[...slug]`, optional catch-all `[[...slug]]`.
- `generateStaticParams` để prerender trước danh sách param; `dynamicParams` quyết định param **không** nằm trong list sẽ được render on-demand hay trả 404.
- `layout` (giữ state, không remount khi navigate trong cùng segment) vs `template` (remount mỗi lần navigate).
- Với Cache Components, **`GET` Route Handler theo đúng model prerender như page**: chạy request-time by default, được prerender khi không chạm uncached/runtime data.

**API / file convention**

- `layout.tsx`, `page.tsx`, `template.tsx`, `loading.tsx`, `not-found.tsx`, `default.tsx`, `route.ts`
- `generateStaticParams()`, `export const dynamicParams`
- Doc: `01-app/03-api-reference/03-file-conventions/` (`parallel-routes.md`, `intercepting-routes.md`, `route-groups.md`, `default.md`)

**Trap hay sai**

- ❌ `pages/` + `getServerSideProps` — không còn trong App Router.
- ❌ Quên `default.tsx` cho parallel route → 404 khi user reload/hard-navigate.
- ❌ Nghĩ `layout.tsx` remount khi navigate giữa các child route. Không — nó giữ state.
- ❌ `route.ts` đặt cùng segment với `page.tsx` → conflict.

**Build để chứng minh**

Một gallery `/photos`: click ảnh → mở **modal** bằng intercepting + parallel route (`@modal`), URL đổi thành `/photos/[id]`.

- Copy URL, mở tab mới → phải ra **full page**, không phải modal.
- Xoá `default.tsx` → reload trong lúc modal đang mở → quan sát hỏng thế nào.
- Thêm `generateStaticParams` cho 3 id, set `dynamicParams = false`, truy cập id thứ 4 → xác nhận 404.

**Tự test**

1. Route group `(shop)` xuất hiện trong URL không? Nó giải quyết vấn đề gì?
2. Vì sao intercepting route reload lại ra full page — cơ chế nào quyết định?
3. `layout` vs `template` — khi nào buộc phải dùng `template`?
4. `dynamicParams = true` + `generateStaticParams` trả về `[]` nghĩa là gì?

---

## 6. Navigation & prefetching

**Phải nắm**

- Prefetch khác nhau rõ rệt giữa static và dynamic page:

  | | Static page | Dynamic page |
  |---|---|---|
  | Được prefetch | Có, cả route | Không, **trừ khi** có `loading.js` |
  | Client cache TTL | 5 phút (default) | Tắt, trừ khi bật `staleTimes` |
  | Server roundtrip khi click | Không | Có, stream sau shell |

- `loading.js` **thay đổi payload được prefetch**: không có `loading.js` → prefetch cả page, TTL đến khi reload app; có `loading.js` → prefetch từ layout đến **boundary loading đầu tiên**, TTL 30s (config bằng `staleTimes`).
- **Automatic prefetch chỉ chạy ở production.** Test ở `pnpm dev` sẽ không thấy gì.
- **`<Suspense>` một mình KHÔNG đảm bảo navigation tức thì.** Boundary đặt sai chỗ có thể **âm thầm** block client navigation — đặc biệt khi entry point vào route thay đổi theo shared layout. Doc nói thẳng: **luôn export `unstable_instant`** từ route cần instant, nó **validate cấu trúc cache ở dev time và build time** và error overlay chỉ đúng component gây block.
- Với `cacheComponents` bật, Next.js dùng React **`<Activity>`** để **giữ state component khi navigate**: route cũ không unmount mà chuyển sang mode `"hidden"`. Effects bị cleanup khi hidden và tạo lại khi visible. Navigate back → route cũ hiện lại **nguyên state**. Next giữ vài route gần nhất ở dạng hidden, route cũ hơn bị bỏ khỏi DOM.

**API / file convention**

- `<Link>`, `prefetch={false}`, `useRouter().prefetch()`
- `useLinkStatus()` — pending indicator cho link
- `export const unstable_instant = { prefetch: 'static' }` (route segment config; **cần `cacheComponents`**; **không dùng được trong Client Component**)
- `experimental.instantNavigationDevToolsToggle` → DevTools tab **Instant Navs**
- Doc: `01-app/02-guides/instant-navigation.md`, `01-app/02-guides/prefetching.md`, `01-app/02-guides/preserving-ui-state.md`

**Trap hay sai**

- ❌ "Có Suspense là nav instant". Không.
- ❌ Test prefetch ở dev rồi kết luận Next.js không prefetch.
- ❌ Giả định component unmount khi navigate away → cleanup logic viết sai (dropdown/dialog mở lại vẫn còn trạng thái cũ). Đọc `preserving-ui-state.md`.
- ❌ Dùng `router.push` cho mọi navigation thay vì `<Link>` → mất prefetch.

**Build để chứng minh**

App 4 route với shared layout, trong đó `/products/[slug]` có phần cached (`ProductInfo`) và phần live (`Inventory`).

- Export `unstable_instant = { prefetch: 'static' }`, cố tình đặt `<Suspense>` **sai chỗ** (bọc quá rộng) → chạy dev, đọc error overlay, sửa theo gợi ý.
- Bật `instantNavigationDevToolsToggle`, mở DevTools → **Instant Navs** → xem UI prefetch thực tế của route.
- Build + start, mở Network, filter theo request có header `rsc: 1`.
- Nhập text vào một input ở route A → navigate sang B → back lại A: text còn không? Giải thích bằng `<Activity>`.

**Tự test**

1. Vì sao page dynamic không được prefetch, và `loading.js` thay đổi điều đó thế nào?
2. `unstable_instant` chạy ở runtime hay chỉ là công cụ validate?
3. State của form còn nguyên khi back — cơ chế nào? Effect có chạy lại?
4. Khi nào nên chủ động `prefetch={false}`?

---

## 7. Proxy + Route Handlers vs Server Actions (BFF)

**Phải nắm**

- **Từ Next.js 16, Middleware được đổi tên thành Proxy** (`proxy.ts`). Chức năng giữ nguyên — đổi tên để phản ánh đúng mục đích.
- Proxy dùng cho: sửa header cho nhiều page, rewrite theo A/B test, redirect theo thuộc tính request.
- Doc nói rõ: Proxy **không dành cho fetch data chậm**, và **không phải giải pháp session management / authorization đầy đủ** — chỉ nên làm **optimistic check** (ví dụ chưa có cookie → redirect ra login).
- Redirect đơn giản → dùng config `redirects` trong `next.config.ts` **trước**, đừng viết Proxy.
- **Route Handler** (`route.ts`): built trên Web `Request`/`Response`, có `NextRequest`/`NextResponse` mở rộng. Hỗ trợ `GET POST PUT PATCH DELETE HEAD OPTIONS`; method khác → 405. **Không** đặt cùng segment với `page.tsx`.
- Chọn cái nào:
  - **Server Action** — mutation phát ra từ chính UI của bạn (form, button). Không cần tự viết endpoint, không cần tự fetch.
  - **Route Handler** — webhook, public API, client không phải browser của bạn, cần control response/header/status, hoặc cần method HTTP cụ thể.

**API / file convention**

- `proxy.ts` (root hoặc `src/`), `config.matcher`
- `route.ts`, `NextRequest`, `NextResponse`
- `after()` từ `next/server` — chạy việc sau khi response đã gửi (logging, analytics). **Không phải Request-time API** → gọi nó **không** làm route thành dynamic; trong static page callback chạy ở build time hoặc lúc revalidate.
- Doc: `01-app/01-getting-started/16-proxy.md`, `01-app/01-getting-started/15-route-handlers.md`, `01-app/02-guides/backend-for-frontend.md`

**Trap hay sai**

- ❌ Gọi tên "middleware" và viết `middleware.ts` ở v16. Nói "Proxy" khi phỏng vấn — đây là dấu hiệu bạn đọc doc mới.
- ❌ Query DB / verify session đầy đủ trong Proxy.
- ❌ Nghĩ App Router vẫn cần `pages/api`. Không — Route Handlers thay thế hoàn toàn, và **không dùng lẫn**.
- ❌ Viết Route Handler chỉ để form của chính mình gọi tới, trong khi Server Action gọn hơn.

**Build để chứng minh**

1. `proxy.ts`: thêm header `x-request-id`, và rewrite `/` sang `/home-b` nếu cookie `ab=b`.
2. Route Handler `POST /api/webhook`: verify signature từ header, rồi `revalidateTag('posts','max')`.
3. Cùng một hành động "tạo post": làm **cả hai** — một Server Action và một `POST /api/posts` — rồi viết 3 dòng so sánh: code nào ngắn hơn, cái nào cần tự lo CSRF/validate/serialize.
4. Thêm `after(() => log(...))` vào một page static → build → xác nhận callback chạy ở build time chứ không mỗi request.

**Tự test**

1. Vì sao doc khuyên **không** làm authorization thật trong Proxy?
2. Proxy set cookie được không? Đọc được body request không?
3. Với `cacheComponents`, `GET` route handler có được prerender? Điều gì làm nó thành dynamic?
4. Webhook từ Stripe nên là Server Action hay Route Handler — vì sao?

---

## 8. Mutations & forms — Server Functions

**Phải nắm**

- **Server Function** (`'use server'`): khai báo ở đầu file (mọi export thành server function) hoặc inline trong Server Component. Client Component **chỉ** import được từ file có `'use server'`.
- Gọi được từ: `<form action={...}>`, event handler, `useEffect`, và truyền được **như prop** xuống Client Component.
- **Expected error thì return, đừng throw.** Validation lỗi, request fail → model thành **giá trị trả về**, đọc bằng `useActionState`. Tránh `try/catch` + throw cho loại lỗi này.
- `useActionState` cho state + pending; `useFormStatus` cho pending của form cha (phải nằm **trong** `<form>`, ở component con); `useOptimistic` cho optimistic UI + rollback tự động khi action fail.
- Sau mutation: `revalidateTag`/`updateTag` để cập nhật cache, `redirect()` để chuyển trang, `refresh()` khi chỉ cần refresh router.
- **Server Action là một endpoint public.** Next tạo endpoint cho nó — nên **mọi authz check phải nằm bên trong action**, không dựa vào việc "UI đã ẩn nút".

**API / file convention**

- `'use server'`, `useActionState`, `useFormStatus`, `useOptimistic` (React 19)
- `redirect()`, `permanentRedirect()`, `cookies()`, `revalidateTag`, `updateTag`, `refresh`
- `zod` cho validate (đã có trong project)
- Doc: `01-app/01-getting-started/07-mutating-data.md`, `01-app/02-guides/forms.md`

**Trap hay sai**

- ❌ Dùng `useFormState` (tên cũ) thay vì `useActionState`.
- ❌ `throw new Error('Email đã tồn tại')` cho lỗi validate → user thấy error page thay vì message dưới input.
- ❌ Đặt `useFormStatus` trong cùng component chứa `<form>` → luôn `false`. Phải ở component con bên trong form.
- ❌ Tin rằng chỉ UI của mình gọi được action → bỏ authz check.

**Build để chứng minh**

Form tạo post 2 bước, có: `useActionState` hiển thị lỗi từng field (validate bằng Zod), submit button riêng dùng `useFormStatus`, list post cập nhật bằng `useOptimistic`, và `redirect()` sau khi thành công.

- Cố tình làm action fail → xác nhận optimistic item **tự rollback**.
- Viết một action `deletePost(id)` **không** check quyền, rồi tự gọi nó bằng `fetch` từ console với id của người khác → tự chứng minh vì sao action là public endpoint. Sau đó thêm authz và thử lại.

**Tự test**

1. Server Action có phải public endpoint? Hệ quả về bảo mật là gì?
2. `useActionState` pending khác `useFormStatus` pending ở chỗ nào?
3. Vì sao expected error nên return chứ không throw?
4. `useOptimistic` rollback dựa trên cái gì?
5. Sau khi tạo post, dùng `updateTag` hay `revalidateTag(...,'max')`? Vì sao?

---

## 9. Error handling

**Phải nắm**

- Chia 2 loại: **expected error** (validate, request fail → model thành return value, xem topic 8) và **uncaught exception** (→ error boundary).
- `error.tsx` bọc một route segment **và các con của nó** trong React Error Boundary. Nó nhận props `{ error, unstable_retry }`:
  - `error.digest` — hash để **đối chiếu với log server**
  - **`unstable_retry()`** — re-fetch và re-render children của boundary, **kể cả Server Components**
- **`unstable_catchError`** — bản programmatic của `error.tsx`, tạo component bọc children trong error boundary, **gọi được từ Client Component**, đặt được **bất kỳ đâu** trong cây. Ưu điểm so với error boundary tự viết:
  - có sẵn recovery qua `unstable_retry()`
  - **không nuốt** các framework error: `redirect()` và `notFound()` hoạt động bằng cách **throw error đặc biệt**, `unstable_catchError` xử lý đúng
  - tự clear error state khi client-navigate sang route khác
- `notFound()` → `not-found.tsx`. `forbidden()` → 403 + `forbidden.tsx`. `unauthorized()` → 401 + `unauthorized.tsx`.
- `unstable_rethrow()` — dùng trong `try/catch` để **throw lại** framework error thay vì nuốt nó.

**API / file convention**

- `error.tsx`, `global-error.tsx`, `not-found.tsx`, `forbidden.tsx`, `unauthorized.tsx`
- `notFound()`, `forbidden()`, `unauthorized()`, `unstable_rethrow()` từ **`next/navigation`**
- `unstable_catchError` (kèm type `ErrorInfo`) từ **`next/error`** — không phải `next/navigation`
- **`forbidden()` và `unauthorized()` cần bật `experimental.authInterrupts: true`** trong `next.config.ts` (cả hai đang ở trạng thái experimental)
- Doc: `01-app/01-getting-started/10-error-handling.md`, `01-app/03-api-reference/03-file-conventions/error.md`, `01-app/03-api-reference/04-functions/catchError.md`

**Trap hay sai**

- ❌ **Bọc `redirect()` trong `try/catch`** → redirect "không chạy" vì error bị catch nuốt. Fix: gọi ngoài try/catch, hoặc `unstable_rethrow` trong catch.
- ❌ Tưởng `error.tsx` bắt được lỗi của **layout cùng cấp** — không; cần `error.tsx` ở segment cha (hoặc `global-error.tsx` cho root layout).
- ❌ Dùng `reset()` (API cũ) — ở v16 prop là `unstable_retry`.
- ❌ Gọi `forbidden()` mà chưa bật `authInterrupts` → lỗi.

**Build để chứng minh**

Route `/reports` cố tình throw 30% số lần:

1. `error.tsx` với nút "Thử lại" gọi `unstable_retry()` → xác nhận **Server Component được fetch lại**, không phải chỉ re-render client.
2. Một widget bọc bằng `unstable_catchError` → chỉ widget đó hỏng, phần còn lại của page vẫn sống.
3. Bật `experimental.authInterrupts`, thêm route gọi `forbidden()` + `forbidden.tsx`.
4. Viết một action có `try { redirect('/x') } catch(e) { return {error:'fail'} }` → quan sát bug, rồi fix bằng `unstable_rethrow`.

**Tự test**

1. Vì sao `redirect()` trong `try/catch` lại không hoạt động?
2. `unstable_retry()` làm gì khác với `location.reload()`?
3. `error.digest` để làm gì trong production?
4. Khi nào dùng `unstable_catchError` thay vì `error.tsx`?
5. Lỗi trong root layout thì file nào bắt?

---

## 10. Auth & data security

**Phải nắm**

- Doc đề xuất **3 cách fetch data — chọn 1, không mix** (để dev và security auditor biết chính xác phải kỳ vọng gì):
  1. **External HTTP APIs** — project lớn/cũ, đã có backend riêng. Theo mô hình **Zero Trust**: Server Component gọi API như client vẫn gọi, kèm token.
  2. **Data Access Layer (DAL)** — **khuyến nghị cho project mới**.
  3. **Component-level data access** — chỉ cho prototype và học.
- **DAL phải**: (a) chỉ chạy ở server, (b) **tự thực hiện authorization check**, (c) trả về **DTO an toàn, tối thiểu** — không trả nguyên record DB.
- Dùng React `cache()` để share kết quả `verifySession()` trong cùng một request (in-memory cache theo request).
- **Authorization thật nằm ở data layer, không nằm ở Proxy.** Proxy chỉ làm optimistic check.
- **Taint** là lớp **bảo vệ thêm**, không thay thế việc filter/sanitize trong DAL: `experimental_taintObjectReference` (cho object), `experimental_taintUniqueValue` (cho giá trị cụ thể), bật bằng `experimental.taint: true`.
- Env: mặc định env var **chỉ có ở server**; chỉ biến prefix `NEXT_PUBLIC_` được expose ra client. Function và class **đã bị block sẵn** khỏi việc truyền xuống Client Component.
- CSP + nonce cho script; `server-only` để chặn code server bị bundle vào client.

**API / file convention**

- `cache()` (React), `cookies()`, `headers()`
- `experimental.taint`, `experimental_taintObjectReference`, `experimental_taintUniqueValue`
- Package `server-only`
- Doc: `01-app/02-guides/data-security.md`, `01-app/02-guides/authentication.md`, `01-app/02-guides/content-security-policy.md`, `01-app/02-guides/environment-variables.md`

**Trap hay sai**

- ❌ Check quyền một lần ở Proxy rồi coi như xong.
- ❌ Trả nguyên `user` từ DB xuống Client Component (kèm `passwordHash`, `role`, `internalNotes`) vì "component chỉ render `user.name`". RSC payload **gửi cả object** xuống browser.
- ❌ Nghĩ `NEXT_PUBLIC_` chỉ là quy ước đặt tên cho đẹp.
- ❌ Coi taint là cơ chế authz.

**Build để chứng minh**

Một DAL nhỏ: `verifySession()` (bọc `cache()`), `getCurrentUser()` trả **DTO** `{ id, name, avatarUrl }`, và `getAdminStats()` tự check role rồi `forbidden()` nếu không đủ quyền.

- Cố tình truyền nguyên `dbUser` xuống một Client Component, mở Network → tìm RSC payload → **tự đọc thấy field bí mật của mình trong response**. Đây là bài học đáng giá nhất của topic này.
- Bật `experimental.taint` + `taintObjectReference` trên object user → xác nhận Next chặn.
- Thêm một biến `SECRET_KEY` và một `NEXT_PUBLIC_SECRET` → grep trong `.next/static` xem cái nào xuất hiện.

**Tự test**

1. Vì sao Proxy không đủ để authorize? Nó *nên* làm gì?
2. DTO là gì, và vì sao DAL phải trả DTO chứ không trả entity?
3. `cache()` của React khác `'use cache'` của Next ở chỗ nào?
4. Taint có thay được authz check không? Vì sao doc nhấn mạnh điều đó?
5. Bạn kiểm tra một secret có bị leak ra client bằng cách nào?

---

## 11. Performance

**Phải nắm**

- `next/image`: local import (tự biết width/height) vs remote (`remotePatterns` + tự khai báo size); `fill` + `sizes` cho layout responsive; `priority` cho ảnh LCP.
- `next/font`: **self-host font** (không request sang Google ở runtime), **loại bỏ layout shift**; hỗ trợ Google fonts và local font.
- `next/dynamic` = tổ hợp của `React.lazy()` + `Suspense`. **`ssr: false` chỉ dùng được trong Client Component** — đặt trong Server Component sẽ lỗi.
- Code splitting theo route là **tự động**; `next/dynamic` để tách thêm những lib nặng ít dùng.
- `useReportWebVitals` để đo CWV thật từ user.
- Trên page có streaming, **LCP thường nằm trong static shell** — nên việc gì vào shell / việc gì stream là quyết định performance, không chỉ là quyết định kiến trúc.

**API / file convention**

- `next/image`, `next/font/google`, `next/font/local`, `next/dynamic`, `next/script`
- `useReportWebVitals`
- `@next/bundle-analyzer`; config `serverExternalPackages`, `optimizePackageImports`
- Doc: `01-app/01-getting-started/12-images.md`, `13-fonts.md`, `01-app/02-guides/lazy-loading.md`, `package-bundling.md`, `production-checklist.md`

**Trap hay sai**

- ❌ Dùng `next/dynamic` với `ssr: false` trong Server Component.
- ❌ Đặt `priority` cho mọi ảnh → mất tác dụng.
- ❌ `<img>` thẳng cho ảnh trên màn hình đầu rồi thắc mắc CLS/LCP xấu.
- ❌ Tối ưu bằng cảm giác, không đo. Chưa mở bundle analyzer thì chưa gọi là tối ưu.

**Build để chứng minh**

Một trang landing có: hero image, một bảng dữ liệu, và một chart dùng lib nặng.

- Đo baseline: `pnpm build` (First Load JS) + Lighthouse.
- Lần lượt: đổi `<img>` → `next/image` + `priority`; đổi Google Fonts `<link>` → `next/font`; `next/dynamic` cho chart.
- Ghi lại **con số trước/sau từng bước** (First Load JS, LCP, CLS). Mục tiêu là có bảng số liệu để nói trong phỏng vấn, không phải "em thấy nhanh hơn".
- Thêm `useReportWebVitals` log ra console.

**Tự test**

1. `next/font` loại bỏ layout shift bằng cách nào?
2. Trên page có streaming, cái gì quyết định LCP?
3. Vì sao `ssr: false` không hợp lệ trong Server Component?
4. Khi nào `next/dynamic` **làm chậm** thay vì nhanh hơn?
5. Bạn tìm ra module nào đang phình bundle bằng cách nào?

---

## Phụ lục — Bảng trap nhanh (Next 13/14 → 16)

| Kiến thức cũ | Đúng ở v16 |
|---|---|
| `fetch` cached by default, opt out bằng `cache:'no-store'` | Default **dynamic**, opt in bằng `'use cache'` |
| `getStaticProps` / `getServerSideProps` | Không tồn tại. ISR = `'use cache'` + `cacheLife` |
| `export const revalidate = 60` | Dùng `cacheLife()` (model Cache Components) |
| `middleware.ts` | **`proxy.ts`** — đổi tên từ v16 |
| `revalidateTag(tag)` | `revalidateTag(tag, 'max')` hoặc `updateTag(tag)`; 1 tham số đã **deprecated** |
| `error.tsx` nhận `reset()` | Nhận **`unstable_retry()`** |
| `useFormState` | `useActionState` |
| `pages/api` | Route Handlers (`route.ts`) |
| 3 flag riêng: `ppr`, `useCache`, `dynamicIO` | Một flag: **`cacheComponents: true`** |
| RSC = SSR | Khác nhau. Client Component **vẫn** được SSR lần đầu |
| Navigate away = component unmount | Với `cacheComponents`, React `<Activity>` giữ state (mode `hidden`) |

## Phụ lục — Đối chiếu với lab đã có trong repo này

| Topic | Lab hiện có | Trạng thái |
|---|---|---|
| 1. Rendering model | `lab/rsc/05-streaming` | Có streaming, **thiếu** static shell / `unstable_instant` |
| 2. Server vs Client | `lab/rsc/01-06` | Khá đầy đủ |
| 3. Cache Components | `lab/caching/01-06` | Đầy đủ, **thiếu** `private` / `remote` |
| 4. Revalidation | `lab/caching/03-on-demand`, `04-update-tag` | Có, **thiếu** multi-instance / soft tags |
| 5. Routing | `lab/routing/01-05` | Khá đầy đủ |
| 6. Navigation | `lab/performance/05-prefetch` | **Thiếu** `unstable_instant`, Activity |
| 7. Proxy / Route Handlers | `lab/routing/04-handlers`, `05-proxy` | Có |
| 8. Mutations & forms | `lab/forms/01-06` | Đầy đủ |
| 9. Error handling | — | **Chưa có** |
| 10. Auth & security | `lab/auth-rbac/01-04` | Có, **thiếu** taint / CSP |
| 11. Performance | `lab/performance/01-06` | Đầy đủ |

Ưu tiên build project mới cho: **9 → 1 → 6 → 4** (phần multi-instance) → **10** (phần taint).
