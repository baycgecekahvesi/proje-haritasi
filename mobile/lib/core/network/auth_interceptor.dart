import 'package:dio/dio.dart';
import 'package:proje_haritasi_mobile/core/storage/token_storage.dart';

class AuthInterceptor extends Interceptor {
  void Function()? authExpiredCallback;

  @override
  Future<void> onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    if (options.extra['noAuth'] == true) {
      handler.next(options);
      return;
    }
    final token = await TokenStorage.getToken();
    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options);
  }

  @override
  Future<void> onError(
    DioException err,
    ErrorInterceptorHandler handler,
  ) async {
    if (err.response?.statusCode == 401) {
      await TokenStorage.clearToken();
      authExpiredCallback?.call();
    }
    handler.next(err);
  }
}
