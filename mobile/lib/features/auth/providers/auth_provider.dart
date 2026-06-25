import 'package:flutter/foundation.dart';
import 'package:dio/dio.dart';
import 'package:proje_haritasi_mobile/core/network/dio_client.dart';
import 'package:proje_haritasi_mobile/core/storage/token_storage.dart';
import 'package:proje_haritasi_mobile/features/auth/models/user_model.dart';

class AuthProvider extends ChangeNotifier {
  final DioClient _client = DioClient();

  UserModel? _user;
  bool _loading = false;
  String? _error;

  UserModel? get user => _user;
  bool get loading => _loading;
  String? get error => _error;
  bool get isAuthenticated => _user != null;

  Future<bool> login(String username, String password) async {
    _loading = true;
    _error = null;
    notifyListeners();
    try {
      final response = await _client.dio.post(
        '/auth/login',
        data: {'username': username, 'password': password},
        options: Options(extra: {'noAuth': true}),
      );
      final token = response.data['access_token'] as String;
      await TokenStorage.saveToken(token);
      await checkAuth();
      return true;
    } on DioException catch (e) {
      _error = e.response?.data?['detail'] as String? ?? 'Giriş başarısız';
      _loading = false;
      notifyListeners();
      return false;
    } catch (e) {
      _error = 'Beklenmeyen hata: $e';
      _loading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> logout() async {
    await TokenStorage.clearToken();
    _user = null;
    notifyListeners();
  }

  Future<void> checkAuth() async {
    final token = await TokenStorage.getToken();
    if (token == null) {
      _user = null;
      _loading = false;
      notifyListeners();
      return;
    }
    try {
      final response = await _client.dio.get('/auth/me');
      _user = UserModel.fromJson(response.data as Map<String, dynamic>);
    } catch (_) {
      _user = null;
      await TokenStorage.clearToken();
    }
    _loading = false;
    notifyListeners();
  }
}
