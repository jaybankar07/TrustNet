"""
Shared DRF permission classes for TrustNet.
Used across all apps.
"""
from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAdminRole(BasePermission):
    """Allow only users with role='admin'."""
    message = "Admin access required."

    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role == 'admin'
        )


class IsCompanyAdmin(BasePermission):
    """Allow company_admin or admin roles."""
    message = "Company admin or admin access required."

    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role in ('company_admin', 'admin')
        )


class IsVerifiedUser(BasePermission):
    """Allow only users who have completed verification."""
    message = "Account verification required."

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return bool(request.user and request.user.is_authenticated)
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.is_verified
        )


class IsOwnerOrAdmin(BasePermission):
    """Object-level: allow owner or admin."""
    message = "You do not have permission to perform this action."

    def has_object_permission(self, request, view, obj):
        if request.user.role == 'admin':
            return True
        # Support objects that store owner as user, author, organizer, or applicant
        owner = getattr(obj, 'user', None) or \
                getattr(obj, 'author', None) or \
                getattr(obj, 'organizer', None) or \
                getattr(obj, 'applicant', None)
        return owner == request.user
