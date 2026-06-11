from rest_framework import permissions

class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Custom permission untuk:
    1. Hanya user yang login yang boleh mengakses report API.
    2. Hanya reporter yang membuat laporan atau admin yang boleh melihat laporan.
    3. Laporan non-DRAFT bisa dilihat semua user; laporan DRAFT hanya dilihat pemilik atau admin.
    4. Hanya reporter sendiri boleh mengubah laporan selama status 'DRAFT', kecuali admin.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            if obj.status != 'DRAFT':
                return True
            return obj.reporter == request.user or request.user.is_superuser

        # Only admin can delete objects
        if request.method == 'DELETE':
            return request.user.is_superuser

        # Admin can do any non-delete unsafe actions
        if request.user.is_superuser:
            return True

        # Non-admins can update only their own DRAFT reports
        return obj.reporter == request.user and obj.status == 'DRAFT'
