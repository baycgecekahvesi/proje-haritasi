"""PM Koordinatör + Risk/QA ajan motoru — deterministik, LLM çağrısı yok."""
from apps.skills.models import ProjeGorev

FAZLAR = [
    "Başlangıç", "Planlama", "Tasarım", "Tedarik", "Geliştirme",
    "Entegrasyon", "Test", "Devreye Alma", "Kabul", "Kapanış",
]


def _kritik_yol(gorevler):
    bitis = {g.gorev_id: g.baslangic_gun + g.gun for g in gorevler}
    if not bitis:
        return set()
    max_bitis = max(bitis.values())
    kritik = set()
    gorev_map = {g.gorev_id: g for g in gorevler}

    def izle(gid):
        kritik.add(gid)
        g = gorev_map.get(gid)
        if not g or not g.onk:
            return
        max_onk_bitis = max((bitis.get(o, 0) for o in g.onk), default=0)
        for o in g.onk:
            if bitis.get(o, 0) == max_onk_bitis:
                izle(o)

    for gid, b in bitis.items():
        if b == max_bitis:
            izle(gid)
    return kritik


def run_pm_agent(gorevler=None):
    if gorevler is None:
        gorevler = list(ProjeGorev.objects.all())

    gorev_map = {g.gorev_id: g for g in gorevler}
    maddeler = []

    # Başlatılabilir görevler: tüm önkoşulları tamamlandı, hâlâ Planlandı
    bekleyenler = []
    for g in gorevler:
        if g.durum != "Planlandı":
            continue
        if all(gorev_map.get(o) and gorev_map[o].durum == "Tamamlandı" for o in g.onk):
            bekleyenler.append(g)
    bekleyenler.sort(key=lambda g: g.baslangic_gun)
    for g in bekleyenler[:5]:
        maddeler.append({
            "tip": "baslat",
            "mesaj": f"{g.gorev_id} — {g.gorev_adi} ({g.rol}, Gün {g.baslangic_gun + 1}) tüm önkoşulları tamamlandı, başlatılabilir.",
            "gorev_id": g.gorev_id,
            "oncelik": "yuksek",
        })

    # Engellenen görevler
    engellenenler = [g for g in gorevler if g.durum == "Engellendi"]
    for g in engellenenler:
        bagimlilar = [x for x in gorevler if g.gorev_id in (x.onk or [])]
        etki = f" → {len(bagimlilar)} görev bekliyor" if bagimlilar else ""
        maddeler.append({
            "tip": "engel",
            "mesaj": f"{g.gorev_id} — {g.gorev_adi} ENGELLENDİ{etki}. Not: {g.not_metni or '—'}",
            "gorev_id": g.gorev_id,
            "oncelik": "kritik" if bagimlilar else "orta",
        })

    # Düşük tamamlanma + devam eden
    yavas = [g for g in gorevler if g.durum == "Devam Ediyor" and g.tamamlanma < 30]
    yavas.sort(key=lambda g: g.baslangic_gun)
    for g in yavas[:3]:
        maddeler.append({
            "tip": "uyari",
            "mesaj": f"{g.gorev_id} — {g.gorev_adi} devam ediyor ama tamamlanma %{g.tamamlanma}.",
            "gorev_id": g.gorev_id,
            "oncelik": "orta",
        })

    # Faz özeti
    faz_ozet = []
    for faz in FAZLAR:
        faz_g = [g for g in gorevler if g.faz == faz]
        if not faz_g:
            continue
        tam = sum(1 for g in faz_g if g.durum == "Tamamlandı")
        faz_ozet.append({
            "faz": faz,
            "toplam": len(faz_g),
            "tamamlanan": tam,
            "pct": round(tam / len(faz_g) * 100),
        })

    toplam = len(gorevler)
    tam_count = sum(1 for g in gorevler if g.durum == "Tamamlandı")
    genel_pct = round(tam_count / toplam * 100) if toplam else 0

    return {
        "ajan": "PM Koordinatör",
        "baslik": f"Proje Durumu — %{genel_pct} Tamamlandı",
        "aciklama": (
            f"{toplam} görevden {tam_count} tamamlandı. "
            f"{len(bekleyenler)} görev başlatılabilir, {len(engellenenler)} engel var."
        ),
        "maddeler": maddeler,
        "faz_ozet": faz_ozet,
        "istatistik": {
            "toplam": toplam,
            "tamamlanan": tam_count,
            "devam_eden": sum(1 for g in gorevler if g.durum == "Devam Ediyor"),
            "engellenen": len(engellenenler),
            "planlandi": sum(1 for g in gorevler if g.durum == "Planlandı"),
            "incelemede": sum(1 for g in gorevler if g.durum == "İncelemede"),
            "genel_pct": genel_pct,
        },
    }


def run_risk_agent(gorevler=None):
    if gorevler is None:
        gorevler = list(ProjeGorev.objects.all())

    gorev_map = {g.gorev_id: g for g in gorevler}
    kritik = _kritik_yol(gorevler)
    riskler = []

    # Kritik yolda tamamlanmamış + düşük ilerleme
    for gid in kritik:
        g = gorev_map.get(gid)
        if not g or g.durum == "Tamamlandı":
            continue
        if g.durum == "Engellendi":
            riskler.append({
                "seviye": "kritik",
                "mesaj": f"KRİTİK YOL ENGELLENDİ: {g.gorev_id} — {g.gorev_adi}.",
                "gorev_id": g.gorev_id,
            })
        elif g.tamamlanma < 50 and g.durum != "Planlandı":
            riskler.append({
                "seviye": "yuksek",
                "mesaj": f"KRİTİK YOL: {g.gorev_id} — {g.gorev_adi} %{g.tamamlanma} tamamlandı ({g.durum}).",
                "gorev_id": g.gorev_id,
            })

    # Engelin bağımlıları çok olan görevler
    for g in gorevler:
        if g.durum != "Engellendi":
            continue
        zincir = [x for x in gorevler if g.gorev_id in (x.onk or []) and x.durum != "Tamamlandı"]
        if len(zincir) >= 3:
            riskler.append({
                "seviye": "kritik",
                "mesaj": (
                    f"{g.gorev_id} ENGELLENDİ → {len(zincir)} görev zincirleme bekliyor: "
                    f"{', '.join(x.gorev_id for x in zincir[:4])}"
                ),
                "gorev_id": g.gorev_id,
            })

    # FAT hazırlık
    fat_onk = ["ELK-012", "PLC-009", "SCADA-011"]
    fat_durum = {gid: (gorev_map[gid].durum if gid in gorev_map else "Bulunamadı") for gid in fat_onk}
    fat_hazir = all(d == "Tamamlandı" for d in fat_durum.values())
    if not fat_hazir:
        eksik = [f"{gid}({d})" for gid, d in fat_durum.items() if d != "Tamamlandı"]
        riskler.append({
            "seviye": "bilgi",
            "mesaj": f"FAT için hazır değil. Bekleyen: {', '.join(eksik)}",
            "gorev_id": None,
        })

    # SAT hazırlık
    sat_onk = ["PLC-010", "SCADA-012"]
    sat_durum = {gid: (gorev_map[gid].durum if gid in gorev_map else "Bulunamadı") for gid in sat_onk}
    sat_hazir = all(d == "Tamamlandı" for d in sat_durum.values())
    if not sat_hazir:
        eksik = [f"{gid}({d})" for gid, d in sat_durum.items() if d != "Tamamlandı"]
        riskler.append({
            "seviye": "bilgi",
            "mesaj": f"SAT için hazır değil. Bekleyen: {', '.join(eksik)}",
            "gorev_id": None,
        })

    skor_map = {"kritik": 10, "yuksek": 5, "orta": 2, "bilgi": 0}
    risk_skoru = sum(skor_map.get(r["seviye"], 0) for r in riskler)
    risk_seviyesi = (
        "Kritik" if risk_skoru >= 20
        else "Yüksek" if risk_skoru >= 10
        else "Orta" if risk_skoru >= 5
        else "Düşük"
    )

    return {
        "ajan": "Risk/QA",
        "baslik": f"Risk Analizi — {risk_seviyesi} Seviye",
        "aciklama": f"Kritik yolda {len(kritik)} görev. {len(riskler)} risk maddesi tespit edildi.",
        "riskler": riskler,
        "kritik_yol_sayisi": len(kritik),
        "risk_skoru": risk_skoru,
        "risk_seviyesi": risk_seviyesi,
        "fat_hazir": fat_hazir,
        "sat_hazir": sat_hazir,
    }


def run_all():
    gorevler = list(ProjeGorev.objects.all())
    return {
        "pm": run_pm_agent(gorevler),
        "risk": run_risk_agent(gorevler),
    }
