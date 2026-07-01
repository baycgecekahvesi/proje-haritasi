"""
PM (Proje Yönetimi) modülleri için örnek veri oluşturur.

Kapsam: Kalite/ITP, Değişiklik Emirleri, Tedarik, Yazışmalar,
        Toplantılar, SGK/İSG, Paydaşlar, Ruhsat/İzin,
        Hakediş Metraj & Fiyat Farkı, WBS Görev Hiyerarşisi,
        Bütçe WBS Kalemleri

Kullanım:
    python manage.py seed_pm_data
    python manage.py seed_pm_data --reset   # Mevcut PM verisini silip yeniden oluştur

NOT: Önce 'python manage.py seed_demo' çalıştırın -- projeler ve
     kullanıcılar bu komuta bağlıdır.
"""
from datetime import date, timedelta
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from apps.accounts.models import User
from apps.budget.models import Budget, BudgetLine
from apps.change_orders.models import ChangeOrder, ChangeOrderReason, ChangeOrderStatus
from apps.correspondence.models import Correspondence, CorrespondenceStatus, CorrespondenceType
from apps.documents.models import LegalPermit, PermitStatus, PermitType
from apps.hse.models import AccidentSeverity, HSEInspection, HSEInspectionStatus, WorkAccident, WorkerEntry
from apps.meetings.models import ActionItem, ActionItemStatus, Meeting, MeetingType
from apps.payroll.models import FiyatFarki, MetrajSatiri, ProgressPayment
from apps.procurement.models import (
    DeliveryInspectionStatus, MaterialDelivery,
    PurchaseOrder, PurchaseRequest, PurchaseRequestStatus,
)
from apps.projects.models import Project, Task
from apps.quality.models import (
    HoldPointType, InspectionItem, InspectionPlan,
    InspectionStatus, NCR, NCRSeverity, NCRStatus,
)
from apps.stakeholders.models import CommunicationFrequency, InfluenceLevel, Stakeholder

TODAY = date.today()


class Command(BaseCommand):
    help = "PM modülleri için örnek veri oluşturur (seed_demo'dan sonra çalıştırın)"

    def add_arguments(self, parser):
        parser.add_argument(
            "--reset", action="store_true",
            help="Mevcut PM verilerini silerek yeniden oluştur",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        self.stdout.write(self.style.MIGRATE_HEADING("\n=== PM Ornek Verisi Olusturuluyor ===\n"))

        # -- Ön koşul: kullanıcı ve proje --------------------------------------
        admin = User.objects.filter(is_superuser=True).first()
        editor = User.objects.filter(profile__role="editor").first()
        viewer = User.objects.filter(profile__role="viewer").first()
        if not admin:
            self.stdout.write(self.style.ERROR(
                "Admin kullanıcı bulunamadı. Önce 'python manage.py seed_demo' çalıştırın."
            ))
            return

        project = Project.objects.first()
        if not project:
            self.stdout.write(self.style.ERROR(
                "Proje bulunamadı. Önce 'python manage.py seed_demo' çalıştırın."
            ))
            return

        if options["reset"]:
            self._reset()
            self.stdout.write("  Mevcut PM verileri silindi.\n")

        # -- 1. Bütçe WBS Kalemleri --------------------------------------------
        self.stdout.write(self.style.SUCCESS("[1]  Bütçe WBS Kalemleri"))
        self.stdout.write(
            "   > Proje bütçesini kategoriye göre parçalara bölün.\n"
            "   > Proje detay modalında 'Bütçe' sekmesinde görünür.\n"
            "   > Planlanan vs. Gerçekleşen fark otomatik hesaplanır.\n"
        )
        budget, _ = Budget.objects.get_or_create(project=project)
        if not budget.planned_amount:
            budget.planned_amount = Decimal("2500000")
            budget.save()

        for cat, desc, planned, actual in [
            ("iscilik",     "Montaj ve devreye alma ekibi",     Decimal("600000"), Decimal("550000")),
            ("malzeme",     "PLC, panel, kablo, sensör",        Decimal("900000"), Decimal("875000")),
            ("ekipman",     "Vinç, platform, test cihazı",      Decimal("300000"), Decimal("310000")),
            ("taseron",     "Mekanik taşeron (boru/çelik)",     Decimal("450000"), Decimal("420000")),
            ("genel_gider", "Ulaşım, konaklama, iletişim",      Decimal("150000"), Decimal("130000")),
            ("diger",       "Beklenmedik giderler (%10 buffer)", Decimal("100000"), Decimal("60000")),
        ]:
            BudgetLine.objects.get_or_create(
                budget=budget, category=cat, description=desc,
                defaults={"planned_amount": planned, "actual_amount": actual},
            )
        self.stdout.write(f"   OK 6 bütçe kalemi oluşturuldu (Proje: {project.name})\n")

        # -- 2. WBS Görev Hiyerarşisi ------------------------------------------
        self.stdout.write(self.style.SUCCESS("[2]  WBS Görev Hiyerarşisi"))
        self.stdout.write(
            "   > Görevleri WBS kodları ile hiyerarşik yapıya alın.\n"
            "   > Proje detayında 'Görevler' bölümünde WBS kodu rozetli görünür.\n"
            "   > Alt görevler üst görevin altında girintili listelenir.\n"
        )
        wbs_data = [
            (None,  "1",     "Mekanik Kurulum",        "high"),
            (None,  "1.1",   "Temel Hazırlık",         "high"),
            (None,  "1.2",   "Panel Montajı",          "medium"),
            (None,  "2",     "Elektrik & Otomasyon",   "high"),
            (None,  "2.1",   "Kablo Çekimi",           "high"),
            (None,  "2.2",   "PLC Programlama",        "medium"),
            (None,  "2.3",   "SCADA Konfigürasyonu",   "medium"),
            (None,  "3",     "Devreye Alma & Test",    "high"),
            (None,  "3.1",   "FAT Testleri",           "high"),
            (None,  "3.2",   "SAT Testleri",           "medium"),
        ]
        wbs_map = {}
        for _, wbs, title, priority in wbs_data:
            parent_code = ".".join(wbs.split(".")[:-1]) if "." in wbs else None
            parent = wbs_map.get(parent_code)
            task, _ = Task.objects.get_or_create(
                project=project, wbs_code=wbs,
                defaults={
                    "title": title, "priority": priority,
                    "parent": parent,
                    "planned_start": TODAY - timedelta(days=30),
                    "planned_end": TODAY + timedelta(days=60),
                    "progress": 25 if "1" in wbs else 10,
                },
            )
            wbs_map[wbs] = task
        self.stdout.write(f"   OK 10 WBS görevi oluşturuldu (1 -> 1.1, 1.2 | 2 -> 2.1..3 | 3 -> 3.1..2)\n")

        # -- 3. Kalite & ITP ---------------------------------------------------
        self.stdout.write(self.style.SUCCESS("[3]  Kalite & ITP (Muayene Test Planı)"))
        self.stdout.write(
            "   > Her proje için ITP planı oluşturun.\n"
            "   > H=Hold (onay olmadan devam edilemez), W=Witness (seyirci), R=Review (belge inceleme).\n"
            "   > NCR: Uygunsuzluk tespit edildiğinde açılır, kapatılana kadar takip edilir.\n"
            "   > Sol menüde 'Kalite & ITP' sekmesinden erişin.\n"
        )
        plan, _ = InspectionPlan.objects.get_or_create(
            project=project, title="Ana Muayene & Test Planı",
            defaults={"description": "PLC/SCADA sistemi FAT/SAT muayene planı", "created_by": admin},
        )
        itp_items = [
            ("Kablo izolasyon testi",          HoldPointType.H, "Elektrik Mühendisi",  "IEC 60364", InspectionStatus.PENDING),
            ("PLC giriş/çıkış loop testi",     HoldPointType.W, "Otomasyon Mühendisi", "IEC 61511", InspectionStatus.PASSED),
            ("Topraklama ölçümü",              HoldPointType.H, "Elektrik Mühendisi",  "IEC 60364", InspectionStatus.PENDING),
            ("Sinyal kalibrasyonu (4-20 mA)",  HoldPointType.W, "Otomasyon Mühendisi", "NAMUR NE43",InspectionStatus.FAILED),
            ("FAT Protokol imzalanması",       HoldPointType.H, "Proje Müdürü",        "İç Prosedür",InspectionStatus.PENDING),
            ("Etiket ve levha kontrolü",       HoldPointType.R, "Kalite Sorumlusu",    "ISO 3864",  InspectionStatus.PASSED),
        ]
        item_failed = None
        for act, hpt, resp, std, status in itp_items:
            item, _ = InspectionItem.objects.get_or_create(
                plan=plan, activity_name=act,
                defaults={
                    "hold_point_type": hpt, "responsible_party": resp,
                    "standard_ref": std, "status": status,
                    "inspected_by": editor if status != InspectionStatus.PENDING else None,
                    "inspection_date": TODAY - timedelta(days=5) if status != InspectionStatus.PENDING else None,
                },
            )
            if status == InspectionStatus.FAILED:
                item_failed = item

        NCR.objects.get_or_create(
            project=project, ncr_no="NCR-2026-001",
            defaults={
                "title": "Sinyal kalibrasyon sapması -- +/-5% tolerans aşıldı",
                "description": "Reaktör sıcaklık sensörü (TAG: TT-101) kalibrasyon ölçümünde +/-8% sapma tespit edildi. IEC 61511 gereksinimi +/-5% tolerans.",
                "severity": NCRSeverity.MAJOR,
                "raised_by": editor or admin,
                "assigned_to": admin,
                "status": NCRStatus.IN_PROGRESS,
                "action_plan": "Sensörü yeniden kalibre et, transmitter sıfırla. Yeniden test et ve sonucu kaydet.",
                "inspection_item": item_failed,
            },
        )
        NCR.objects.get_or_create(
            project=project, ncr_no="NCR-2026-002",
            defaults={
                "title": "Topraklama direnici değeri yüksek",
                "description": "Kontrol paneli topraklama direnici 12Ohm ölçüldü. Beklenen max 5Ohm (IEC 60364).",
                "severity": NCRSeverity.MINOR,
                "raised_by": editor or admin,
                "status": NCRStatus.OPEN,
                "action_plan": "Topraklama bağlantısını kontrol et, gerekirse ek çubuk çak.",
            },
        )
        self.stdout.write(f"   OK 1 ITP planı, 6 kalem, 2 NCR oluşturuldu\n")

        # -- 4. Değişiklik Emirleri ---------------------------------------------
        self.stdout.write(self.style.SUCCESS("[4]  Değişiklik Emirleri (Change Order)"))
        self.stdout.write(
            "   > Kapsam, tasarım veya müşteri talepli değişiklikleri belgeleyin.\n"
            "   > Onaylanan CO -> Proje bütçesi otomatik güncellenir.\n"
            "   > Durum akışı: Taslak -> Gönderildi -> Onaylandı / Reddedildi.\n"
            "   > Sol menüde 'Değişiklik Emirleri' sekmesinden erişin.\n"
        )
        cos = [
            ("CO-001", "Ek 8 analog giriş modülü",
             "Müşteri proses optimizasyonu için 8 ilave AI modülü talep etti.",
             ChangeOrderReason.CLIENT_REQUEST, Decimal("45000"), 5, ChangeOrderStatus.APPROVED),
            ("CO-002", "SCADA sunucu yükseltme",
             "Mevcut sunucu kapasite yetersiz, 32GB RAM -> 64GB yükseltme.",
             ChangeOrderReason.DESIGN, Decimal("18500"), 3, ChangeOrderStatus.SUBMITTED),
            ("CO-003", "Zemin kaplama değişikliği",
             "İş güvenliği gereksinimi nedeniyle anti-statik zemin kaplama eklendi.",
             ChangeOrderReason.UNFORESEEN, Decimal("12000"), 2, ChangeOrderStatus.DRAFT),
        ]
        for co_no, title, desc, reason, cost, days, status in cos:
            co, _ = ChangeOrder.objects.get_or_create(
                project=project, co_number=co_no,
                defaults={
                    "title": title, "description": desc, "reason": reason,
                    "cost_impact": cost, "schedule_impact_days": days,
                    "requested_by": editor or admin, "status": status,
                    "approved_by": admin if status == ChangeOrderStatus.APPROVED else None,
                    "approved_at": timezone.now() if status == ChangeOrderStatus.APPROVED else None,
                },
            )
        self.stdout.write(f"   OK 3 değişiklik emri oluşturuldu (1 onaylı, 1 gönderildi, 1 taslak)\n")

        # -- 5. Tedarik --------------------------------------------------------
        self.stdout.write(self.style.SUCCESS("[5]  Tedarik & Satın Alma"))
        self.stdout.write(
            "   > Satın alma talebi -> Sipariş -> Teslimat zincirini takip edin.\n"
            "   > Beklenen teslim tarihi geçmiş siparişler kırmızı uyarı gösterir.\n"
            "   > Sol menüde 'Tedarik' sekmesinden erişin.\n"
        )
        req1, _ = PurchaseRequest.objects.get_or_create(
            project=project, item_name="Siemens S7-1500 PLC (6 adet)",
            defaults={
                "description": "CPU 1515-2 PN + DI/DO/AI modülleri",
                "quantity": Decimal("6"), "unit": "adet",
                "required_date": TODAY + timedelta(days=20),
                "requested_by": editor or admin,
                "status": PurchaseRequestStatus.APPROVED,
            },
        )
        req2, _ = PurchaseRequest.objects.get_or_create(
            project=project, item_name="75mm2 Güç Kablosu",
            defaults={
                "description": "Flexcel 75mm2 H07V-K, siyah",
                "quantity": Decimal("500"), "unit": "metre",
                "required_date": TODAY + timedelta(days=10),
                "requested_by": editor or admin,
                "status": PurchaseRequestStatus.ORDERED,
            },
        )
        po1, _ = PurchaseOrder.objects.get_or_create(
            project=project, po_number="PO-2026-001",
            defaults={
                "request": req1,
                "supplier_name": "Siemens Türkiye A.Ş.",
                "supplier_contact": "satis@siemens.com.tr / 0212 400 00 00",
                "total_amount": Decimal("285000"),
                "currency": "TRY",
                "order_date": TODAY - timedelta(days=15),
                "expected_delivery": TODAY + timedelta(days=5),
                "status": "pending",
                "notes": "Hızlandırılmış teslimat talep edildi.",
                "created_by": admin,
            },
        )
        po2, _ = PurchaseOrder.objects.get_or_create(
            project=project, po_number="PO-2026-002",
            defaults={
                "request": req2,
                "supplier_name": "Prysmian Kablo",
                "supplier_contact": "ihracat@prysmian.com",
                "total_amount": Decimal("37500"),
                "currency": "TRY",
                "order_date": TODAY - timedelta(days=20),
                "expected_delivery": TODAY - timedelta(days=5),  # Gecikmiş!
                "actual_delivery": None,
                "status": "pending",
                "created_by": admin,
            },
        )
        MaterialDelivery.objects.get_or_create(
            purchase_order=po1,
            delivery_date=TODAY - timedelta(days=2),
            defaults={
                "quantity_received": Decimal("3"),
                "inspection_status": DeliveryInspectionStatus.PASSED,
                "notes": "3 adet teslim alındı, 3 adet kalan kargo yolda.",
                "received_by": editor or admin,
            },
        )
        self.stdout.write(f"   OK 2 satın alma talebi, 2 sipariş (1 GECİKMİŞ), 1 teslimat oluşturuldu\n")

        # -- 6. Yazışmalar -----------------------------------------------------
        self.stdout.write(self.style.SUCCESS("[6]  Yazışma Yönetimi (RFI / DCN / Yazı)"))
        self.stdout.write(
            "   > Tüm teknik talepler (RFI), değişiklik bildirimleri (DCN) ve resmi yazıları kaydedin.\n"
            "   > Yanıt süresi dolan ve yanıtlanmamış yazışmalar 'GECİKMİŞ' olarak işaretlenir.\n"
            "   > Sol menüde 'Yazışmalar' sekmesinden erişin.\n"
        )
        corrs = [
            ("RFI-001", CorrespondenceType.RFI,
             "Reaktör TT-101 sensör yerine alternatif marka kabul edilebilir mi?",
             "ABC Mühendislik", "XYZ Müşavir",
             TODAY - timedelta(days=10), TODAY - timedelta(days=3),
             None, CorrespondenceStatus.OVERDUE),
            ("DCN-001", CorrespondenceType.DCN,
             "Panel 3 -- Güç giriş kesiti 35mm2'den 50mm2'ye revize edildi",
             "XYZ Müşavir", "ABC Mühendislik",
             TODAY - timedelta(days=5), TODAY + timedelta(days=2),
             TODAY - timedelta(days=1), CorrespondenceStatus.RESPONDED),
            ("LTR-001", CorrespondenceType.LETTER,
             "FAT tarih teyidi ve katılımcı listesi talebi",
             "ABC Mühendislik", "Müşteri İmalat Direktörü",
             TODAY - timedelta(days=2), TODAY + timedelta(days=5),
             None, CorrespondenceStatus.OPEN),
            ("TRM-001", CorrespondenceType.TRANSMITTAL,
             "FAT test prosedürü doküman gönderimi (Rev.2)",
             "ABC Mühendislik", "Kalite Departmanı",
             TODAY - timedelta(days=1), None,
             None, CorrespondenceStatus.OPEN),
        ]
        for ref, ctype, subj, frm, to, sent, due, responded, status in corrs:
            Correspondence.objects.get_or_create(
                project=project, ref_no=ref,
                defaults={
                    "type": ctype, "subject": subj,
                    "from_party": frm, "to_party": to,
                    "sent_at": sent, "response_due": due,
                    "responded_at": responded, "status": status,
                    "created_by": admin,
                },
            )
        self.stdout.write(f"   OK 4 yazışma oluşturuldu (1 GECİKMİŞ, 1 yanıtlandı, 2 açık)\n")

        # -- 7. Toplantılar & Aksiyonlar ---------------------------------------
        self.stdout.write(self.style.SUCCESS("[7]  Toplantılar & Aksiyon Takibi"))
        self.stdout.write(
            "   > Her toplantı için tutanak ve aksiyon kalemleri girin.\n"
            "   > Süresi geçmiş aksiyonlar kırmızı olarak vurgulanır.\n"
            "   > Sol menüde 'Toplantılar' sekmesinden erişin.\n"
        )
        m1, _ = Meeting.objects.get_or_create(
            project=project, title="Haftalık İlerleme Toplantısı #12",
            defaults={
                "type": MeetingType.WEEKLY,
                "meeting_date": TODAY - timedelta(days=3),
                "location": "Proje Sahası -- Toplantı Odası A",
                "minutes": (
                    "Gündem: 1) PLC programlama durumu, 2) Kablo gecikme riski, "
                    "3) FAT hazırlık takvimi\n\n"
                    "Kararlar: Siemens'e teslimat hızlandırma yazısı yazılacak. "
                    "FAT tarihi 15 gün öne alındı."
                ),
                "created_by": admin,
            },
        )
        m1.participants.add(admin)
        if editor:
            m1.participants.add(editor)

        m2, _ = Meeting.objects.get_or_create(
            project=project, title="FAT Hazırlık Tasarım İnceleme",
            defaults={
                "type": MeetingType.DESIGN_REVIEW,
                "meeting_date": TODAY - timedelta(days=1),
                "location": "Video Konferans (Teams)",
                "minutes": "FAT protokolü Rev.2 incelendi. 3 açık nokta belirlendi.",
                "created_by": admin,
            },
        )
        m2.participants.add(admin)

        actions = [
            (m1, "Siemens'e kargo hızlandırma yazısı gönder",       editor or admin, TODAY - timedelta(days=1), ActionItemStatus.OPEN),
            (m1, "FAT protokolünü Rev.2 olarak güncelle ve paylaş", editor or admin, TODAY + timedelta(days=2), ActionItemStatus.IN_PROGRESS),
            (m1, "Topraklama NCR aksiyon planını müşteriye sun",     admin,           TODAY - timedelta(days=2), ActionItemStatus.OPEN),
            (m2, "FAT katılımcı listesini müşteriye ilet",           editor or admin, TODAY + timedelta(days=1), ActionItemStatus.COMPLETED),
            (m2, "Test senaryolarını SCADA'ya yükle",               editor or admin, TODAY + timedelta(days=3), ActionItemStatus.OPEN),
        ]
        for meeting, desc, owner, due, status in actions:
            ActionItem.objects.get_or_create(
                meeting=meeting, description=desc,
                defaults={
                    "owner": owner, "due_date": due, "status": status,
                    "completed_at": TODAY if status == ActionItemStatus.COMPLETED else None,
                },
            )
        self.stdout.write(f"   OK 2 toplantı, 5 aksiyon kalemi oluşturuldu (2 GECİKMİŞ)\n")

        # -- 8. SGK & İSG -----------------------------------------------------
        self.stdout.write(self.style.SUCCESS("[8]  SGK & İş Güvenliği (İSG)"))
        self.stdout.write(
            "   > Günlük çalışan giriş sayısını kaydedin (SGK puantaj desteği).\n"
            "   > İş kazaları ve 'ramak kala' olayları kayıt altına alın.\n"
            "   > Periyodik İSG denetimleri planlayın ve takip edin.\n"
            "   > Sol menüde 'SGK & İSG' sekmesinden erişin.\n"
        )
        for i, (count, subcontractor) in enumerate([
            (12, ""), (15, ""), (14, "Mekanik Taşeron A.Ş."), (13, ""), (16, "Mekanik Taşeron A.Ş."),
        ]):
            WorkerEntry.objects.get_or_create(
                project=project, date=TODAY - timedelta(days=i),
                defaults={"worker_count": count, "subcontractor_name": subcontractor, "registered_by": editor or admin},
            )

        WorkAccident.objects.get_or_create(
            project=project, accident_date=TODAY - timedelta(days=8),
            description="Çalışan panel montajı sırasında basamaktan düşerek burkulma yaşadı.",
            defaults={
                "severity": AccidentSeverity.MINOR,
                "injured_person": "Ahmet Y. (Elektrikçi)",
                "action_taken": "İlk yardım uygulandı, iş güvenliği eğitimi tekrarlandı, basamak seti değiştirildi.",
                "reported_to_sgk": True,
                "sgk_report_date": TODAY - timedelta(days=7),
                "created_by": admin,
            },
        )
        WorkAccident.objects.get_or_create(
            project=project, accident_date=TODAY - timedelta(days=2),
            description="Kablo makarası devrilme riski -- ramak kala olayı, yaralanma yok.",
            defaults={
                "severity": AccidentSeverity.NEAR_MISS,
                "action_taken": "Makara sabitleme prosedürü revize edildi.",
                "reported_to_sgk": False,
                "created_by": editor or admin,
            },
        )

        ins, _ = HSEInspection.objects.get_or_create(
            project=project, inspection_date=TODAY - timedelta(days=7),
            defaults={
                "inspector": admin,
                "findings": "1) Elektrik panoları kilitli değil. 2) Yangın tüpü son kullanma tarihi dolmuş. 3) Kişisel koruyucu donanım (baret) eksik.",
                "action_required": "Tüm panolara kilit takılacak. Yangın tüpleri yenilenecek. Ek baret temin edilecek.",
                "next_inspection_date": TODAY + timedelta(days=14),
                "status": HSEInspectionStatus.OPEN,
            },
        )
        self.stdout.write(f"   OK 5 çalışan giriş kaydı, 2 kaza (1 SGK bildirili), 1 denetim oluşturuldu\n")

        # -- 9. Paydaşlar -----------------------------------------------------
        self.stdout.write(self.style.SUCCESS("[9]  Paydaş Yönetimi"))
        self.stdout.write(
            "   > Projeyi etkileyen/etkilenen tüm tarafları kaydedin.\n"
            "   > Etki (Influence) ve İlgi (Interest) seviyelerine göre matriste görünür.\n"
            "   > İletişim sıklığını belirleyin -- kimle ne sıklıkla iletişim kurulacak?\n"
            "   > Sol menüde 'Paydaşlar' sekmesinden erişin.\n"
        )
        stakeholders_data = [
            ("Mehmet Kaya",        "XYZ Müşteri A.Ş.",         "Proje Sahibi",          "m.kaya@xyz.com",      "0532 111 22 33", InfluenceLevel.HIGH,   InfluenceLevel.HIGH,   CommunicationFrequency.WEEKLY),
            ("Ayşe Demir",         "XYZ Müşteri A.Ş.",         "Satın Alma Müdürü",     "a.demir@xyz.com",     "0533 222 33 44", InfluenceLevel.HIGH,   InfluenceLevel.MEDIUM, CommunicationFrequency.MONTHLY),
            ("Kemal Arslan",       "ABC Mühendislik Ltd.",     "Proje Müdürü",          "k.arslan@abc.com",    "0535 333 44 55", InfluenceLevel.HIGH,   InfluenceLevel.HIGH,   CommunicationFrequency.DAILY),
            ("Fatma Öztürk",       "ABC Mühendislik Ltd.",     "Otomasyon Mühendisi",   "f.ozturk@abc.com",    "",              InfluenceLevel.MEDIUM, InfluenceLevel.HIGH,   CommunicationFrequency.DAILY),
            ("İl Çevre Müdürlüğü", "T.C. Çevre ve Orman Bak.","Denetleyici Kurum",     "",                    "",              InfluenceLevel.HIGH,   InfluenceLevel.LOW,    CommunicationFrequency.AS_NEEDED),
            ("Siemens Türkiye",    "Siemens A.Ş.",             "Ana Tedarikçi",         "destek@siemens.com",  "",              InfluenceLevel.MEDIUM, InfluenceLevel.MEDIUM, CommunicationFrequency.WEEKLY),
            ("Mekanik Taşeron",    "Mekanik Taşeron A.Ş.",     "Alt Yüklenici",         "",                    "",              InfluenceLevel.LOW,    InfluenceLevel.HIGH,   CommunicationFrequency.DAILY),
        ]
        for name, org, role, email, phone, inf, interest, freq in stakeholders_data:
            Stakeholder.objects.get_or_create(
                project=project, name=name,
                defaults={
                    "organization": org, "role": role, "email": email,
                    "phone": phone, "influence_level": inf,
                    "interest_level": interest, "communication_frequency": freq,
                },
            )
        self.stdout.write(f"   OK 7 paydaş oluşturuldu (3 yüksek etki, 2 orta, 2 düşük)\n")

        # -- 10. Ruhsat & İzin -------------------------------------------------
        self.stdout.write(self.style.SUCCESS("[10]  Ruhsat & İzin Takibi"))
        self.stdout.write(
            "   > Tüm yasal izin ve ruhsatları proje bazında kaydedin.\n"
            "   > Süresi 30 gün içinde dolacak izinler turuncu uyarı gösterir.\n"
            "   > Süresi dolmuş izinler kırmızı ile işaretlenir.\n"
            "   > Proje detay modalında 'İzinler' bölümünde görünür.\n"
        )
        permits_data = [
            ("yapi_ruhsati",    "RUH-2025-4521",  "İzmir Büyükşehir Belediyesi",  TODAY - timedelta(days=180), TODAY + timedelta(days=185), PermitStatus.ACTIVE),
            ("cevre_izni",      "ÇEV-2025-0892",  "İl Çevre ve Orman Müdürlüğü",  TODAY - timedelta(days=90),  TODAY + timedelta(days=25),  PermitStatus.ACTIVE),   # 25 gün -- turuncu!
            ("isg_belgesi",     "İSG-2026-0134",  "ÇSGB İş Teftiş Kurulu",        TODAY - timedelta(days=30),  TODAY + timedelta(days=335), PermitStatus.ACTIVE),
            ("belediye_onayi",  "BLD-2025-7723",  "Bornova Belediyesi",            TODAY - timedelta(days=200), TODAY - timedelta(days=5),   PermitStatus.EXPIRED),  # Süresi dolmuş!
            ("diger",           "SGB-2026-0021",  "Enerji Piyasası Düzenleme",     TODAY - timedelta(days=10),  None,                        PermitStatus.ACTIVE),
        ]
        for ptype, pno, issued_by, issue_date, expiry, status in permits_data:
            LegalPermit.objects.get_or_create(
                project=project, permit_no=pno,
                defaults={
                    "permit_type": ptype, "issued_by": issued_by,
                    "issue_date": issue_date, "expiry_date": expiry, "status": status,
                },
            )
        self.stdout.write(f"   OK 5 ruhsat/izin oluşturuldu (1 SÜRESİ DOLMUŞ, 1 UYARI -- 25 gün kaldı)\n")

        # -- 11. Hakediş Metraj & Fiyat Farkı ---------------------------------
        self.stdout.write(self.style.SUCCESS("[1][1]  Hakediş Metraj Cetveli & Fiyat Farkı"))
        self.stdout.write(
            "   > Her hakediş dönemine ait metraj satırları girin (birim fiyat x miktar).\n"
            "   > Enflasyon farkı: DİE endeks katsayısına göre otomatik hesaplanır.\n"
            "   > Hakediş sekmesinde ödeme detayında görünür.\n"
        )
        payment = ProgressPayment.objects.filter(project=project).first()
        if not payment:
            payment = ProgressPayment.objects.create(
                project=project,
                period_start=TODAY - timedelta(days=30),
                period_end=TODAY,
                planned_amount=Decimal("450000"),
                actual_amount=Decimal("390000"),
                approved_amount=Decimal("390000"),
                status="approved",
            )
            self.stdout.write("   (Örnek hakediş dönemi oluşturuldu)")

        metraj_data = [
            ("101.001", "Enerji Analiz Cihazı Montajı",    "adet",  Decimal("6"),  Decimal("6"),   Decimal("4500")),
            ("102.001", "75mm2 Güç Kablosu Çekimi",        "metre", Decimal("500"), Decimal("480"), Decimal("75")),
            ("103.001", "PLC Dolabı Kurulumu",              "adet",  Decimal("3"),  Decimal("3"),   Decimal("28000")),
            ("104.001", "SCADA Yazılım Lisansı",            "adet",  Decimal("1"),  Decimal("1"),   Decimal("65000")),
            ("105.001", "Boru ve Kablo Taşıyıcı Montajı",  "metre", Decimal("250"), Decimal("210"), Decimal("120")),
        ]
        for poz_no, tanim, birim, sozlesme, gerceklesen, birim_fiyat in metraj_data:
            MetrajSatiri.objects.get_or_create(
                progress_payment=payment, poz_no=poz_no,
                defaults={
                    "tanim": tanim, "birim": birim,
                    "sozlesme_miktari": sozlesme,
                    "gerceklesen_miktar": gerceklesen,
                    "birim_fiyat": birim_fiyat,
                },
            )

        FiyatFarki.objects.get_or_create(
            progress_payment=payment, endeks_turu="Elektrik-Elektronik İmalat Endeksi (D-IV)",
            defaults={
                "baslangic_endeksi": Decimal("542.18"),
                "bitis_endeksi": Decimal("589.34"),
                "fark_tutari": Decimal("33842.50"),
            },
        )
        FiyatFarki.objects.get_or_create(
            progress_payment=payment, endeks_turu="İnşaat Maliyeti Endeksi (C-IX)",
            defaults={
                "baslangic_endeksi": Decimal("1204.55"),
                "bitis_endeksi": Decimal("1289.10"),
                "fark_tutari": Decimal("8450.00"),
            },
        )
        self.stdout.write(f"   OK 5 metraj satırı, 2 fiyat farkı kalemi oluşturuldu\n")

        # -- Özet --------------------------------------------------------------
        self.stdout.write("\n" + "-" * 60)
        self.stdout.write(self.style.SUCCESS("\nTAMAM PM Örnek Verisi Başarıyla Oluşturuldu!\n"))
        self.stdout.write(self.style.WARNING(
            "  Şimdi yapabilecekleriniz:\n"
            "  - python manage.py runserver --settings=config.settings.local\n"
            "  - http://127.0.0.1:8000 adresini açın\n"
            "  - admin / admin123 ile giriş yapın\n\n"
            "  Yeni Sekmeleri Deneyin:\n"
            "   Kalite & ITP   -- NCR-2026-001 majör uygunsuzluk bekliyor\n"
            "   Değişiklik     -- CO-001 onaylı, CO-002 onay bekliyor\n"
            "   Tedarik        -- PO-2026-002 GECİKMİŞ (kırmızı)\n"
            "    Yazışmalar    -- RFI-001 OVERDUE uyarısı\n"
            "   Toplantılar    -- 2 gecikmiş aksiyon kalemi\n"
            "    SGK & İSG     -- 1 kaza kaydı, 1 açık denetim\n"
            "   Paydaşlar      -- 7 paydaş (etki/ilgi matrisi)\n"
            "   İzinler        -- Proje detayında (1 süresi dolmuş!)\n"
            "   Hakediş        -- Metraj cetveli + fiyat farkı tablosu\n"
        ))

    def _reset(self):
        from apps.stakeholders.models import Stakeholder
        Stakeholder.objects.all().delete()
        LegalPermit.objects.all().delete()
        WorkerEntry.objects.all().delete()
        WorkAccident.objects.all().delete()
        HSEInspection.objects.all().delete()
        ActionItem.objects.all().delete()
        Meeting.objects.all().delete()
        Correspondence.objects.all().delete()
        ChangeOrder.objects.all().delete()
        PurchaseRequest.objects.all().delete()
        PurchaseOrder.objects.all().delete()
        NCR.objects.all().delete()
        InspectionItem.objects.all().delete()
        InspectionPlan.objects.all().delete()
        BudgetLine.objects.all().delete()
        MetrajSatiri.objects.all().delete()
        FiyatFarki.objects.all().delete()
        Task.objects.filter(wbs_code__ne="").delete() if hasattr(Task.objects.filter(), "ne") else Task.objects.filter(wbs_code__isnull=False).exclude(wbs_code="").delete()
