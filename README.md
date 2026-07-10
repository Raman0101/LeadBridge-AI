# LeadBridge AI — Universal CRM Lead Importer 🚀

AI-powered CSV importer that intelligently maps any CSV format (Facebook Lead Ads, Google Ads, real estate CRM exports, manual Excel sheets, etc.) into a unified CRM schema using multiple AI models with automatic fallback.

---

## ✨ Features

- Drag & drop + file picker upload
- Beautiful, responsive preview table
- Two-step workflow: Preview → Confirm → AI extraction
- **Multi-model AI fallback** — automatically tries alternative models if one hits rate limits
- AI extraction in batches with retry + exponential backoff
- Import statistics dashboard (imported, skipped, total processed)
- Skipped-record reason table
- Download parsed result as CSV
- Dark mode support
- Progress indicator during AI processing
- Dockerized and production-ready

---

## 🧱 Tech Stack

### Frontend
- Next.js 14, TypeScript, Tailwind CSS, lucide-react

### Backend
- Node.js, Express, TypeScript, multer, csv-parse, Google GenAI SDK

### AI
- Multiple Gemini models with automatic fallback

### Testing
- Jest

---

## 📦 Local Setup

### 1. Clone & configure

```bash
git clone https://github.com/Raman0101/LeadBridge-AI
cd LeadBridge-AI
cp .env.example .env
```

Add your Gemini API key inside the `.env` file.

### 2. Run with Docker (Recommended)

```bash
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend: http://localhost:4000

### 3. Run without Docker

**Backend**
```bash
cd backend
npm install
npm run dev
```

**Frontend** (new terminal)
```bash
cd frontend
npm install
npm run dev
```

---

## 🔑 Environment Variables

### Required
```env
GEMINI_API_KEY=your_gemini_api_key
```

### Optional
```env
# AI model configuration (comma-separated, tried in order)
GEMINI_MODELS=gemini-2.0-flash,gemini-2.5-flash,gemini-3.1-flash-lite,gemini-3-flash,gemini-2.5-flash-lite,gemini-3.5-flash
AI_FALLBACK=true
AI_MAX_OUTPUT_TOKENS=16384
AI_TEMPERATURE=0.1

# Server
PORT=4000
FRONTEND_URL=http://localhost:3000
NEXT_PUBLIC_API_BASE=http://localhost:4000/api
BATCH_SIZE=10
```

---

## 🔌 API Reference

### POST `/api/parse`
Upload and parse a CSV for preview (without AI processing).

**Content-Type:** `multipart/form-data`
**Field:** `file`

**Response:**
```json
{
  "filename": "example.csv",
  "headers": [],
  "records": [],
  "total_rows": 100
}
```

### POST `/api/extract`
Run AI extraction on parsed records.

**Request:**
```json
{ "records": [{}] }
```

**Response:**
```json
{
  "parsed": [],
  "skipped": [],
  "total_parsed": 90,
  "total_skipped": 10,
  "total_processed": 100
}
```

### GET `/health`
Health check endpoint.

---

## ✅ Run Tests

```bash
cd backend
npm test
```

---

## 🚢 Deployment

### Frontend
Deploy to **Vercel**.

Environment variable:
```env
NEXT_PUBLIC_API_BASE=<backend-url>
```

### Backend
Deploy to any Node.js hosting provider (Railway, Render, Fly.io).

Required environment variables:
```env
GEMINI_API_KEY=your_api_key
FRONTEND_URL=https://your-frontend-url.com
```

---

## 📝 License

MIT