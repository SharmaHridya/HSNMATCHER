from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from hsnManager.management.commands.generate_embeddings import get_candidates
from hsnManager.management.commands.generate_embeddings import model
from .models import HSNCode
from django.shortcuts import get_object_or_404

# Create your views here.

@api_view(['POST'])
def classify(request):
    query=request.data.get('description')
    if not query:
        return Response({"error": "Description is required."}, status=400)
    try:
        embedding = model.encode(query).tolist()
    except Exception:
        return Response(
            {"error": "Embedding service unavailable"},
            status=503
        )
    candidates = get_candidates(embedding)

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
