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

class _ProjectDetailScreenState extends State<ProjectDetailScreen> {
  ProjectModel? _project;
  List<TaskModel> _tasks = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() { _loading = true; _error = null; });
    try {
      final client = DioClient();
      final id = int.parse(widget.projectId);
      final projRes = await client.dio.get('/projects/$id');
      final taskRes = await client.dio.get('/projects/$id/tasks');
      final taskList = taskRes.data as List<dynamic>? ?? [];
      setState(() {
        _project = ProjectModel.fromJson(projRes.data as Map<String, dynamic>);
        _tasks = taskList
            .map((e) => TaskModel.fromJson(e as Map<String, dynamic>))
            .toList();
        _loading = false;
      });
    } catch (e) {
      setState(() { _error = 'Yüklenemedi: $e'; _loading = false; });
    }
  }

  Future<void> _deleteProject() async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Projeyi Sil'),
        content: const Text('Bu projeyi silmek istediğinizden emin misiniz?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('İptal')),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Sil', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
    if (confirm != true || !mounted) return;
    final ok = await context.read<ProjectsProvider>().deleteProject(_project!.id);
    if (ok && mounted) context.pop();
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Scaffold(body: Center(child: CircularProgressIndicator()));
    if (_error != null) return Scaffold(appBar: AppBar(), body: Center(child: Text(_error!)));
    if (_project == null) return const Scaffold(body: Center(child: Text('Proje bulunamadı')));

    final p = _project!;
    final isEditor = context.watch<AuthProvider>().user?.isEditor ?? false;
    final fmt = DateFormat('dd.MM.yyyy');

    Color statusColor(String s) {
      switch (s) {
        case 'active': return Colors.green;
        case 'planning': return Colors.blue;
        case 'completed': return Colors.purple;
        default: return Colors.grey;
      }
    }

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
      ),
      body: RefreshIndicator(
        onRefresh: _load,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
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
                Icon(Icons.location_on_outlined, size: 16,
                    color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.6)),
                Text(p.province),
                if (p.isDelayed) ...[
                  const SizedBox(width: 8),
                  const Icon(Icons.warning_amber, color: Colors.orange, size: 16),
                  const Text('Gecikmiş', style: TextStyle(color: Colors.orange)),
                ],
              ],
            ),
            const SizedBox(height: 16),
            Text('İlerleme', style: Theme.of(context).textTheme.labelLarge),
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
                Text('${p.progress}%', style: Theme.of(context).textTheme.bodyMedium),
              ],
            ),
            const SizedBox(height: 16),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    if (p.ownerUsername != null)
                      _InfoRow(icon: Icons.person_outline, label: 'Proje Sahibi', value: p.ownerUsername!),
                    if (p.plannedStart != null)
                      _InfoRow(icon: Icons.calendar_today, label: 'Başlangıç', value: fmt.format(p.plannedStart!)),
                    if (p.plannedEnd != null)
                      _InfoRow(icon: Icons.event, label: 'Bitiş', value: fmt.format(p.plannedEnd!)),
                    _InfoRow(icon: Icons.task_alt, label: 'Görev Sayısı', value: '${p.taskCount}'),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
            Text('Görevler (${_tasks.length})',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            if (_tasks.isEmpty)
              const Card(child: Padding(padding: EdgeInsets.all(16), child: Text('Görev bulunamadı'))),
            ..._tasks.map((t) => Card(
              margin: const EdgeInsets.symmetric(vertical: 2),
              child: ListTile(
                leading: Icon(
                  t.isDone ? Icons.check_circle : Icons.radio_button_unchecked,
                  color: t.isDone ? Colors.green : Colors.grey,
                ),
                title: Text(t.title,
                    style: TextStyle(
                        decoration: t.isDone ? TextDecoration.lineThrough : null)),
                subtitle: t.assigneeUsername != null ? Text(t.assigneeUsername!) : null,
                trailing: _priorityChip(t.priority),
              ),
            )),
          ],
        ),
      ),
    );
  }

  Widget _priorityChip(String priority) {
    Color c;
    switch (priority) {
      case 'high': c = Colors.red; break;
      case 'medium': c = Colors.orange; break;
      default: c = Colors.green;
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(
          color: c.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(8)),
      child: Text(priority, style: TextStyle(color: c, fontSize: 11)),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  const _InfoRow({required this.icon, required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          Icon(icon, size: 18, color: Theme.of(context).colorScheme.primary),
          const SizedBox(width: 8),
          Text('$label: ', style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.7))),
          Expanded(child: Text(value, style: Theme.of(context).textTheme.bodyMedium)),
        ],
      ),
    );
  }
}
