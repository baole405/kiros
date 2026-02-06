## Tóm tắt bài test Kiros & định hướng thực hiện (Option A)

### 1. Kiros là công ty gì?

- **Kiros Technology Pte Ltd**: công ty công nghệ tại **Singapore**, xây nền tảng **AI Co‑pilot cho cố vấn tài chính/bảo hiểm**.
- Sản phẩm chính:
  - Advisor **upload policy PDF**.
  - AI **trích xuất dữ liệu**, gom thành **portfolio**.
  - Hỗ trợ **so sánh Current vs Recommended Portfolio**, giải thích coverage, premium, gap.
- Giá trị cốt lõi: **tiết kiệm thời gian nhập liệu**, **tăng năng suất advisor**, **tuân thủ PDPA/MAS** với **Zero‑Retention**, audit trail đầy đủ.

### 2. Yêu cầu bài test kỹ thuật

- Mục tiêu: xây **Full Stack MVP tích hợp Generative AI**, tập trung vào:
  - **Thiết kế kiến trúc + database**.
  - **Async/background processing**.
  - **Xử lý edge cases** & **validate output của AI**.
- Tech bắt buộc:
  - **Frontend**: Next.js (React).
  - **Backend**: FastAPI (Python) **hoặc** Node.js (Express).
  - **Database**: PostgreSQL.
  - **AI**: bất kỳ LLM (OpenAI, Gemini, Groq, …).
- Thời gian làm bài: **7 ngày**, nộp:
  - **Public GitHub repo**.
  - **Video Loom ≤ 5 phút** demo + giải thích kỹ thuật.
  - **README hoặc docker‑compose** để chạy app local.

### 3. Option A – AI Support "Triage & Recovery" Hub (đã chọn)

- **Mục tiêu**: Hệ thống nhận **user complaints/tickets** → AI **triage & soạn draft trả lời** → **agent dashboard** để xử lý.
- Thành phần chính:
  1. **Ingestion API – `POST /tickets`**
     - Nhận complaint từ user.
     - Lưu ticket vào DB (status ban đầu: `pending`).
     - **Yêu cầu quan trọng**: Gọi AI mất 3–5 giây **không được block HTTP response** → trả `201 Created` ngay, AI chạy **background**.
  2. **AI Triage Engine – Background worker**
     - **Categorize** ticket: `Billing | Technical | Feature Request`.
     - **Score**:
       - `sentiment` (1–10).
       - `urgency` (`High | Medium | Low`).
     - **Draft**: sinh câu trả lời lịch sự, bám ngữ cảnh complaint.
     - Bắt buộc: AI trả **JSON hợp lệ** → lưu `category`, `sentiment`, `urgency`, `draft_reply` thành các field riêng trong DB.
  3. **Agent Dashboard (Frontend)**
     - **List view**:
       - Hiển thị danh sách tickets, join với kết quả AI.
       - **Color‑code theo urgency** (VD: High = đỏ, Medium = vàng, Low = xanh).
     - **Detail view**:
       - Hiển thị complaint + category + sentiment + urgency + draft_reply.
       - Cho agent chỉnh sửa draft.
       - Nút **“Resolve”** → cập nhật trạng thái ticket trong DB.

### 4. Tech stack lựa chọn

- **Frontend**: Next.js (TypeScript, App Router).
- **Backend**: **Node.js + Express** (đã chốt).
- **Database**: PostgreSQL.
- **LLM** (dự kiến, free/ít tốn tài nguyên máy):
  - Dùng API hosted (vd: Gemini, Groq, OpenRouter, …) để **không phải tự host model**, chỉ tốn network call.

### 5. Thiết kế sơ bộ kiến trúc & database

- Bảng gợi ý:
  - `tickets`:
    - `id` (PK).
    - `email` (nullable).
    - `content` (text complaint).
    - `status` (`pending | processing | resolved`).
    - `created_at`, `updated_at`.
  - `ticket_ai_results`:
    - `id` (PK).
    - `ticket_id` (FK → tickets).
    - `category` (enum: `billing | technical | feature_request`).
    - `sentiment_score` (int 1–10).
    - `urgency` (enum: `high | medium | low`).
    - `draft_reply` (text).
    - `processed_at`.

- Luồng xử lý:
  1. **User** gửi complaint qua frontend → gọi `POST /tickets`.
  2. **Backend**:
     - Lưu ticket (`status = pending`).
     - Đẩy job vào queue/background (VD: bảng job, worker đọc định kỳ, hoặc worker chạy trong process riêng).
     - Trả `201 Created` + `ticket_id` cho frontend.
  3. **Worker**:
     - Lấy các ticket `pending` chưa xử lý.
     - Gọi LLM với prompt yêu cầu JSON chuẩn (category, sentiment, urgency, draft_reply).
     - Validate JSON (schema, enum, range) → nếu fail, handle lỗi & log, không làm sập hệ thống.
     - Lưu kết quả vào `ticket_ai_results`, cập nhật `tickets.status = processing` hoặc `resolved` tùy logic.
  4. **Frontend**:
     - **List page**: gọi `GET /tickets` → render bảng/cards với màu urgency.
     - **Detail page**: `GET /tickets/:id` → cho agent chỉnh `draft_reply` → `POST /tickets/:id/resolve` để cập nhật trạng thái.

### 6. Kế hoạch triển khai (high‑level)

1. **Dựng skeleton project**:
   - Thư mục `frontend` (Next.js) và `backend` (Express) + file `README.md`.
2. **Cấu hình Postgres + migrations** cho bảng `tickets` và `ticket_ai_results`.
3. **Implement backend core**:
   - `POST /tickets` (chỉ lưu DB, chưa cần AI).
   - Cơ chế background worker đơn giản + API `GET /tickets`, `GET /tickets/:id`, `POST /tickets/:id/resolve`.
4. **Tích hợp LLM + validation JSON** trong worker.
5. **Hoàn thiện frontend**:
   - Form submit ticket.
   - Agent dashboard (list + detail với edit & resolve).
6. **Viết README + chuẩn bị video Loom**:
   - Giải thích kiến trúc, background processing, handling edge cases và cách dùng AI assistant trong quá trình dev.

