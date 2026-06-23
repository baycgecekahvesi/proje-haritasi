from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("documents", "0003_technicalspec"),
        ("projects", "0001_initial"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="EplanDokuman",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("seri_no", models.CharField(max_length=50)),
                ("baslik", models.CharField(max_length=255)),
                ("dokuman_tipi", models.CharField(
                    choices=[
                        ("sema", "Elektrik Şeması"),
                        ("panel_layout", "Panel Layout"),
                        ("kablo_listesi", "Kablo Listesi"),
                        ("bom", "BOM (Malzeme Listesi)"),
                        ("as_built", "As-Built Şema"),
                        ("diger", "Diğer"),
                    ],
                    default="sema", max_length=30,
                )),
                ("revizyon_no", models.CharField(default="Rev.0", max_length=20)),
                ("onay_durumu", models.CharField(
                    choices=[
                        ("taslak", "Taslak"),
                        ("ic_kontrol", "İç Kontrol"),
                        ("musteri_inceleme", "Müşteri İncelemesinde"),
                        ("onaylandi", "Onaylandı"),
                        ("as_built", "As-Built"),
                        ("iptal", "İptal"),
                    ],
                    default="taslak", max_length=30,
                )),
                ("aciklama", models.TextField(blank=True)),
                ("notlar", models.TextField(blank=True)),
                ("dosya", models.FileField(blank=True, null=True, upload_to="eplan/%Y/%m/")),
                ("onay_tarihi", models.DateField(blank=True, null=True)),
                ("yukleme_tarihi", models.DateTimeField(auto_now_add=True)),
                ("guncelleme_tarihi", models.DateTimeField(auto_now=True)),
                ("proje", models.ForeignKey(
                    blank=True, null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name="eplan_dokumanlar",
                    to="projects.project",
                )),
                ("yukleyen", models.ForeignKey(
                    null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name="eplan_dokumanlar",
                    to=settings.AUTH_USER_MODEL,
                )),
                ("onaylayan", models.ForeignKey(
                    blank=True, null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name="eplan_onaylari",
                    to=settings.AUTH_USER_MODEL,
                )),
            ],
            options={
                "verbose_name": "E-Plan Döküman",
                "verbose_name_plural": "E-Plan Dökümanlar",
                "ordering": ["seri_no", "-yukleme_tarihi"],
                "unique_together": {("seri_no", "revizyon_no")},
            },
        ),
    ]
