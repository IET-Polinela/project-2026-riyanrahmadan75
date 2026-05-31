from django.urls import path
from . import views

urlpatterns = [
    path('', views.ReportListView.as_view(), name='home'),
    # Pastikan name di bawah ini sama dengan yang dipanggil di template
    path('add/', views.ReportCreateView.as_view(), name='add_report'), 
    path('edit/<int:pk>/', views.ReportUpdateView.as_view(), name='edit_report'),
    path('delete/<int:pk>/', views.delete_report, name='delete_report'),
    path('update-status/<int:pk>/', views.update_status, name='update_status'),
    path('register/', views.register_view, name='register'),
    path('about/', views.about, name='about'),
    path('contacts/', views.contacts, name='contacts'),
]