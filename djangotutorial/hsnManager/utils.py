import json
import os
from ollama import Client

client = Client(
    host=os.getenv("OLLAMA_HOST", "https://ollama.com"),
    headers={"Authorization": f"Bearer {os.getenv('OLLAMA_API_KEY')}"},
    timeout=25
)


def _confidence_from_distance(distance):
    """Map pgvector L2 distance to the High/Medium/Low labels the UI understands.

    classify() already rejects anything above 0.85, so the bands sit below that.
    """
    if distance <= 0.70:
        return "High"
    if distance <= 0.84:
        return "Medium"
    return "Low"


def fallback_rank(candidates, top_n=3):
    """
    Rank candidates by vector distance alone, in the same shape rerank() returns.
    Used when the LLM re-ranker is unavailable (e.g. Ollama out of credits).
    """
    ranked = []
    for candidate in sorted(candidates, key=lambda c: c["distance"])[:top_n]:
        distance = float(candidate["distance"])
        ranked.append({
            "code": candidate["code"],
            "gst_rate": candidate.get("gst_rate"),
            "confidence": _confidence_from_distance(distance),
            # Jina embeddings are unit-length, so cosine similarity = 1 - d^2 / 2.
            "similarity": round(max(0.0, 1 - distance ** 2 / 2), 3),
            "reason": "Closest match by meaning from vector search (AI re-ranking is currently unavailable).",
        })
    return {"ranked": ranked}


def rerank_or_fallback(query, candidates):
    """Try the LLM re-ranker; on any failure fall back to vector-distance ranking.

    Returns (result, used_fallback).
    """
    try:
        result = rerank(query, candidates)
        if result.get("ranked"):
            return result, False
        print("RERANK RETURNED NO RESULTS, USING FALLBACK")
    except Exception as e:
        print("RERANK FAILED, USING FALLBACK:", e)
    return fallback_rank(candidates), True


def rerank(query, candidates):
    """
    Re-rank the top pgvector candidates using Gemma.
    Returns a Python dictionary.
    Raises an exception if Ollama fails or returns invalid JSON.
    """

    formatted_candidates = ""

    for i, candidate in enumerate(candidates, start=1):
        formatted_candidates += (
            f"Candidate {i}\n"
            f"Code: {candidate['code']}\n"
            f"Description: {candidate['description']}\n"
            f"GST Rate: {candidate.get('gst_rate', 'N/A')}\n\n"
        )

    prompt = f"""
You are an expert assistant for Indian GST HSN classification.

The user has described a product.
A vector search has already selected the five most relevant HSN codes.

Your job is ONLY to rank these candidates.

User Description:
{query}

Candidate HSN Codes:

{formatted_candidates}

Instructions:
You must respond ONLY in English.

Return valid JSON.

The confidence field must be one of:
"95", "90", "85"
or
"High", "Medium", "Low"

The reason must be written in English.

Do not use any other language.

IMPORTANT:
You must return the exact candidate number.
Do not modify, shorten, format, or generate new codes.

- Rank ONLY the best 3 candidates.
- Use ONLY the candidates provided.
- Never invent a new HSN code.

For every result provide:
- candidate_id (ONLY the number from the candidate list)
- confidence
- reason

Do NOT return the HSN code.
Do NOT return GST rate.
The application will attach GST rate after ranking.

- If uncertain, choose the closest candidate and lower the confidence.
- Return ONLY valid JSON.
- Do not include markdown.
- Do not include code fences.
- Do not include extra text.

Return exactly this structure:

{{
  "ranked": [
    {{
      "candidate_id": 1,
      "confidence": "",
      "reason": ""
    }}
  ]
}}
"""

    response = client.chat(
    model="gpt-oss:20b-cloud",
    messages=[
        {
            "role": "user",
            "content": prompt
        }
    ]
)

    result = json.loads(response["message"]["content"])

    final_ranked = []

    for item in result.get("ranked", []):

        if "candidate_id" in item:
            candidate_id = item["candidate_id"]

            if isinstance(candidate_id, int) and 1 <= candidate_id <= len(candidates):
                selected_candidate = candidates[candidate_id - 1]
                item["code"] = selected_candidate["code"]
                item["gst_rate"] = selected_candidate.get("gst_rate")

        elif "code" in item:
            item["gst_rate"] = next(
                (
                    candidate.get("gst_rate")
                    for candidate in candidates
                    if candidate["code"] == item["code"]
                ),
                None
            )

        else:
            continue

        item.pop("candidate_id", None)
        final_ranked.append(item)

    result["ranked"] = final_ranked

    return result