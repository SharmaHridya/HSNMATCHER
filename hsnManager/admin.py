from django.contrib import admin
from .models import HSNCode

# Register your models here.

@admin.register(HSNCode)
class HSNCodeAdmin(admin.ModelAdmin):
    list_display = ("code", "description", "gst_rate", "code_type")
    search_fields = ("code", "description")
    list_filter = ("gst_rate", "code_type")
    ordering = ("code",)

def __str__(self):
     return f"{self.code} - {self.description}"
