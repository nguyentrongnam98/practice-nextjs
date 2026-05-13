# Hướng dẫn CI/CD: Next.js → AWS qua GitHub Actions

> Lộ trình end-to-end deploy 1 dự án Next.js 16 lên AWS EC2 dùng GitHub Actions, ECR, Docker.
> Phù hợp cho người mới bắt đầu CI/CD.

---

## Mục lục

1. [Tổng quan kiến trúc](#1-tổng-quan-kiến-trúc)
2. [Yêu cầu trước khi bắt đầu](#2-yêu-cầu-trước-khi-bắt-đầu)
3. [Buổi 1 — Hiểu khái niệm CI/CD](#buổi-1--hiểu-khái-niệm-cicd)
4. [Buổi 2 — Dockerize Next.js](#buổi-2--dockerize-nextjs)
5. [Buổi 3 — GitHub Actions CI](#buổi-3--github-actions-ci)
6. [Buổi 4 — AWS Infrastructure](#buổi-4--aws-infrastructure)
7. [Buổi 5 — Auto Deploy](#buổi-5--auto-deploy)
8. [Troubleshooting](#troubleshooting)
9. [Nâng cấp lên production](#nâng-cấp-lên-production)

---

## 1. Tổng quan kiến trúc

```
┌──────────────┐   git push    ┌─────────────────────┐
│  Your laptop │ ────────────> │  GitHub repo        │
└──────────────┘               └──────────┬──────────┘
                                          │ trigger
                                          ▼
                          ┌───────────────────────────┐
                          │  GitHub Actions runner    │
                          │  1. lint + test           │  ← CI
                          │  2. docker build          │
                          │  3. push image → ECR      │  ← CD bước 1
                          │  4. SSH vào EC2           │
                          │  5. docker pull + restart │  ← CD bước 2
                          └───────────┬───────────────┘
                                      │
                   ┌──────────────────┴──────────────────┐
                   ▼                                     ▼
          ┌────────────────┐                   ┌──────────────────┐
          │  AWS ECR       │                   │  AWS EC2         │
          │  (Docker       │ ←── pull image ── │  t3.micro        │
          │   registry)    │                   │  chạy container  │
          └────────────────┘                   │  :3000           │
                                               └────────┬─────────┘
                                                        │
                                                        ▼
                                               http://<EC2-IP>:3000
```

### Định nghĩa nhanh

| Thuật ngữ | Ý nghĩa |
|-----------|---------|
| **CI** | Continuous Integration — auto build/test mỗi commit |
| **CD** | Continuous Deployment — auto deploy code đã pass test |
| **Docker image** | "Đóng hộp" app + runtime → chạy được ở bất cứ đâu |
| **ECR** | AWS Elastic Container Registry — kho riêng tư cho Docker image |
| **EC2** | AWS Elastic Compute Cloud — máy ảo Linux |
| **IAM** | AWS Identity and Access Management — phân quyền |
| **Security Group** | Firewall stateful cho EC2 |
| **GitHub Actions** | CI/CD platform của GitHub, chạy workflow YAML |

---

## 2. Yêu cầu trước khi bắt đầu

- ✅ Tài khoản GitHub
- ✅ Tài khoản AWS (Free Tier 12 tháng đầu)
- ✅ Cài đặt local: Node.js ≥ 20.9, pnpm, Docker Desktop, Git
- ✅ Project Next.js 16 đã có code chạy được (`pnpm dev`)
- ✅ AWS CLI v2 (sẽ cài ở Buổi 4)

---

## Buổi 1 — Hiểu khái niệm CI/CD

### CI vs CD

- **CI** = verify code chạy được (lint, test, build).
- **Continuous Delivery** = artifact sẵn sàng deploy (push image lên registry).
- **Continuous Deployment** = tự động deploy không cần người bấm nút.

Workflow trong dự án này:

```
push lên main
  → CI (ci.yml): lint + test + build
  → CD (deploy.yml): build Docker → push ECR → SSH EC2 → restart container
```

### Lựa chọn dịch vụ AWS

| Dịch vụ | Free tier? | Học được gì? | Kết luận |
|---------|-----------|--------------|----------|
| App Runner | ❌ ~$25/tháng | Ít | Loại |
| Amplify | ✅ Có | Rất ít (PaaS) | Loại — không học được |
| Lambda (serverless) | ✅ Rộng | Phức tạp với App Router | Loại — newbie |
| **EC2 t3.micro + Docker + ECR** | ✅ 750h/tháng + 500MB image | **Rất nhiều** | ✅ **CHỌN** |

---

## Buổi 2 — Dockerize Next.js

### Khái niệm cần nắm

#### Multi-stage build

Tách image build (cần dev deps, ~1.5GB) khỏi image runtime (~150MB):

```
Stage 1 (deps)    — cài node_modules (bỏ sau)
Stage 2 (builder) — chạy next build (bỏ sau)
Stage 3 (runner)  — chỉ copy file output  ← image final
```

#### Next.js `output: 'standalone'`

Bật chế độ này trong `next.config.ts` để Next.js trace **chỉ những file cần thiết** vào `.next/standalone/` (kèm `server.js` minimal). Không bật → image to gấp 5 lần.

#### `.dockerignore`

Loại file thừa khỏi build context: `node_modules` local, `.next`, `.git`, `.env*.local`, etc.

### File cần tạo

#### `next.config.ts`

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  output: "standalone",
};

export default nextConfig;
```

#### `.dockerignore`

```
node_modules
.next
.git
.gitignore
.env*.local
.vscode
.idea
Dockerfile
.dockerignore
README.md
npm-debug.log
.DS_Store
coverage
.vitest
```

#### `Dockerfile`

```dockerfile
# syntax=docker/dockerfile:1.7

# ---------- Stage 1: deps ----------
FROM node:20-alpine AS deps
WORKDIR /app

RUN npm install -g corepack@latest && corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN corepack prepare pnpm@10.15.0 --activate \
 && pnpm install --frozen-lockfile

# ---------- Stage 2: builder ----------
FROM node:20-alpine AS builder
WORKDIR /app

RUN npm install -g corepack@latest && corepack enable
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
RUN corepack prepare pnpm@10.15.0 --activate \
 && pnpm run build

# ---------- Stage 3: runner ----------
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
```

### Test local

```bash
# Build
docker build -t practice-nextjs .

# Verify image
docker images practice-nextjs   # phải ~150-250 MB

# Run (port 3000 host → 3000 container)
docker run --rm -p 3000:3000 practice-nextjs
```

→ Mở http://localhost:3000 → thấy app.

### Đổi port host (ví dụ 3008)

```bash
docker run --rm -p 3008:3000 practice-nextjs
```

`-p HOST:CONTAINER` chỉ map port, **không cần sửa Dockerfile**.

---

## Buổi 3 — GitHub Actions CI

### Khái niệm

```
Workflow (file .yml)
 └── Job (chạy trên 1 máy ảo)
      └── Step (1 lệnh hoặc 1 action)
```

| Khái niệm | Ý nghĩa |
|-----------|---------|
| **Workflow** | File YAML trong `.github/workflows/` |
| **Job** | Chạy trên 1 runner. Các job song song mặc định |
| **Step** | Tuần tự trong job |
| **Action** | Plugin tái sử dụng (`owner/repo@version`) |
| **Runner** | Máy ảo (Ubuntu/Windows/macOS), free 2000 phút/tháng cho repo private |

### Triggers thường dùng

```yaml
on:
  push:
    branches: [main]      # push vào main
  pull_request:
    branches: [main]      # PR target main
  workflow_dispatch:      # nút "Run workflow" trên UI
```

### File `.github/workflows/ci.yml`

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true

jobs:
  lint-test-build:
    name: Lint, test, build
    runs-on: ubuntu-latest
    timeout-minutes: 10

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@a15d269cd4658e1107c09f1fabf4cbd7bd1f308a # v4.4.0
        with:
          version: 10.15.0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Lint
        run: pnpm lint

      - name: Test
        run: pnpm test

      - name: Build
        env:
          NEXT_TELEMETRY_DISABLED: 1
        run: pnpm build
```

### Điểm quan trọng

- `cache: pnpm` trong `setup-node` → cache pnpm store giữa run, build sau nhanh hơn 10×.
- `concurrency` với `cancel-in-progress: true` → push commit mới hủy run cũ → tiết kiệm minutes.
- `timeout-minutes: 10` → bảo hiểm khỏi infinite loop ăn quota.
- Action third-party **pin theo SHA** (`@a15d269...` thay vì `@v4`) — chống supply chain attack.

### Có nên commit thư mục `.github/`?

**Có — bắt buộc.** GitHub Actions chỉ đọc workflow từ file nằm trong repo (cụ thể `.github/workflows/*.yml`). File chỉ ở local → GitHub không thấy → không chạy.

| Nội dung | Commit? | Lý do |
|----------|---------|-------|
| `.github/workflows/*.yml` | ✅ | GitHub Actions đọc từ đây |
| `.github/CODEOWNERS` | ✅ | Quy định reviewer cho PR |
| `.github/dependabot.yml` | ✅ | Config Dependabot |
| `.env*.local` | ❌ | Chứa secrets — KHÔNG bao giờ commit |

**Secrets** trong workflow (`${{ secrets.XXX }}`) lưu trên GitHub UI, **không** trong file YAML. File YAML có thể public.

---

## Buổi 4 — AWS Infrastructure

### 4.1 Billing Alert (BẮT BUỘC làm đầu tiên)

1. AWS Console → **Billing and Cost Management** → **Billing preferences** → bật billing alerts.
2. **Budgets** → **Create a budget** → **Use a template** → **Zero spend budget**.
3. Nhập email → Create.

→ Có 1 cent chi phí → email ngay lập tức.

> 📧 **AWS không gửi email confirmation khi tạo budget.** Email chỉ tới khi **vượt threshold**. Bấm vào budget → mục Alerts → kiểm tra cột Subscribers có đúng email của bạn.

### 4.2 IAM User cho GitHub Actions

#### Mục đích

User "robot" có credentials để GitHub Actions push image lên ECR. Không login console.

#### Steps

1. IAM Console → **Users** → **Create user**.
2. Username: `github-actions-deploy`.
3. **KHÔNG** tick console access.
4. **Attach policies directly** → tick `AmazonEC2ContainerRegistryPowerUser`.
5. Create user → vào user → **Security credentials** → **Create access key** → use case "Application running outside AWS".
6. **LƯU CSV** ngay (Secret Key chỉ hiện 1 lần).

> ⚠️ **Không bao giờ** dùng tài khoản root cho automation. Không commit access key vào git.

### 4.3 ECR Repository

#### Vì sao cần ECR (không build trực tiếp trên EC2)?

1. 🔥 **EC2 t3.micro yếu** (1 vCPU, 1GB RAM). Build Next.js trên đó **hết RAM → crash** hoặc mất 10+ phút. Build trên GitHub Actions runner (4 vCPU, 16GB RAM, free) chỉ mất 1-2 phút → push image đã build sẵn → EC2 chỉ `docker pull` (vài giây).
2. 🔄 **Rollback dễ**: mỗi image có tag (commit SHA hoặc `v1.2.3`). Hỏng prod? `docker pull app:v1.2.2` → revert trong 10 giây.
3. 🔒 **Immutability**: image sau khi build không đổi. Dev, staging, prod dùng **cùng 1 image** → không còn "works on my machine".

#### Tạo repo

1. ECR Console → verify region `ap-southeast-1`.
2. **Create repository** → Private → name `practice-nextjs`.
3. Tag immutability: Mutable (demo) hoặc Immutable (prod).
4. Bật **Scan on push** (free, scan CVE).

URI có dạng: `<ACCOUNT-ID>.dkr.ecr.ap-southeast-1.amazonaws.com/practice-nextjs`

> **Account ID** (12 chữ số) ≠ **Access Key ID** (20 ký tự bắt đầu `AKIA`). Nhầm 2 cái sẽ khiến `docker login` lỗi 400.

#### Test push thủ công (verify IAM user)

```powershell
# Cài AWS CLI v2 từ https://awscli.amazonaws.com/AWSCLIV2.msi
aws --version

# Configure
aws configure
# → paste Access Key, Secret, region=ap-southeast-1, format=json

# Verify
aws sts get-caller-identity
# → JSON có "Arn": "arn:aws:iam::XXX:user/github-actions-deploy"

# Login Docker vào ECR
$ACCOUNT_ID = (aws sts get-caller-identity --query Account --output text)
$REGISTRY = "$ACCOUNT_ID.dkr.ecr.ap-southeast-1.amazonaws.com"
aws ecr get-login-password --region ap-southeast-1 | docker login --username AWS --password-stdin $REGISTRY

# Tag + push
docker tag practice-nextjs:latest "$REGISTRY/practice-nextjs:test"
docker push "$REGISTRY/practice-nextjs:test"
```

→ Vào ECR Console → repo `practice-nextjs` → tab Images → thấy 1 image tag `test`.

### 4.4 EC2 Instance

#### 4.4.a Tạo Key Pair (SSH key)

1. EC2 Console → **Key Pairs** → **Create key pair**.
2. Name: `github-deploy-key`.
3. Type: RSA, Format: `.pem`.
4. Download → lưu vào `C:\Users\<bạn>\.ssh\github-deploy-key.pem` (KHÔNG để trong project folder).
5. **Lock permission** (Windows):

```powershell
$keyPath = "C:\Users\<bạn>\.ssh\github-deploy-key.pem"

# Trong PowerShell THƯỜNG (không phải Admin)
icacls $keyPath /reset
icacls $keyPath /inheritance:r
icacls $keyPath /remove "BUILTIN\Administrators"
icacls $keyPath /remove "NT AUTHORITY\SYSTEM"
icacls $keyPath /remove "BUILTIN\Users"
icacls $keyPath /remove "Everyone"
icacls $keyPath /grant:r "$(whoami):(R)"
icacls $keyPath
```

Output cuối phải **chỉ có 1 entry** với username của bạn `:(R)`.

#### 4.4.b Tạo IAM Role cho EC2

EC2 cần pull image từ ECR. Dùng **IAM Role** thay vì lưu access key trên EC2 (an toàn hơn).

1. IAM → **Roles** → **Create role**.
2. Trusted entity: **AWS service** → **EC2**.
3. Permissions: tick `AmazonEC2ContainerRegistryReadOnly` (chỉ pull, không push).
4. Name: `ec2-ecr-pull-role`.

#### 4.4.c Tạo Security Group

Firewall cho EC2.

1. EC2 → **Security Groups** → **Create security group**.
2. Name: `practice-nextjs-sg`.
3. **Inbound rules**:

| Type | Port | Source | Mục đích |
|------|------|--------|----------|
| SSH | 22 | `0.0.0.0/0` (cần cho GitHub Actions) | SSH login |
| Custom TCP | 3000 | `0.0.0.0/0` | App Next.js |

4. **Outbound rules**: giữ mặc định (allow all).

> ⚠️ Mở SSH cho `0.0.0.0/0` không lý tưởng nhưng cần thiết vì GitHub Actions runner IP đổi mỗi lần. Production nên dùng AWS SSM Session Manager để tránh expose port 22.

#### 4.4.d Launch EC2 Instance

1. EC2 → **Launch instances**.
2. Name: `practice-nextjs-server`.
3. AMI: **Amazon Linux 2023 kernel-6.1 AMI** (Free tier eligible).

   > ⚠️ **Cảnh báo chọn AMI**: list có nhiều option, chỉ chọn dòng có badge **"Free tier eligible"**:
   > | AMI | Dùng được? |
   > |-----|-----------|
   > | ✅ Amazon Linux 2023 kernel-6.1 AMI | **Dùng cái này** |
   > | ✅ Amazon Linux 2023 kernel-6.18 AMI | OK nhưng không cần |
   > | ❌ Deep Learning Base AMI | KHÔNG — có CUDA, cần GPU instance (mất phí) |
   > | ❌ Deep Learning OSS Nvidia | KHÔNG — cho ML |
   > | ❌ Deep Learning AMI Neuron | KHÔNG — chip ML đặc biệt |

4. Architecture: **64-bit (x86)** (KHÔNG phải Arm — image Docker build cho `linux/amd64`).
5. Instance type: **t3.micro** (Free tier eligible).
6. Key pair: `github-deploy-key`.
7. **Network settings** → Edit:
   - Auto-assign public IP: **Enable**.
   - Security group: select existing → `practice-nextjs-sg`.
8. Storage: 8 GiB gp3 (mặc định).
9. **Advanced details**:
   - **IAM instance profile**: `ec2-ecr-pull-role`.
   - **User data** (script chạy lần đầu boot):

```bash
#!/bin/bash
dnf update -y
dnf install -y docker
systemctl enable docker
systemctl start docker
usermod -aG docker ec2-user
```

10. Launch → đợi state `Running` + `2/2 checks passed`.
11. Copy **Public IPv4 address** từ tab Details.

> 📍 **Lấy Public IP**: EC2 Console → Instances → click instance → tab **Details** → dòng **Public IPv4 address** (dạng `xxx.xxx.xxx.xxx`).
>
> KHÔNG nhầm với **Private IPv4** (`10.x.x.x` hoặc `172.x.x.x`) — IP nội bộ AWS, không SSH từ ngoài được.

### 4.5 Verify thủ công (trước khi auto)

```powershell
# Trên máy local
ssh -i "C:\Users\<bạn>\.ssh\github-deploy-key.pem" ec2-user@<EC2-IP>
```

Trên EC2:

```bash
# Verify Docker
docker --version

# Verify IAM Role hoạt động
aws sts get-caller-identity
# → "Arn": "arn:aws:sts::XXX:assumed-role/ec2-ecr-pull-role/i-xxxxx"

# Login ECR + pull (KHÔNG cần access key!)
ACCOUNT_ID=<your-account-id>
REGION=ap-southeast-1
REGISTRY=$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com

aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $REGISTRY

docker pull $REGISTRY/practice-nextjs:test

# Run container
docker run -d --name app -p 3000:3000 --restart unless-stopped $REGISTRY/practice-nextjs:test

# Verify
docker ps
docker logs app
```

→ Mở browser: `http://<EC2-IP>:3000` → thấy app chạy.

---

## Buổi 5 — Auto Deploy

### 5.1 GitHub Secrets

Vào repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**.

Tạo 6 secrets:

| Tên | Giá trị |
|-----|---------|
| `AWS_ACCESS_KEY_ID` | Từ CSV của user `github-actions-deploy` |
| `AWS_SECRET_ACCESS_KEY` | Từ CSV |
| `AWS_REGION` | `ap-southeast-1` |
| `ECR_REPOSITORY` | `practice-nextjs` |
| `EC2_HOST` | Public IP của EC2 |
| `EC2_SSH_KEY` | Toàn bộ nội dung file `.pem` (cả 2 dòng `BEGIN/END`) |

### 5.2 File `.github/workflows/deploy.yml`

```yaml
name: Deploy

on:
  push:
    branches: [main]
  workflow_dispatch:

concurrency:
  group: deploy-${{ github.ref }}
  cancel-in-progress: false

jobs:
  build-and-deploy:
    name: Build, push to ECR, deploy to EC2
    runs-on: ubuntu-latest
    timeout-minutes: 15

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@7474bc4690e29a8392af63c5b98e7449536d5c3a # v4.3.1
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ secrets.AWS_REGION }}

      - name: Login to Amazon ECR
        id: ecr
        uses: aws-actions/amazon-ecr-login@1629cc33a9521f764a4704d4d0387513918873b9 # v2.1.4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@8d2750c68a42422c14e847fe6c8ac0403b4cbd6f # v3.12.0

      - name: Build and push image
        uses: docker/build-push-action@ca052bb54ab0790a636c9b5f226502c73d547a25 # v5.4.0
        with:
          context: .
          platforms: linux/amd64
          push: true
          tags: |
            ${{ steps.ecr.outputs.registry }}/${{ secrets.ECR_REPOSITORY }}:latest
            ${{ steps.ecr.outputs.registry }}/${{ secrets.ECR_REPOSITORY }}:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
          provenance: false

      - name: Deploy to EC2 over SSH
        uses: appleboy/ssh-action@0ff4204d59e8e51228ff73bce53f80d53301dee2 # v1.2.5
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ec2-user
          key: ${{ secrets.EC2_SSH_KEY }}
          script: |
            set -e
            REGION="${{ secrets.AWS_REGION }}"
            REGISTRY="${{ steps.ecr.outputs.registry }}"
            IMAGE="$REGISTRY/${{ secrets.ECR_REPOSITORY }}:${{ github.sha }}"

            echo "==> Logging into ECR (using EC2 instance role)..."
            aws ecr get-login-password --region "$REGION" | docker login --username AWS --password-stdin "$REGISTRY"

            echo "==> Pulling image $IMAGE..."
            docker pull "$IMAGE"

            echo "==> Stopping old container if exists..."
            docker stop app 2>/dev/null || true
            docker rm   app 2>/dev/null || true

            echo "==> Starting new container..."
            docker run -d --name app -p 3000:3000 --restart unless-stopped "$IMAGE"

            echo "==> Waiting 5s for app to boot..."
            sleep 5

            echo "==> Health check..."
            if curl -fsS http://localhost:3000 > /dev/null; then
              echo "✅ App is up!"
            else
              echo "❌ App did not respond on :3000"
              docker logs app
              exit 1
            fi

            echo "==> Cleaning up dangling images older than 24h..."
            docker image prune -af --filter "until=24h" || true
```

### 5.3 Điểm quan trọng

- **Image tag** = `commit SHA` + `latest`. SHA tag immutable → rollback dễ.
- **Cache GHA** (`cache-from: type=gha`) → build lần sau nhanh 5×.
- **`provenance: false`** → tránh tạo extra metadata image (multi-row trong ECR).
- **`platforms: linux/amd64`** → khớp với t3.micro x86.
- **Health check** với `curl localhost:3000` → workflow fail nếu app không response.
- **`cancel-in-progress: false`** → deploy phải chạy hết, không hủy giữa chừng.
- **Cleanup dangling images** → tránh đầy disk EC2.

### 5.4 Test auto-deploy

```bash
# Sửa 1 chữ trong src/app/page.tsx
git checkout -b test-auto-deploy
git add -A
git commit -m "test: verify auto-deploy"
git push -u origin test-auto-deploy
```

Mở PR → merge vào main → tab Actions → xem 2 workflow chạy:
- **CI** (verify code).
- **Deploy** (build + push ECR + SSH EC2).

Sau ~3-5 phút → refresh `http://<EC2-IP>:3000` → thấy code mới.

### 5.5 Multi-workflow files: file nào chạy khi nào?

GitHub scan **toàn bộ** `.github/workflows/`, đọc `on:` của từng file độc lập, chạy song song mọi file match event.

| Event | `ci.yml` chạy? | `deploy.yml` chạy? |
|-------|---------------|---------------------|
| Push lên branch `feature/xxx` | ❌ | ❌ |
| Mở PR từ `feature/xxx` → `main` | ✅ CI | ❌ (PR không phải push) |
| Update commit trên PR đó | ✅ CI | ❌ |
| Merge PR → push `main` | ✅ CI | ✅ Deploy (song song) |
| Bấm "Run workflow" trên UI | ❌ | ✅ Deploy |
| Push trực tiếp vào `main` | ✅ CI | ✅ Deploy |

### 5.6 Muốn Deploy chờ CI pass mới chạy?

3 cách:

#### Cách A — Gộp 1 file, dùng `needs:` (đơn giản nhất)

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps: [...]

  deploy:
    needs: test           # ← chỉ chạy khi test pass
    runs-on: ubuntu-latest
    steps: [...]
```

#### Cách B — Tách file, dùng `workflow_run`

```yaml
# deploy.yml
on:
  workflow_run:
    workflows: ["CI"]
    types: [completed]
    branches: [main]

jobs:
  deploy:
    if: ${{ github.event.workflow_run.conclusion == 'success' }}
    ...
```

#### Cách C — Branch protection (chuẩn production)

Settings repo → **Branches** → add rule cho `main`:
- ✅ Require status checks to pass before merging
- ✅ Chọn `CI` là required check

→ PR không merge được nếu CI fail → Deploy chỉ chạy sau merge → đảm bảo Deploy luôn chạy với code đã pass.

---

## Troubleshooting

### Lint errors khi setup CI

#### `react/no-unescaped-entities`
Fix thật: thay `"`/`'` trong JSX bằng `&ldquo;`/`&rdquo;`/`&apos;`.

#### `react-hooks/purity` (Math.random, Date.now trong server component)
Add `// eslint-disable-next-line react-hooks/purity -- intentional: <reason>` nếu code demo cố ý.

#### `react-hooks/set-state-in-effect`
Add `// eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: <reason>`.

#### `@typescript-eslint/no-unused-vars`
Đổi tên param thành `_xxx` + thêm rule trong `eslint.config.mjs`:

```js
{
  rules: {
    "@typescript-eslint/no-unused-vars": [
      "warn",
      { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
    ],
  },
}
```

### Docker build lỗi `npm ci`

Project dùng pnpm chứ không phải npm. Sửa Dockerfile dùng `corepack enable` + `pnpm install --frozen-lockfile`.

### `aws: command not found` sau khi cài AWS CLI trên Windows

PATH chưa reload. Fix:

```powershell
# Reload PATH cho session hiện tại
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
aws --version
```

Hoặc restart Windows.

### `docker login` lỗi 400 Bad Request

Bị nhầm **Access Key ID** với **Account ID** trong URI ECR. Account ID là **12 chữ số**, lấy bằng:

```powershell
aws sts get-caller-identity --query Account --output text
```

### `docker push` lỗi `tag does not exist`

Chưa chạy `docker tag` trước khi push. Phải tag local image với URI ECR trước.

### SSH `Permission denied (publickey)` từ Windows

Permission file `.pem` quá rộng. Lock lại bằng `icacls` (xem 4.4.a). **Quan trọng**: chạy từ PowerShell THƯỜNG (không Admin).

### GitHub Actions deploy lỗi `dial tcp ***:22: i/o timeout`

Security Group SSH source = "My IP" không cho phép GitHub runner. Đổi thành `0.0.0.0/0`.

### EC2 sau Stop/Start → Public IP đổi

Free tier EC2 có **dynamic public IP** (đổi mỗi lần stop/start). Update secret `EC2_HOST` trên GitHub. Nếu muốn IP cố định → tạo **Elastic IP** (free khi attached vào running instance).

### Multi-image trong ECR (3 row, 1 image index + provenance)

Buildx default tạo manifest list + provenance attestation:

| Row | Type | Size | Vai trò |
|-----|------|------|---------|
| `test` | **Image Index** | 60 MB | "Mục lục" (manifest list) — cái bạn pull |
| (no tag) | Image | 0 MB | **Provenance attestation** (chữ ký metadata: ai build, build từ commit nào) |
| (no tag) | Image | 60 MB | Image thật cho `linux/amd64` |

Khi EC2 pull `practice-nextjs:test` → đọc Image Index → chọn image cho platform của mình → pull image thật. **Hoạt động bình thường, không cần fix.**

Nếu muốn 1 row duy nhất:

```bash
docker build --provenance=false -t practice-nextjs .
```

Hoặc trong workflow: `provenance: false`.

### Nút "Run workflow" không hiện trên UI

`workflow_dispatch` chỉ hiện nút khi:
1. ✅ Workflow file đã merge vào **default branch** (`main`).
2. ✅ File có `workflow_dispatch:` trong `on:`.
3. ✅ Bạn có write permission.

→ Nếu file chỉ ở branch feature, nút không hiện. Merge vào `main` trước. Vào tab Actions → sidebar → click workflow name → banner "Run workflow" hiện ở trên.

### `icacls` không lock được key (vẫn còn nhiều entry)

Triệu chứng: sau `icacls /grant`, output vẫn còn `BUILTIN\Administrators`, `NT AUTHORITY\SYSTEM`, etc.

Nguyên nhân: chạy PowerShell **as Administrator** → `${env:USERNAME}` = `admin`, không phải user login Windows. SSH chạy as user thật → thấy file có entries lạ → từ chối.

Fix: đóng PowerShell Admin, mở **PowerShell THƯỜNG**, chạy lệnh icacls (đầy đủ ở 4.4.a). `whoami` phải trả về user login Windows (ví dụ `TECHVIFY\sam.nguyen`).

### GitHub warning "Use full commit SHA hash for this dependency"

Pin third-party action theo commit SHA thay vì tag:

```yaml
# Thay
uses: aws-actions/configure-aws-credentials@v4
# Bằng
uses: aws-actions/configure-aws-credentials@7474bc4690e29a8392af63c5b98e7449536d5c3a # v4.3.1
```

Lấy SHA từ: `https://api.github.com/repos/<owner>/<repo>/git/refs/tags`.

---

## Nâng cấp lên production

| Ưu tiên | Việc | Cải thiện |
|---------|------|-----------|
| **1 🔥** | **Domain + HTTPS** (Route 53 + ACM + CloudFront) | Url đẹp, SSL, không expose `:3000` |
| **2** | **OIDC** giữa GitHub và AWS | Không có long-lived access key |
| **3** | **AWS SSM Session Manager** thay SSH | Không expose port 22 |
| **4** | **Branch protection** + required CI check | Không merge code fail test |
| **5** | **Dependabot** auto-update SHA | Action security tự động |
| **6** | **CloudWatch logs + alarm** | Biết khi app crash |
| **7** | **Multi-environment** (staging + prod) | Test trước khi đụng prod |
| **8** | **Elastic IP** | EC2 IP cố định sau reboot |
| **9** | **EFS hoặc volume** persistent | Lưu data không mất khi container restart |
| **10** | **Auto Scaling** | Scale lên khi traffic cao |

### Quy ước branch (production-ready)

```
feature/xxx → PR → dev   → auto deploy STAGING
                   dev   → PR → main → auto deploy PRODUCTION
```

### Tag strategy

- Demo: `:latest` + `:<commit-sha>`.
- Production: `:<semver>` (`:v1.2.3`) + `:<commit-sha>` + `:latest` chỉ trên prod.

---

## Tài liệu tham khảo

- [Next.js Self-hosting](https://nextjs.org/docs/app/guides/self-hosting)
- [GitHub Actions Docs](https://docs.github.com/actions)
- [AWS ECR User Guide](https://docs.aws.amazon.com/ecr/)
- [AWS EC2 User Guide](https://docs.aws.amazon.com/ec2/)
- [Docker Multi-stage builds](https://docs.docker.com/build/building/multi-stage/)
- [Pin actions to a full length commit SHA](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions#using-third-party-actions)

---

**Xong! Hành trình của bạn từ "không biết CI/CD là gì" đến "có pipeline auto-deploy lên AWS" — chỉ trong 5 buổi.** 🎉
