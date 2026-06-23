from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("skills", "0002_gorevdurumu_roleskill_durum_alanlari"),
    ]

    operations = [
        migrations.CreateModel(
            name="ReferansDoc",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("slug", models.SlugField(max_length=100, unique=True)),
                ("baslik", models.CharField(max_length=200)),
                ("standart", models.CharField(blank=True, max_length=200)),
                ("revizyon", models.CharField(blank=True, max_length=20)),
                ("icerik", models.TextField()),
                (
                    "rol",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="referans_dokumanlar",
                        to="skills.roleskill",
                    ),
                ),
            ],
            options={
                "verbose_name": "Referans Doküman",
                "verbose_name_plural": "Referans Dokümanlar",
                "ordering": ["rol", "slug"],
            },
        ),
    ]
