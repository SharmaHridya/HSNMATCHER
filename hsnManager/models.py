from django.db import models

# Create your models here.
class HSNCode(models.Model):
      code = models.CharField(max_length=8, unique=True, db_index=True)
      description = models.TextField()
      # Nullable: the official HSN/SAC master has no rates; rates are merged
      # from a separate schedule and won't cover every code.
      gst_rate = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
      code_type = models.CharField(choices=[("HSN", "Goods"), ("SAC", "Services")], max_length=3)

      def __str__(self):
            return f"{self.code} - {self.description[:60]}"