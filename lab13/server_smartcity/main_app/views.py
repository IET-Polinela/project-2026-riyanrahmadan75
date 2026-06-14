from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse_lazy
from django.contrib import messages
from django.contrib.auth import login, logout
from django.contrib.auth.views import LoginView
from django.contrib.auth.mixins import UserPassesTestMixin, LoginRequiredMixin
from django.contrib.auth.decorators import login_required
from django.views.generic import ListView, CreateView, UpdateView
from django.db.models import Q

from rest_framework import viewsets
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated, AllowAny

from .models import Report
from .forms import RegisterForm
from .serializers import ReportSerializer

# ==========================================
# API REST FRAMEWORK CONFIG (LAB 10)
# ==========================================

class ReportPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class ReportViewSet(viewsets.ModelViewSet):
    serializer_class = ReportSerializer
    pagination_class = ReportPagination
    permission_classes = [AllowAny]

    def get_queryset(self):
        user = self.request.user
        # Mengurutkan dari aduan yang paling baru diperbarui/dibuat
        queryset = Report.objects.all().order_by('-updated_at')
        tab = self.request.query_params.get('tab', None)
        
        if tab == 'my_reports':
            # 🔒 TAB LAPORAN SAYA: Hanya menampilkan laporan milik user yang sedang login
            if user.is_authenticated:
                return queryset.filter(reporter=user)
            else:
                # Jika belum login/anonim, amankan dengan mengembalikan data kosong []
                return Report.objects.none()
                
        elif tab == 'feed':
            # 🔓 TAB FEED KOTA (PUBLIK): Menampilkan semua aduan masyarakat yang bukan DRAFT
            # Termasuk aduan milik kita sendiri yang sudah dipublikasikan (bukan DRAFT)
            return queryset.exclude(status='DRAFT')
                
        else:
            # Jalur pengaman alternatif jika parameter tab tidak dikirim oleh frontend
            if user.is_authenticated:
                return queryset.filter(Q(reporter=user) | ~Q(status='DRAFT'))
            else:
                return queryset.exclude(status='DRAFT')

    def perform_create(self, serializer):
        # Otomatis mengikat pembuat laporan ke user yang sedang login
        if self.request.user.is_authenticated:
            serializer.save(reporter=self.request.user)
        else:
            serializer.save()

# ==========================================
# CORE VIEW INTERFACE TEMPLATE
# ==========================================

def home_landing_view(request):
    if not request.user.is_authenticated:
        return redirect('login')
    return render(request, 'main_app/home.html')

class ReportListView(LoginRequiredMixin, ListView):
    login_url = 'login'
    model = Report
    template_name = 'main_app/laporan.html'
    context_object_name = 'reports'

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return Report.objects.all().order_by('-created_at')
        if user.is_authenticated:
            return Report.objects.filter(Q(reporter=user) | ~Q(status='DRAFT')).order_by('-created_at')
        return Report.objects.filter(~Q(status='DRAFT')).order_by('-created_at')

class ReportCreateView(UserPassesTestMixin, CreateView):
    model = Report
    template_name = 'main_app/add_report.html'
    fields = ['title', 'category', 'description', 'location']
    success_url = reverse_lazy('reports_list')

    def test_func(self):
        return self.request.user.is_authenticated and not self.request.user.is_superuser

    def handle_no_permission(self):
        messages.error(self.request, "Admin tidak diizinkan membuat laporan!")
        return redirect('reports_list')

    def form_valid(self, form):
        form.instance.reporter = self.request.user
        form.instance.status = 'REPORTED'
        messages.success(self.request, "Laporan berhasil ditambahkan!")
        return super().form_valid(form)

class ReportUpdateView(UserPassesTestMixin, UpdateView):
    model = Report
    template_name = 'main_app/add_report.html'
    fields = ['title', 'category', 'description', 'location']
    success_url = reverse_lazy('reports_list')

    def test_func(self):
        return self.request.user.is_superuser

    def handle_no_permission(self):
        messages.error(self.request, "Hanya admin yang boleh mengedit!")
        return redirect('reports_list')

    def form_valid(self, form):
        messages.success(self.request, "Laporan berhasil diperbarui!")
        return super().form_valid(form)

def delete_report(request, pk):
    if not request.user.is_superuser:
        messages.error(request, "Hanya admin yang bisa menghapus!")
        return redirect('reports_list')
    report = get_object_or_404(Report, pk=pk)
    report.delete()
    messages.success(request, "Laporan berhasil dihapus!")
    return redirect('reports_list')

def update_status(request, pk):
    if not request.user.is_superuser:
        messages.error(request, "Hanya admin yang bisa mengubah status!")
        return redirect('reports_list')
    report = get_object_or_404(Report, pk=pk)
    report.status = request.POST.get('status')
    report.save()
    messages.success(request, "Status berhasil diperbarui!")
    return redirect('reports_list')

def register_view(request):
    if request.method == 'POST':
        form = RegisterForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            messages.success(request, f"Registrasi berhasil! Selamat datang, Citizen {user.username}")
            return redirect('reports_list')
    else:
        form = RegisterForm()
    return render(request, 'register.html', {'form': form})

class CustomLoginView(LoginView):
    template_name = 'login.html'
    def form_valid(self, form):
        user = form.get_user()
        if user.is_superuser or user.is_staff:
            messages.success(self.request, f"Selamat datang, Admin {user.username}!")
        else:
            messages.success(self.request, f"Selamat datang, Citizen {user.username}!")
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
    reports = Report.objects.all()
    return render(request, 'main_app/dashboard.html', {'reports': reports})