import 'package:dio/dio.dart';
import 'package:proje_haritasi_mobile/core/config/env.dart';
import 'package:proje_haritasi_mobile/core/network/auth_interceptor.dart';

class DioClient {
  static final DioClient _instance = DioClient._internal();
  factory DioClient() => _instance;

  late final Dio _dio;
  final AuthInterceptor _authInterceptor = AuthInterceptor();

  DioClient._internal() {
    _dio = Dio(
      BaseOptions(
        baseUrl: Env.baseUrl,
        connectTimeout: const Duration(seconds: 15),
        receiveTimeout: const Duration(seconds: 30),
        headers: {'Content-Type': 'application/json'},
      ),
    );
    _dio.interceptors.add(_authInterceptor);
  }

  Dio get dio => _dio;

  set onAuthExpired(void Function() callback) {
    _authInterceptor.authExpiredCallback = callback;
  }
}
