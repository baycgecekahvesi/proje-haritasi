from datetime import date

from django.db import models

from apps.accounts.models import User

from .provinces import PROVINCE_CHOICES


class ProjectStatus(models.TextChoices):
    ACTIVE = "aktif", "Aktif"
    PENDING = "beklemede", "Beklemede"
    COMPLETED = "tamamlandi", "Tamamlandı"
    CANCELLED = "iptal", "İptal"


class Category(models.Model):
    name = models.CharField(max_length=100)
    color = models.CharField(max_length=7, default="#4f6ef7")

    class Meta:
        verbose_name = "Kategori"
        verbose_name_plural = "Kategoriler"
        ordering = ["name"]

    def __str__(self):
        return self.name


class Project(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    province = models.CharField(max_length=60, choices=PROVINCE_CHOICES)
    category = models.ForeignKey(
        Category, null=True, blank=True, on_delete=models.SET_NULL,
        related_name="projects",
    )
    status = models.CharField(
        max_length=20, choices=ProjectStatus.choices,
        default=ProjectStatus.ACTIVE,
    )
    progress = models.PositiveSmallIntegerField(default=0)  # 0–100
    owner = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="owned_projects"
    )
    members = models.ManyToManyField(
        User, related_name="member_projects", blank=True
    )
    planned_start = models.DateField(null=True, blank=True)
    planned_end = models.DateField(null=True, blank=True)
    actual_start = models.DateField(null=True, blank=True)
    actual_end = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Proje"
        verbose_name_plural = "Projeler"

    def __str__(self):
        return f"{self.name} ({self.province})"

    @property
    def is_delayed(self) -> bool:
        if self.planned_end and self.status != ProjectStatus.COMPLETED:
            return date.today() > self.planned_end
        return False

    @property
    def delay_days(self) -> int:
        if (
            self.planned_end
            and self.actual_end
            and self.actual_end > self.planned_end
        ):
            return (self.actual_end - self.planned_end).days
        return 0


class ProjectImage(models.Model):
    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, related_name="images"
    )
    image = models.ImageField(upload_to="project_images/%Y/%m/")
    caption = models.CharField(max_length=255, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Proje Görseli"
        verbose_name_plural = "Proje Görselleri"
        ordering = ["-uploaded_at"]

    def __str__(self):
        return f"{self.project.name} görseli #{self.pk}"


class Task(models.Model):
    class Priority(models.TextChoices):
        LOW = "low", "Düşük"
        MEDIUM = "medium", "Orta"
        HIGH = "high", "Yüksek"

    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, related_name="tasks"
    )
    parent = models.ForeignKey(
        "self", null=True, blank=True, on_delete=models.CASCADE, related_name="children"
    )
    wbs_code = models.CharField(max_length=20, blank=True)  # örn: "1.2.3"
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    assignee = models.ForeignKey(
        User, null=True, blank=True, on_delete=models.SET_NULL,
        related_name="assigned_tasks",
    )
    priority = models.CharField(
        max_length=10, choices=Priority.choices, default=Priority.MEDIUM
    )
    is_done = models.BooleanField(default=False)
    due_date = models.DateField(null=True, blank=True)
    planned_start = models.DateField(null=True, blank=True)
    planned_end = models.DateField(null=True, blank=True)
    actual_start = models.DateField(null=True, blank=True)
    actual_end = models.DateField(null=True, blank=True)
    progress = models.PositiveSmallIntegerField(default=0)  # 0-100
    delay_reason = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Görev"
        verbose_name_plural = "Görevler"
        ordering = ["is_done", "-priority", "due_date"]

    def __str__(self):
        return self.title


class DependencyType(models.TextChoices):
    FS = "FS", "Finish-Start"
    SS = "SS", "Start-Start"
    FF = "FF", "Finish-Finish"
    SF = "SF", "Start-Finish"


class TaskDependency(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name="dependencies")
    depends_on = models.ForeignKey(Task, on_delete=models.CASCADE, related_name="required_by")
    dep_type = models.CharField(
        max_length=2, choices=DependencyType.choices, default=DependencyType.FS
    )

    class Meta:
        unique_together = [("task", "depends_on")]
        verbose_name = "Görev Bağımlılığı"
        verbose_name_plural = "Görev Bağımlılıkları"

    def __str__(self):
        return f"{self.task} → {self.depends_on} ({self.dep_type})"
