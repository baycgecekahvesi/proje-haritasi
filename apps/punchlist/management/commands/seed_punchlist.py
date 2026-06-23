from django.core.management.base import BaseCommand
from apps.projects.models import Project
from apps.punchlist.models import PunchItem


ITEMS = [
    ("fat", "PLC I/O testi sırasında DI-017 girmedi", "otomasyon", "A", "acik",
     "PLC kablo bağlantısı ve adres eşleşmesi kontrol edilecek."),
    ("fat", "Panel kapısı menteşesi tam kapanmıyor", "mekanik", "B", "devam",
     "Panel üreticisinden yedek menteşe sipariş edildi."),
    ("fat", "SCADA alarm listesi müşteriye sunulmadı", "dokuman", "B", "acik",
     "SCADA mühendisi tarafından hazırlanıp müşteriye gönderilecek."),
    ("fat", "E-stop devresi test raporu eksik", "guvenlik", "A", "acik",
     "SIL doğrulama raporu hazırlanacak."),
    ("sat", "Saha kablo testi belgesi tamamlanmadı", "elektrik", "A", "acik",
     "Saha ekibi kablo test protokolünü dolduracak."),
    ("sat", "Motor çalışma yönü ters", "otomasyon", "A", "kapandi",
     "Faz sırası değiştirildi, test tekrarlandı. Kapatıldı."),
    ("sat", "HMI ekran parlaklık ayarı düşük", "yazilim", "C", "acik", ""),
    ("sat", "Yağmurlama sprinkler sistemi devreye alma testi bekleniyor",
     "mekanik", "B", "devam", "Tesis yangın ekibiyle koordinasyon sağlandı."),
]


class Command(BaseCommand):
    help = "Örnek punch list verileri ekler (idempotent)"

    def handle(self, *args, **kwargs):
        projeler = list(Project.objects.all()[:3])
        if not projeler:
            self.stdout.write(self.style.WARNING("Önce seed_demo çalıştırın."))
            return

        eklendi = 0
        for i, (tur, baslik, kategori, oncelik, durum, not_) in enumerate(ITEMS):
            proje = projeler[i % len(projeler)]
            _, created = PunchItem.objects.get_or_create(
                baslik=baslik, proje=proje,
                defaults=dict(tur=tur, kategori=kategori, oncelik=oncelik,
                              durum=durum, kapatma_notu=not_),
            )
            if created:
                eklendi += 1

        self.stdout.write(self.style.SUCCESS(f"{eklendi} punch item eklendi."))
