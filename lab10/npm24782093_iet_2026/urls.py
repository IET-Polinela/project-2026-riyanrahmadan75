from django.contrib import admin
from django.urls import path, include
from main_app.views import CustomLoginView, logout_view
#1. IMPORT VIEWS DARI SIMPLEJWT UNTUK REST API
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
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
    # 🔥 2. ENDPOINT JWT AUTHENTICATION (UNTUK POSTMAN)
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

]