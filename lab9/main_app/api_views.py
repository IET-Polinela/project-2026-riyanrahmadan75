from rest_framework import viewsets, permissions
from .models import Report
from .serializers import ReportSerializer

class ReportViewSet(viewsets.ModelViewSet):
    # Mengatur hak akses: AllowAny berarti API dapat diakses oleh siapa saja untuk pengujian [cite: 92-93]
    permission_classes = [permissions.AllowAny]
    
    # Menentukan data apa yang akan diambil dari database [cite: 93]
    queryset = Report.objects.all()
    
    # Menentukan serializer mana yang digunakan untuk mengonversi data tersebut [cite: 94]
    serializer_class = ReportSerializer