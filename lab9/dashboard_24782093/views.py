from django.views.generic import TemplateView
from django.http import JsonResponse
from django.db.models import Count, Q
from main_app.models import Report


# ======================
# DASHBOARD PAGE
# ======================
class DashboardView(TemplateView):
    template_name = "dashboard_24782093/index.html"


# ======================
# API STATUS
# ======================
def report_status_api(request):
    data = Report.objects.values('status').annotate(total=Count('id'))
    result = {item['status']: item['total'] for item in data}
    return JsonResponse(result)


# ======================
# API CATEGORY
# ======================
def report_category_api(request):
    data = Report.objects.values('category').annotate(total=Count('id'))
    result = {
        item['category'] if item['category'] else 'Unknown': item['total']
        for item in data
    }
    return JsonResponse(result)


# ======================
# API LATEST
# ======================
def latest_reports_api(request):
    reported = list(
        Report.objects.filter(status='REPORTED')
        .order_by('-created_at')[:5]
        .values('id','title','location','status')
    )

    resolved = list(
        Report.objects.filter(status='RESOLVED')
        .order_by('-created_at')[:5]
        .values('id','title','location','status')
    )

    return JsonResponse({
        'reported': reported,
        'resolved': resolved
    })


# ======================
# LIVE SEARCH API
# ======================
def search_reports_api(request):
    query = request.GET.get('q', '')

    reports = Report.objects.filter(
        Q(title__icontains=query) |
        Q(location__icontains=query)
    ).values('id','title','location','status')[:10]

    return JsonResponse(list(reports), safe=False)


# ======================
# DETAIL API
def report_detail_api(request, pk):
    try:
        report = Report.objects.get(pk=pk)

        return JsonResponse({
            'title': report.title,
            'description': report.description,
            'location': report.location,
            'status': report.status,
            'category': report.category if hasattr(report, 'category') else 'Tidak ada',
        })

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)