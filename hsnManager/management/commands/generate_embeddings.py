import os
from dotenv import load_dotenv

load_dotenv()
from django.core.management.base import BaseCommand
from openai import OpenAI
from hsnManager.models import HSNCode

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

class Command(BaseCommand):
    help = "Generate embeddings for HSN descriptions"

    def handle(self, *args, **options):
        rows = HSNCode.objects.filter(embedding__isnull=True)

        for row in rows:
            response = client.embeddings.create(
                model="text-embedding-3-small",
                input=row.description,
            )

            row.embedding = response.data[0].embedding
            row.save(update_fields=["embedding"])

            self.stdout.write(f"Embedded {row.code}")