from django.contrib import admin
from django.urls import path, include
from main_app.views import CustomLoginView, logout_view

urlpatterns = [
    path('admin/', admin.site.urls),

    path('', include('main_app.urls')),

    path('dashboard/', include('dashboard_24782093.urls')),  # 🔥 TAMBAHAN

    path('login/', CustomLoginView.as_view(), name='login'),
    path('logout/', logout_view, name='logout'),
]