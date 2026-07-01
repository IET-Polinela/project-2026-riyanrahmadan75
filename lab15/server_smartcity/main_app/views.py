from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse_lazy
from django.contrib import messages
from django.contrib.auth import login, logout
from django.contrib.auth.views import LoginView
from django.contrib.auth.mixins import UserPassesTestMixin, LoginRequiredMixin
from django.contrib.auth.decorators import login_required
from django.views.generic import ListView, CreateView, UpdateView, DetailView, DeleteView
from django.db.models import Q
from django.http import Http404, JsonResponse

from rest_framework import viewsets, filters, permissions
from rest_framework.pagination import PageNumberPagination
from rest_framework.decorators import api_view
from rest_framework.response import Response

from drf_spectacular.utils import extend_schema

from .models import Report
from .forms import RegisterForm
from .serializers import ReportSerializer


# ══════════════════════════════════════════════════════════
#  API REST FRAMEWORK
# ══════════════════════════════════════════════════════════

class ReportPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


class IsOwnerAndDraftOrReadOnly(permissions.BasePermission):
    """
    - SAFE_METHODS (GET, HEAD, OPTIONS): semua user login boleh
    - Modifikasi (PUT, PATCH, DELETE):
        - Admin/superuser: boleh ubah apapun
        - Warga: hanya boleh ubah miliknya sendiri DAN statusnya masih DRAFT
    """
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        if request.user.is_superuser or request.user.is_staff:
            return True
        return obj.reporter == request.user and obj.status == 'DRAFT'


@extend_schema(tags=['Reports'])
class ReportViewSet(viewsets.ModelViewSet):
    serializer_class   = ReportSerializer
    pagination_class   = ReportPagination
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerAndDraftOrReadOnly]
    filter_backends    = [filters.SearchFilter]
    search_fields      = ['title', 'location', 'description', 'category']

    def get_queryset(self):
        user     = self.request.user
        queryset = Report.objects.all().order_by('-updated_at')
        tab      = self.request.query_params.get('tab', None)

        if tab == 'my_reports':
            return queryset.filter(reporter=user) if user.is_authenticated else Report.objects.none()

        if tab == 'feed':
            # Feed publik: semua laporan non-DRAFT
            return queryset.exclude(status='DRAFT')

        # Default (tanpa tab): admin lihat semua, warga lihat milik sendiri + non-DRAFT
        if user.is_authenticated:
            if user.is_superuser or user.is_staff:
                return queryset
            return queryset.filter(Q(reporter=user) | ~Q(status='DRAFT'))
        return queryset.exclude(status='DRAFT')

    def perform_create(self, serializer):
        if self.request.user.is_authenticated:
            serializer.save(reporter=self.request.user)
        else:
            serializer.save()


@api_view(['GET'])
def report_detail_api(request, pk):
    try:
        report     = Report.objects.get(pk=pk)
        serializer = ReportSerializer(report, context={'request': request})
        return Response(serializer.data)
    except Report.DoesNotExist:
        raise Http404()


# ══════════════════════════════════════════════════════════
#  HALAMAN TEMPLATE DJANGO
# ══════════════════════════════════════════════════════════

def home_landing_view(request):
    return render(request, 'main_app/home.html')


class ReportListView(LoginRequiredMixin, ListView):
    login_url            = 'login'
    model                = Report
    template_name        = 'main_app/laporan.html'
    context_object_name  = 'reports'

    def get_queryset(self):
        user = self.request.user
        # Admin / superuser: hanya lihat laporan NON-DRAFT (REPORTED ke atas)
        # DRAFT adalah milik pribadi warga — admin tidak berhak melihatnya
        if user.is_superuser or user.is_staff:
            return Report.objects.exclude(status='DRAFT').order_by('-created_at')
        # Warga: laporan milik sendiri (termasuk DRAFT) + non-DRAFT milik warga lain
        return Report.objects.filter(
            Q(reporter=user) | ~Q(status='DRAFT')
        ).order_by('-created_at')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        user = self.request.user
        # Statistik hanya dari laporan non-DRAFT (yang bisa dilihat admin maupun publik)
        visible = Report.objects.exclude(status='DRAFT')
        context['stat_total']    = visible.count()
        context['stat_diproses'] = visible.filter(status__in=['REPORTED', 'VERIFIED', 'IN_PROGRESS']).count()
        context['stat_selesai']  = visible.filter(status='RESOLVED').count()
        # Jumlah draft: hanya tampilkan milik warga sendiri (bukan total semua draft)
        if not (user.is_superuser or user.is_staff):
            context['stat_draft'] = Report.objects.filter(reporter=user, status='DRAFT').count()
        else:
            context['stat_draft'] = '-'   # admin tidak perlu tahu jumlah draft warga
        return context


class ReportDetailView(DetailView):
    model             = Report
    template_name     = 'main_app/laporan.html'
    context_object_name = 'report'


class ReportSearchView(ListView):
    model             = Report
    template_name     = 'main_app/laporan.html'
    context_object_name = 'reports'

    def get_queryset(self):
        query = self.request.GET.get('q', '').strip()
        if query:
            return Report.objects.filter(
                Q(title__icontains=query) | Q(description__icontains=query)
            ).exclude(status='DRAFT')
        return Report.objects.none()

    def render_to_response(self, context, **response_kwargs):
        # UI-02 test: selalu return JSON dari endpoint /search/?q=
        qs = self.get_queryset()
        data = list(qs.values('id', 'title', 'category', 'location', 'status', 'description'))
        return JsonResponse({'results': data, 'count': len(data)})


class ReportCreateView(UserPassesTestMixin, CreateView):
    model         = Report
    template_name = 'main_app/add_report.html'
    fields        = ['title', 'category', 'description', 'location']
    success_url   = reverse_lazy('report_list')

    def test_func(self):
        return self.request.user.is_authenticated and not self.request.user.is_superuser

    def handle_no_permission(self):
        messages.error(self.request, "Admin tidak diizinkan membuat laporan!")
        return redirect('report_list')

    def form_valid(self, form):
        form.instance.reporter = self.request.user
        form.instance.status   = 'REPORTED'
        messages.success(self.request, "Laporan berhasil ditambahkan!")
        return super().form_valid(form)


class ReportUpdateView(UserPassesTestMixin, UpdateView):
    model         = Report
    template_name = 'main_app/add_report.html'
    success_url   = reverse_lazy('report_list')

    def get_fields(self):
        # FIX: Admin bisa ubah status; warga biasa tidak bisa
        if self.request.user.is_superuser or self.request.user.is_staff:
            return ['title', 'category', 'description', 'location', 'status']
        return ['title', 'category', 'description', 'location']

    # get_form_class butuh fields — override get_form agar get_fields() terpanggil
    def get_form(self, form_class=None):
        self.fields = self.get_fields()
        return super().get_form(form_class)

    def test_func(self):
        return self.request.user.is_superuser or self.request.user.is_staff

    def handle_no_permission(self):
        messages.error(self.request, "Hanya admin yang boleh mengedit!")
        return redirect('report_list')

    def form_valid(self, form):
        messages.success(self.request, "Laporan berhasil diperbarui!")
        return super().form_valid(form)


class ReportDeleteView(UserPassesTestMixin, DeleteView):
    model         = Report
    success_url   = reverse_lazy('report_list')
    template_name = 'main_app/report_confirm_delete.html'

    def test_func(self):
        return self.request.user.is_superuser

    def handle_no_permission(self):
        messages.error(self.request, "Hanya admin yang bisa menghapus!")
        return redirect('report_list')


def update_status(request, pk):
    if not (request.user.is_staff or request.user.is_superuser):
        messages.error(request, "Hanya admin yang bisa mengubah status!")
        return redirect('report_list')
    report        = get_object_or_404(Report, pk=pk)
    report.status = request.POST.get('status')
    report.save()
    messages.success(request, "Status berhasil diperbarui!")
    return redirect('report_list')


# ── Auth ──────────────────────────────────────────────────

def register_view(request):
    if request.method == 'POST':
        form = RegisterForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            messages.success(request, f"Registrasi berhasil! Selamat datang, {user.username}")
            return redirect('report_list')
    else:
        form = RegisterForm()
    return render(request, 'register.html', {'form': form})


class CustomLoginView(LoginView):
    template_name = 'login.html'

    def form_valid(self, form):
        user = form.get_user()
        label = "Admin" if (user.is_superuser or user.is_staff) else "Citizen"
        messages.success(self.request, f"Selamat datang, {label} {user.username}!")
        return super().form_valid(form)


def logout_view(request):
    logout(request)
    messages.success(request, "Logout berhasil. Terima kasih! 👋")
    return redirect('login')


def about(request):
    return render(request, 'main_app/about.html')


def contacts(request):
    return render(request, 'main_app/contacts.html')


@login_required(login_url='login')
def dashboard_view(request):
    if not (request.user.is_staff or request.user.is_superuser):
        messages.error(request, "Maaf, Dashboard hanya bisa diakses oleh Admin.")
        return redirect('home')
    reports = Report.objects.all()
    return render(request, 'main_app/dashboard.html', {'reports': reports})