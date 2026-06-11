from django.views.generic import ListView, CreateView, UpdateView
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse_lazy
from django.contrib import messages   # 🔥 WAJIB
from .models import Report


class ReportListView(ListView):
    model = Report
    template_name = 'main_app/home.html'
    context_object_name = 'reports'


# ======================
# CREATE
# ======================
class ReportCreateView(CreateView):
    model = Report
    template_name = 'main_app/add_report.html'
    fields = ['title', 'category', 'description', 'location']
    success_url = reverse_lazy('home')

    def form_valid(self, form):
        form.instance.status = 'REPORTED'
        messages.success(self.request, "Laporan berhasil ditambahkan!")  # 🔥
        return super().form_valid(form)


# ======================
# UPDATE
# ======================
class ReportUpdateView(UpdateView):
    model = Report
    template_name = 'main_app/add_report.html'
    fields = ['title', 'category', 'description', 'location']
    success_url = reverse_lazy('home')

    def form_valid(self, form):
        messages.success(self.request, "Laporan berhasil diperbarui!")  # 🔥
        return super().form_valid(form)


# ======================
# DELETE
# ======================
def delete_report(request, pk):
    report = get_object_or_404(Report, pk=pk)
    report.delete()
    messages.success(request, "Laporan berhasil dihapus!")  # 🔥
    return redirect('home')


# ======================
# UPDATE STATUS
# ======================
def update_status(request, pk):
    report = get_object_or_404(Report, pk=pk)
    report.status = request.POST.get('status')
    report.save()
    messages.success(request, "Status berhasil diperbarui!")  # 🔥
    return redirect('home')


# ======================
# STATIC PAGE
# ======================
def about(request):
    return render(request, 'main_app/about.html')


def contacts(request):
    return render(request, 'main_app/contacts.html')