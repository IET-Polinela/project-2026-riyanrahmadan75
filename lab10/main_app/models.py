from django.db import models
from django.conf import settings

# 1. Definisi STATUS_CHOICES sesuai instruksi Lab 9 [cite: 30, 38-44]
STATUS_CHOICES = [
    ('DRAFT', 'Draft'),
    ('REPORTED', 'Reported'),
    ('VERIFIED', 'Verified'),
    ('IN_PROGRESS', 'In Progress'),
    ('RESOLVED', 'Resolved'),
]

class Report(models.Model):
    # 2. Field dasar laporan [cite: 46-49]
    title = models.CharField(max_length=200)
    category = models.CharField(max_length=100)
    description = models.TextField()
    location = models.CharField(max_length=200)

    # 3. Field reporter dengan relasi ForeignKey ke CustomUser [cite: 31-32, 50-57]
    reporter = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='reports',
        null=True,
        blank=True
    )

    # 4. Field status dengan pilihan yang sudah di-update [cite: 58-63]
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='DRAFT'
    )

    # 5. Field timestamp untuk jejak waktu draf/laporan [cite: 33, 64-65]
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title