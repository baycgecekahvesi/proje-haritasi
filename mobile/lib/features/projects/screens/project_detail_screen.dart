import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import 'package:proje_haritasi_mobile/core/network/dio_client.dart';
import 'package:proje_haritasi_mobile/features/auth/providers/auth_provider.dart';
import 'package:proje_haritasi_mobile/features/projects/models/project_model.dart';
import 'package:proje_haritasi_mobile/features/projects/providers/projects_provider.dart';
import 'package:proje_haritasi_mobile/features/tasks/models/task_model.dart';
import 'package:proje_haritasi_mobile/features/site_photos/screens/site_photo_screen.dart';

class ProjectDetailScreen extends StatefulWidget {
  final String projectId;
  const ProjectDetailScreen({super.key, required this.projectId});

  @override
  State<ProjectDetailScreen> createState() => _ProjectDetailScreenState();
}

class _ProjectDetailScreenState extends State<ProjectDetailScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final _dio = DioClient().dio;

  // Core data
  ProjectModel? _project;
  List<TaskModel> _tasks = [];
  bool _loading = true;
  String? _error;

  // Kalite (ITP + NCR)
  bool _kaliteLoaded = false;
  bool _kaliteLoading = false;
  List<dynamic> _itpPlanlar = [];
  List<dynamic> _ncrList = [];

  // SGK & İSG
  bool _hseLoaded = false;
  bool _hseLoading = false;
  Map<String, dynamic>? _hseSummary;

  // Toplantılar
  bool _meetingsLoaded = false;
  bool _meetingsLoading = false;
  List<dynamic> _meetings = [];

  // Tedarik
  bool _procurementLoaded = false;
  bool _procurementLoading = false;
  List<dynamic> _orders = [];

  // Yazışmalar
  bool _corrLoaded = false;
  bool _corrLoading = false;
  List<dynamic> _correspondence = [];

  // Paydaşlar
  bool _stakeholdersLoaded = false;
  bool _stakeholdersLoading = false;
  List<dynamic> _stakeholders = [];

  // Değişiklik Emirleri
  bool _changeOrdersLoaded = false;
  bool _changeOrdersLoading = false;
  List<dynamic> _changeOrders = [];

  // İzinler
  bool _permitsLoaded = false;
  bool _permitsLoading = false;
  List<dynamic> _permits = [];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 10, vsync: this);
    _tabController.addListener(_onTabChanged);
    _load();
  }

  @override
  void dispose() {
    _tabController.removeListener(_onTabChanged);
    _tabController.dispose();
    super.dispose();
  }

  void _onTabChanged() {
    if (_tabController.indexIsChanging) return;
    switch (_tabController.index) {
      case 2:
        _loadKalite();
        break;
      case 3:
        _loadHse();
        break;
      case 4:
        _loadMeetings();
        break;
      case 5:
        _loadProcurement();
        break;
      case 6:
        _loadCorrespondence();
        break;
      case 7:
        _loadStakeholders();
        break;
      case 8:
        _loadChangeOrders();
        break;
      case 9:
        _loadPermits();
        break;
    }
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final id = int.parse(widget.projectId);
      final projRes = await _dio.get('/projects/$id');
      final taskRes = await _dio.get('/projects/$id/tasks');
      final taskList = taskRes.data as List<dynamic>? ?? [];
      setState(() {
        _project = ProjectModel.fromJson(projRes.data as Map<String, dynamic>);
        _tasks = taskList
            .map((e) => TaskModel.fromJson(e as Map<String, dynamic>))
            .toList();
        _loading = false;
      });
    } catch (e) {
      setState(() {
        _error = 'Yüklenemedi: $e';
        _loading = false;
      });
    }
  }

  Future<void> _loadKalite() async {
    if (_kaliteLoaded || _kaliteLoading) return;
    setState(() => _kaliteLoading = true);
    try {
      final id = widget.projectId;
      final itpRes = await _dio.get('/quality/plans',
          queryParameters: {'project_id': id});
      final ncrRes = await _dio.get('/quality/$id/ncrs');
      setState(() {
        _itpPlanlar = itpRes.data as List<dynamic>? ?? [];
        _ncrList = ncrRes.data as List<dynamic>? ?? [];
        _kaliteLoaded = true;
        _kaliteLoading = false;
      });
    } catch (_) {
      setState(() {
        _kaliteLoaded = true;
        _kaliteLoading = false;
      });
    }
  }

  Future<void> _loadHse() async {
    if (_hseLoaded || _hseLoading) return;
    setState(() => _hseLoading = true);
    try {
      final res = await _dio.get('/hse/summary',
          queryParameters: {'project_id': widget.projectId});
      setState(() {
        _hseSummary = res.data as Map<String, dynamic>?;
        _hseLoaded = true;
        _hseLoading = false;
      });
    } catch (_) {
      setState(() {
        _hseLoaded = true;
        _hseLoading = false;
      });
    }
  }

  Future<void> _loadMeetings() async {
    if (_meetingsLoaded || _meetingsLoading) return;
    setState(() => _meetingsLoading = true);
    try {
      final res = await _dio.get('/meetings',
          queryParameters: {'project_id': widget.projectId});
      setState(() {
        _meetings = res.data as List<dynamic>? ?? [];
        _meetingsLoaded = true;
        _meetingsLoading = false;
      });
    } catch (_) {
      setState(() {
        _meetingsLoaded = true;
        _meetingsLoading = false;
      });
    }
  }

  Future<void> _loadProcurement() async {
    if (_procurementLoaded || _procurementLoading) return;
    setState(() => _procurementLoading = true);
    try {
      final res = await _dio.get('/procurement/orders',
          queryParameters: {'project_id': widget.projectId});
      setState(() {
        _orders = res.data as List<dynamic>? ?? [];
        _procurementLoaded = true;
        _procurementLoading = false;
      });
    } catch (_) {
      setState(() {
        _procurementLoaded = true;
        _procurementLoading = false;
      });
    }
  }

  Future<void> _loadCorrespondence() async {
    if (_corrLoaded || _corrLoading) return;
    setState(() => _corrLoading = true);
    try {
      final res = await _dio.get('/correspondence',
          queryParameters: {'project_id': widget.projectId});
      setState(() {
        _correspondence = res.data as List<dynamic>? ?? [];
        _corrLoaded = true;
        _corrLoading = false;
      });
    } catch (_) {
      setState(() {
        _corrLoaded = true;
        _corrLoading = false;
      });
    }
  }

  Future<void> _loadStakeholders() async {
    if (_stakeholdersLoaded || _stakeholdersLoading) return;
    setState(() => _stakeholdersLoading = true);
    try {
      final res = await _dio.get('/stakeholders',
          queryParameters: {'project_id': widget.projectId});
      setState(() {
        _stakeholders = res.data as List<dynamic>? ?? [];
        _stakeholdersLoaded = true;
        _stakeholdersLoading = false;
      });
    } catch (_) {
      setState(() {
        _stakeholdersLoaded = true;
        _stakeholdersLoading = false;
      });
    }
  }

  Future<void> _loadChangeOrders() async {
    if (_changeOrdersLoaded || _changeOrdersLoading) return;
    setState(() => _changeOrdersLoading = true);
    try {
      final res = await _dio.get('/change-orders',
          queryParameters: {'project_id': widget.projectId});
      setState(() {
        _changeOrders = res.data as List<dynamic>? ?? [];
        _changeOrdersLoaded = true;
        _changeOrdersLoading = false;
      });
    } catch (_) {
      setState(() {
        _changeOrdersLoaded = true;
        _changeOrdersLoading = false;
      });
    }
  }

  Future<void> _loadPermits() async {
    if (_permitsLoaded || _permitsLoading) return;
    setState(() => _permitsLoading = true);
    try {
      final res = await _dio.get('/permits',
          queryParameters: {'project_id': widget.projectId});
      setState(() {
        _permits = res.data as List<dynamic>? ?? [];
        _permitsLoaded = true;
        _permitsLoading = false;
      });
    } catch (_) {
      setState(() {
        _permitsLoaded = true;
        _permitsLoading = false;
      });
    }
  }

  Future<void> _deleteProject() async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Projeyi Sil'),
        content:
            const Text('Bu projeyi silmek istediğinizden emin misiniz?'),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(context, false),
              child: const Text('İptal')),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child:
                const Text('Sil', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
    if (confirm != true || !mounted) return;
    final ok =
        await context.read<ProjectsProvider>().deleteProject(_project!.id);
    if (ok && mounted) context.pop();
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Scaffold(
          body: Center(child: CircularProgressIndicator()));
    }
    if (_error != null) {
      return Scaffold(
          appBar: AppBar(), body: Center(child: Text(_error!)));
    }
    if (_project == null) {
      return const Scaffold(
          body: Center(child: Text('Proje bulunamadı')));
    }

    final p = _project!;
    final isEditor =
        context.watch<AuthProvider>().user?.isEditor ?? false;

    return Scaffold(
      appBar: AppBar(
        title: Text(p.name, maxLines: 1, overflow: TextOverflow.ellipsis),
        actions: [
          IconButton(
            icon: const Icon(Icons.camera_alt),
            tooltip: 'Saha Fotoğrafları',
            onPressed: () => Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => SitePhotoScreen(
                  projectId: p.id,
                  projectName: p.name,
                ),
              ),
            ),
          ),
          if (isEditor) ...[
            IconButton(
              icon: const Icon(Icons.edit),
              onPressed: () => context.push('/projects/${p.id}/edit'),
            ),
            IconButton(
              icon: const Icon(Icons.delete, color: Colors.red),
              onPressed: _deleteProject,
            ),
          ],
        ],
        bottom: TabBar(
          controller: _tabController,
          isScrollable: true,
          tabs: const [
            Tab(text: 'Genel'),
            Tab(text: 'Görevler'),
            Tab(text: 'Kalite'),
            Tab(text: 'SGK & İSG'),
            Tab(text: 'Toplantılar'),
            Tab(text: 'Tedarik'),
            Tab(text: 'Yazışmalar'),
            Tab(text: 'Paydaşlar'),
            Tab(text: 'Değişiklik E.'),
            Tab(text: 'İzinler'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildGenelTab(p),
          _buildGorevlerTab(),
          _buildKaliteTab(),
          _buildHseTab(),
          _buildMeetingsTab(),
          _buildProcurementTab(),
          _buildCorrespondenceTab(),
          _buildStakeholdersTab(),
          _buildChangeOrdersTab(),
          _buildPermitsTab(),
        ],
      ),
    );
  }

  // ─── GENEL TAB ────────────────────────────────────────────────────────────
  Widget _buildGenelTab(ProjectModel p) {
    final fmt = DateFormat('dd.MM.yyyy');

    Color statusColor(String s) {
      switch (s) {
        case 'active':
          return Colors.green;
        case 'planning':
          return Colors.blue;
        case 'completed':
          return Colors.purple;
        default:
          return Colors.grey;
      }
    }

    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(
                    horizontal: 12, vertical: 4),
                decoration: BoxDecoration(
                  color: statusColor(p.status).withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(p.statusDisplay,
                    style: TextStyle(
                        color: statusColor(p.status),
                        fontWeight: FontWeight.bold)),
              ),
              const SizedBox(width: 12),
              Icon(Icons.location_on_outlined,
                  size: 16,
                  color: Theme.of(context)
                      .colorScheme
                      .onSurface
                      .withValues(alpha: 0.6)),
              Text(p.province),
              if (p.isDelayed) ...[
                const SizedBox(width: 8),
                const Icon(Icons.warning_amber,
                    color: Colors.orange, size: 16),
                const Text('Gecikmiş',
                    style: TextStyle(color: Colors.orange)),
              ],
            ],
          ),
          const SizedBox(height: 16),
          Text('İlerleme',
              style: Theme.of(context).textTheme.labelLarge),
          const SizedBox(height: 4),
          Row(
            children: [
              Expanded(
                child: LinearProgressIndicator(
                  value: p.progress / 100,
                  minHeight: 8,
                  backgroundColor: Colors.grey.shade200,
                ),
              ),
              const SizedBox(width: 8),
              Text('${p.progress}%',
                  style: Theme.of(context).textTheme.bodyMedium),
            ],
          ),
          const SizedBox(height: 16),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  if (p.ownerUsername != null)
                    _InfoRow(
                        icon: Icons.person_outline,
                        label: 'Proje Sahibi',
                        value: p.ownerUsername!),
                  if (p.plannedStart != null)
                    _InfoRow(
                        icon: Icons.calendar_today,
                        label: 'Başlangıç',
                        value: fmt.format(p.plannedStart!)),
                  if (p.plannedEnd != null)
                    _InfoRow(
                        icon: Icons.event,
                        label: 'Bitiş',
                        value: fmt.format(p.plannedEnd!)),
                  _InfoRow(
                      icon: Icons.task_alt,
                      label: 'Görev Sayısı',
                      value: '${p.taskCount}'),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ─── GÖREVLER TAB ─────────────────────────────────────────────────────────
  Widget _buildGorevlerTab() {
    return RefreshIndicator(
      onRefresh: _load,
      child: _tasks.isEmpty
          ? const Center(
              child: Text('Kayıt bulunamadı',
                  style: TextStyle(color: Colors.grey)))
          : ListView.builder(
              padding: const EdgeInsets.all(8),
              itemCount: _tasks.length,
              itemBuilder: (_, i) {
                final t = _tasks[i];
                return Card(
                  margin: const EdgeInsets.symmetric(
                      vertical: 2, horizontal: 8),
                  child: ListTile(
                    leading: Icon(
                      t.isDone
                          ? Icons.check_circle
                          : Icons.radio_button_unchecked,
                      color: t.isDone ? Colors.green : Colors.grey,
                    ),
                    title: Text(t.title,
                        style: TextStyle(
                            decoration: t.isDone
                                ? TextDecoration.lineThrough
                                : null)),
                    subtitle: t.assigneeUsername != null
                        ? Text(t.assigneeUsername!)
                        : null,
                    trailing: _priorityChip(t.priority),
                  ),
                );
              },
            ),
    );
  }

  // ─── KALİTE TAB ───────────────────────────────────────────────────────────
  Widget _buildKaliteTab() {
    if (_kaliteLoading || !_kaliteLoaded) {
      return const Center(child: CircularProgressIndicator());
    }

    Color ncrSeverityColor(String s) {
      switch (s.toUpperCase()) {
        case 'MINOR':
          return Colors.orange;
        case 'MAJOR':
          return Colors.red;
        case 'CRITICAL':
          return Colors.purple;
        default:
          return Colors.grey;
      }
    }

    Color ncrStatusColor(String s) {
      switch (s.toLowerCase()) {
        case 'open':
          return Colors.red;
        case 'closed':
          return Colors.green;
        case 'in_progress':
          return Colors.orange;
        default:
          return Colors.grey;
      }
    }

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Text('ITP Planları',
            style: Theme.of(context)
                .textTheme
                .titleMedium
                ?.copyWith(fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        if (_itpPlanlar.isEmpty)
          const Center(
              child: Text('Kayıt bulunamadı',
                  style: TextStyle(color: Colors.grey)))
        else
          ..._itpPlanlar.map((item) {
            final m = item as Map<String, dynamic>;
            return Card(
              margin: const EdgeInsets.symmetric(vertical: 2),
              child: ListTile(
                title: Text(m['name'] as String? ?? ''),
                subtitle: Text(m['status'] as String? ?? ''),
              ),
            );
          }),
        const SizedBox(height: 24),
        Text('NCR Listesi',
            style: Theme.of(context)
                .textTheme
                .titleMedium
                ?.copyWith(fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        if (_ncrList.isEmpty)
          const Center(
              child: Text('Kayıt bulunamadı',
                  style: TextStyle(color: Colors.grey)))
        else
          ..._ncrList.map((item) {
            final m = item as Map<String, dynamic>;
            final severity = m['severity'] as String? ?? '';
            final status = m['status'] as String? ?? '';
            return Card(
              margin: const EdgeInsets.symmetric(vertical: 2),
              child: ListTile(
                title: Text(m['title'] as String? ?? ''),
                subtitle: Row(
                  children: [
                    _badge(severity, ncrSeverityColor(severity)),
                    const SizedBox(width: 8),
                    _badge(status, ncrStatusColor(status)),
                  ],
                ),
              ),
            );
          }),
      ],
    );
  }

  // ─── SGK & İSG TAB ────────────────────────────────────────────────────────
  Widget _buildHseTab() {
    if (_hseLoading || !_hseLoaded) {
      return const Center(child: CircularProgressIndicator());
    }
    if (_hseSummary == null) {
      return const Center(
          child: Text('Yüklenemedi', style: TextStyle(color: Colors.red)));
    }

    final s = _hseSummary!;
    final items = [
      {
        'label': 'Toplam İşçi',
        'value': '${s['total_workers'] ?? 0}',
        'icon': Icons.people
      },
      {
        'label': 'Adam-Gün',
        'value': '${s['total_man_days'] ?? 0}',
        'icon': Icons.calendar_today
      },
      {
        'label': 'Kaza Sayısı',
        'value': '${s['accident_count'] ?? 0}',
        'icon': Icons.report_problem
      },
      {
        'label': 'Denetim Sayısı',
        'value': '${s['inspection_count'] ?? 0}',
        'icon': Icons.verified_user
      },
    ];

    return Padding(
      padding: const EdgeInsets.all(16),
      child: GridView.count(
        crossAxisCount: 2,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
        childAspectRatio: 1.5,
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        children: items.map((item) {
          return Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(item['icon'] as IconData,
                      size: 28,
                      color: Theme.of(context).colorScheme.primary),
                  const SizedBox(height: 8),
                  Text(item['value'] as String,
                      style: Theme.of(context)
                          .textTheme
                          .headlineSmall
                          ?.copyWith(fontWeight: FontWeight.bold)),
                  Text(item['label'] as String,
                      style: Theme.of(context).textTheme.bodySmall,
                      textAlign: TextAlign.center),
                ],
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  // ─── TOPLANTLAR TAB ───────────────────────────────────────────────────────
  Widget _buildMeetingsTab() {
    if (_meetingsLoading || !_meetingsLoaded) {
      return const Center(child: CircularProgressIndicator());
    }
    if (_meetings.isEmpty) {
      return const Center(
          child: Text('Kayıt bulunamadı',
              style: TextStyle(color: Colors.grey)));
    }

    final fmt = DateFormat('dd.MM.yyyy');

    return ListView.builder(
      padding: const EdgeInsets.all(8),
      itemCount: _meetings.length,
      itemBuilder: (_, i) {
        final m = _meetings[i] as Map<String, dynamic>;
        final type = m['type'] as String? ?? '';
        final dateStr = m['meeting_date'] as String? ?? '';
        String formattedDate = dateStr;
        try {
          formattedDate = fmt.format(DateTime.parse(dateStr));
        } catch (_) {}

        return Card(
          margin:
              const EdgeInsets.symmetric(vertical: 2, horizontal: 8),
          child: ListTile(
            title: Text(m['title'] as String? ?? ''),
            subtitle: Text(formattedDate),
            trailing: _badge(type, Colors.blue),
          ),
        );
      },
    );
  }

  // ─── TEDARİK TAB ──────────────────────────────────────────────────────────
  Widget _buildProcurementTab() {
    if (_procurementLoading || !_procurementLoaded) {
      return const Center(child: CircularProgressIndicator());
    }
    if (_orders.isEmpty) {
      return const Center(
          child: Text('Kayıt bulunamadı',
              style: TextStyle(color: Colors.grey)));
    }

    Color statusColor(String s) {
      switch (s.toUpperCase()) {
        case 'PENDING':
          return Colors.orange;
        case 'DELIVERED':
          return Colors.green;
        case 'CANCELLED':
          return Colors.grey;
        case 'PARTIAL':
          return Colors.blue;
        default:
          return Colors.grey;
      }
    }

    final fmt = DateFormat('dd.MM.yyyy');

    return ListView.builder(
      padding: const EdgeInsets.all(8),
      itemCount: _orders.length,
      itemBuilder: (_, i) {
        final m = _orders[i] as Map<String, dynamic>;
        final status = m['status'] as String? ?? '';
        final deliveryStr = m['expected_delivery'] as String? ?? '';
        String formattedDelivery = deliveryStr;
        try {
          formattedDelivery = fmt.format(DateTime.parse(deliveryStr));
        } catch (_) {}

        return Card(
          margin:
              const EdgeInsets.symmetric(vertical: 2, horizontal: 8),
          child: ListTile(
            title: Text(m['supplier_name'] as String? ?? ''),
            subtitle: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('PO: ${m['po_number'] as String? ?? ''}'),
                Text('Teslimat: $formattedDelivery'),
              ],
            ),
            trailing: _badge(status, statusColor(status)),
            isThreeLine: true,
          ),
        );
      },
    );
  }

  // ─── YAZIŞMALAR TAB ───────────────────────────────────────────────────────
  Widget _buildCorrespondenceTab() {
    if (_corrLoading || !_corrLoaded) {
      return const Center(child: CircularProgressIndicator());
    }
    if (_correspondence.isEmpty) {
      return const Center(
          child: Text('Kayıt bulunamadı',
              style: TextStyle(color: Colors.grey)));
    }

    return ListView.builder(
      padding: const EdgeInsets.all(8),
      itemCount: _correspondence.length,
      itemBuilder: (_, i) {
        final m = _correspondence[i] as Map<String, dynamic>;
        final isOverdue =
            (m['status'] as String? ?? '') == 'OVERDUE';

        return Card(
          margin:
              const EdgeInsets.symmetric(vertical: 2, horizontal: 8),
          child: Container(
            decoration: isOverdue
                ? const BoxDecoration(
                    border: Border(
                        left: BorderSide(
                            color: Colors.red, width: 4)),
                  )
                : null,
            child: ListTile(
              title: Text(m['subject'] as String? ?? ''),
              subtitle: Text(
                  '${m['ref_no'] as String? ?? ''} · ${m['type'] as String? ?? ''}'),
              trailing: m['status'] != null
                  ? _badge(m['status'] as String,
                      isOverdue ? Colors.red : Colors.grey)
                  : null,
            ),
          ),
        );
      },
    );
  }

  // ─── PAYDAŞLAR TAB ────────────────────────────────────────────────────────
  Widget _buildStakeholdersTab() {
    if (_stakeholdersLoading || !_stakeholdersLoaded) {
      return const Center(child: CircularProgressIndicator());
    }
    if (_stakeholders.isEmpty) {
      return const Center(
          child: Text('Kayıt bulunamadı',
              style: TextStyle(color: Colors.grey)));
    }

    Color influenceColor(String s) {
      switch (s.toUpperCase()) {
        case 'HIGH':
          return Colors.red;
        case 'MEDIUM':
          return Colors.orange;
        case 'LOW':
          return Colors.green;
        default:
          return Colors.grey;
      }
    }

    return ListView.builder(
      padding: const EdgeInsets.all(8),
      itemCount: _stakeholders.length,
      itemBuilder: (_, i) {
        final m = _stakeholders[i] as Map<String, dynamic>;
        final influence = m['influence_level'] as String? ?? '';

        return Card(
          margin:
              const EdgeInsets.symmetric(vertical: 2, horizontal: 8),
          child: ListTile(
            title: Text(m['name'] as String? ?? ''),
            subtitle: Text(m['organization'] as String? ?? ''),
            trailing: _badge(influence, influenceColor(influence)),
          ),
        );
      },
    );
  }

  // ─── DEĞİŞİKLİK EMİRLERİ TAB ─────────────────────────────────────────────
  Widget _buildChangeOrdersTab() {
    if (_changeOrdersLoading || !_changeOrdersLoaded) {
      return const Center(child: CircularProgressIndicator());
    }
    if (_changeOrders.isEmpty) {
      return const Center(
          child: Text('Kayıt bulunamadı',
              style: TextStyle(color: Colors.grey)));
    }

    return ListView.builder(
      padding: const EdgeInsets.all(8),
      itemCount: _changeOrders.length,
      itemBuilder: (_, i) {
        final m = _changeOrders[i] as Map<String, dynamic>;
        final costImpact =
            (m['cost_impact'] as num?)?.toDouble() ?? 0.0;
        final status = m['status'] as String? ?? '';
        final costColor =
            costImpact >= 0 ? Colors.green : Colors.red;
        final costSign = costImpact >= 0 ? '+' : '';

        return Card(
          margin:
              const EdgeInsets.symmetric(vertical: 2, horizontal: 8),
          child: ListTile(
            title: Text(m['title'] as String? ?? ''),
            subtitle:
                Text('CO: ${m['co_number'] as String? ?? ''}'),
            trailing: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                    '$costSign${costImpact.toStringAsFixed(0)}',
                    style: TextStyle(
                        color: costColor,
                        fontWeight: FontWeight.bold)),
                const SizedBox(width: 8),
                _badge(status, Colors.blue),
              ],
            ),
          ),
        );
      },
    );
  }

  // ─── İZİNLER TAB ──────────────────────────────────────────────────────────
  Widget _buildPermitsTab() {
    if (_permitsLoading || !_permitsLoaded) {
      return const Center(child: CircularProgressIndicator());
    }
    if (_permits.isEmpty) {
      return const Center(
          child: Text('Kayıt bulunamadı',
              style: TextStyle(color: Colors.grey)));
    }

    Color permitStatusColor(String s) {
      switch (s.toUpperCase()) {
        case 'EXPIRED':
          return Colors.red;
        case 'PENDING_RENEWAL':
          return Colors.orange;
        case 'ACTIVE':
          return Colors.green;
        default:
          return Colors.grey;
      }
    }

    final fmt = DateFormat('dd.MM.yyyy');

    return ListView.builder(
      padding: const EdgeInsets.all(8),
      itemCount: _permits.length,
      itemBuilder: (_, i) {
        final m = _permits[i] as Map<String, dynamic>;
        final status = m['status'] as String? ?? 'ACTIVE';
        final expiryStr = m['expiry_date'] as String? ?? '';
        String formattedExpiry = expiryStr;
        try {
          formattedExpiry = fmt.format(DateTime.parse(expiryStr));
        } catch (_) {}

        return Card(
          margin:
              const EdgeInsets.symmetric(vertical: 2, horizontal: 8),
          child: ListTile(
            title: Text(m['permit_type'] as String? ?? ''),
            subtitle: Text(
                'No: ${m['permit_no'] as String? ?? ''} · Son: $formattedExpiry'),
            trailing:
                _badge(status, permitStatusColor(status)),
          ),
        );
      },
    );
  }

  // ─── HELPERS ──────────────────────────────────────────────────────────────
  Widget _badge(String label, Color color) {
    return Container(
      padding:
          const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(label,
          style: TextStyle(
              color: color,
              fontSize: 11,
              fontWeight: FontWeight.w600)),
    );
  }

  Widget _priorityChip(String priority) {
    Color c;
    switch (priority) {
      case 'high':
        c = Colors.red;
        break;
      case 'medium':
        c = Colors.orange;
        break;
      default:
        c = Colors.green;
    }
    return _badge(priority, c);
  }
}

class _InfoRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  const _InfoRow(
      {required this.icon, required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          Icon(icon,
              size: 18,
              color: Theme.of(context).colorScheme.primary),
          const SizedBox(width: 8),
          Text('$label: ',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: Theme.of(context)
                      .colorScheme
                      .onSurface
                      .withValues(alpha: 0.7))),
          Expanded(
              child: Text(value,
                  style: Theme.of(context).textTheme.bodyMedium)),
        ],
      ),
    );
  }
}
