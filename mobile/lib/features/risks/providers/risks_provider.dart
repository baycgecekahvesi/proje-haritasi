import 'package:flutter/foundation.dart';
import 'package:dio/dio.dart';
import 'package:proje_haritasi_mobile/core/network/dio_client.dart';
import 'package:proje_haritasi_mobile/features/risks/models/risk_model.dart';

class RisksProvider extends ChangeNotifier {
  final DioClient _client = DioClient();

  List<RiskModel> _risks = [];
  bool _loading = false;
  String? _error;
  int? _projeId;
  String _durum = '';
  String _seviye = '';

  List<RiskModel> get risks => _risks;
  bool get loading => _loading;
  String? get error => _error;
  int? get projeId => _projeId;
  String get durum => _durum;
  String get seviye => _seviye;

  void setFilter({int? projeId, String? durum, String? seviye}) {
    if (projeId != null) _projeId = projeId;
    if (durum != null) _durum = durum;
    if (seviye != null) _seviye = seviye;
    load();
  }

  Future<void> load() async {
    _loading = true;
    _error = null;
    notifyListeners();
    try {
      final params = <String, dynamic>{};
      if (_projeId != null) params['proje_id'] = _projeId;
      if (_durum.isNotEmpty) params['durum'] = _durum;
      if (_seviye.isNotEmpty) params['seviye'] = _seviye;

      final response = await _client.dio.get('/risks', queryParameters: params);
      final list = response.data as List<dynamic>? ?? [];
      _risks = list.map((e) => RiskModel.fromJson(e as Map<String, dynamic>)).toList();
    } on DioException catch (e) {
      _error = e.response?.data?['detail'] as String? ?? 'Riskler yüklenemedi';
    } catch (e) {
      _error = 'Beklenmeyen hata: $e';
    }
    _loading = false;
    notifyListeners();
  }

  Future<bool> create(Map<String, dynamic> data) async {
    try {
      await _client.dio.post('/risks', data: data);
      await load();
      return true;
    } on DioException catch (e) {
      _error = e.response?.data?['detail'] as String? ?? 'Risk oluşturulamadı';
      notifyListeners();
      return false;
    }
  }

  Future<bool> update(int id, Map<String, dynamic> data) async {
    try {
      await _client.dio.patch('/risks/$id', data: data);
      await load();
      return true;
    } on DioException catch (e) {
      _error = e.response?.data?['detail'] as String? ?? 'Risk güncellenemedi';
      notifyListeners();
      return false;
    }
  }

  Future<bool> delete(int id) async {
    try {
      await _client.dio.delete('/risks/$id');
      await load();
      return true;
    } on DioException catch (e) {
      _error = e.response?.data?['detail'] as String? ?? 'Risk silinemedi';
      notifyListeners();
      return false;
    }
  }
}
