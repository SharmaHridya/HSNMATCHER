import json
from ollama import chat


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
            f"Description: {candidate['description']}\n\n"
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

- Rank ONLY the best 3 candidates.
- Use ONLY the candidates provided.
- Never invent a new HSN code.
- For every result provide:
  - code
  - confidence (High, Medium, Low)
  - reason (1-2 concise sentences)
- If uncertain, choose the closest candidate and lower the confidence.
- Return ONLY valid JSON.
- Do not include markdown.
- Do not include code fences.
- Do not include extra text.

Return exactly this structure:

{{
  "ranked": [
    {{
      "code": "",
      "confidence": "",
      "reason": ""
    }}
  ]
}}
"""

    response = chat(
        model="qwen2.5:3b",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    result = response["message"]["content"]

    return json.loads(result)