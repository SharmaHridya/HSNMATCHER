# HSN Matcher

Describe a product in plain English and get the most likely **HSN/SAC code**, its **GST rate**, and a confidence-ranked shortlist with reasoning.

**Live demo:** https://hsnmatcher.netlify.app/

---

## Why this exists

Classifying goods and services under the right HSN/SAC code is a routine but error-prone step in Indian GST compliance. The official code list is large, the descriptions are formal, and people usually describe products in everyday language. HSN Matcher bridges that gap with semantic search plus LLM reranking, and it says so when it is not sure instead of guessing.

## How it works

```
Product description
        │
        ▼
 Input validation
        │
        ▼
 Embed description (Jina AI)
        │
        ▼
 Vector search in PostgreSQL + pgvector  ──►  top-K candidate HSN codes
        │
        ▼
 Similarity threshold gate  ──(too weak)──►  "Unable to classify"
        │
        ▼
 LLM reranking + reasoning (Ollama Cloud)
        │
        ▼
 Ranked shortlist · GST rate · confidence · explanation
```

1. **Retrieval first.** The description is embedded and compared against embeddings of HSN/SAC entries stored in pgvector. This step is deterministic and does the heavy lifting.
2. **LLM only for reranking.** The LLM sees just the top candidates. It reorders them and explains why. It does not invent codes.
3. **Confidence handling.**
   - Input is validated before embedding.
   - A similarity threshold stops weak matches from reaching the LLM.
   - The response schema allows an explicit "unranked" verdict when no candidate fits.
   - The gap between the top scores is used as a secondary confidence signal. Near-ties are shown as ambiguous instead of a single confident answer.

## Tech stack

| Layer | Technology |
|---|---|
| Backend | Django, Django REST Framework |
| Database | PostgreSQL + pgvector |
| Embeddings | Jina AI |
| Reranking | LLM via Ollama Cloud |
| Frontend | React, Tailwind CSS |
| Hosting | Render (backend), Netlify (frontend) |

## Features

- Plain-English product description as input
- Most likely HSN/SAC code and applicable GST rate
- Confidence-ranked shortlist of alternatives
- Short reasoning for each candidate
- Explicit "can't classify confidently" outcome for weak or ambiguous input

## Getting started

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL with the `pgvector` extension
- A Jina AI API key
- An Ollama Cloud API key

### Backend

```bash
git clone <your-repo-url>
cd <repo>/backend

python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env            # then fill in the values below
python manage.py migrate
python manage.py runserver
```

### Environment variables

> Adjust these names to match your `.env.example`.

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (database must have `pgvector` enabled) |
| `SECRET_KEY` | Django secret key |
| `JINA_API_KEY` | Jina AI embeddings key |
| `OLLAMA_API_KEY` | Ollama Cloud key for reranking |
| `ALLOWED_HOSTS` / `CORS_ALLOWED_ORIGINS` | Deployment hosts and frontend origin |

### Load the HSN dataset

> Replace with your actual command.

```bash
python manage.py load_hsn_data
```

This loads the HSN/SAC codes and generates their embeddings into pgvector.

### Frontend

```bash
cd <repo>/frontend
npm install
npm run dev
```

Set the backend URL in the frontend environment file (for example `VITE_API_URL`).

## API

> Replace with your actual route and fields.

`POST /api/match/`

```json
{ "description": "stainless steel insulated water bottle" }
```

Example response shape:

```json
{
  "results": [
    {
      "hsn_code": "xxxx",
      "description": "...",
      "gst_rate": "xx%",
      "confidence": 0.00,
      "reasoning": "..."
    }
  ],
  "verdict": "ranked"
}
```

`verdict` can also indicate that the input could not be classified confidently.

## Data notes and limitations

- No single clean public file maps every HSN code to its GST rate. The dataset used here combines HSN codes with chapter-level GST rate estimates, so some rates are approximations.
- GST rates changed with the GST reforms effective September 2025. Always verify the rate against the official notification before relying on it for filing.
- This tool is a decision aid, not tax advice. Final classification responsibility stays with the taxpayer or a qualified professional.

## Deployment

- **Backend:** Render, with a hosted PostgreSQL instance that supports `pgvector`
- **Frontend:** Netlify

## Future improvements

- Per-code rate data with effective dates
- Feedback loop to learn from user corrections
- Batch classification from CSV
- Evaluation set to track accuracy over time

## Author

**Hridya Sharma**, B.Tech, NIT Jalandhar
GitHub: [SharmaHridya](https://github.com/SharmaHridya)
