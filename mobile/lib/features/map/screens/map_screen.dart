import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:proje_haritasi_mobile/core/network/dio_client.dart';
import 'package:proje_haritasi_mobile/core/notifiers/map_refresh_notifier.dart';
import 'package:proje_haritasi_mobile/features/map/models/province_model.dart';
import 'package:proje_haritasi_mobile/features/map/widgets/turkey_map_widget.dart';
import 'package:proje_haritasi_mobile/features/projects/providers/projects_provider.dart';

class MapScreen extends StatefulWidget {
  const MapScreen({super.key});

  @override
  State<MapScreen> createState() => _MapScreenState();
}

class _MapScreenState extends State<MapScreen> {
  List<ProvinceModel> _provinces = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<MapRefreshNotifier>().addListener(_load);
    });
  }

  @override
  void dispose() {
    context.read<MapRefreshNotifier>().removeListener(_load);
    super.dispose();
  }

  Future<void> _load() async {
    setState(() { _loading = true; _error = null; });
    try {
      final res = await DioClient().dio.get('/projects/map');
      final list = res.data as List<dynamic>? ?? [];
      setState(() {
        _provinces = list
            .map((e) => ProvinceModel.fromJson(e as Map<String, dynamic>))
            .toList();
        _loading = false;
      });
    } catch (e) {
      setState(() { _error = 'Yüklenemedi: $e'; _loading = false; });
    }
  }

  Color _parseColor(String hex) {
    try {
      final clean = hex.replaceAll('#', '');
      return Color(int.parse('FF$clean', radix: 16));
    } catch (_) {
      return Colors.grey;
    }
  }

  void _onProvinceTap(String province) {
    context.read<ProjectsProvider>().setFilter(province: province);
    context.go('/projects');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Türkiye Haritası'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _load,
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(_error!),
                      const SizedBox(height: 16),
                      ElevatedButton(onPressed: _load, child: const Text('Tekrar Dene')),
                    ],
                  ),
                )
              : RefreshIndicator(
                  onRefresh: _load,
                  child: CustomScrollView(
                    slivers: [
                      SliverToBoxAdapter(
                        child: TurkeyMapWidget(
                          provinces: _provinces,
                          onProvinceTap: _onProvinceTap,
                        ),
                      ),
                      SliverPadding(
                        padding: const EdgeInsets.all(16),
                        sliver: SliverToBoxAdapter(
                          child: Text('İl Bazlı Proje Dağılımı',
                              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                  fontWeight: FontWeight.bold)),
                        ),
                      ),
                      SliverList(
                        delegate: SliverChildBuilderDelegate(
                          (_, i) {
                            final p = _provinces[i];
                            if (p.projectCount == 0) return const SizedBox.shrink();
                            final color = _parseColor(p.color);
                            return ListTile(
                              leading: Container(
                                width: 12,
                                height: 12,
                                decoration: BoxDecoration(
                                  color: color,
                                  shape: BoxShape.circle,
                                ),
                              ),
                              title: Text(p.province),
                              subtitle: Text(
                                  '${p.projectCount} proje • Ort. %${p.avgProgress.round()}'),
                              trailing: p.hasDelay
                                  ? const Icon(Icons.warning_amber,
                                      color: Colors.orange, size: 18)
                                  : null,
                              onTap: () => _onProvinceTap(p.province),
                            );
                          },
                          childCount: _provinces.length,
                        ),
                      ),
                    ],
                  ),
                ),
    );
  }
}
