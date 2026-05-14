from rest_framework.routers import DefaultRouter
from .api_views import ReportViewSet

# Membuat objek router secara otomatis
router = DefaultRouter()

# Mendaftarkan ViewSet ke dalam router dengan nama 'report'
# Ini akan otomatis membuat URL seperti /api/report/ dan /api/report/id/
router.register(r'report', ReportViewSet, basename='report')

# Mengatur agar urlpatterns menggunakan daftar URL yang dihasilkan oleh router
urlpatterns = router.urls