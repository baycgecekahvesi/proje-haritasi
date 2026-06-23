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
            name="Risk",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False)),
                ("baslik", models.CharField(max_length=255)),
                ("aciklama", models.TextField(blank=True)),
                ("kategori", models.CharField(
                    choices=[("teknik","Teknik"),("mali","Mali"),("zaman","Zaman"),
                             ("kaynak","Kaynak"),("dis","Dış Etken"),("guvenlik","Güvenlik")],
                    default="teknik", max_length=20)),
                ("olasilik", models.PositiveSmallIntegerField(default=3)),
                ("etki", models.PositiveSmallIntegerField(default=3)),
                ("mitigasyon", models.TextField(blank=True)),
                ("hedef_tarih", models.DateField(blank=True, null=True)),
                ("durum", models.CharField(
                    choices=[("acik","Açık"),("izleniyor","İzleniyor"),
                             ("azaltildi","Azaltıldı"),("kapandi","Kapandı"),("realize","Gerçekleşti")],
                    default="acik", max_length=20)),
                ("olusturuldu", models.DateTimeField(auto_now_add=True)),
                ("guncellendi", models.DateTimeField(auto_now=True)),
                ("proje", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE,
                    related_name="riskler", to="projects.project")),
                ("sorumlu", models.ForeignKey(blank=True, null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name="riskler", to=settings.AUTH_USER_MODEL)),
            ],
            options={"verbose_name": "Risk", "verbose_name_plural": "Riskler",
                     "ordering": ["-olasilik", "-etki"]},
        ),
    ]
