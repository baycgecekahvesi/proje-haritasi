import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import 'package:proje_haritasi_mobile/core/network/dio_client.dart';
import 'package:proje_haritasi_mobile/features/projects/models/project_model.dart';
import 'package:proje_haritasi_mobile/features/projects/providers/projects_provider.dart';

const _turkishProvinces = [
  'Adana','Adıyaman','Afyonkarahisar','Ağrı','Amasya','Ankara','Antalya','Artvin',
  'Aydın','Balıkesir','Bilecik','Bingöl','Bitlis','Bolu','Burdur','Bursa','Çanakkale',
  'Çankırı','Çorum','Denizli','Diyarbakır','Edirne','Elazığ','Erzincan','Erzurum',
  'Eskişehir','Gaziantep','Giresun','Gümüşhane','Hakkari','Hatay','Isparta','Mersin',
  'İstanbul','İzmir','Kars','Kastamonu','Kayseri','Kırklareli','Kırşehir','Kocaeli',
  'Konya','Kütahya','Malatya','Manisa','Kahramanmaraş','Mardin','Muğla','Muş',
  'Nevşehir','Niğde','Ordu','Rize','Sakarya','Samsun','Siirt','Sinop','Sivas',
  'Tekirdağ','Tokat','Trabzon','Tunceli','Şanlıurfa','Uşak','Van','Yozgat',
  'Zonguldak','Aksaray','Bayburt','Karaman','Kırıkkale','Batman','Şırnak','Bartın',
  'Ardahan','Iğdır','Yalova','Karabük','Kilis','Osmaniye','Düzce',
];

const _statusOptions = [
  {'value': 'aktif', 'label': 'Aktif'},
  {'value': 'beklemede', 'label': 'Beklemede'},
  {'value': 'tamamlandi', 'label': 'Tamamlandı'},
  {'value': 'iptal', 'label': 'İptal'},
];

class ProjectFormScreen extends StatefulWidget {
  final String? projectId;
  const ProjectFormScreen({super.key, this.projectId});

  bool get isEdit => projectId != null;

  @override
  State<ProjectFormScreen> createState() => _ProjectFormScreenState();
}

class _ProjectFormScreenState extends State<ProjectFormScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  String _province = _turkishProvinces.first;
  String _status = 'aktif';
  double _progress = 0;
  DateTime? _plannedStart;
  DateTime? _plannedEnd;
  bool _loading = false;
  bool _initialLoading = false;
  ProjectModel? _existing;

  final _fmt = DateFormat('dd.MM.yyyy');

  @override
  void initState() {
    super.initState();
    if (widget.isEdit) _loadExisting();
  }

  @override
  void dispose() {
    _nameController.dispose();
    super.dispose();
  }

  Future<void> _loadExisting() async {
    setState(() => _initialLoading = true);
    try {
      final response = await DioClient().dio.get('/projects/${widget.projectId}');
      final p = ProjectModel.fromJson(response.data as Map<String, dynamic>);
      setState(() {
        _existing = p;
        _nameController.text = p.name;
        _province = p.province.isNotEmpty && _turkishProvinces.contains(p.province)
            ? p.province
            : _turkishProvinces.first;
        _status = p.status;
        _progress = p.progress.toDouble();
        _plannedStart = p.plannedStart;
        _plannedEnd = p.plannedEnd;
        _initialLoading = false;
      });
    } catch (_) {
      setState(() => _initialLoading = false);
    }
  }

  Future<void> _pickDate(bool isStart) async {
    final picked = await showDatePicker(
      context: context,
      initialDate: (isStart ? _plannedStart : _plannedEnd) ?? DateTime.now(),
      firstDate: DateTime(2020),
      lastDate: DateTime(2035),
    );
    if (picked != null) {
      setState(() {
        if (isStart) _plannedStart = picked;
        else _plannedEnd = picked;
      });
    }
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _loading = true);

    final data = <String, dynamic>{
      'name': _nameController.text.trim(),
      'province': _province,
      'status': _status,
      'progress': _progress.round(),
      if (_plannedStart != null)
        'planned_start': _plannedStart!.toIso8601String().split('T')[0],
      if (_plannedEnd != null)
        'planned_end': _plannedEnd!.toIso8601String().split('T')[0],
    };

    final provider = context.read<ProjectsProvider>();
    bool ok;
    if (widget.isEdit) {
      ok = await provider.updateProject(int.parse(widget.projectId!), data);
    } else {
      ok = await provider.createProject(data);
    }

    setState(() => _loading = false);
    if (ok && mounted) context.pop();
  }

  @override
  Widget build(BuildContext context) {
    if (_initialLoading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    return Scaffold(
      appBar: AppBar(
        title: Text(widget.isEdit ? 'Projeyi Düzenle' : 'Yeni Proje'),
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            TextFormField(
              controller: _nameController,
              decoration: const InputDecoration(labelText: 'Proje Adı *'),
              validator: (v) => v == null || v.isEmpty ? 'Ad gerekli' : null,
            ),
            const SizedBox(height: 16),
            DropdownButtonFormField<String>(
              value: _province,
              decoration: const InputDecoration(labelText: 'İl'),
              items: _turkishProvinces
                  .map((p) => DropdownMenuItem(value: p, child: Text(p)))
                  .toList(),
              onChanged: (v) => setState(() => _province = v ?? _province),
            ),
            const SizedBox(height: 16),
            DropdownButtonFormField<String>(
              value: _status,
              decoration: const InputDecoration(labelText: 'Durum'),
              items: _statusOptions
                  .map((s) =>
                      DropdownMenuItem(value: s['value'], child: Text(s['label']!)))
                  .toList(),
              onChanged: (v) => setState(() => _status = v ?? _status),
            ),
            const SizedBox(height: 16),
            Text('İlerleme: ${_progress.round()}%',
                style: Theme.of(context).textTheme.bodyMedium),
            Slider(
              value: _progress,
              min: 0,
              max: 100,
              divisions: 100,
              label: '${_progress.round()}%',
              onChanged: (v) => setState(() => _progress = v),
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    icon: const Icon(Icons.calendar_today, size: 16),
                    label: Text(_plannedStart != null
                        ? _fmt.format(_plannedStart!)
                        : 'Başlangıç Tarihi'),
                    onPressed: () => _pickDate(true),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: OutlinedButton.icon(
                    icon: const Icon(Icons.event, size: 16),
                    label: Text(_plannedEnd != null
                        ? _fmt.format(_plannedEnd!)
                        : 'Bitiş Tarihi'),
                    onPressed: () => _pickDate(false),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),
            Consumer<ProjectsProvider>(
              builder: (_, p, __) {
                if (p.error == null) return const SizedBox.shrink();
                return Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: Text(p.error!,
                      style: TextStyle(color: Theme.of(context).colorScheme.error)),
                );
              },
            ),
            ElevatedButton(
              onPressed: _loading ? null : _submit,
              child: _loading
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                    )
                  : Text(widget.isEdit ? 'Güncelle' : 'Oluştur'),
            ),
          ],
        ),
      ),
    );
  }
}
