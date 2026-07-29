import os
from dotenv import load_dotenv

load_dotenv()

from django.core.management.base import BaseCommand
from hsnManager.models import HSNCode
from sentence_transformers import SentenceTransformer

model = SentenceTransformer("BAAI/bge-small-en-v1.5")

class Command(BaseCommand):
    help = "Generate embeddings for HSN descriptions"

    def handle(self, *args, **options):
        rows = HSNCode.objects.filter(embedding__isnull=True)

        for row in rows:
            try:
                embedding = model.encode(
                    row.description,
                    normalize_embeddings=True,
                )
                row.embedding = embedding.tolist()
                row.save(update_fields=["embedding"])

                self.stdout.write(f"Embedded {row.code}")

            except Exception as e:
                self.stderr.write(f"Failed {row.code}: {e}")