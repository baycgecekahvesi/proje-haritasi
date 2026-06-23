import json

from django.core.management.base import BaseCommand

from apps.agents.engine import run_all


class Command(BaseCommand):
    help = "PM Koordinatör ve Risk/QA ajanlarını çalıştırır"

    def add_arguments(self, parser):
        parser.add_argument("--json", action="store_true", help="JSON çıktı")

    def handle(self, *args, **options):
        rapor = run_all()

        if options["json"]:
            self.stdout.write(json.dumps(rapor, ensure_ascii=False, indent=2))
            return

        pm = rapor["pm"]
        risk = rapor["risk"]

        self.stdout.write(self.style.SUCCESS(f"\n{'='*60}"))
        self.stdout.write(self.style.SUCCESS(f"  {pm['baslik']}"))
        self.stdout.write(self.style.SUCCESS(f"{'='*60}"))
        self.stdout.write(pm["aciklama"])
        for m in pm["maddeler"]:
            ikon = {"baslat": "[>]", "engel": "[!]", "uyari": "[~]"}.get(m["tip"], "[-]")
            self.stdout.write(f"  {ikon} {m['mesaj']}")

        self.stdout.write(self.style.WARNING(f"\n{'='*60}"))
        self.stdout.write(self.style.WARNING(f"  {risk['baslik']}"))
        self.stdout.write(self.style.WARNING(f"{'='*60}"))
        self.stdout.write(risk["aciklama"])
        for r in risk["riskler"]:
            ikon = {"kritik": "[!!]", "yuksek": "[!]", "orta": "[~]", "bilgi": "[i]"}.get(r["seviye"], "[-]")
            self.stdout.write(f"  {ikon} {r['mesaj']}")

        self.stdout.write("")
