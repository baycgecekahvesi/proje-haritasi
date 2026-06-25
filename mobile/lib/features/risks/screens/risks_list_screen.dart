import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:proje_haritasi_mobile/core/network/dio_client.dart';
import 'package:proje_haritasi_mobile/features/auth/providers/auth_provider.dart';
import 'package:proje_haritasi_mobile/features/projects/models/project_model.dart';
import 'package:proje_haritasi_mobile/features/risks/models/risk_model.dart';
import 'package:proje_haritasi_mobile/features/risks/providers/risks_provider.dart';
import 'package:proje_haritasi_mobile/features/risks/screens/risk_form_screen.dart';

class RisksListScreen extends StatefulWidget {
  const RisksListScreen({super.key});

  @override
  State<RisksListScreen> createState() => _RisksListScreenState();
}

class _RisksListScreenState extends State<RisksListScreen> {
  List<ProjectModel> _projects = [];
  String _selectedDurum = '';
  String _selectedSeviye = '';

  @override
  void initState() {
    super.initState();
    _loadProjects();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<RisksProvider>().load();
    });
  }

  Future<void> _loadProjects() async {
    try {
      final res = await DioClient().dio.get('/projects/', queryParameters: {'page': 1});
      final data = res.data as Map<String, dynamic>;
      final items = (data['items'] as List<dynamic>? ?? [])
          .map((e) => ProjectModel.fromJson(e as Map<String, dynamic>))
          .toList();
      setState(() => _projects = items);
    } catch (_) {}
  }

  Color _seviyeColor(String seviye) {
    switch (seviye) {
      case 'kritik': return Colors.red;
      case 'yuksek': return Colors.orange;
      case 'orta': return Colors.amber;
      default: return Colors.green;
    }
  }

  void _showEditSheet(RiskModel risk) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (_) => RiskFormSheet(
        projects: _projects,
        existing: risk,
        onSaved: () => context.read<RisksProvider>().load(),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isEditor = context.watch<AuthProvider>().user?.isEditor ?? false;
    final provider = context.watch<RisksProvider>();

    return Scaffold(
      appBar: AppBar(title: const Text('Riskler')),
      floatingActionButton: isEditor
          ? FloatingActionButton(
              onPressed: () => showModalBottomSheet(
                context: context,
                isScrollControlled: true,
                builder: (_) => RiskFormSheet(
                  projects: _projects,
                  onSaved: () => context.read<RisksProvider>().load(),
                ),
              ),
              child: const Icon(Icons.add),
            )
          : null,
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(8),
            child: Row(
              children: [
                Expanded(
                  child: DropdownButtonFormField<String>(
                    value: _selectedDurum,
                    decoration: const InputDecoration(
                        labelText: 'Durum', isDense: true,
                        contentPadding: EdgeInsets.symmetric(horizontal: 8, vertical: 8)),
                    items: const [
                      DropdownMenuItem(value: '', child: Text('Tüm Durumlar')),
                      DropdownMenuItem(value: 'acik', child: Text('Açık')),
                      DropdownMenuItem(value: 'izleniyor', child: Text('İzleniyor')),
                      DropdownMenuItem(value: 'kapali', child: Text('Kapalı')),
                    ],
                    onChanged: (v) {
                      setState(() => _selectedDurum = v ?? '');
                      context.read<RisksProvider>().setFilter(durum: v ?? '');
                    },
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: DropdownButtonFormField<String>(
                    value: _selectedSeviye,
                    decoration: const InputDecoration(
                        labelText: 'Seviye', isDense: true,
                        contentPadding: EdgeInsets.symmetric(horizontal: 8, vertical: 8)),
                    items: const [
                      DropdownMenuItem(value: '', child: Text('Tüm Seviyeler')),
                      DropdownMenuItem(value: 'kritik', child: Text('Kritik')),
                      DropdownMenuItem(value: 'yuksek', child: Text('Yüksek')),
                      DropdownMenuItem(value: 'orta', child: Text('Orta')),
                      DropdownMenuItem(value: 'dusuk', child: Text('Düşük')),
                    ],
                    onChanged: (v) {
                      setState(() => _selectedSeviye = v ?? '');
                      context.read<RisksProvider>().setFilter(seviye: v ?? '');
                    },
                  ),
                ),
              ],
            ),
          ),
          if (provider.loading) const LinearProgressIndicator(),
          Expanded(
            child: provider.risks.isEmpty && !provider.loading
                ? const Center(child: Text('Risk bulunamadı'))
                : ListView.builder(
                    itemCount: provider.risks.length,
                    itemBuilder: (_, i) {
                      final r = provider.risks[i];
                      final color = _seviyeColor(r.seviye);
                      return Card(
                        margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        child: InkWell(
                          onTap: isEditor ? () => _showEditSheet(r) : null,
                          borderRadius: BorderRadius.circular(12),
                          child: Padding(
                            padding: const EdgeInsets.all(12),
                            child: Row(
                              children: [
                                Container(
                                  width: 48,
                                  height: 48,
                                  decoration: BoxDecoration(
                                    color: color.withValues(alpha: 0.15),
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: Column(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      Text('${r.skor}',
                                          style: TextStyle(
                                              color: color,
                                              fontWeight: FontWeight.bold,
                                              fontSize: 18)),
                                      Text('skor',
                                          style: TextStyle(color: color, fontSize: 9)),
                                    ],
                                  ),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(r.baslik,
                                          style: Theme.of(context)
                                              .textTheme
                                              .titleSmall
                                              ?.copyWith(fontWeight: FontWeight.bold),
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis),
                                      const SizedBox(height: 2),
                                      Text(r.kategoriDisplay,
                                          style: Theme.of(context).textTheme.bodySmall),
                                      if (r.sorumluUsername != null)
                                        Text(r.sorumluUsername!,
                                            style: Theme.of(context)
                                                .textTheme
                                                .bodySmall
                                                ?.copyWith(
                                                    color: Theme.of(context)
                                                        .colorScheme
                                                        .primary)),
                                    ],
                                  ),
                                ),
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.end,
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.symmetric(
                                          horizontal: 6, vertical: 2),
                                      decoration: BoxDecoration(
                                        color: color.withValues(alpha: 0.15),
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                      child: Text(r.seviye,
                                          style: TextStyle(
                                              color: color,
                                              fontSize: 10,
                                              fontWeight: FontWeight.bold)),
                                    ),
                                    const SizedBox(height: 4),
                                    Text(r.durumDisplay,
                                        style: Theme.of(context).textTheme.bodySmall),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}
