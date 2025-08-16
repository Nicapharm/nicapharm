from rest_framework.permissions import BasePermission
class IsDirector(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return getattr(request.user, 'role', '') == 'directeur'

class IsAdminOrSuperuser(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False  # rejeter les utilisateurs anonymes

        return getattr(user, 'role', None) in ['superuser', 'admin']
