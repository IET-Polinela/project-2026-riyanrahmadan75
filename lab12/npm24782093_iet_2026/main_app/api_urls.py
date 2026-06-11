from django.urls import path
from rest_framework.routers import DefaultRouter
from .api_views import ReportViewSet, RegisterAPIView

# Membuat objek router secara otomatis
router = DefaultRouter()

# Mendaftarkan ViewSet ke dalam router dengan nama 'report'
# Ini akan otomatis membuat URL seperti /api/reports/ dan /api/reports/id/
router.register(r'reports', ReportViewSet, basename='report')

# Menambahkan endpoint API registrasi di luar router
urlpatterns = router.urls + [
    path('register/', RegisterAPIView.as_view(), name='api-register'),
]