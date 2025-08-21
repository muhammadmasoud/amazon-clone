from rest_framework import permissions

class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    Assumes the model instance has an `user` attribute.
    """

    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only allowed to the owner of the object.
        return obj.user == request.user


class IsOwner(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to access it.
    """

    def has_object_permission(self, request, view, obj):
        # Only allow access to the owner
        return obj.user == request.user


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow admins to edit objects.
    Regular users get read-only access.
    """

    def has_permission(self, request, view):
        # Read permissions for any authenticated user
        if request.method in permissions.SAFE_METHODS:
            return request.user.is_authenticated
        
        # Write permissions only for admin users
        return request.user.is_authenticated and request.user.is_staff


class IsEmailVerified(permissions.BasePermission):
    """
    Custom permission to check if user's email is verified.
    """

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        # Check if email is verified
        return request.user.is_email_verified


class IsVerifiedUser(permissions.BasePermission):
    """
    Permission that requires user to be authenticated and email verified.
    """

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and 
            request.user.is_email_verified
        )
