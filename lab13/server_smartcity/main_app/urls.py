# main_app/urls.py
from django.urls import path
from . import views  # Mengimpor seluruh fungsi view dari views.py

urlpatterns = [
    # 🌆 1. Jalur Halaman Utama / Root URL (Landing Page Kata-Kata Sambutan Indah)
    path('', views.home_landing_view, name='home'),
    
    # 📋 2. Jalur Khusus Menu Reports (Menampilkan Kartu Statistik & Tabel Daftar Laporan)
    path('reports/', views.ReportListView.as_view(), name='reports_list'),
    
    # 📊 3. Jalur Dashboard Analisis Grafik (Chart.js modern)
    path('dashboard/', views.dashboard_view, name='dashboard'),
    
    # 🛠️ 4. Jalur Manajemen CRUD Laporan
    path('add/', views.ReportCreateView.as_view(), name='add_report'),
    path('update/<int:pk>/', views.ReportUpdateView.as_view(), name='update_report'),
    path('delete/<int:pk>/', views.delete_report, name='delete_report'),
    path('update_status/<int:pk>/', views.update_status, name='update_status'),
    
    # 🔐 5. Jalur Autentikasi Akun
    path('register/', views.register_view, name='register'),
    path('login/', views.CustomLoginView.as_view(), name='login'),
    path('logout/', views.logout_view, name='logout'),
    
    # 📄 6. Jalur Halaman Statis Bawaan Lab
    path('about/', views.about, name='about'),
    path('contacts/', views.contacts, name='contacts'),
]