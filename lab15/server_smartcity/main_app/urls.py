from django.urls import path, include  
from rest_framework.routers import DefaultRouter  
from . import views

# 3. Buat Router Otomatis untuk menciduk ReportViewSet dari views.py
router = DefaultRouter()
# EDIT: 'reports' diubah jadi 'report' agar sinkron dengan test API (api_report-detail)
router.register('report', views.ReportViewSet, basename='api_report')

urlpatterns = [
    # 🌆 1. Jalur Halaman Utama / Root URL (Landing Page Kata-Kata Sambutan Indah)
    path('', views.home_landing_view, name='home'),
    
    # 📋 2. Jalur Khusus Menu Reports (Menampilkan Kartu Statistik & Tabel Daftar Laporan)
    # EDIT: name='' diubah jadi 'report_list' karena test dosen nyarinya tanpa 's'
    path('reports/', views.ReportListView.as_view(), name='report_list'),
    
    # TAMBAHAN: Dua jalur ini wajib ada karena dipanggil oleh file test_addtional.py
    path('reports/<int:pk>/', views.ReportDetailView.as_view(), name='report_detail'),
    path('search/', views.ReportSearchView.as_view(), name='report_search'),
    
    # 📊 3. Jalur Dashboard Analisis Grafik (Chart.js modern)
    path('dashboard/', views.dashboard_view, name='dashboard'),
    
    # 🛠️ 4. Jalur Manajemen CRUD Laporan
    path('add/', views.ReportCreateView.as_view(), name='add_report'),
    path('update/<int:pk>/', views.ReportUpdateView.as_view(), name='update_report'),
    # EDIT: delete_report diubah ke ReportDeleteView.as_view() karena dites spesifik oleh file test
    path('delete/<int:pk>/', views.ReportDeleteView.as_view(), name='delete_report'),
    path('update_status/<int:pk>/', views.update_status, name='update_status'),
    
    # 🔐 5. Jalur Autentikasi Akun
    path('register/', views.register_view, name='register'),
    path('login/', views.CustomLoginView.as_view(), name='login'),
    path('logout/', views.logout_view, name='logout'),
    
    # 📄 6. Jalur Halaman Statis Bawaan Lab
    path('about/', views.about, name='about'),
    path('contacts/', views.contacts, name='contacts'),

    # 🌐 7. JALUR UTAMA API (Menghubungkan Frontend JS Smart Citizen ke Backend)
    # Jalur ini otomatis menciptakan alamat: /api/reports/ 
    path('api/', include(router.urls)),
]