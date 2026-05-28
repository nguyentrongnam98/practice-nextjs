# Next.js Mid-Senior Interview Prep — Design

**Date:** 2026-05-28
**Status:** Approved (pending implementation plan)
**Owner:** Sam (hunglk@techvify.com.vn)
**Stack:** Next.js 16.2.3, React 19.2.4, Tailwind v4, TypeScript, Vitest, Playwright (new)
**Purpose:** Lộ trình ôn phỏng vấn Next.js level mid-senior thông qua bài tập thực hành, kéo dài 7-8 tuần.

## Goal

Trong 7-8 tuần, fill các gap kiến thức mid-senior Next.js qua bài tập thực hành cụ thể, kết thúc bằng khả năng:
- Tự tin trả lời ~190 câu hỏi PV mid-senior (lý thuyết + deep dive)
- Có 1 feature "Article Platform" production-grade làm portfolio
- Hiểu và viết được CI/CD pipeline cơ bản trên GitHub Actions
- Trình bày được system design cho Next.js app (folder, auth, caching, scaling)

## Non-Goals

- Học từ con số 0 — plan này giả định đã nắm cơ bản (đã có RSC lab, caching lab, parallel routes lab)
- Cover toàn bộ Next.js — chỉ tập trung gap mid-senior
- Triển khai production thật lên domain — chỉ cần chạy local + CI xanh
- Cover các framework khác (Remix, Astro) hay so sánh chi tiết

## Current State (đã có)

- `/lab/rsc/` — 7 exercise về Server/Client Components
- `/lab/caching/` — 6 exercise về Cache Components (Next.js 16)
- `/lab/parallel-routes/` — parallel + intercepting routes cơ bản
- `features/auth/` — login form, role, server action `setRole`
- `features/dashboard/` — mock dashboard với parallel routes
- Vitest setup + một số unit test
- Branch `test-CI` với pinned actions

## Approach

**Hybrid: Foundation Labs → Capstone → Interview Drill.**

3 phase nối tiếp nhau, mỗi phase có deliverable riêng. Tất cả nằm trong project `practice-nextjs` hiện tại. Lab mới theo pattern `/lab/<topic>` đã chứng minh hiệu quả ở RSC/caching lab. Mỗi exercise có:
- Code demo chạy được
- Concept box giải thích trong page (Vietnamese OK)
- 5-10 interview Q&A cuối page

## Timeline Overview

| Phase | Tuần | Nội dung | Output |
|---|---|---|---|
| **1. Foundation Labs** | 1-3 | 6 lab mới fill gap mid-senior | 6 route `/lab/*` + ~200 Q&A |
| **2. Capstone** | 4-6 | Mini "Article Platform" | Feature `articles/` hoàn chỉnh |
| **3. Interview Drill** | 7-8 | System design + CI/CD + Q&A bank | Docs + workflow + ~190 Q&A bank |

---

## Phase 1: Foundation Labs (tuần 1-3)

6 lab mới, mỗi lab 4-7 exercise nhỏ. Tổng ~30 exercise, mỗi exercise có 5-8 Q&A.

### Lab 1 — `/lab/forms` (Forms + Server Actions deep)

| # | Exercise | Concept |
|---|---|---|
| 01 | Basic useActionState | Trạng thái form + error từ Server Action |
| 02 | useFormStatus | Pending UI trong submit button |
| 03 | Optimistic updates | `useOptimistic` cho UI mượt |
| 04 | Validation với Zod | Server-side validation + field errors |
| 05 | File upload | FormData multipart, progress |
| 06 | Multi-step form | State giữa các step, server-driven |

### Lab 2 — `/lab/routing` (Routing nâng cao)

| # | Exercise | Concept |
|---|---|---|
| 01 | Intercepting routes | Modal pattern (`(.)`, `(..)`, `(...)`) |
| 02 | Route Groups & layouts | Multi-layout, shared layout per group |
| 03 | Dynamic segments & catch-all | `[...slug]`, `[[...slug]]`, `generateStaticParams` |
| 04 | Route Handlers (API) | GET/POST/streaming response, NextRequest |
| 05 | Middleware | Auth guard, i18n redirect, A/B testing |

### Lab 3 — `/lab/performance` (Performance & Optimization)

| # | Exercise | Concept |
|---|---|---|
| 01 | next/image | sizes, priority, blur placeholder, LCP optimization |
| 02 | next/font | self-host, subset, variable fonts, no layout shift |
| 03 | Bundle analysis | `@next/bundle-analyzer`, treeshaking, dynamic import |
| 04 | Lazy loading | `next/dynamic`, ssr:false, intersection observer |
| 05 | Prefetching | Link prefetch strategies, programmatic prefetch |
| 06 | Web Vitals | `useReportWebVitals`, LCP/CLS/FID monitoring |

### Lab 4 — `/lab/auth-rbac` (Auth & Authorization Patterns)

| # | Exercise | Concept |
|---|---|---|
| 01 | Session management | Cookie + JWT, secure flags |
| 02 | Route protection | Middleware vs layout vs page guard |
| 03 | RBAC | Role-based UI hiding + server check |
| 04 | Data Access Layer (DAL) | `auth()` helper, dùng trong RSC vs Action |

### Lab 5 — `/lab/seo-meta` (SEO & Metadata)

| # | Exercise | Concept |
|---|---|---|
| 01 | Metadata API | Static + `generateMetadata` |
| 02 | OpenGraph Image | `opengraph-image.tsx` dynamic OG |
| 03 | Sitemap & robots | `sitemap.ts`, `robots.ts` |
| 04 | Structured data | JSON-LD cho SEO |

### Lab 6 — `/lab/testing` (Testing Strategy)

| # | Exercise | Concept |
|---|---|---|
| 01 | Server Action testing | Mock `cookies`, `revalidateTag` |
| 02 | Component testing | Async Server Component testing |
| 03 | MSW integration | Mock API ở mức network |
| 04 | Playwright E2E | Login flow, navigation, screenshot |

### Phase 1 File Structure

```
src/app/lab/
├── forms/
│   ├── page.tsx              ← index
│   ├── 01-action-state/
│   ├── 02-form-status/
│   ├── ... (6 exercise)
├── routing/
├── performance/
├── auth-rbac/
├── seo-meta/
└── testing/
```

Reuse `ExerciseLayout` đã có từ RSC lab (`src/app/lab/rsc/_components/ExerciseLayout.tsx`).

### Phase 1 Output

- 30 exercise chạy được
- ~200 interview Q&A (sẽ tổng hợp vào qa-bank ở Phase 3)
- Index page `/lab` tổng hợp tất cả lab

---

## Phase 2: Capstone "Article Platform" (tuần 4-6)

Mini blog/CMS có 2 actor: **author** (viết bài) và **reader** (xem bài). Đủ phức tạp để demo mid-senior patterns mà không phình to.

### User Stories

| ID | Story | Concept luyện |
|---|---|---|
| US-01 | Reader xem list articles có pagination + search | RSC + Suspense + URL state + caching |
| US-02 | Reader xem chi tiết article (SEO friendly) | Static generation + generateMetadata + OG image |
| US-03 | Author đăng nhập, vào dashboard | Auth guard + middleware + DAL |
| US-04 | Author tạo/sửa article có upload ảnh cover | Server Action + FormData + Zod + revalidateTag |
| US-05 | Author thấy preview trước khi publish | Intercepting routes + parallel routes (modal) |
| US-06 | Reader xem comment count cập nhật realtime nhẹ | Optimistic update + revalidate |
| US-07 | Admin có report analytics đơn giản | RBAC + chart Client Component + cached data |

### Architecture

```
src/features/articles/
├── types.ts                  ← Article, Comment, Author types
├── schemas/                  ← Zod schemas (create, update, comment)
├── services/                 ← data access layer
├── actions/                  ← Server Actions (create, update, delete, comment)
├── helpers/                  ← business logic pure functions
└── components/               ← shared (ArticleCard, Editor, CoverUpload...)

src/app/articles/             ← public reader routes
│   ├── page.tsx              ← list (US-01)
│   ├── [slug]/page.tsx       ← detail (US-02)
│   └── [slug]/opengraph-image.tsx
src/app/(admin)/admin/articles/  ← protected admin (US-03, 04, 05)
│   ├── page.tsx              ← list
│   ├── new/page.tsx          ← create form
│   ├── [id]/edit/page.tsx    ← edit
│   ├── @modal/(.)preview/[id]/page.tsx  ← intercepted preview
│   └── analytics/page.tsx    ← US-07
```

### Tech Choices

- **Data:** SQLite via `better-sqlite3` — đủ thật để luyện caching/revalidation, không cần external service
- **Upload:** lưu vào `public/uploads/` — đơn giản, đủ luyện FormData multipart
- **Auth:** mở rộng `features/auth/` hiện có (cookie session), không thêm NextAuth
- **State:** chỉ dùng RSC + URL search params, không cần Zustand/Jotai
- **Editor:** textarea + markdown render (không cần WYSIWYG cho lab)

### Deliverable Phase 2

- 7 user story chạy được end-to-end
- README riêng cho feature giải thích design decisions
- `docs/superpowers/specs/articles-architecture.md` ghi lại các quyết định kiến trúc (chuẩn bị trả lời "tại sao bạn chọn X?")
- Test coverage cho actions + services bằng Vitest

---

## Phase 3: Interview Drill (tuần 7-8)

### 3.1 — System Design Drills (~3-4 ngày)

7 file trong `docs/interview-prep/system-design/`, mỗi file 1-2 trang, không code, có diagram (ASCII hoặc Excalidraw):

| # | Topic | Câu hỏi đại diện |
|---|---|---|
| 01 | Folder/architecture của Next.js app | "Sao chia features/ vs app/?" |
| 02 | Auth & session strategy | "Cookie vs JWT? Middleware vs DAL?" |
| 03 | Caching strategy | "Khi nào dùng `use cache`, khi nào fresh?" |
| 04 | SSR vs SSG vs ISR vs PPR | "Page nào nên dùng gì, tại sao?" |
| 05 | Data fetching patterns | "Server vs Client fetch, request memoization" |
| 06 | Scaling: monorepo + multi-tenant | "Nếu app to lên thì refactor thế nào?" |
| 07 | Observability & error handling | "Bắt lỗi ở đâu? Log gì? Monitor ra sao?" |

Mỗi file dùng chính capstone để minh hoạ.

### 3.2 — CI/CD Setup (~2-3 ngày)

Tận dụng branch `test-CI` đã có. Thêm trong `.github/workflows/`:

| File | Job |
|---|---|
| `ci.yml` | Lint + typecheck + test on PR (đã có chút khởi đầu) |
| `e2e.yml` | Playwright trên PR (matrix Node 20/22) |
| `preview.yml` | Deploy preview (optional, có thể skip nếu không có Vercel) |

`docs/interview-prep/ci-cd-notes.md` ghi lại lý do từng quyết định:
- Pin actions bằng SHA (đã làm, ghi lại why)
- Cache pnpm/Node
- Permissions tối thiểu
- `concurrency` group cho cancel duplicate runs

### 3.3 — Mock Interview Q&A Bank (~2 ngày)

Tổng hợp tất cả Q&A từ Phase 1 + Phase 2 vào `docs/interview-prep/qa-bank.md`, chia category:

| Category | Số câu (ước) |
|---|---|
| Rendering & RSC | ~40 |
| Caching | ~25 |
| Routing & Middleware | ~20 |
| Forms & Server Actions | ~20 |
| Performance | ~25 |
| Auth & Security | ~15 |
| SEO | ~10 |
| Testing | ~10 |
| System Design | ~15 |
| CI/CD | ~10 |
| **Total** | **~190** |

Mỗi câu có:
- Câu trả lời ngắn (1-2 câu) — đủ pass screening
- Mở rộng (deep dive) — đủ ấn tượng PV cao cấp
- Link đến lab/file trong project minh hoạ

---

## Final Deliverables (cuối tuần 8)

```
src/app/lab/                   ← 6 lab mới (Phase 1) + 3 lab cũ
src/features/articles/         ← capstone (Phase 2)
src/app/articles/              ← reader routes
src/app/(admin)/admin/articles/← author routes

docs/interview-prep/
├── system-design/
│   ├── 01-folder-architecture.md
│   ├── 02-auth-strategy.md
│   ├── ... (7 file)
├── ci-cd-notes.md
└── qa-bank.md                 ← ~190 Q&A

.github/workflows/
├── ci.yml
├── e2e.yml
└── (preview.yml — optional)
```

## Success Criteria

Có thể tự đánh giá đạt mid-senior khi:
1. Trả lời được 80%+ câu trong qa-bank không nhìn tài liệu
2. Demo được capstone end-to-end trong 10 phút, giải thích được mọi quyết định
3. Vẽ được architecture diagram trên giấy/whiteboard trong 5 phút cho 1 trong 7 system design topic
4. CI pipeline trên branch `test-CI` chạy xanh, hiểu được mỗi step làm gì

## Implementation Order

Implementation plan chi tiết sẽ được tạo riêng bằng `writing-plans` skill, chia thành:

1. **Plan 1 — Phase 1 Labs** (1 plan tổng, 6 sub-plan cho 6 lab)
2. **Plan 2 — Phase 2 Capstone** (1 plan với 7 user story)
3. **Plan 3 — Phase 3 Drill** (1 plan cho system design + CI + qa-bank)

Mỗi plan có thể implement độc lập sau khi plan trước hoàn thành.
