"""Durum → renk kodlaması (frontend ile tutarlı)."""

STATUS_COLORS = {
    "aktif": "#4f6ef7",       # mavi
    "beklemede": "#f39c12",   # turuncu
    "tamamlandi": "#27ae60",  # yeşil
    "iptal": "#95a5a6",       # gri
}

DELAY_COLOR = "#e74c3c"   # kırmızı (gecikme)
EMPTY_COLOR = "#e5e7eb"   # açık gri (projesiz il)


def status_color(status: str) -> str:
    return STATUS_COLORS.get(status, EMPTY_COLOR)


def province_color(dominant_status: str, has_delay: bool) -> str:
    """İl rengi: gecikme varsa kırmızı, yoksa baskın durum rengi."""
    if has_delay:
        return DELAY_COLOR
    return STATUS_COLORS.get(dominant_status, EMPTY_COLOR)
