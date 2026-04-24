# 🛡️ Intelligence Query Engine (HNG Stage 2)

An upgraded demographic intelligence API built for **Insighta Labs**. This system extends the Stage 1 service with advanced filtering, sorting, pagination, and a custom-built Natural Language Processing (NLP) engine.

## 🚀 Live Links
- **API Base URL:** `https://hng-stage-two-task.vercel.app` 
- **Profiles Endpoint:** `/api/profiles`
- **Search Endpoint:** `/api/profiles/search`

---

## ✨ Stage 2 Enhancements
- **Advanced Filtering:** Query by gender, age ranges, country IDs, and probability confidence scores.
- **Sorting & Pagination:** Server-side sorting (`asc`/`desc`) and paginated results (default 10, max 50).
- **Natural Language Query:** A rule-based engine that translates plain English into database filters.
- **Data Seeding:** Pre-populated with 2026 intelligence profiles.
- **UUID v7:** Strictly uses time-ordered version 7 UUIDs for primary keys.
- **Strict Validation:** Returns `422 Unprocessable Entity` for invalid ID formats.

---

## 🚦 API Documentation

### 1. Intelligence Query (GET)
`GET /api/profiles`

**Supported Parameters:**
- `gender`: `male` | `female`
- `age_group`: `child` | `teenager` | `adult` | `senior`
- `min_age` / `max_age`: Integer range
- `min_gender_probability`: Float (0.0 - 1.0)
- `sort_by`: `age` | `created_at` | `gender_probability`
- `page` / `limit`: Pagination controls

**Example:** `/api/profiles?gender=male&min_age=25&sort_by=age&order=desc`

### 2. Natural Language Search (GET)
`GET /api/profiles/search?q=young males from nigeria`

---

## 🧠 Natural Language Parsing Approach
To meet the "No AI/LLM" requirement, this system utilizes a **Deterministic Rule-Based Tokenizer**.

### How it works:
1. **Normalization:** The query string is converted to lowercase and stripped of special characters.
2. **Keyword Mapping:**
   - **Gender:** Scans for tokens `male` or `female`.
   - **Age Groups:** Matches against stored categories (`child`, `teenager`, `adult`, `senior`).
   - **"Young" Logic:** Specifically maps the keyword `young` to a functional range of `16–24`.
   - **Numeric Extraction:** Uses Regex (`above (\d+)`) to capture numerical values for "above X" queries.
   - **Geography:** Uses a `countryMap` dictionary to translate full country names (e.g., "Nigeria") into ISO codes (`NG`).
3. **Filter Aggregation:** These identified tokens are merged into a single database query object, which is then handled by the service layer.

### Supported Keywords:
- **Age:** `young`, `above [number]`, `child`, `teenager`, `adult`, `senior`.
- **Gender:** `male`, `males`, `female`, `females`.
- **Location:** `nigeria`, `kenya`, `angola`, `benin`, `tanzania`, `ghana`.

### Limitations & Edge Cases:
- **Conjunctions:** Does not currently support complex logic like `OR` or `NOT` (e.g., "males but not from Nigeria").
- **Spelling:** The parser is sensitive to typos (e.g., "nigeriaa" will not resolve to `NG`).
- **Ambiguity:** Queries without recognizable keywords return a `400 Bad Request` with an "Unable to interpret query" message.
- **Country Scope:** Only supports countries explicitly defined in the internal mapping dictionary.

---

## 🛠️ Tech Stack
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB Atlas (Mongoose)
- **ID Standard:** UUID v7
- **Deployment:** Vercel

---

## ⚙️ Local Setup
1. `git clone https://github.com/Whykay012/HNG_STAGE_TWO_TASK.git`
2. `npm install`
3. Create a `.env` file and add your `MONGODB_URI` and `PORT`.
4. `npm start`