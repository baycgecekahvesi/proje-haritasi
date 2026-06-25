import 'package:flutter/foundation.dart';
import 'package:dio/dio.dart';
import 'package:proje_haritasi_mobile/core/network/dio_client.dart';
import 'package:proje_haritasi_mobile/core/notifiers/map_refresh_notifier.dart';
import 'package:proje_haritasi_mobile/features/projects/models/project_model.dart';

class ProjectsProvider extends ChangeNotifier {
  final DioClient _client = DioClient();
  MapRefreshNotifier? mapRefresh;

  List<ProjectModel> _projects = [];
  int _total = 0;
  bool _loading = false;
  String? _error;
  int _page = 1;
  String _search = '';
  String _province = '';
  String _status = '';

  List<ProjectModel> get projects => _projects;
  int get total => _total;
  bool get loading => _loading;
  String? get error => _error;
  int get page => _page;
  String get search => _search;
  String get province => _province;
  String get status => _status;

  bool get hasMore => _projects.length < _total;

  Future<void> load({bool resetPage = false}) async {
    if (resetPage) _page = 1;
    _loading = true;
    _error = null;
    notifyListeners();
    try {
      final params = <String, dynamic>{'page': _page};
      if (_search.isNotEmpty) params['search'] = _search;
      if (_province.isNotEmpty) params['province'] = _province;
      if (_status.isNotEmpty) params['status'] = _status;

      final response = await _client.dio.get('/projects/', queryParameters: params);
      final paginated = PaginatedProjects.fromJson(response.data as Map<String, dynamic>);
      _projects = paginated.items;
      _total = paginated.count;
    } on DioException catch (e) {
      _error = e.response?.data?['detail'] as String? ?? 'Projeler yüklenemedi';
    } catch (e) {
      _error = 'Beklenmeyen hata: $e';
    }
    _loading = false;
    notifyListeners();
  }

  void setFilter({String? search, String? province, String? status}) {
    if (search != null) _search = search;
    if (province != null) _province = province;
    if (status != null) _status = status;
    load(resetPage: true);
  }

  void nextPage() {
    if (_projects.length < _total) {
      _page++;
      load();
    }
  }

  void prevPage() {
    if (_page > 1) {
      _page--;
      load();
    }
  }

  Future<bool> createProject(Map<String, dynamic> data) async {
    try {
      await _client.dio.post('/projects/', data: data);
      await load(resetPage: true);
      mapRefresh?.refresh();
      return true;
    } on DioException catch (e) {
      _error = e.response?.data?['detail'] as String? ?? 'Proje oluşturulamadı';
      notifyListeners();
      return false;
    }
  }

  Future<bool> updateProject(int id, Map<String, dynamic> data) async {
    try {
      await _client.dio.patch('/projects/$id', data: data);
      await load();
      mapRefresh?.refresh();
      return true;
    } on DioException catch (e) {
      _error = e.response?.data?['detail'] as String? ?? 'Proje güncellenemedi';
      notifyListeners();
      return false;
    }
  }

  Future<bool> deleteProject(int id) async {
    try {
      await _client.dio.delete('/projects/$id');
      await load();
      mapRefresh?.refresh();
      return true;
    } on DioException catch (e) {
      _error = e.response?.data?['detail'] as String? ?? 'Proje silinemedi';
      notifyListeners();
      return false;
    }
  }
}
