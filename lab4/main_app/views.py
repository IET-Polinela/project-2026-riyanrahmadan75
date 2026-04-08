from django.views.generic import ListView, DetailView, CreateView, UpdateView, DeleteView, View
from django.shortcuts import get_object_or_404, redirect
from django.urls import reverse_lazy
from .models import Report


# ======================
# LIST (DAFTAR LAPORAN)
# ======================
class ReportListView(ListView):
    model = Report
    template_name = 'main_app/home.html'
    context_object_name = 'reports'


# ======================
# DETAIL LAPORAN
# ======================
class ReportDetailView(DetailView):
    model = Report
    template_name = 'main_app/detail.html'


# ======================
# CREATE LAPORAN
# ======================
class ReportCreateView(CreateView):
    model = Report
    template_name = 'main_app/add_report.html'
    fields = ['title', 'category', 'description', 'location']
    success_url = reverse_lazy('home')


# ======================
# UPDATE LAPORAN
# ======================
class ReportUpdateView(UpdateView):
    model = Report
    template_name = 'main_app/add_report.html'
    fields = ['title', 'category', 'description', 'location']
    success_url = reverse_lazy('home')


# ======================
# DELETE LAPORAN
# ======================
class ReportDeleteView(DeleteView):
    model = Report
    template_name = 'main_app/delete.html'
    success_url = reverse_lazy('home')


# ======================
# UPDATE STATUS (WORKFLOW)
# ======================
class ReportUpdateStatusView(View):
    def post(self, request, pk):
        report = get_object_or_404(Report, pk=pk)
        new_status = request.POST.get('status')
        report.status = new_status
        report.save()
        return redirect('home')