from django.views.generic import ListView, CreateView, UpdateView
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse_lazy
from .models import Report


class ReportListView(ListView):
    model = Report
    template_name = 'main_app/home.html'
    context_object_name = 'reports'


class ReportCreateView(CreateView):
    model = Report
    template_name = 'main_app/add_report.html'
    fields = ['title', 'category', 'description', 'location']
    success_url = reverse_lazy('home')


class ReportUpdateView(UpdateView):
    model = Report
    template_name = 'main_app/add_report.html'
    fields = ['title', 'category', 'description', 'location']
    success_url = reverse_lazy('home')


# DELETE TANPA TEMPLATE
def delete_report(request, pk):
    report = get_object_or_404(Report, pk=pk)
    report.delete()
    return redirect('home')


# UPDATE STATUS
def update_status(request, pk):
    report = get_object_or_404(Report, pk=pk)
    report.status = request.POST.get('status')
    report.save()
    return redirect('home')


# STATIC PAGE
def about(request):
    return render(request, 'main_app/about.html')


def contacts(request):
    return render(request, 'main_app/contacts.html')