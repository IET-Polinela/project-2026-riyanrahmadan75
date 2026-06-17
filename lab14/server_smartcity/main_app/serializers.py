# main_app/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Report

User = get_user_model()

class ReportSerializer(serializers.ModelSerializer):
    reporter = serializers.SerializerMethodField()
    is_owner = serializers.SerializerMethodField() # Membuka akses tombol edit draft
    
    class Meta:
        model = Report
        fields = ['id', 'title', 'category', 'description', 'location', 'status', 'reporter', 'is_owner', 'created_at']
        read_only_fields = ['id', 'created_at']

    def get_reporter(self, obj):
        request = self.context.get('request') if hasattr(self, 'context') else None
        user = getattr(request, 'user', None)

        if user and user.is_authenticated:
            if user.is_superuser or obj.reporter == user:
                return obj.reporter.username if obj.reporter else None
            if obj.status == 'DRAFT':
                return None
            return 'Warga Anonim' # Sesuai perintah instruksi halaman 5 dokumen

        return None

    def get_is_owner(self, obj):
        request = self.context.get('request')
        if request and request.user and request.user.is_authenticated:
            return obj.reporter == request.user
        return False


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