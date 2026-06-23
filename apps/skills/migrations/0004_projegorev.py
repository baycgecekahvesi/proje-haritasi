from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("skills", "0003_referansdoc"),
    ]

    operations = [
        migrations.CreateModel(
            name="ProjeGorev",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("gorev_id", models.CharField(max_length=20, unique=True)),
                ("rol", models.CharField(max_length=10)),
                ("gorev_adi", models.CharField(max_length=200)),
                ("faz", models.CharField(max_length=30)),
                ("gun", models.PositiveSmallIntegerField()),
                ("onk", models.JSONField(default=list)),
                ("teslim", models.CharField(blank=True, max_length=200)),
                ("baslangic_gun", models.IntegerField(default=0)),
                ("durum", models.CharField(
                    choices=[
                        ("Planlandı", "Planlandı"),
                        ("Devam Ediyor", "Devam Ediyor"),
                        ("İncelemede", "İncelemede"),
                        ("Tamamlandı", "Tamamlandı"),
                        ("Engellendi", "Engellendi"),
                    ],
                    default="Planlandı",
                    max_length=20,
                )),
                ("tamamlanma", models.PositiveSmallIntegerField(default=0)),
                ("not_metni", models.TextField(blank=True)),
            ],
            options={
                "verbose_name": "Proje Görevi",
                "verbose_name_plural": "Proje Görevleri",
                "ordering": ["baslangic_gun", "gorev_id"],
            },
        ),
    ]
