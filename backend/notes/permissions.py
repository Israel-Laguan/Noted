from rest_framework.permissions import BasePermission


class IsOwner(BasePermission):
    def has_object_permission(self, request, _view, obj):
        return obj.owner_id == request.user.id
