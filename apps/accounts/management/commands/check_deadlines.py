"""
Gecikmiş proje ve görevler için bildirim oluşturur.

Kullanım:
    python manage.py check_deadlines
    python manage.py check_deadlines --dry-run  # Oluşturmadan raporla
"""
from datetime import date
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.db.models import DecimalField, Sum
from django.db.models.functions import Coalesce

from apps.accounts.models import Bildirim
from apps.projects.models import Project, ProjectStatus, Task


class Command(BaseCommand):
    help = "Gecikmiş proje ve görevler için bildirim oluşturur"

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Kayıt oluşturmadan raporla",
        )

    def handle(self, *args, **options):
        dry_run = options["dry_run"]
        today = date.today()
        created = 0

        # 1. Gecikmiş projeler
        delayed_projects = (
            Project.objects
            .exclude(planned_end__isnull=True)
            .exclude(status=ProjectStatus.COMPLETED)
            .filter(planned_end__lt=today)
            .prefetch_related("members")
            .select_related("owner")
        )

        for project in delayed_projects:
            delay_days = (today - project.planned_end).days
            baslik = f"Geciken Proje: {project.name}"
            mesaj = (
                f"{project.province} — "
                f"Planlanan bitiş: {project.planned_end.strftime('%d.%m.%Y')} "
                f"({delay_days} gün gecikme)"
            )

            # Alıcılar: owner + members (tekrar etmesin)
            recipients = {project.owner}
            recipients.update(project.members.all())

            for alici in recipients:
                exists = Bildirim.objects.filter(
                    alici=alici,
                    baslik=baslik,
                    olusturuldu__date=today,
                ).exists()
                if not exists:
                    if not dry_run:
                        Bildirim.objects.create(
                            alici=alici,
                            baslik=baslik,
                            mesaj=mesaj,
                        )
                    created += 1
                    self.stdout.write(f"  [PROJE] {alici.username} <- {baslik}")

        # 2. Gecikmiş görevler
        overdue_tasks = (
            Task.objects
            .exclude(due_date__isnull=True)
            .filter(is_done=False, due_date__lt=today)
            .select_related("project", "assignee")
        )

        for task in overdue_tasks:
            if not task.assignee:
                continue
            delay_days = (today - task.due_date).days
            baslik = f"Geciken Gorev: {task.title}"
            mesaj = (
                f"Proje: {task.project.name} — "
                f"Son tarih: {task.due_date.strftime('%d.%m.%Y')} "
                f"({delay_days} gün gecikme)"
            )

            exists = Bildirim.objects.filter(
                alici=task.assignee,
                baslik=baslik,
                olusturuldu__date=today,
            ).exists()
            if not exists:
                if not dry_run:
                    Bildirim.objects.create(
                        alici=task.assignee,
                        baslik=baslik,
                        mesaj=mesaj,
                        gorev_id=str(task.id),
                    )
                created += 1
                self.stdout.write(f"  [GOREV] {task.assignee.username} <- {baslik}")

        # 3. Bütçe %80+ aşanlar
        try:
            from apps.budget.models import Budget

            money_field = DecimalField(max_digits=18, decimal_places=2)
            budgets = (
                Budget.objects
                .select_related("project__owner")
                .annotate(
                    spent=Coalesce(
                        Sum("expenses__amount"),
                        Decimal("0"),
                        output_field=money_field,
                    )
                )
                .filter(planned_amount__gt=0)
            )

            for b in budgets:
                pct = float(b.spent) / float(b.planned_amount) * 100
                if pct < 80:
                    continue
                alici = b.project.owner
                baslik = f"Butce Uyarisi: {b.project.name}"
                mesaj = (
                    f"Bütçe kullanımı %{pct:.1f} — "
                    f"Planlanan: {b.planned_amount:,.0f} {b.currency}, "
                    f"Harcanan: {b.spent:,.0f} {b.currency}"
                )
                exists = Bildirim.objects.filter(
                    alici=alici,
                    baslik=baslik,
                    olusturuldu__date=today,
                ).exists()
                if not exists:
                    if not dry_run:
                        Bildirim.objects.create(
                            alici=alici,
                            baslik=baslik,
                            mesaj=mesaj,
                        )
                    created += 1
                    self.stdout.write(f"  [BUTCE] {alici.username} <- {baslik}")

        except Exception as e:
            self.stderr.write(f"Bütçe kontrolü atlandı: {e}")

        suffix = " (dry-run)" if dry_run else ""
        verb = "oluşturulacaktı" if dry_run else "oluşturuldu"
        self.stdout.write(
            self.style.SUCCESS(f"Toplam {created} bildirim {verb}{suffix}")
        )
