class RiskModel {
  final int id;
  final int projeId;
  final String baslik;
  final String aciklama;
  final String kategori;
  final String kategoriDisplay;
  final int olasilik;
  final int etki;
  final int skor;
  final String seviye;
  final String durum;
  final String durumDisplay;
  final String? sorumluUsername;
  final DateTime? hedefTarih;

  const RiskModel({
    required this.id,
    required this.projeId,
    required this.baslik,
    required this.aciklama,
    required this.kategori,
    required this.kategoriDisplay,
    required this.olasilik,
    required this.etki,
    required this.skor,
    required this.seviye,
    required this.durum,
    required this.durumDisplay,
    this.sorumluUsername,
    this.hedefTarih,
  });

  factory RiskModel.fromJson(Map<String, dynamic> json) {
    return RiskModel(
      id: json['id'] as int,
      projeId: json['proje_id'] as int? ?? 0,
      baslik: json['baslik'] as String? ?? '',
      aciklama: json['aciklama'] as String? ?? '',
      kategori: json['kategori'] as String? ?? '',
      kategoriDisplay: json['kategori_display'] as String? ?? json['kategori'] as String? ?? '',
      olasilik: json['olasilik'] as int? ?? 1,
      etki: json['etki'] as int? ?? 1,
      skor: json['skor'] as int? ?? 1,
      seviye: json['seviye'] as String? ?? 'dusuk',
      durum: json['durum'] as String? ?? 'acik',
      durumDisplay: json['durum_display'] as String? ?? json['durum'] as String? ?? '',
      sorumluUsername: json['sorumlu_username'] as String?,
      hedefTarih: json['hedef_tarih'] != null
          ? DateTime.tryParse(json['hedef_tarih'] as String)
          : null,
    );
  }
}
