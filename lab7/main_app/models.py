from django.db import models
from django.conf import settings   # 🔥 penting untuk ambil user model


class Report(models.Model):

    STATUS_CHOICES = [
        ('REPORTED', 'Reported'),
        ('VERIFIED', 'Verified'),
        ('IN_PROGRESS', 'In Progress'),
        ('RESOLVED', 'Resolved'),
    ]

    # 🔥 TAMBAHAN LAB 6 (RELASI KE USER)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )

    title = models.CharField(max_length=200)
    category = models.CharField(max_length=100)
    description = models.TextField()
    location = models.CharField(max_length=200)

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='REPORTED'
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title