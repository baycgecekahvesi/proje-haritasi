from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin

from .models import DeviceToken, User, UserProfile


class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    verbose_name_plural = "Profil"
    fk_name = "user"


@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    inlines = [UserProfileInline]
    list_display = ("username", "email", "first_name", "last_name", "get_role", "is_staff")
    list_select_related = ("profile",)

    @admin.display(description="Rol")
    def get_role(self, obj):
        return getattr(getattr(obj, "profile", None), "role", "—")


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "role", "phone", "created_at")
    list_filter = ("role",)
    search_fields = ("user__username", "user__email", "phone")


@admin.register(DeviceToken)
class DeviceTokenAdmin(admin.ModelAdmin):
    list_display = ("user", "device_type", "is_active", "created_at", "updated_at")
    list_filter = ("device_type", "is_active")
    search_fields = ("user__username",)
    readonly_fields = ("created_at", "updated_at")
