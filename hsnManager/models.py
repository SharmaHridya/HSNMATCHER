from django.db import models

# Create your models here.
class HSNCode(models.Model):
      code = models.CharField(max_length=8, unique=True, db_index=True)
      description = models.TextField()
      gst_rate = models.DecimalField(max_digits=5, decimal_places=2)
      code_type = models.CharField(choices=[("HSN", "Goods"), ("SAC", "Services")], max_length=3)