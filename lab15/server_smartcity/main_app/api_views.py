from django.db.models import Q
from rest_framework import viewsets, permissions, generics, filters
from .models import Report
from .serializers import ReportSerializer, RegisterSerializer
from .permissions import IsOwnerOrAdmin


class ReportViewSet(viewsets.ModelViewSet):
    queryset = Report.objects.all()
    serializer_class = ReportSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'location', 'description', 'category']

    def get_permissions(self):
        # list & retrieve: cukup login biasa — get_queryset() yang handle filter data
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        # buat laporan baru: cukup login
        if self.action == 'create':
            return [permissions.IsAuthenticated()]
        # edit / hapus: harus login + punya hak atas objek
        if self.action in ['update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsOwnerOrAdmin()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        """
        Aturan visibilitas data:
        - tab=my_reports  → hanya laporan milik user sendiri (termasuk DRAFT milik sendiri)
        - tab=feed        → semua laporan NON-DRAFT (publik, nama disamarkan serializer)
        - superuser/admin → bisa lihat semuanya
        """
        user = self.request.user
        tab  = self.request.query_params.get('tab', 'my_reports')

        # Admin / superuser lihat semua
        if user.is_superuser or (hasattr(user, 'is_staff') and user.is_staff):
            return Report.objects.all().order_by('-created_at')

        # Feed publik: hanya tampilkan yang sudah bukan DRAFT
        if tab == 'feed':
            return Report.objects.exclude(status='DRAFT').order_by('-created_at')

        # Laporan milik sendiri: semua status termasuk DRAFT
        return Report.objects.filter(reporter=user).order_by('-created_at')

    def perform_create(self, serializer):
        # Otomatis isi field reporter dari token login — tidak bisa dimanipulasi client
        serializer.save(reporter=self.request.user)


class RegisterAPIView(generics.CreateAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer