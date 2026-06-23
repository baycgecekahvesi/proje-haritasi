from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ("projects", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="IOPoint",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False)),
                ("tag_no", models.CharField(max_length=50)),
                ("tanim", models.CharField(max_length=255)),
                ("sinyal_tipi", models.CharField(
                    choices=[("DI","DI — Dijital Giriş"),("DO","DO — Dijital Çıkış"),
                             ("AI","AI — Analog Giriş"),("AO","AO — Analog Çıkış"),
                             ("RTD","RTD — Sıcaklık (PT100)"),("TC","TC — Termokupul"),
                             ("PI","PI — Puls Giriş"),("COM","COM — İletişim")],
                    max_length=10)),
                ("proses_deger",  models.CharField(blank=True, max_length=100)),
                ("plc_rack",      models.CharField(blank=True, max_length=20)),
                ("plc_slot",      models.CharField(blank=True, max_length=20)),
                ("plc_kanal",     models.CharField(blank=True, max_length=20)),
                ("panel_no",      models.CharField(blank=True, max_length=30)),
                ("klemens_no",    models.CharField(blank=True, max_length=30)),
                ("kablo_no",      models.CharField(blank=True, max_length=50)),
                ("alan_cihaz",    models.CharField(blank=True, max_length=150)),
                ("sil_seviye",    models.CharField(blank=True, max_length=10)),
                ("notlar",        models.TextField(blank=True)),
                ("durum", models.CharField(
                    choices=[("taslak","Taslak"),("onaylandi","Onaylandı"),
                             ("revize","Revize"),("iptal","İptal")],
                    default="taslak", max_length=20)),
                ("kablo_durum", models.CharField(
                    choices=[("bekliyor","Bekliyor"),("cekildi","Çekildi"),
                             ("baglandi","Bağlandı"),("test_ok","Test OK"),("test_hata","Test Hatası")],
                    default="bekliyor", max_length=20)),
                ("olusturuldu", models.DateTimeField(auto_now_add=True)),
                ("guncellendi", models.DateTimeField(auto_now=True)),
                ("proje", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE,
                    related_name="io_points", to="projects.project")),
            ],
            options={"verbose_name": "I/O Noktası", "verbose_name_plural": "I/O Listesi",
                     "ordering": ["sinyal_tipi", "tag_no"],
                     "unique_together": {("proje", "tag_no")}},
        ),
    ]
