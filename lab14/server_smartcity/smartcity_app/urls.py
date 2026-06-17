from django.contrib import admin
from django.urls import path, include
from main_app.views import CustomLoginView, logout_view

# 1. IMPORT VIEWS DARI SIMPLEJWT UNTUK REST API
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

# 🌟 IMPORT DOKUMENTASI API (LAB 14) 
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from django_scalar.views import scalar_viewer

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
    path('', include('main_app.urls')),

    # 🔥 5. ENDPOINT JWT AUTHENTICATION
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # 🌟 6. PATH DOKUMENTASI API (LAB 14)
    # Endpoint untuk generate skema [cite: 58]
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    
    # Endpoint Swagger UI [cite: 59, 60]
    path('api/docs/swagger/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    
    # Endpoint Scalar UI [cite: 62]
    path('api/docs/scalar/', scalar_viewer, name='scalar-ui'),
]