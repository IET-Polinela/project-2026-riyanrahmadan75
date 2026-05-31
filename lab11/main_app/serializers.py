# main_app/serializers.py
from rest_framework import serializers
from .models import Report

class ReportSerializer(serializers.ModelSerializer):
    # Nama pelapor harus anonim untuk warga lain ketika status bukan DRAFT
    reporter = serializers.SerializerMethodField()
    
    class Meta:
        model = Report
        # Sesuaikan dengan field yang ada di model Report kamu
        fields = ['id', 'title', 'category', 'description', 'location', 'status', 'reporter', 'created_at']
        
        # Aturan Lab 10: Status otomatis DRAFT saat dibuat, 
        # dan tidak boleh diubah sembarangan oleh warga via POST/PUT API
        read_only_fields = ['id', 'status', 'created_at']

    def get_reporter(self, obj):
        request = self.context.get('request') if hasattr(self, 'context') else None
        user = getattr(request, 'user', None)

        if user and user.is_authenticated:
            if user.is_superuser or obj.reporter == user:
                return obj.reporter.username if obj.reporter else None
            if obj.status == 'DRAFT':
                return None
            return 'Anonim'

        return None

from django.contrib.auth import get_user_model
User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = ('username', 'email', 'password')

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        return user