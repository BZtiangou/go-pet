from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin
from django.utils.translation import gettext_lazy as _
from django.contrib.auth.models import Group
from django.contrib.auth.admin import GroupAdmin as DjangoGroupAdmin
from .models import CustomUser

@admin.register(CustomUser)
class CustomUserAdmin(DjangoUserAdmin):
    """Add additional fields to user admin page."""
    fieldsets = (
        (None, {"fields": ("username", "password")}),
        (_("Personal info"), {"fields": ("name", "email", "device", "phone_number", "gender", "exp_id", "exp_title", "exp_state")}),
        (
            _("Permissions"),
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                ),
            },
        ),
        (_("Important dates"), {"fields": ("last_login", "date_joined")}),
    )
    list_display = ("username", "email")
    actions = ['delete_selected']  # Ensure bulk delete is enabled

class GroupProxy(Group):
    """Proxy model for Group. Dedicated for django-admin."""
    class Meta:
        """Declare model being proxy."""
        proxy = True
        verbose_name_plural = verbose_name = '用户组'

@admin.register(GroupProxy)
class MyGroupAdmin(DjangoGroupAdmin):
    """Grouping useradmin with groupadmin"""
    actions = ['delete_selected']  # Ensure bulk delete is enabled

admin.site.unregister(Group)  # Avoid multiple GroupAdmin