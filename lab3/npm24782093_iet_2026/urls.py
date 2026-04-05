from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('main_app.urls')),
    path('about/', include('about.urls')),       # ← TAMBAH INI
    path('contacts/', include('contacts.urls')), # ← TAMBAH INI
]