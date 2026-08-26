import os
import requests
from dotenv import load_dotenv
load_dotenv()

from django.core.management.base import BaseCommand
from django.db import connection
from hsnManager.models import HSNCode

JINA_URL = "https://api.jina.ai/v1/embeddings"

def get_embedding(text):
    response = requests.post(
        JINA_URL,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {os.getenv('JINA_API_KEY')}"
        },
        json={
            "model": "jina-embeddings-v3",
            "task": "text-matching",
            "dimensions": 768,
            "input": [text]
        }
    )
    response.raise_for_status()
    return response.json()["data"][0]["embedding"]

def get_candidates(query_embedding):
    query_embedding = "[" + ",".join(map(str, query_embedding)) + "]"

    with connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT code, description, gst_rate, embedding <-> %s::vector AS distance
            FROM "hsnManager_hsncode"
            ORDER BY embedding <-> %s::vector
            LIMIT 5;
            """,
            [query_embedding, query_embedding],
        )
        columns = [column[0] for column in cursor.description]
        results = []
        for row in cursor.fetchall():
            item = dict(zip(columns, row))
            if item["gst_rate"] is not None:
                item["gst_rate"] = float(item["gst_rate"])
            results.append(item)
        return results

class Command(BaseCommand):
    help = "Generate embeddings for HSN descriptions"

    def handle(self, *args, **options):
        rows = HSNCode.objects.filter(embedding__isnull=True)

        for row in rows:
            try:
                embedding = get_embedding(row.description)
                row.embedding = embedding
                row.save(update_fields=["embedding"])
                self.stdout.write(f"Embedded {row.code}")
            except Exception as e:
                self.stderr.write(f"Failed {row.code}: {e}")