from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):   # 🔥 PENTING: pakai UserAdmin

    list_display = (
        'username',
        'email',
        'is_admin',
        'is_member',
        'is_staff',
        'is_superuser',
    )

    list_filter = (
        'is_admin',
        'is_member',
        'is_staff',
    )

    search_fields = ('username', 'email')

    ordering = ('username',)

    # 🔥 tampil di form edit
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal Info', {'fields': ('email',)}),
        ('Permissions', {
            'fields': (
                'is_active',
                'is_staff',
                'is_superuser',
                'is_admin',
                'is_member',
            )
        }),
    )