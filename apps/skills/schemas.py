from typing import List, Optional

from ninja import Schema


class GorevDurumuOut(Schema):
    deger: str
    renk: str
    ikon: str
    sira: int


class TaskTemplateOut(Schema):
    gorev_id: str
    gorev_sira: int
    gorev_adi: str
    faz: str
    min_gun: float
    max_gun: float
    onkosullar: List[str]
    teslimati: str
    tekrar: str


class RoleSkillOut(Schema):
    rol_id: str
    rol_adi: str
    renk_kodu: str
    ikon: str
    sorumluluklar: List[str]
    yetkinlikler: List[str]
    durum_alanlari: List[str]
    gorev_sablonlari: List[TaskTemplateOut]


class RoleSkillListOut(Schema):
    rol_id: str
    rol_adi: str
    renk_kodu: str
    ikon: str
    gorev_sayisi: int


class ReferansDocListOut(Schema):
    slug: str
    baslik: str
    standart: str
    revizyon: str
    rol_id: str


class ReferansDocOut(Schema):
    slug: str
    baslik: str
    standart: str
    revizyon: str
    rol_id: str
    icerik: str


class EkosistemOut(Schema):
    roller: List[RoleSkillListOut]
    gorev_durumlari: List[GorevDurumuOut]
    proje_fazlari: List[str]


class ProjeGorevOut(Schema):
    gorev_id: str
    rol: str
    gorev_adi: str
    faz: str
    gun: int
    onk: List[str]
    teslim: str
    baslangic_gun: int
    durum: str
    tamamlanma: int
    not_metni: str
    atanan_id: Optional[int] = None
    atanan_adi: Optional[str] = None


class ProjeGorevGuncelleIn(Schema):
    durum: Optional[str] = None
    tamamlanma: Optional[int] = None
    not_metni: Optional[str] = None
    atanan_id: Optional[int] = None


class ProjeGorevEkleIn(Schema):
    rol: str
    gorev_adi: str
    faz: str
    gun: int
    onk: Optional[List[str]] = []
    teslim: Optional[str] = ""
    baslangic_gun: Optional[int] = 0
    durum: Optional[str] = "Planlandı"
    tamamlanma: Optional[int] = 0
    not_metni: Optional[str] = ""
    atanan_id: Optional[int] = None

