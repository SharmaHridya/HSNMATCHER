from hsnManager.models import HSNCode
from dotenv import load_dotenv

load_dotenv()

from openai import OpenAI

client = OpenAI()

rows = HSNCode.objects.filter(embedding__isnull=True)

for row in rows:
    text = row.description
    response = client.embeddings.create(
    model="text-embedding-3-small",
    input=text
    )
    embedding = response.data[0].embedding
    row.embedding = embedding
    row.save()
