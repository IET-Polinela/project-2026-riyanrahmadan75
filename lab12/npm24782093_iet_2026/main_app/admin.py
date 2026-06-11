from django.contrib import admin
from .models import Report

@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    # Kolom yang tampil di daftar laporan admin
    # 'reporter' menggantikan 'user' agar sesuai dengan models.py Lab 9
    list_display = ('title', 'category', 'location', 'status', 'reporter', 'created_at')
    
    # Fitur filter di sisi kanan halaman admin
    list_filter = ('status', 'category')
    
    # Fitur pencarian berdasarkan judul dan lokasi
    search_fields = ('title', 'location')