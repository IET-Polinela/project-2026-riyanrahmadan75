from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Report

User = get_user_model()

class ReportSerializer(serializers.ModelSerializer):
    reporter = serializers.SerializerMethodField()
    reporter_name = serializers.SerializerMethodField() # Ini field yang dicari oleh tes
    is_owner = serializers.SerializerMethodField()
    
    class Meta:
        model = Report
        # Pastikan reporter_name dimasukkan ke dalam fields
        fields = ['id', 'title', 'category', 'description', 'location', 'status', 'reporter', 'reporter_name', 'is_owner', 'created_at']
        read_only_fields = ['id', 'created_at']

    def get_reporter(self, obj):
        # PRIV-01: Feed publik harus SELALU menyamarkan nama
        return 'Warga Anonim'

    def get_reporter_name(self, obj):
        # PRIV-02: Tampilkan nama asli HANYA jika yang request adalah pemilik laporan
        request = self.context.get('request') if hasattr(self, 'context') else None
        user = getattr(request, 'user', None)
        if user and user.is_authenticated and obj.reporter == user:
            return obj.reporter.username
        return 'Warga Anonim'

    def get_is_owner(self, obj):
        request = self.context.get('request') if hasattr(self, 'context') else None
        user = getattr(request, 'user', None)
        if user and user.is_authenticated:
            return obj.reporter == user
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