import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import 'package:proje_haritasi_mobile/core/network/dio_client.dart';
import 'package:proje_haritasi_mobile/features/auth/providers/auth_provider.dart';
import 'package:proje_haritasi_mobile/features/projects/models/project_model.dart';
import 'package:proje_haritasi_mobile/features/tasks/models/task_model.dart';

class TasksScreen extends StatefulWidget {
  const TasksScreen({super.key});

  @override
  State<TasksScreen> createState() => _TasksScreenState();
}

class _TasksScreenState extends State<TasksScreen> {
  final _client = DioClient();
  List<ProjectModel> _projects = [];
  ProjectModel? _selectedProject;
  List<TaskModel> _tasks = [];
  bool _loadingProjects = true;
  bool _loadingTasks = false;

  @override
  void initState() {
    super.initState();
    _loadProjects();
  }

  Future<void> _loadProjects() async {
    try {
      final res = await _client.dio.get('/projects/', queryParameters: {'page': 1});
      final data = res.data as Map<String, dynamic>;
      final items = (data['items'] as List<dynamic>? ?? [])
          .map((e) => ProjectModel.fromJson(e as Map<String, dynamic>))
          .toList();
      setState(() {
        _projects = items;
        _loadingProjects = false;
        if (items.isNotEmpty) {
          _selectedProject = items.first;
          _loadTasks();
        }
      });
    } catch (_) {
      setState(() => _loadingProjects = false);
    }
  }

  Future<void> _loadTasks() async {
    if (_selectedProject == null) return;
    setState(() => _loadingTasks = true);
    try {
      final res = await _client.dio.get('/projects/${_selectedProject!.id}/tasks');
      final list = res.data as List<dynamic>? ?? [];
      setState(() {
        _tasks = list.map((e) => TaskModel.fromJson(e as Map<String, dynamic>)).toList();
        _loadingTasks = false;
      });
    } catch (_) {
      setState(() => _loadingTasks = false);
    }
  }

  Future<void> _toggleDone(TaskModel task) async {
    try {
      await _client.dio.patch(
        '/projects/${_selectedProject!.id}/tasks/${task.id}',
        data: {'is_done': !task.isDone},
      );
      await _loadTasks();
    } catch (_) {}
  }

  Future<void> _deleteTask(TaskModel task) async {
    try {
      await _client.dio.delete('/projects/${_selectedProject!.id}/tasks/${task.id}');
      await _loadTasks();
    } catch (_) {}
  }

  void _showNewTaskSheet() {
    if (_selectedProject == null) return;
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (_) => _NewTaskSheet(
        projectId: _selectedProject!.id,
        onCreated: _loadTasks,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isEditor = context.watch<AuthProvider>().user?.isEditor ?? false;

    if (_loadingProjects) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    return Scaffold(
      appBar: AppBar(title: const Text('Görevler')),
      floatingActionButton: isEditor
          ? FloatingActionButton(
              onPressed: _showNewTaskSheet,
              child: const Icon(Icons.add),
            )
          : null,
      body: Column(
        children: [
          if (_projects.isNotEmpty)
            Padding(
              padding: const EdgeInsets.all(12),
              child: DropdownButtonFormField<ProjectModel>(
                value: _selectedProject,
                decoration: const InputDecoration(
                  labelText: 'Proje Seç',
                  isDense: true,
                ),
                items: _projects
                    .map((p) => DropdownMenuItem(
                          value: p,
                          child: Text(p.name,
                              overflow: TextOverflow.ellipsis, maxLines: 1),
                        ))
                    .toList(),
                onChanged: (p) {
                  setState(() {
                    _selectedProject = p;
                    _tasks = [];
                  });
                  _loadTasks();
                },
              ),
            ),
          if (_loadingTasks) const LinearProgressIndicator(),
          Expanded(
            child: _tasks.isEmpty && !_loadingTasks
                ? const Center(child: Text('Görev bulunamadı'))
                : ListView.builder(
                    itemCount: _tasks.length,
                    itemBuilder: (_, i) {
                      final t = _tasks[i];
                      return Dismissible(
                        key: Key('task-${t.id}'),
                        direction: isEditor
                            ? DismissDirection.endToStart
                            : DismissDirection.none,
                        background: Container(
                          color: Colors.red,
                          alignment: Alignment.centerRight,
                          padding: const EdgeInsets.only(right: 16),
                          child: const Icon(Icons.delete, color: Colors.white),
                        ),
                        onDismissed: (_) => _deleteTask(t),
                        child: ListTile(
                          leading: Checkbox(
                            value: t.isDone,
                            onChanged: isEditor ? (_) => _toggleDone(t) : null,
                          ),
                          title: Text(t.title,
                              style: TextStyle(
                                  decoration: t.isDone
                                      ? TextDecoration.lineThrough
                                      : null)),
                          subtitle: t.assigneeUsername != null
                              ? Text(t.assigneeUsername!)
                              : null,
                          trailing: _priorityBadge(t.priority),
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }

  Widget _priorityBadge(String priority) {
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

class _NewTaskSheet extends StatefulWidget {
  final int projectId;
  final VoidCallback onCreated;
  const _NewTaskSheet({required this.projectId, required this.onCreated});

  @override
  State<_NewTaskSheet> createState() => _NewTaskSheetState();
}

class _NewTaskSheetState extends State<_NewTaskSheet> {
  final _titleController = TextEditingController();
  String _priority = 'medium';
  DateTime? _dueDate;
  bool _loading = false;
  final _fmt = DateFormat('dd.MM.yyyy');

  @override
  void dispose() {
    _titleController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (_titleController.text.trim().isEmpty) return;
    setState(() => _loading = true);
    try {
      await DioClient().dio.post(
        '/projects/${widget.projectId}/tasks',
        data: {
          'title': _titleController.text.trim(),
          'priority': _priority,
          if (_dueDate != null)
            'due_date': _dueDate!.toIso8601String().split('T')[0],
        },
      );
      widget.onCreated();
      if (mounted) Navigator.pop(context);
    } catch (_) {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        left: 16, right: 16, top: 16,
        bottom: MediaQuery.of(context).viewInsets.bottom + 16,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Yeni Görev', style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: 16),
          TextField(
            controller: _titleController,
            decoration: const InputDecoration(labelText: 'Görev Adı *'),
            autofocus: true,
          ),
          const SizedBox(height: 12),
          DropdownButtonFormField<String>(
            value: _priority,
            decoration: const InputDecoration(labelText: 'Öncelik', isDense: true),
            items: const [
              DropdownMenuItem(value: 'low', child: Text('Düşük')),
              DropdownMenuItem(value: 'medium', child: Text('Orta')),
              DropdownMenuItem(value: 'high', child: Text('Yüksek')),
            ],
            onChanged: (v) => setState(() => _priority = v ?? _priority),
          ),
          const SizedBox(height: 12),
          OutlinedButton.icon(
            icon: const Icon(Icons.calendar_today, size: 16),
            label: Text(_dueDate != null ? _fmt.format(_dueDate!) : 'Bitiş Tarihi'),
            onPressed: () async {
              final picked = await showDatePicker(
                context: context,
                initialDate: _dueDate ?? DateTime.now(),
                firstDate: DateTime.now(),
                lastDate: DateTime(2035),
              );
              if (picked != null) setState(() => _dueDate = picked);
            },
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _loading ? null : _submit,
              child: _loading
                  ? const SizedBox(
                      height: 20, width: 20,
                      child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                  : const Text('Ekle'),
            ),
          ),
        ],
      ),
    );
  }
}
