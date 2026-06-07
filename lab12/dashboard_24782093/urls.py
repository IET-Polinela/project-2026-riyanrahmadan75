from django.urls import path
from .views import (
    DashboardView,
    report_status_api,
    report_category_api,
    latest_reports_api,
    search_reports_api,
    report_detail_api
)

urlpatterns = [
    path('', DashboardView.as_view(), name='dashboard'),

    path('api/status/', report_status_api),
    path('api/category/', report_category_api),
    path('api/latest/', latest_reports_api),

    path('api/search/', search_reports_api),
    path('api/detail/<int:pk>/', report_detail_api),
]