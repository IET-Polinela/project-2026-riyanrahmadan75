from django.contrib import admin
from django.urls import path, include
from main_app.views import CustomLoginView, logout_view

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # 1. Rute Auth (Login & Logout)
    path('login/', CustomLoginView.as_view(), name='login'),
    path('logout/', logout_view, name='logout'),

    # 2. Rute API Lab 9
    path('api/', include('main_app.api_urls')),

    # 3. Rute Dashboard Lab 8
    path('dashboard/', include('dashboard_24782093.urls')),

    # 4. Rute Utama (Home, Register, About, Contact)
    # PENTING: Gunakan namespace atau pastikan include benar
    path('', include('main_app.urls')),
]