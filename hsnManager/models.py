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
class ClassificationQuery(models.Model):
    query_text = models.TextField()

    predicted_code = models.ForeignKey(
        HSNCode,
        on_delete=models.SET_NULL,
        null=True,
        related_name="predictions"
    )

    candidates = models.JSONField()

    created_at = models.DateTimeField(auto_now_add=True)
    embedding = VectorField(
    dimensions=384,
    null=True,
    blank=True,
)
    

class ClassificationCorrection(models.Model):
    query = models.OneToOneField(
        ClassificationQuery,
        on_delete=models.CASCADE,
        related_name="correction"
    )

    submitted_code = models.CharField(max_length=20)
    submitted_at = models.DateTimeField(auto_now_add=True)
    