from django.db.models import query
from rest_framework.decorators import api_view
from rest_framework.response import Response
from hsnManager.management.commands.generate_embeddings import (
    get_candidates,
    get_model,
)
from .models import HSNCode
from django.shortcuts import get_object_or_404
from .utils import rerank
import time
import pandas as pd
from django.http import HttpResponse
from .models import ClassificationQuery, ClassificationCorrection
# Create your views here.
@api_view(["POST"])
def correction(request):
    query_id = request.data.get("query_id")
    submitted_code = request.data.get("submitted_code")

    if not query_id or not submitted_code:
        return Response(
            {"error": "query_id and submitted_code are required"},
            status=400
        )

    query = get_object_or_404(
        ClassificationQuery,
        id=query_id
    )

    correction = ClassificationCorrection.objects.create(
        query=query,
        submitted_code=submitted_code
    )

    return Response({
        "message": "Correction saved",
        "query_id": query.id,
        "submitted_code": correction.submitted_code
    })

@api_view(['POST'])
def classify(request):
    print("CLASSIFY START")
    candidates = []
    start_time = time.perf_counter()

    query = request.data.get('description')

    if not query:
        return Response(
            {"error": "Description is required."},
            status=400
        )

    try:
        embed_start = time.perf_counter()
        embedding = get_model().encode(query).tolist()
        embedding_time = time.perf_counter() - embed_start

    except Exception as e:
        return Response(
            {
                "error": "Embedding service unavailable",
                "details": str(e)
            },
            status=503
        )
    
    try:
        search_start = time.perf_counter()
        candidates = get_candidates(embedding)
        print(candidates)
        DISTANCE_THRESHOLD = 0.70
         # Tune this experimentally
        if not candidates or candidates[0]["distance"] > DISTANCE_THRESHOLD:
            return Response({
        "query_id": None,
        "ranked": [],
        "status": "no_confident_match",
        "message": "No sufficiently similar HSN/SAC code found. Please provide a more specific product description."
    })
        search_time = time.perf_counter() - search_start

        rerank_start = time.perf_counter()
        ranked = rerank(query, candidates)
        rerank_time = time.perf_counter() - rerank_start
        predicted = None

        # Get predicted HSN object safely
        if ranked.get("ranked"):
            predicted_code = ranked["ranked"][0].get("code")

            try:
                predicted = HSNCode.objects.get(
                    code=predicted_code
                )
            except HSNCode.DoesNotExist:
                predicted = None

        classification_query = ClassificationQuery.objects.create(
            query_text=query,
            embedding=embedding,
            predicted_code=predicted,
            candidates=candidates,
        )

        total_time = time.perf_counter() - start_time
        print("CLASSIFY RETURN")

        return Response({
            "query_id": classification_query.id,
            "ranked": ranked.get("ranked", []),
            "timing": {
                "embedding_time": embedding_time,
                "search_time": search_time,
                "rerank_time": rerank_time,
                "total_time": total_time
            }
        })

    except Exception as e:

        print("CLASSIFY ERROR:", e)

        # Save failed classification also
        classification_query = ClassificationQuery.objects.create(
            query_text=query,
            embedding=embedding,
            predicted_code=None,
            candidates=candidates,
        )

        return Response(
            {
                "error": str(e),
                "query_id": classification_query.id,
                "candidates": candidates
            },
            status=500
        )
    

@api_view(["GET"])

def hsn_lookup(request, code=None):
    if code is None:
        # handle the "no code provided" case — e.g. return a list, or a 400
        return Response({"detail": "code parameter is required"}, status=400)

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
    if df.empty:
        return Response(
        {"error": "CSV contains no data rows."},
        status=400
    )
    if "description" not in df.columns:
        return Response(
            {"error": "CSV must contain a 'description' column"},
            status=400
        )
    results = []
    for _, row in df.iterrows():
        try:
            query = row["description"]
            embedding = get_model().encode(query).tolist()
            candidates = get_candidates(embedding)
            ranked = rerank(query, candidates)
            if ranked.get("ranked"):
                best = ranked["ranked"][0]
                results.append({
        "description": query,
        "predicted_code": best["code"],
        "confidence": best["confidence"],
        "status": "Success"
    })
            else:
                results.append({
        "description": query,
        "predicted_code": "",
        "confidence": "",
        "status": "Failed"
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