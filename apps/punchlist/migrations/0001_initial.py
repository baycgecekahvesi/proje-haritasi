from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ("projects", "0001_initial"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="PunchItem",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False)),
                ("tur", models.CharField(
                    choices=[("fat","FAT (Fabrika Kabul Testi)"),("sat","SAT (Saha Kabul Testi)"),
                             ("komisyon","Devreye Alma"),("diger","Diğer")],
                    default="fat", max_length=20)),
                ("no", models.CharField(blank=True, max_length=20)),
                ("baslik", models.CharField(max_length=300)),
                ("aciklama", models.TextField(blank=True)),
                ("kategori", models.CharField(
                    choices=[("elektrik","Elektrik"),("otomasyon","Otomasyon / PLC"),
                             ("mekanik","Mekanik"),("dokuman","Döküman"),
                             ("guvenlik","Güvenlik / SIL"),("yazilim","Yazılım / SCADA"),("diger","Diğer")],
                    default="diger", max_length=20)),
                ("oncelik", models.CharField(
                    choices=[("A","A — Kritik (İşi Engelliyor)"),("B","B — Önemli (Yakında Çözülmeli)"),
                             ("C","C — İstenen (Fırsat Bulununca)")],
                    default="B", max_length=2)),
                ("durum", models.CharField(
                    choices=[("acik","Açık"),("devam","Devam Ediyor"),
                             ("kapandi","Kapandı"),("iptal","İptal")],
                    default="acik", max_length=20)),
                ("hedef_tarih", models.DateField(blank=True, null=True)),
                ("kapanma_tarihi", models.DateField(blank=True, null=True)),
                ("kapatma_notu", models.TextField(blank=True)),
                ("tespit_tarihi", models.DateField(blank=True, null=True)),
                ("olusturuldu", models.DateTimeField(auto_now_add=True)),
                ("guncellendi", models.DateTimeField(auto_now=True)),
                ("proje", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE,
                    related_name="punch_items", to="projects.project")),
                ("sorumlu", models.ForeignKey(blank=True, null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name="punch_items", to=settings.AUTH_USER_MODEL)),
            ],
            options={"verbose_name": "Punch Item", "verbose_name_plural": "Punch List",
                     "ordering": ["oncelik", "tur", "no"]},
        ),
    ]
