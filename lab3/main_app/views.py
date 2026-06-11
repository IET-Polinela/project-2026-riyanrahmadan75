from django.shortcuts import render, redirect, get_object_or_404
from .models import Report
from .forms import ReportForm


# READ
def home(request):
    reports = Report.objects.all()
    return render(request, 'main_app/home.html', {'reports': reports})


# CREATE
def add_report(request):
    if request.method == 'POST':
        form = ReportForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('home')
    else:
        form = ReportForm()

    return render(request, 'main_app/add_report.html', {'form': form})


# UPDATE
def edit_report(request, id):
    report = get_object_or_404(Report, id=id)

    if request.method == 'POST':
        form = ReportForm(request.POST, instance=report)
        if form.is_valid():
            form.save()
            return redirect('home')
    else:
        form = ReportForm(instance=report)

    return render(request, 'main_app/add_report.html', {'form': form})


# DELETE
def delete_report(request, id):
    report = get_object_or_404(Report, id=id)
    report.delete()
    return redirect('home')

# from django.shortcuts import render, redirect
# from .models import Report
# from .forms import ReportForm

# def home(request):
#     reports = Report.objects.all()
#     return render(request, 'main_app/home.html', {'reports': reports})


# def add_report(request):
#     if request.method == "POST":
#         form = ReportForm(request.POST)
#         if form.is_valid():
#             form.save()
#             return redirect('home')
#     else:
#         form = ReportForm()

#     return render(request, 'main_app/add_report.html', {'form': form})
# def laporan(request):
#     reports = Report.objects.all()
#     return render(request, 'main_app/laporan.html', {'reports': reports})

# def edit_report(request, id):
#     report = get_object_or_404(Report, id=id)
#     form = ReportForm(request.POST or None, instance=report)

#     if form.is_valid():
#         form.save()
#         return redirect('home')

#     return render(request, 'main_app/add_report.html', {'form': form})


# def delete_report(request, id):
#     report = get_object_or_404(Report, id=id)
#     report.delete()
#     return redirect('home')
# # from django.shortcuts import render
# # from .models import Report

# # def home(request):
# #     reports = Report.objects.all()
# #     return render(request, 'main_app/home.html', {'reports': reports})