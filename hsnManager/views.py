from django.db.models import query
from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from torch import embedding
from hsnManager.management.commands.generate_embeddings import get_candidates
from hsnManager.management.commands.generate_embeddings import model
from .models import HSNCode
from django.shortcuts import get_object_or_404
from .utils import rerank
import time

# Create your views here.

@api_view(['POST'])
def classify(request):
    start_time = time.perf_counter()
    query=request.data.get('description')
    if not query:
        return Response({"error": "Description is required."}, status=400)
    try:
        embed_start = time.perf_counter()
        embedding = model.encode(query).tolist()
        candidates = get_candidates(embedding)
        embedding_time = time.perf_counter() - embed_start
    except Exception:
        return Response(
            {"error": "Embedding service unavailable"},
            status=503
        )
    search_start = time.perf_counter()
    candidates = get_candidates(embedding)
    search_time = time.perf_counter() - search_start
    rerank_start = time.perf_counter()
    try:
        ranked = rerank(query, candidates)
        rerank_time = time.perf_counter() - rerank_start
        total_time = time.perf_counter() - start_time
        return Response({
            "ranked": ranked["ranked"],
            "timing": {
                "embedding_time": embedding_time,
                "search_time": search_time,
                "rerank_time": rerank_time,
                "total_time": total_time
            }
        })
    except Exception:
        ranked = {
        "ranked": [
            {
                "code": c["code"],
                "confidence": "Similarity",
                "reason": "unranked — explanation unavailable"
            }
            for c in candidates[:3]
        ]
    }

@api_view(["GET"])

def hsn_lookup(request, code):

    hsn = get_object_or_404(
        HSNCode,
        code=code
    )
    return Response({
        "code": hsn.code,
        "description": hsn.description

    })
