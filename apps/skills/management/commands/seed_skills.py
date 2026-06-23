"""
skill-ekosistemi.json, SKILL.md ve referans/ dosyalarından veritabanını doldurur.
Yukler: RoleSkill, TaskTemplate, GorevDurumu, ReferansDoc.

Kullanim:
    python manage.py seed_skills          # Yeni ekler, mevcut gunceller
    python manage.py seed_skills --reset  # Tum skill verisini sifirLayip yeniden yukler
"""
import json
import re
from pathlib import Path

from django.core.management.base import BaseCommand
from django.db import transaction

from apps.skills.models import GorevDurumu, ProjeGorev, ReferansDoc, RoleSkill, TaskTemplate

SKILLS_DIR = Path(__file__).resolve().parents[4] / "skills"
REFERANS_DIR = Path(__file__).resolve().parents[4] / "referans"

# rol_id -> SKILL.md dosya adi eslemesi
SKILL_MD_MAP = {
    "PLCProg":  "plc-programcisi-SKILL.md",
    "SCADAEng": "scada-muhendisi-SKILL.md",
    "SahaTech": "saha-teknisyeni-SKILL.md",
    "ElkEng":   "elektrik-otomasyon-muhendisi-SKILL.md",
}

# referans/ dosya on-eki -> rol_id
REFERANS_PREFIX_MAP = {
    "elk":   "ElkEng",
    "plc":   "PLCProg",
    "saha":  "SahaTech",
    "scada": "SCADAEng",
}


class Command(BaseCommand):
    help = "skill-ekosistemi.json ve SKILL.md dosyalarından skill verisini yukler"

    def add_arguments(self, parser):
        parser.add_argument(
            "--reset", action="store_true",
            help="Mevcut skill verisini silerek yeniden olustur",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        ekosistem_path = SKILLS_DIR / "skill-ekosistemi.json"
        if not ekosistem_path.exists():
            self.stderr.write(f"Dosya bulunamadi: {ekosistem_path}")
            return

        with open(ekosistem_path, encoding="utf-8") as f:
            data = json.load(f)

        if options["reset"]:
            ProjeGorev.objects.all().delete()
            ReferansDoc.objects.all().delete()
            TaskTemplate.objects.all().delete()
            RoleSkill.objects.all().delete()
            GorevDurumu.objects.all().delete()
            self.stdout.write("  Mevcut skill verisi silindi.")

        # --- GorevDurumu ---
        self._seed_gorev_durumlari(data.get("gorev_durumlari", []))

        # --- RoleSkill + TaskTemplate ---
        for rol_data in data["roller"]:
            skill_icerik = self._load_skill_md(rol_data["rol_id"])

            rol, created = RoleSkill.objects.update_or_create(
                rol_id=rol_data["rol_id"],
                defaults={
                    "rol_adi":        rol_data["rol_adi"],
                    "renk_kodu":      rol_data.get("renk_kodu", "#4f6ef7"),
                    "ikon":           rol_data.get("ikon", ""),
                    "sorumluluklar":  rol_data.get("sorumluluklar", []),
                    "yetkinlikler":   rol_data.get("yetkinlikler", []),
                    "durum_alanlari": rol_data.get("durum_alanlari", []),
                    "skill_icerik":   skill_icerik,
                },
            )
            verb = "Olusturuldu" if created else "Guncellendi"
            self.stdout.write(f"  {verb}: {rol.rol_id} - {rol.rol_adi}")

            # Şablonları her zaman sıfırla (idempotent)
            TaskTemplate.objects.filter(rol=rol).delete()
            self._create_task_templates(rol, rol_data.get("gorev_sablonlari", []))

        # --- Referans Dokumanlar ---
        self._seed_referans_dokumanlar()

        # --- Proje Gorevleri ---
        self._seed_proje_gorevleri()

        self.stdout.write(
            self.style.SUCCESS("[OK] Skill verisi basariyla yuklendi.")
        )

    def _seed_gorev_durumlari(self, durum_list: list):
        for sira, d in enumerate(durum_list):
            GorevDurumu.objects.update_or_create(
                deger=d["deger"],
                defaults={"renk": d["renk"], "ikon": d.get("ikon", ""), "sira": sira},
            )
        self.stdout.write(f"  GorevDurumu: {len(durum_list)} durum yuklendi.")

    def _create_task_templates(self, rol: RoleSkill, sablonlar: list):
        for sira, sablon in enumerate(sablonlar, start=1):
            TaskTemplate.objects.create(
                rol=rol,
                gorev_id_prefix=sablon["gorev_id_prefix"],
                gorev_sira=sira,
                gorev_adi=sablon["gorev_adi"],
                faz=sablon["faz"],
                min_gun=sablon["min_gun"],
                max_gun=sablon["max_gun"],
                onkosullar=sablon.get("onkoşullar", []),
                teslimati=sablon.get("teslimati", ""),
                tekrar=sablon.get("tekrar", ""),
            )

    def _load_skill_md(self, rol_id: str) -> str:
        filename = SKILL_MD_MAP.get(rol_id)
        if not filename:
            return ""
        path = SKILLS_DIR / filename
        if not path.exists():
            self.stderr.write(f"  Uyari: {path} bulunamadi, skill_icerik bos.")
            return ""
        return path.read_text(encoding="utf-8")

    def _seed_referans_dokumanlar(self):
        if not REFERANS_DIR.exists():
            self.stderr.write(f"  Uyari: {REFERANS_DIR} bulunamadi, referanslar atlanıyor.")
            return

        count = 0
        for md_path in sorted(REFERANS_DIR.glob("*.md")):
            stem = md_path.stem  # "plc-kod-standartlari"

            # on-eki bul (en uzun eslesen on-eke gore)
            rol_id = None
            prefix_used = ""
            for prefix, rid in REFERANS_PREFIX_MAP.items():
                if stem.startswith(prefix + "-") and len(prefix) > len(prefix_used):
                    rol_id = rid
                    prefix_used = prefix

            if not rol_id:
                self.stderr.write(f"  Uyari: {md_path.name} icin rol tanımlanamadı, atlanıyor.")
                continue

            try:
                rol = RoleSkill.objects.get(rol_id=rol_id)
            except RoleSkill.DoesNotExist:
                self.stderr.write(f"  Uyari: RoleSkill '{rol_id}' bulunamadı, {md_path.name} atlanıyor.")
                continue

            slug = stem[len(prefix_used) + 1:]  # "kod-standartlari"
            icerik = md_path.read_text(encoding="utf-8")

            # Baslik: ilk # satirı
            baslik = slug
            for line in icerik.splitlines():
                stripped = line.strip()
                if stripped.startswith("# "):
                    baslik = stripped[2:].strip()
                    break

            # Standart ve revizyon: ikinci satirdan parse et
            standart = ""
            revizyon = ""
            lines = icerik.splitlines()
            if len(lines) > 1:
                meta_line = lines[1]
                standart_match = re.search(r"\*\*(?:Standart|Kapsam)\*\*:\s*([^|]+)", meta_line)
                if standart_match:
                    standart = standart_match.group(1).strip()
                revizyon_match = re.search(r"\*\*Revizyon\*\*:\s*([^\s|]+)", meta_line)
                if revizyon_match:
                    revizyon = revizyon_match.group(1).strip()

            ReferansDoc.objects.update_or_create(
                slug=slug,
                defaults={
                    "rol": rol,
                    "baslik": baslik,
                    "standart": standart,
                    "revizyon": revizyon,
                    "icerik": icerik,
                },
            )
            count += 1

        self.stdout.write(f"  ReferansDoc: {count} dokuman yuklendi.")

    def _seed_proje_gorevleri(self):
        ham_gorevler = [
            # ELK
            {"id": "ELK-001", "rol": "ELK", "adi": "Otomasyon Mimarisi Tasarimi",    "faz": "Tasarim",      "gun": 3,  "onk": [],                                     "teslim": "Mimari blok sema"},
            {"id": "ELK-002", "rol": "ELK", "adi": "Ekipman Listesi ve On Secim",    "faz": "Tasarim",      "gun": 2,  "onk": ["ELK-001"],                            "teslim": "Ekipman on secim tablosu"},
            {"id": "ELK-003", "rol": "ELK", "adi": "Guc Dagitim Tek Hat Semasi",     "faz": "Tasarim",      "gun": 3,  "onk": ["ELK-002"],                            "teslim": "Onaylı SLD"},
            {"id": "ELK-004", "rol": "ELK", "adi": "Kablo Kesit ve Koruma Hesabi",   "faz": "Tasarim",      "gun": 2,  "onk": ["ELK-003"],                            "teslim": "Hesap raporu"},
            {"id": "ELK-005", "rol": "ELK", "adi": "Pano Layout Tasarimi",           "faz": "Tasarim",      "gun": 2,  "onk": ["ELK-002", "ELK-003"],                 "teslim": "Panel layout"},
            {"id": "ELK-006", "rol": "ELK", "adi": "I/O Listesi (Muh. Surumu)",      "faz": "Tasarim",      "gun": 2,  "onk": ["ELK-001"],                            "teslim": "Master I/O listesi"},
            {"id": "ELK-007", "rol": "ELK", "adi": "Fonksiyonel Tasarim Dok. (FDS)", "faz": "Tasarim",      "gun": 4,  "onk": ["ELK-001", "ELK-006"],                 "teslim": "Onaylı FDS"},
            {"id": "ELK-008", "rol": "ELK", "adi": "Risk Degerlendirmesi",           "faz": "Tasarim",      "gun": 2,  "onk": ["ELK-007"],                            "teslim": "Risk matrisi"},
            {"id": "ELK-009", "rol": "ELK", "adi": "Teknik Sartname Hazirlama",      "faz": "Tedarik",      "gun": 3,  "onk": ["ELK-003", "ELK-004"],                 "teslim": "Sartname seti"},
            {"id": "ELK-010", "rol": "ELK", "adi": "Malzeme Listesi (BOM) ve Teklif","faz": "Tedarik",      "gun": 2,  "onk": ["ELK-009"],                            "teslim": "BOM + teklif"},
            {"id": "ELK-011", "rol": "ELK", "adi": "Tedarikci/Teklif Degerlendirme", "faz": "Tedarik",      "gun": 2,  "onk": ["ELK-010"],                            "teslim": "Karsilastirma tablosu"},
            {"id": "ELK-012", "rol": "ELK", "adi": "FAT Plani Hazirlama",            "faz": "Test",         "gun": 2,  "onk": ["ELK-007"],                            "teslim": "FAT plani"},
            {"id": "ELK-013", "rol": "ELK", "adi": "FAT Denetimi/Onayi",             "faz": "Test",         "gun": 2,  "onk": ["ELK-012", "PLC-009", "SCADA-011"],    "teslim": "Imzali FAT"},
            {"id": "ELK-014", "rol": "ELK", "adi": "Devreye Alma Muh. Destegi",      "faz": "Devreye Alma", "gun": 5,  "onk": ["ELK-013"],                            "teslim": "Commissioning raporu"},
            {"id": "ELK-015", "rol": "ELK", "adi": "CE/Teknik Dosya Hazirlama",      "faz": "Kapanis",      "gun": 3,  "onk": ["ELK-014"],                            "teslim": "Teknik dosya"},
            {"id": "ELK-016", "rol": "ELK", "adi": "As-Built Onayi",                 "faz": "Kapanis",      "gun": 1,  "onk": ["ELK-015"],                            "teslim": "Onaylı as-built"},
            # PLC
            {"id": "PLC-001", "rol": "PLC", "adi": "I/O Listesi Hazirlama",          "faz": "Tasarim",      "gun": 3,  "onk": ["ELK-001", "ELK-006"],                 "teslim": "Excel I/O Listesi"},
            {"id": "PLC-002", "rol": "PLC", "adi": "Tag Veritabani Olusturma",        "faz": "Tasarim",      "gun": 2,  "onk": ["PLC-001"],                            "teslim": "Tag export"},
            {"id": "PLC-003", "rol": "PLC", "adi": "Ana Program Yapisi",             "faz": "Gelistirme",   "gun": 3,  "onk": ["PLC-001", "ELK-007"],                 "teslim": "PLC proje v1"},
            {"id": "PLC-004", "rol": "PLC", "adi": "Guvenlik Bloklarinin Yazilmasi", "faz": "Gelistirme",   "gun": 4,  "onk": ["PLC-003"],                            "teslim": "Safety FB kutuphanesi"},
            {"id": "PLC-005", "rol": "PLC", "adi": "Sira Kontrol Programlama",       "faz": "Gelistirme",   "gun": 5,  "onk": ["PLC-003", "PLC-004"],                 "teslim": "Sequence FB'leri"},
            {"id": "PLC-006", "rol": "PLC", "adi": "Alarm Yonetimi",                 "faz": "Gelistirme",   "gun": 2,  "onk": ["PLC-003"],                            "teslim": "Alarm listesi + kod"},
            {"id": "PLC-007", "rol": "PLC", "adi": "HMI Haberlesmesi Konfigurasyonu","faz": "Entegrasyon",  "gun": 2,  "onk": ["PLC-002", "SCADA-003"],               "teslim": "Haberlesme test raporu"},
            {"id": "PLC-008", "rol": "PLC", "adi": "Offline Simulasyon ve Test",     "faz": "Test",         "gun": 3,  "onk": ["PLC-003", "PLC-004", "PLC-005"],      "teslim": "Simulasyon raporu"},
            {"id": "PLC-009", "rol": "PLC", "adi": "FAT Hazirligi ve Uygulama",      "faz": "Test",         "gun": 3,  "onk": ["PLC-008"],                            "teslim": "Imzali FAT"},
            {"id": "PLC-010", "rol": "PLC", "adi": "Saha Devreye Alma",              "faz": "Devreye Alma", "gun": 7,  "onk": ["PLC-009", "SAHA-010"],                "teslim": "Commissioning raporu"},
            {"id": "PLC-011", "rol": "PLC", "adi": "SAT Uygulama ve Onay",           "faz": "Kabul",        "gun": 2,  "onk": ["PLC-010"],                            "teslim": "Imzali SAT"},
            {"id": "PLC-012", "rol": "PLC", "adi": "As-Built Dokumantasyon",         "faz": "Kapanis",      "gun": 2,  "onk": ["PLC-011"],                            "teslim": "As-built PLC projesi"},
            # SCADA
            {"id": "SCADA-001", "rol": "SCADA", "adi": "Mimari ve Platform Secimi",    "faz": "Tasarim",      "gun": 2,  "onk": ["ELK-001"],                          "teslim": "SCADA mimari dokumani"},
            {"id": "SCADA-002", "rol": "SCADA", "adi": "Tag Isimlendirme Standarti",   "faz": "Tasarim",      "gun": 1,  "onk": ["SCADA-001"],                        "teslim": "Naming convention"},
            {"id": "SCADA-003", "rol": "SCADA", "adi": "Tag Veritabani Olusturma",     "faz": "Gelistirme",   "gun": 4,  "onk": ["SCADA-002", "PLC-002"],             "teslim": "Tag veritabani"},
            {"id": "SCADA-004", "rol": "SCADA", "adi": "Ana Mimik Ekranlari",          "faz": "Gelistirme",   "gun": 5,  "onk": ["SCADA-003"],                        "teslim": "Ana ekranlar"},
            {"id": "SCADA-005", "rol": "SCADA", "adi": "Detay Ekranlari",              "faz": "Gelistirme",   "gun": 5,  "onk": ["SCADA-004"],                        "teslim": "Detay ekranlari"},
            {"id": "SCADA-006", "rol": "SCADA", "adi": "Alarm Konfigurasyonu",         "faz": "Gelistirme",   "gun": 3,  "onk": ["SCADA-003", "PLC-006"],             "teslim": "Alarm listesi"},
            {"id": "SCADA-007", "rol": "SCADA", "adi": "Historian Konfigurasyonu",     "faz": "Gelistirme",   "gun": 2,  "onk": ["SCADA-003"],                        "teslim": "Historian arsiv plani"},
            {"id": "SCADA-008", "rol": "SCADA", "adi": "Kullanici Yetkilendirme",      "faz": "Gelistirme",   "gun": 1,  "onk": ["SCADA-001"],                        "teslim": "User role matrisi"},
            {"id": "SCADA-009", "rol": "SCADA", "adi": "OPC/Haberlesme Baglantisi",    "faz": "Entegrasyon",  "gun": 3,  "onk": ["SCADA-003", "PLC-007"],             "teslim": "Haberlesme test raporu"},
            {"id": "SCADA-010", "rol": "SCADA", "adi": "Raporlama Modulu",             "faz": "Gelistirme",   "gun": 3,  "onk": ["SCADA-007"],                        "teslim": "Rapor sablonlari"},
            {"id": "SCADA-011", "rol": "SCADA", "adi": "FAT Uygulama",                 "faz": "Test",         "gun": 3,  "onk": ["SCADA-009"],                        "teslim": "Imzali SCADA FAT"},
            {"id": "SCADA-012", "rol": "SCADA", "adi": "Saha Devreye Alma",            "faz": "Devreye Alma", "gun": 4,  "onk": ["SCADA-011", "PLC-010"],             "teslim": "SCADA canli sistem"},
            {"id": "SCADA-013", "rol": "SCADA", "adi": "Operator Egitimi",             "faz": "Kapanis",      "gun": 2,  "onk": ["SCADA-012"],                        "teslim": "Egitim kaydi"},
            {"id": "SCADA-014", "rol": "SCADA", "adi": "As-Built Dokumantasyon",       "faz": "Kapanis",      "gun": 2,  "onk": ["SCADA-013"],                        "teslim": "As-built SCADA"},
            # SAHA
            {"id": "SAHA-001", "rol": "SAHA", "adi": "Saha On Kesif ve Olcum",       "faz": "Tasarim",      "gun": 1,  "onk": [],                                     "teslim": "Kesif raporu"},
            {"id": "SAHA-002", "rol": "SAHA", "adi": "Malzeme Teslim Alma",           "faz": "Tedarik",      "gun": 1,  "onk": ["ELK-011"],                            "teslim": "Irsaliye onaylı liste"},
            {"id": "SAHA-003", "rol": "SAHA", "adi": "Pano/Kabin Mekanik Montaji",    "faz": "Gelistirme",   "gun": 2,  "onk": ["SAHA-001", "SAHA-002"],               "teslim": "Montaj fotograflari"},
            {"id": "SAHA-004", "rol": "SAHA", "adi": "Kablo Kanal ve Tray Doseme",    "faz": "Gelistirme",   "gun": 3,  "onk": ["SAHA-003"],                           "teslim": "Doseme fotograflari"},
            {"id": "SAHA-005", "rol": "SAHA", "adi": "Guc Kablolarinin Cekilmesi",    "faz": "Gelistirme",   "gun": 2,  "onk": ["SAHA-004"],                           "teslim": "Kablo listesi"},
            {"id": "SAHA-006", "rol": "SAHA", "adi": "Sinyal/Kontrol Kabloları",      "faz": "Gelistirme",   "gun": 2,  "onk": ["SAHA-004"],                           "teslim": "Sinyal kablo listesi"},
            {"id": "SAHA-007", "rol": "SAHA", "adi": "Pano Ic Baglantilari",          "faz": "Gelistirme",   "gun": 2,  "onk": ["SAHA-005", "SAHA-006"],               "teslim": "Baglanti kontrol formu"},
            {"id": "SAHA-008", "rol": "SAHA", "adi": "Saha Cihazlari Montaji",        "faz": "Gelistirme",   "gun": 2,  "onk": ["SAHA-004"],                           "teslim": "Montaj fotograflari"},
            {"id": "SAHA-009", "rol": "SAHA", "adi": "Kablo Test (Surekklilik/Izol)", "faz": "Test",         "gun": 1,  "onk": ["SAHA-007"],                           "teslim": "Kablo test raporu"},
            {"id": "SAHA-010", "rol": "SAHA", "adi": "I/O Checkout (Sinyal Dogr.)",   "faz": "Devreye Alma", "gun": 2,  "onk": ["SAHA-009", "PLC-003"],                "teslim": "I/O checkout formu"},
            {"id": "SAHA-011", "rol": "SAHA", "adi": "Cihaz Devreye Alma",            "faz": "Devreye Alma", "gun": 2,  "onk": ["SAHA-010"],                           "teslim": "Parametre listesi"},
            {"id": "SAHA-012", "rol": "SAHA", "adi": "Fonksiyonel Test Destegi",      "faz": "Test",         "gun": 2,  "onk": ["SAHA-011", "PLC-008"],                "teslim": "Test destegi kaydi"},
            {"id": "SAHA-013", "rol": "SAHA", "adi": "As-Built (Red-line) Guncelleme","faz": "Kapanis",      "gun": 1,  "onk": ["SAHA-012"],                           "teslim": "As-built semalar"},
            {"id": "SAHA-014", "rol": "SAHA", "adi": "Saha Temizlik ve Teslim",       "faz": "Kapanis",      "gun": 1,  "onk": ["SAHA-013"],                           "teslim": "Teslim tutanagi"},
            # PM
            {"id": "PM-001", "rol": "PM", "adi": "Proje Kick-off ve Kapsam",        "faz": "Baslangic",    "gun": 2,  "onk": [],                                     "teslim": "Kick-off tutanagi"},
            {"id": "PM-002", "rol": "PM", "adi": "Proje Plani ve Gantt",            "faz": "Planlama",     "gun": 2,  "onk": ["PM-001"],                             "teslim": "Onaylı proje plani"},
            {"id": "PM-003", "rol": "PM", "adi": "Kaynak Planlamasi",               "faz": "Planlama",     "gun": 1,  "onk": ["PM-002"],                             "teslim": "Kaynak takvimi"},
            {"id": "PM-004", "rol": "PM", "adi": "Risk Kaydi Olusturma",            "faz": "Planlama",     "gun": 1,  "onk": ["PM-001"],                             "teslim": "Risk matrisi"},
            {"id": "PM-005", "rol": "PM", "adi": "FAT Koordinasyonu",               "faz": "Test",         "gun": 2,  "onk": ["ELK-012", "PLC-009", "SCADA-011"],    "teslim": "FAT davet + gundem"},
            {"id": "PM-006", "rol": "PM", "adi": "Musteri SAT Koordinasyonu",       "faz": "Kabul",        "gun": 2,  "onk": ["PLC-010", "SCADA-012"],               "teslim": "SAT davet + onay paketi"},
            {"id": "PM-007", "rol": "PM", "adi": "Proje Kapanis Raporu",            "faz": "Kapanis",      "gun": 2,  "onk": ["PLC-012", "SCADA-014", "ELK-016"],    "teslim": "Kapanis raporu"},
        ]

        # Topologik siralama ile baslangic_gun hesapla
        by_id = {t["id"]: t for t in ham_gorevler}
        baslangic = {}
        resolved = set()
        iteration = 0
        while len(resolved) < len(ham_gorevler) and iteration < 300:
            iteration += 1
            for t in ham_gorevler:
                if t["id"] in resolved:
                    continue
                if all(o in resolved for o in t["onk"]):
                    if not t["onk"]:
                        baslangic[t["id"]] = 0
                    else:
                        baslangic[t["id"]] = max(
                            baslangic[o] + by_id[o]["gun"] for o in t["onk"]
                        )
                    resolved.add(t["id"])

        count = 0
        for t in ham_gorevler:
            ProjeGorev.objects.update_or_create(
                gorev_id=t["id"],
                defaults={
                    "rol":           t["rol"],
                    "gorev_adi":     t["adi"],
                    "faz":           t["faz"],
                    "gun":           t["gun"],
                    "onk":           t["onk"],
                    "teslim":        t["teslim"],
                    "baslangic_gun": baslangic.get(t["id"], 0),
                },
                # durum / tamamlanma / not_metni NOT in defaults → kullanici editleri korunur
            )
            count += 1

        self.stdout.write(f"  ProjeGorev: {count} gorev yuklendi.")
