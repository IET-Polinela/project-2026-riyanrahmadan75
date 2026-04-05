from django.db import models

class Report(models.Model):
    title = models.CharField(max_length=200)
    category = models.CharField(max_length=100)  # ← diperbaiki
    description = models.TextField()
    location = models.CharField(max_length=200)
    status = models.CharField(max_length=20, default='REPORTED')  # ← tanda petik diperbaiki
    created_at = models.DateTimeField(auto_now_add=True)  # ← nama diperbaiki

    def __str__(self):
        return self.title