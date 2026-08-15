from xml.parsers.expat import model

from django.utils import text
from dotenv import load_dotenv
load_dotenv()

from django.core.management.base import BaseCommand
from django.db import connection
from hsnManager.models import HSNCode
from sentence_transformers import SentenceTransformer
from hsnManager.management.commands.generate_embeddings import get_model
_model = None

def get_model():
    global _model
    if _model is None:
        _model = SentenceTransformer("BAAI/bge-small-en-v1.5")
    return _model

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
        model = get_model()
        rows = HSNCode.objects.filter(embedding__isnull=True)

        for row in rows:
            try:
                model = get_model()
                embedding = model.encode(text, normalize_embeddings=True)
                row.embedding = embedding.tolist()
                row.save(update_fields=["embedding"])
                self.stdout.write(f"Embedded {row.code}")
            except Exception as e:
                self.stderr.write(f"Failed {row.code}: {e}")