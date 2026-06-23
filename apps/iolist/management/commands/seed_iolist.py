from django.core.management.base import BaseCommand
from apps.projects.models import Project
from apps.iolist.models import IOPoint


ITEMS = [
    # (tag_no, tanim, sinyal_tipi, proses_deger, plc_rack, plc_slot, plc_kanal, alan_cihaz, kablo_durum)
    ("FIC-101", "Kazan besleme suyu akış kontrol", "AI", "4-20mA / 0-100 m³/h", "R1", "S3", "CH01", "Endress+Hauser Coriolis", "baglandi"),
    ("LSH-201", "Buhar kazanı yüksek seviye şalteri", "DI", "NC / 24VDC", "R1", "S2", "CH04", "Vega VEGAPOINT 23", "test_ok"),
    ("PIC-301", "Reaktör basınç kontrolü", "AI", "4-20mA / 0-16 bar", "R1", "S3", "CH02", "Siemens SITRANS P", "baglandi"),
    ("MV-101A", "Ana besleme motoru çalış/dur", "DO", "24VDC Coil / 5A", "R1", "S4", "CH01", "Schneider LC1D VFD", "test_ok"),
    ("TIC-401", "Karıştırıcı sıcaklık kontrolü", "RTD", "PT100 / -50…200°C", "R2", "S1", "CH01", "Autonics TK4W", "baglandi"),
    ("LSL-202", "Yağ tanka düşük seviye alarmı", "DI", "NO / 24VDC", "R1", "S2", "CH08", "GEMS Sensors LS-700", "cekildi"),
    ("AIC-501", "Baca gazı O2 analizi", "AI", "4-20mA / 0-25% O2", "R2", "S3", "CH03", "ABB AO2000 Uras26", "bekliyor"),
    ("MV-202B", "Pompa 2 manuel kontrol", "DO", "24VDC / 2A", "R1", "S4", "CH05", "WEG CFW500 VFD", "cekildi"),
    ("FQI-601", "Su sayacı puls girişi", "PI", "24VDC Puls / 0.1 L/imp", "R2", "S2", "CH01", "Itron BM+I", "test_ok"),
    ("ESD-001", "Acil durdurma butonu (güvenlik zinciri)", "DI", "NC / SIL2 Certified", "R1", "S1", "CH01", "Schmersal AZM200", "test_ok"),
    ("TI-701", "Saha sıcaklık göstergesi", "TC", "K-Tipi / 0-500°C", "R2", "S1", "CH04", "Wika TR10-E", "baglandi"),
    ("COM-PLC01", "PLC-SCADA Profinet bağlantısı", "COM", "Profinet / 100Mbps", "R1", "S0", "—", "Siemens S7-1500 PN", "test_ok"),
]


class Command(BaseCommand):
    help = "Örnek I/O listesi verileri ekler (idempotent)"

    def handle(self, *args, **kwargs):
        projeler = list(Project.objects.all()[:3])
        if not projeler:
            self.stdout.write(self.style.WARNING("Önce seed_demo çalıştırın."))
            return

        eklendi = 0
        for i, (tag, tanim, sinyal, proses, rack, slot, kanal, cihaz, kablo) in enumerate(ITEMS):
            proje = projeler[i % len(projeler)]
            _, created = IOPoint.objects.get_or_create(
                proje=proje, tag_no=tag,
                defaults=dict(tanim=tanim, sinyal_tipi=sinyal, proses_deger=proses,
                              plc_rack=rack, plc_slot=slot, plc_kanal=kanal,
                              alan_cihaz=cihaz, kablo_durum=kablo,
                              durum="onaylandi" if kablo in ("test_ok","baglandi") else "taslak"),
            )
            if created:
                eklendi += 1

        self.stdout.write(self.style.SUCCESS(f"{eklendi} I/O noktası eklendi."))
