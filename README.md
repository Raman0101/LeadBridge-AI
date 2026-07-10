# LeadBridge AI — Universal CRM Lead Importer 🚀

AI-powered CSV importer that intelligently maps any CSV format (Facebook Lead Ads, Google Ads, real estate CRM exports, manual Excel sheets, etc.) into the unified GrowEasy CRM schema using multiple Gemini models with automatic fallback.

---

## ✨ Features

- Drag & drop + file picker upload
- Beautiful, responsive preview table
  - Sticky headers
  - Horizontal & vertical scrolling
- Two-step workflow
  1. Preview
  2. Confirm → AI extraction
- **Multi-model AI fallback** — tries multiple Gemini models automatically if one hits rate limits
- AI extraction in batches with retry + exponential backoff
- Import statistics dashboard
  - Imported records
  - Skipped records
  - Total processed
- Skipped-record reason table
- Download parsed result as CSV
- **Sleek black monochrome theme** with glass morphism
- Dark mode 🌙
- Progress indicator during AI processing
- Strict enum enforcement (`crm_status`, `data_source`)
- Automatic newline escaping for CSV compatibility
- Automatically skips records without both email and mobile
- Dockerized and production-ready

---

## 🧱 Tech Stack

### Frontend

- Next.js 14
- TypeScript
- Tailwind CSS
- lucide-react

### Backend

- Node.js
- Express
- TypeScript
- multer
- csv-parse
- Google GenAI SDK

### AI

- **Multiple Gemini models with automatic fallback**
  - gemini-2.0-flash
  - gemini-2.5-flash
  - gemini-2.5-flash-lite
  - gemini-3-flash
  - gemini-3.1-flash-lite
  - gemini-3.5-flash

### Testing

- Jest

---

## 📦 Local Setup

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd groweasy-csv-importer
cp .env.example .env
```

Add your Gemini API key inside the `.env` file.

---

### 2. Run with Docker (Recommended)

```bash
docker compose up --build
```

Applications:

- Frontend: http://localhost:3000
- Backend: http://localhost:4000

---

### 3. Run without Docker

#### Backend

```bash
cd backend
npm install
npm run dev
```

#### Frontend (new terminal)

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

### AI Model Configuration

```env
# Comma-separated list of Gemini models to try in order
# If one hits rate limits, the next one is tried automatically
GEMINI_MODELS=gemini-2.0-flash,gemini-2.5-flash,gemini-3.1-flash-lite,gemini-3-flash,gemini-2.5-flash-lite,gemini-3.5-flash

# Optional: Enable/disable fallback (default: true)
AI_FALLBACK=true

# Optional: Shared AI settings
AI_MAX_OUTPUT_TOKENS=16384
AI_TEMPERATURE=0.1
```

### Server Configuration

```env
PORT=4000
FRONTEND_URL=http://localhost:3000
NEXT_PUBLIC_API_BASE=http://localhost:4000/api
BATCH_SIZE=10
```

---

## 🔌 API Reference

### POST `/api/parse`

Upload and parse a CSV for preview (without AI processing).

### Request

**Content-Type**

```
multipart/form-data
```

**Field**

```
file
```

### Response

```json
{
  "filename": "example.csv",
  "headers": [],
  "records": [],
  "total_rows": 100
}
```

---

### POST `/api/extract`

Run AI extraction on parsed records.

### Request

```json
{
  "records": [
    {}
  ]
}
```

### Response

```json
{
  "parsed": [],
  "skipped": [],
  "total_parsed": 90,
  "total_skipped": 10,
  "total_processed": 100
}
```

---

### GET `/health`

Health check endpoint.

---

## 🧠 AI Architecture

### Multi-Model Fallback System

The backend uses a provider-agnostic architecture that automatically falls back between multiple AI models:

```
AIManager
├── gemini-2.0-flash (primary)
├── gemini-2.5-flash (fallback)
├── gemini-2.5-flash-lite (fallback)
├── gemini-3-flash (fallback)
├── gemini-3.1-flash-lite (fallback)
└── gemini-3.5-flash (fallback)
```

**How it works:**
1. Tries the first model in the list
2. If it hits rate limits, timeouts, or 5xx errors → automatically tries the next model
3. Each model has its own internal retry logic with exponential backoff
4. If all models fail, returns detailed error messages from all attempts

### Provider Architecture

```
backend/src/services/ai/
├── ai-manager.ts          # Orchestrator with fallback logic
├── utils.ts               # JSON parsing/sanitization utilities
└── providers/
    ├── types.ts           # Provider interface
    ├── index.ts           # Factory function
    ├── gemini.provider.ts # Gemini implementation
    └── openai.provider.ts # OpenAI-compatible (optional)
```

---

## 🧪 AI Prompt Engineering Highlights

- Strict JSON output using Gemini structured responses
- Explicit enum validation for:
  - `crm_status`
  - `data_source`
- Semantic column mapping
  - Phone / Mobile / Contact → `mobile`
  - Email → `email`
  - Company → `company`
  - etc.
- Phone normalization
  - Removes country codes
  - Handles `+91`
  - Defaults to 10-digit mobile format
- Multiple email/mobile handling
  - Primary value mapped normally
  - Remaining values appended to `crm_note`
- Automatic newline escaping for CSV safety
- Skip rule
  - Records without both email and mobile are added to `skipped[]`
- Processes records in batches of **10** (configurable via `BATCH_SIZE`)
- Exponential backoff retry on:
  - Rate limits
  - Timeouts
  - 5xx server errors

---

## 📂 GrowEasy CRM Schema

| Field |
|--------|
| created_at |
| name |
| email |
| country_code |
| mobile_without_country_code |
| company |
| city |
| state |
| country |
| lead_owner |
| crm_status |
| crm_note |
| data_source |
| possession_time |
| description |

---

## 🧪 Test CSVs

The importer can intelligently process a wide variety of CSV formats, including:

- Facebook Lead Ads exports
- Google Ads Lead Form exports
- HubSpot exports
- Zoho CRM exports
- Real Estate CRM exports
- Manually created Excel CSV files with arbitrary column names

---

## ✅ Run Tests

```bash
cd backend
npm test
```

---

## 🚢 Deployment

## Frontend

Deploy to **Vercel**.

Environment variable:

```env
NEXT_PUBLIC_API_BASE=<backend-url>
```

---

## Backend

Deploy to any Node.js hosting provider such as:

- Railway
- Render
- Fly.io

Required environment variables:

```env
GEMINI_API_KEY=your_api_key
GEMINI_MODELS=gemini-2.0-flash,gemini-2.5-flash,gemini-3.5-flash
FRONTEND_URL=https://your-frontend-url.com
PORT=4000
```

---

## 🎨 UI Features

- **Black Monochrome Theme** — Sleek, modern design with slate/black color palette
- **Glass Morphism** — Frosted glass effects with backdrop blur
- **Smooth Animations** — Fade-in, scale-in, slide-in, shimmer effects
- **Responsive Design** — Works perfectly on mobile, tablet, and desktop
- **Dark Mode** — Toggle between light and dark themes
- **Ambient Glow** — Subtle background animations for premium feel
- **Animated Counters** — Statistics cards with number animations
- **Progress Indicators** — Real-time AI processing feedback

---

## 📝 License

MIT