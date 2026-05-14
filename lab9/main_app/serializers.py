from rest_framework import serializers
from .models import Report # Mengimpor model Report yang sudah kita buat

class ReportSerializer(serializers.ModelSerializer):
    # Menggunakan SerializerMethodField untuk melakukan override pada field reporter [cite: 72, 76]
    reporter = serializers.SerializerMethodField()

    class Meta:
        model = Report # Menghubungkan serializer dengan model Report [cite: 70, 78]
        # Menentukan daftar field yang akan dikirimkan melalui API [cite: 79-81]
        fields = [
            'id', 'title', 'category', 'description', 
            'location', 'status', 'reporter', 
            'created_at', 'updated_at'
        ]

    # Fungsi untuk menentukan isi dari field reporter [cite: 82]
    def get_reporter(self, obj):
        # Logika Anonimitas: Selalu mengembalikan string statis [cite: 72, 83]
        return "Warga Anonim"