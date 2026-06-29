import 'dart:convert';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:dio/dio.dart';
import 'local_db.dart';

class SyncService {
  final Dio _dio;
  final LocalDb _localDb = LocalDb();

  SyncService(this._dio);

  Stream<bool> get connectivityStream =>
      Connectivity().onConnectivityChanged.map(
        (results) => results.any((r) => r != ConnectivityResult.none),
      );

  Future<bool> isOnline() async {
    final results = await Connectivity().checkConnectivity();
    return results.any((r) => r != ConnectivityResult.none);
  }

  Future<void> syncProjects() async {
    try {
      final response = await _dio.get('/projects/');
      final data = response.data as Map<String, dynamic>;
      final items = (data['items'] as List<dynamic>? ?? [])
          .cast<Map<String, dynamic>>();
      await _localDb.upsertProjects(items);
    } catch (_) {
      // sync başarısız, local data kullan
    }
  }

  Future<int> flushPendingActions() async {
    final actions = await _localDb.getPendingActions();
    int flushed = 0;
    for (final action in actions) {
      try {
        final method = action['method'] as String;
        final endpoint = action['endpoint'] as String;
        final payload = action['payload'] != null
            ? jsonDecode(action['payload'] as String)
            : null;
        if (method == 'POST') {
          await _dio.post(endpoint, data: payload);
        } else if (method == 'PATCH') {
          await _dio.patch(endpoint, data: payload);
        }
        await _localDb.deletePendingAction(action['id'] as int);
        flushed++;
      } catch (_) {
        break;
      }
    }
    return flushed;
  }
}
