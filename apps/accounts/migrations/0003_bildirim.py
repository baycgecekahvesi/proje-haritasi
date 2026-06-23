from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [("accounts", "0002_userprofile_meslek_rolu")]
    operations = [
        migrations.CreateModel(
            name="Bildirim",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("baslik", models.CharField(max_length=200)),
                ("mesaj", models.TextField(blank=True)),
                ("gorev_id", models.CharField(max_length=20, blank=True)),
                ("okundu", models.BooleanField(default=False)),
                ("olusturuldu", models.DateTimeField(auto_now_add=True)),
                ("alici", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="bildirimler", to=settings.AUTH_USER_MODEL)),
            ],
            options={"verbose_name": "Bildirim", "verbose_name_plural": "Bildirimler", "ordering": ["-olusturuldu"]},
        ),
    ]
