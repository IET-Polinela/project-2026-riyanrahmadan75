from django.db.models import Q
from rest_framework import viewsets, permissions, status, generics
from rest_framework.response import Response
from .models import Report
from .serializers import ReportSerializer, RegisterSerializer
from .permissions import IsOwnerOrAdmin

class ReportViewSet(viewsets.ModelViewSet):
    queryset = Report.objects.all()
    serializer_class = ReportSerializer

    def get_permissions(self):
        """
        Mengatur hak akses secara dinamis berdasarkan aksi (action).
        """
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated(), IsOwnerOrAdmin()]

        if self.action == 'create':
            return [permissions.IsAuthenticated()]

        if self.action in ['update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsOwnerOrAdmin()]

        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return Report.objects.all().order_by('-created_at')
        if user.is_authenticated:
            return Report.objects.filter(Q(reporter=user) | ~Q(status='DRAFT')).order_by('-created_at')
        return Report.objects.filter(~Q(status='DRAFT')).order_by('-created_at')

    def perform_create(self, serializer):
        """
        Otomatis mengisi field 'reporter' dengan user yang sedang login tokennya.
        Mencegah manipulasi input parameter dari client / Postman.
        """
        # Sesuai relasi di model kita, field-nya bernama 'reporter' [cite: 48, 62]
        serializer.save(reporter=self.request.user)


class RegisterAPIView(generics.CreateAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer
