from django.core.management.base import BaseCommand
from apps.projects.models import Project
from apps.risks.models import Risk


SAMPLE_RISKS = [
    # (baslik, aciklama, kategori, olasilik, etki, mitigasyon, durum)
    ("PLC yazılım hatası", "Yazılım testleri yetersiz kalırsa FAT'ta sorun çıkabilir.",
     "teknik", 3, 5, "FAT öncesi kapsamlı yazılım testi ve kod review yapılacak.", "acik"),
    ("Malzeme tedarik gecikmesi", "Import ürünlerde gümrük gecikmesi.",
     "zaman", 4, 4, "Kritik malzemeler için 4 hafta önceden sipariş ver, alternatif tedarikçi belirle.", "izleniyor"),
    ("Bütçe aşımı riski", "Döviz kurundaki dalgalanma maliyetleri artırabilir.",
     "mali", 3, 4, "Sözleşmeye kur koruma maddesi eklendi.", "izleniyor"),
    ("Kablo güzergah değişikliği", "Mevcut boru/kanal güzergahı onaylanmamış.",
     "teknik", 2, 3, "Montaj öncesi saha survey raporu alınacak.", "acik"),
    ("Sahada yetersiz teknik kaynak", "Eş zamanlı projeler nedeniyle mühendis sıkıntısı.",
     "kaynak", 4, 3, "Proje takvimi revize edildi, dış kaynak hazır bekletiliyor.", "azaltildi"),
    ("SCADA lisans gecikmesi", "Yazılım lisansı tedarikçiden geç gelebilir.",
     "teknik", 2, 4, "Lisans siparişi erken verildi, geçici lisans talep edildi.", "acik"),
    ("Müşteri onay gecikmesi", "Tasarım dökümanları müşteri tarafından geç onaylanıyor.",
     "zaman", 3, 3, "Haftalık takip toplantısı planlandı.", "izleniyor"),
    ("IEC 61511 uyum eksikliği", "SIL hesaplamaları tamamlanmamış.",
     "guvenlik", 2, 5, "Bağımsız SIL doğrulama firması devreye alındı.", "acik"),
]


class Command(BaseCommand):
    help = "Örnek risk verileri ekler (idempotent)"

    def handle(self, *args, **kwargs):
        projeler = list(Project.objects.all()[:4])
        if not projeler:
            self.stdout.write(self.style.WARNING("Önce seed_demo çalıştırın."))
            return

        eklendi = 0
        for i, (baslik, aciklama, kategori, olasilik, etki, mitigasyon, durum) in enumerate(SAMPLE_RISKS):
            proje = projeler[i % len(projeler)]
            _, created = Risk.objects.get_or_create(
                baslik=baslik,
                proje=proje,
                defaults=dict(
                    aciklama=aciklama, kategori=kategori,
                    olasilik=olasilik, etki=etki,
                    mitigasyon=mitigasyon, durum=durum,
                ),
            )
            if created:
                eklendi += 1

        self.stdout.write(self.style.SUCCESS(f"{eklendi} yeni risk eklendi."))
