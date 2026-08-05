from rest_framework.decorators import api_view
from rest_framework.response import Response
from hsnManager.management.commands.generate_embeddings import get_candidates
from hsnManager.management.commands.generate_embeddings import model
from .models import HSNCode
from django.shortcuts import get_object_or_404
from .utils import rerank
import time
import pandas as pd
from django.http import HttpResponse
from .models import ClassificationQuery
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
        predicted = None
        if ranked["ranked"]:
            predicted = HSNCode.objects.get(code=ranked["ranked"][0]["code"])
        ClassificationQuery.objects.create(
                    query_text=query,
                    embedding=embedding,
                    predicted_code=predicted,
                    candidates=candidates,
                )
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
        predicted = None
        if candidates:
            predicted = HSNCode.objects.get(code=candidates[0]["code"])
        ClassificationQuery.objects.create(
            query_text=query,
            embedding=embedding,
            predicted_code=predicted,
            candidates=candidates,

    )
        return Response({
            "disclaimer": "Suggestion only. Not a filing-ready GST determination.",
            "best": candidates[0]["code"],
            "timing": {
                "embedding_time": embedding_time,
                "search_time": search_time,
                "rerank_time": None,
                "total_time": time.perf_counter() - start_time
            }
        })
    

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
@api_view(["POST"])
def classify_bulk(request):
    start_time = time.perf_counter()
    csv_file = request.FILES.get("file")
    if not csv_file:
        return Response(
        {"error": "CSV file required"},
        status=400
    )
    
    df = pd.read_csv(csv_file)
    if "description" not in df.columns:
        return Response(
            {"error": "CSV must contain a 'description' column"},
            status=400
        )
    results = []
    for _, row in df.iterrows():
        try:
            query = row["description"]
            embedding = model.encode(query).tolist()
            candidates = get_candidates(embedding)
            ranked = rerank(query, candidates)
            best = ranked["ranked"][0]
            results.append({
                "description": query,
                "predicted_code": best["code"],
                "confidence": best["confidence"],
                "status": "Success"
            })
        except Exception:
            results.append({
                "description": query,
                "predicted_code": "",
                "confidence": "",
                "status": "Failed"
            })
    output = pd.DataFrame(results)
    response = HttpResponse(content_type="text/csv")
    response["Content-Disposition"] = 'attachment; filename="classified_output.csv"'
    response.write(output.to_csv(index=False))
    total_time = time.perf_counter() - start_time
    response["X-Processing-Time"] = f"{total_time:.2f}"
    return response