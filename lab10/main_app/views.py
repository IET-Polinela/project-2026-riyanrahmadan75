from django.views.generic import ListView, CreateView, UpdateView
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse_lazy
from django.contrib import messages
from django.contrib.auth import login, logout
from django.contrib.auth.mixins import UserPassesTestMixin
from django.contrib.auth.views import LoginView
from django.db.models import Q

from .models import Report
from .forms import RegisterForm


class ReportListView(ListView):
    model = Report
    template_name = 'main_app/home.html'
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
    success_url = reverse_lazy('home')

    def test_func(self):
        return self.request.user.is_superuser

    def handle_no_permission(self):
        messages.error(self.request, "Hanya admin yang boleh menambah laporan!")
        return redirect('home')

    def form_valid(self, form):
        # Update Lab 9: Menggunakan field 'reporter' sesuai model terbaru
        form.instance.reporter = self.request.user
        form.instance.status = 'REPORTED'
        messages.success(self.request, "Laporan berhasil ditambahkan!")
        return super().form_valid(form)


class ReportUpdateView(UserPassesTestMixin, UpdateView):
    model = Report
    template_name = 'main_app/add_report.html'
    fields = ['title', 'category', 'description', 'location']
    success_url = reverse_lazy('home')

    def test_func(self):
        return self.request.user.is_superuser

    def handle_no_permission(self):
        messages.error(self.request, "Hanya admin yang boleh mengedit laporan!")
        return redirect('home')

    def form_valid(self, form):
        messages.success(self.request, "Laporan berhasil diperbarui!")
        return super().form_valid(form)


def delete_report(request, pk):
    if not request.user.is_superuser:
        messages.error(request, "Hanya admin yang bisa menghapus!")
        return redirect('home')

    report = get_object_or_404(Report, pk=pk)
    report.delete()
    messages.success(request, "Laporan berhasil dihapus!")
    return redirect('home')


def update_status(request, pk):
    if not request.user.is_superuser:
        messages.error(request, "Hanya admin yang bisa mengubah status!")
        return redirect('home')

    report = get_object_or_404(Report, pk=pk)
    report.status = request.POST.get('status')
    report.save()
    messages.success(request, "Status berhasil diperbarui!")
    return redirect('home')


# 🔥 REGISTER DENGAN PESAN ROLE
def register_view(request):
    if request.method == 'POST':
        form = RegisterForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            messages.success(request, f"Registrasi berhasil! Selamat datang, Citizen {user.username}")
            return redirect('home')
    else:
        form = RegisterForm()

    return render(request, 'register.html', {'form': form})


# 🔥 LOGIN CUSTOM DENGAN DETEKSI ADMIN/CITIZEN
class CustomLoginView(LoginView):
    template_name = 'login.html'

    def form_valid(self, form):
        user = form.get_user()
        
        # Logika pesan selamat datang berdasarkan Role
        if user.is_superuser or user.is_staff:
            messages.success(self.request, f"Selamat datang, Admin {user.username}! Panel kendali siap digunakan.")
        else:
            messages.success(self.request, f"Selamat datang, Citizen {user.username}! Silakan sampaikan aspirasi Anda.")
            
        return super().form_valid(form)


# 🔥 LOGOUT CUSTOM
def logout_view(request):
    logout(request)
    messages.success(request, "Logout berhasil. Terima kasih telah berkontribusi di IET City! 👋")
    return redirect('login')


def about(request):
    return render(request, 'main_app/about.html')


def contacts(request):
    return render(request, 'main_app/contacts.html')