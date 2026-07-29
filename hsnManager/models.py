from django.db import models
from pgvector.django import VectorField

class HSNCode(models.Model):
    code = models.CharField(max_length=8, unique=True, db_index=True)
    description = models.TextField()

    gst_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
    )

    code_type = models.CharField(
        choices=[("HSN", "Goods"), ("SAC", "Services")],
        max_length=3,
    )

    embedding = VectorField(
                        dimensions=384,
                        null=True,
                        blank=True,
                    )

    def __str__(self):
        return f"{self.code} - {self.description[:60]}"