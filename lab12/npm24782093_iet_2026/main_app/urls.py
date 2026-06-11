# main_app/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ReportViewSet, CustomLoginView, register_view, logout_view, 
    about, contacts, ReportListView, ReportCreateView, ReportUpdateView, delete_report, update_status
)

# Inisialisasi router otomatis DRF untuk ViewSet Lab 12
router = DefaultRouter(trailing_slash=False)
router.register(r'report', ReportViewSet, basename='report')

urlpatterns = [
    # 🛠️ Jalur Utama API ViewSet Terpusat (Lab 12)
    path('api/', include(router.urls)),
    
    # 🔐 Jalur Autentikasi dan Halaman Monolitik Lama Kamu (Dipertahankan agar tidak error)
    path('', ReportListView.as_view(), name='home'),
    path('report/add/', ReportCreateView.as_view(), name='add_report'),
    path('report/<int:pk>/edit/', ReportUpdateView.as_view(), name='edit_report'),
    path('report/<int:pk>/delete/', delete_report, name='delete_report'),
    path('report/<int:pk>/status/', update_status, name='update_status'),
    path('register/', register_view, name='register'),
    path('login/', CustomLoginView.as_view(), name='login'),
    path('logout/', logout_view, name='logout'),
    path('about/', about, name='about'),
    path('contacts/', contacts, name='contacts'),
]