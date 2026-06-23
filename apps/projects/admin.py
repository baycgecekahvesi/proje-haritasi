from django.contrib import admin

from .models import Category, Project, ProjectImage, Task


class TaskInline(admin.TabularInline):
    model = Task
    extra = 0
    fields = ("title", "assignee", "priority", "is_done", "due_date")


class ProjectImageInline(admin.TabularInline):
    model = ProjectImage
    extra = 0
    fields = ("image", "caption", "uploaded_at")
    readonly_fields = ("uploaded_at",)


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "color")
    search_fields = ("name",)


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = (
        "name", "province", "status", "progress",
        "owner", "is_delayed", "planned_end",
    )
    list_filter = ("status", "province", "category")
    search_fields = ("name", "description", "province")
    autocomplete_fields = ("owner", "category")
    filter_horizontal = ("members",)
    date_hierarchy = "created_at"
    inlines = [TaskInline, ProjectImageInline]
    readonly_fields = ("created_at", "updated_at", "is_delayed", "delay_days")

    @admin.display(boolean=True, description="Gecikmede")
    def is_delayed(self, obj):
        return obj.is_delayed


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ("title", "project", "priority", "is_done", "due_date", "assignee")
    list_filter = ("priority", "is_done")
    search_fields = ("title", "description")
    autocomplete_fields = ("project", "assignee")
