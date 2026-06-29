from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin

from .models import User, UserProfile, ContractorProfile, ProjectContractor


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


@admin.register(ContractorProfile)
class ContractorProfileAdmin(admin.ModelAdmin):
    list_display = ["company_name", "user", "tax_number", "phone"]
    search_fields = ["company_name", "user__username"]


@admin.register(ProjectContractor)
class ProjectContractorAdmin(admin.ModelAdmin):
    list_display = ["project", "contractor", "role", "contract_amount", "start_date", "end_date"]
    list_filter = ["project"]
