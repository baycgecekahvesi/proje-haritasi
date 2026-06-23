from django.contrib import admin

from .models import GorevDurumu, ProjeGorev, ReferansDoc, RoleSkill, TaskTemplate


@admin.register(GorevDurumu)
class GorevDurumuAdmin(admin.ModelAdmin):
    list_display = ("sira", "deger", "ikon", "renk")
    ordering = ("sira",)


class TaskTemplateInline(admin.TabularInline):
    model = TaskTemplate
    extra = 0
    fields = ("gorev_sira", "gorev_adi", "faz", "min_gun", "max_gun", "teslimati")
    readonly_fields = ("gorev_sira",)


class ReferansDocInline(admin.TabularInline):
    model = ReferansDoc
    extra = 0
    fields = ("slug", "baslik", "standart", "revizyon")
    readonly_fields = ("slug",)


@admin.register(RoleSkill)
class RoleSkillAdmin(admin.ModelAdmin):
    list_display = ("ikon", "rol_id", "rol_adi", "renk_kodu")
    search_fields = ("rol_id", "rol_adi")
    inlines = [TaskTemplateInline, ReferansDocInline]


@admin.register(TaskTemplate)
class TaskTemplateAdmin(admin.ModelAdmin):
    list_display = ("gorev_id", "gorev_adi", "faz", "min_gun", "max_gun", "rol")
    list_filter = ("rol", "faz")
    search_fields = ("gorev_adi", "teslimati")


@admin.register(ReferansDoc)
class ReferansDocAdmin(admin.ModelAdmin):
    list_display = ("slug", "baslik", "standart", "revizyon", "rol")
    list_filter = ("rol",)
    search_fields = ("slug", "baslik", "standart", "icerik")


@admin.register(ProjeGorev)
class ProjeGorevAdmin(admin.ModelAdmin):
    list_display = ("gorev_id", "gorev_adi", "rol", "faz", "gun", "baslangic_gun", "durum", "tamamlanma")
    list_filter = ("rol", "faz", "durum")
    search_fields = ("gorev_id", "gorev_adi", "teslim")
    readonly_fields = ("gorev_id", "rol", "gorev_adi", "faz", "gun", "onk", "teslim", "baslangic_gun")
    list_editable = ("durum", "tamamlanma")
