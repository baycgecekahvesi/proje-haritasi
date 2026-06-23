"""
Demo verisi oluşturur: kullanıcılar (admin/editor/viewer), kategoriler,
projeler, görevler, bütçeler/harcamalar.

Kullanım:
    python manage.py seed_demo          # Varsa üzerine yazar
    python manage.py seed_demo --reset  # Projeleri ve kategorileri sıfırlayıp yeniden oluşturur
"""
from datetime import date, timedelta
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.db import transaction

from apps.accounts.models import Role, User, UserProfile
from apps.budget.models import Budget, Expense
from apps.projects.models import Category, Project, ProjectStatus, Task


class Command(BaseCommand):
    help = "Endüstriyel otomasyon & MES projeleri için örnek veri oluşturur"

    def add_arguments(self, parser):
        parser.add_argument(
            "--reset", action="store_true",
            help="Mevcut proje ve kategori verilerini silerek yeniden oluştur",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        self.stdout.write("Demo verisi olusturuluyor...")

        if options["reset"]:
            Project.objects.all().delete()
            Category.objects.all().delete()
            self.stdout.write("  Mevcut proje ve kategoriler silindi.")

        # ---- Kullanıcılar ----
        admin  = self._user("admin",  "admin123",  Role.ADMIN,  superuser=True)
        editor = self._user("editor", "editor123", Role.EDITOR)
        self._user("viewer", "viewer123", Role.VIEWER)

        # ---- Kategoriler ----
        cats = {}
        for name, color in [
            ("PLC/SCADA",          "#4f6ef7"),
            ("Robot Sistemleri",   "#e74c3c"),
            ("MES",                "#27ae60"),
            ("Vizyon Sistemi",     "#9b59b6"),
            ("Elektrik Altyapı",   "#f39c12"),
            ("Servo/Hareket",      "#1abc9c"),
        ]:
            cats[name], _ = Category.objects.get_or_create(
                name=name, defaults={"color": color}
            )

        today = date.today()

        # ---- Projeler ----
        # (ad, il, durum, ilerleme, kategori, plan_baş, plan_bit, bütçe, [(harcama_açık, tür, tutar)])
        seed = [
            (
                "Bursa Otomotiv Kaynak Robotu Entegrasyonu",
                "Bursa", ProjectStatus.ACTIVE, 65, "Robot Sistemleri",
                today - timedelta(days=90), today + timedelta(days=60),
                Decimal("4200000"),
                [("Robot Ekipman", "equipment", "2100000"), ("Devreye Alma", "service", "800000")],
                [
                    "Mekanik montaj tamamlandi",
                    "Robot programlama devam ediyor",
                    "Guvenlik kafesi kurulumu",
                    "FAT (Fabrika Kabul Testi)",
                ],
            ),
            (
                "İstanbul (Avrupa) MES Uretim Takip Sistemi",
                "İstanbul (Avrupa)", ProjectStatus.ACTIVE, 30, "MES",
                today - timedelta(days=150), today - timedelta(days=10),  # gecikmeli
                Decimal("3800000"),
                [("Yazilim Lisansi", "service", "1500000"), ("Entegrasyon", "service", "2900000")],  # bütçe aşımı
                [
                    "Sunucu altyapisi kuruldu",
                    "ERP entegrasyonu devam ediyor",
                    "Vardiya yonetimi modulu",
                    "OEE gostergesi entegrasyonu",
                    "Kullanici egitimi",
                ],
            ),
            (
                "İzmir Gida Fabrikasi SCADA Sistemi",
                "İzmir", ProjectStatus.PENDING, 10, "PLC/SCADA",
                today + timedelta(days=15), today + timedelta(days=180),
                Decimal("2600000"),
                [],
                [
                    "Saha olcum ve kablolama plani",
                    "PLC programlama",
                    "SCADA ekrani tasarimi",
                    "Saha testleri",
                ],
            ),
            (
                "Ankara Elektrik Pano Modernizasyonu",
                "Ankara", ProjectStatus.COMPLETED, 100, "Elektrik Altyapı",
                today - timedelta(days=200), today - timedelta(days=15),
                Decimal("1900000"),
                [("Malzeme", "material", "980000"), ("Iscilik", "labor", "540000")],
                [
                    "Pano sökümü tamamlandi",
                    "Yeni pano montaji tamamlandi",
                    "Test ve devreye alma tamamlandi",
                ],
            ),
            (
                "Konya Makine Imalati OEE Takip MES",
                "Konya", ProjectStatus.ACTIVE, 50, "MES",
                today - timedelta(days=60), today + timedelta(days=100),
                Decimal("2200000"),
                [("Yazilim", "service", "900000")],
                [
                    "As-is analiz tamamlandi",
                    "MES modul kurulumu",
                    "Makine baglanti arayuzleri",
                    "Rapor ve dashboard",
                    "Canli gecis",
                ],
            ),
            (
                "Gaziantep Ambalaj Hatti Vizyon Kontrol",
                "Gaziantep", ProjectStatus.ACTIVE, 75, "Vizyon Sistemi",
                today - timedelta(days=110), today + timedelta(days=30),
                Decimal("1400000"),
                [("Kamera/Lens", "equipment", "420000"), ("Yazilim", "service", "310000")],
                [
                    "Kamera konumlama ve aydinlatma",
                    "Goruntu isleme algoritmasi",
                    "PLC haberlesme entegrasyonu",
                    "Uretim testleri",
                ],
            ),
            (
                "Kocaeli Pres Hatti Servo Modernizasyonu",
                "Kocaeli", ProjectStatus.PENDING, 0, "Servo/Hareket",
                today + timedelta(days=30), today + timedelta(days=210),
                Decimal("3100000"),
                [],
                [
                    "Mekanik analiz ve tasarim",
                    "Servo surucu ve motor temini",
                    "Mekanik montaj",
                    "Parametre ayarlari ve tuning",
                    "Uretim dogrulamasi",
                ],
            ),
            (
                "Kayseri Metal Isleme PLC Otomasyonu",
                "Kayseri", ProjectStatus.COMPLETED, 100, "PLC/SCADA",
                today - timedelta(days=260), today - timedelta(days=40),
                Decimal("1750000"),
                [("PLC Ekipman", "equipment", "750000"), ("Devreye Alma", "service", "420000")],
                [
                    "Mekanik entegrasyon tamamlandi",
                    "PLC programlama tamamlandi",
                    "SAT (Saha Kabul Testi) tamamlandi",
                ],
            ),
        ]

        for (name, prov, status, prog, cat, p_start, p_end, budget_amt, expenses, task_titles) in seed:
            project, created = Project.objects.get_or_create(
                name=name,
                defaults={
                    "province": prov,
                    "status": status,
                    "progress": prog,
                    "category": cats[cat],
                    "owner": admin,
                    "planned_start": p_start,
                    "planned_end": p_end,
                    "actual_start": p_start,
                    "actual_end": p_end if status == ProjectStatus.COMPLETED else None,
                    "description": f"{cat} kapsaminda {prov} lokasyonunda yurutulmektedir.",
                },
            )
            if not created:
                continue
            project.members.add(editor)

            # Görevler (proje türüne özel)
            for i, title in enumerate(task_titles):
                is_done = (status == ProjectStatus.COMPLETED) or (i < prog // (100 // max(len(task_titles), 1)))
                Task.objects.create(
                    project=project, title=title,
                    is_done=is_done,
                    priority="high" if i == 0 else ("medium" if i % 2 == 0 else "low"),
                    due_date=p_start + timedelta(days=20 * (i + 1)) if p_start else None,
                )

            # Bütçe + harcamalar
            budget = Budget.objects.create(project=project, planned_amount=budget_amt)
            for desc, etype, amt in expenses:
                Expense.objects.create(
                    budget=budget, description=desc, expense_type=etype,
                    amount=Decimal(amt), date=today - timedelta(days=30),
                )

        self.stdout.write(self.style.SUCCESS("[OK] Demo verisi hazir."))
        self.stdout.write("Giris bilgileri:")
        self.stdout.write("  admin  / admin123   (Admin)")
        self.stdout.write("  editor / editor123  (Editor)")
        self.stdout.write("  viewer / viewer123  (Izleyici)")

    def _user(self, username, password, role, superuser=False):
        user = User.objects.filter(username=username).first()
        if user is None:
            if superuser:
                user = User.objects.create_superuser(username=username, password=password)
            else:
                user = User.objects.create_user(username=username, password=password)
        profile, _ = UserProfile.objects.get_or_create(user=user)
        profile.role = role
        profile.save(update_fields=["role"])
        user.profile = profile
        return user
