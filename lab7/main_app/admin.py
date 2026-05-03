from django.contrib import admin
from .models import Report


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'location', 'status', 'user', 'created_at')
    list_filter = ('status', 'category')
    search_fields = ('title', 'location')