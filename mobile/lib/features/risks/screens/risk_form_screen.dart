import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import 'package:proje_haritasi_mobile/features/projects/models/project_model.dart';
import 'package:proje_haritasi_mobile/features/risks/models/risk_model.dart';
import 'package:proje_haritasi_mobile/features/risks/providers/risks_provider.dart';

class RiskFormSheet extends StatefulWidget {
  final List<ProjectModel> projects;
  final RiskModel? existing;
  final VoidCallback onSaved;

  const RiskFormSheet({
    super.key,
    required this.projects,
    this.existing,
    required this.onSaved,
  });

  bool get isEdit => existing != null;

  @override
  State<RiskFormSheet> createState() => _RiskFormSheetState();
}

class _RiskFormSheetState extends State<RiskFormSheet> {
  final _formKey = GlobalKey<FormState>();
  final _baslikController = TextEditingController();
  final _aciklamaController = TextEditingController();
  int? _projeId;
  String _kategori = 'teknik';
  double _olasilik = 3;
  double _etki = 3;
  String _durum = 'acik';
  DateTime? _hedefTarih;
  bool _loading = false;
  final _fmt = DateFormat('dd.MM.yyyy');

  @override
  void initState() {
    super.initState();
    final e = widget.existing;
    if (e != null) {
      _baslikController.text = e.baslik;
      _aciklamaController.text = e.aciklama;
      _projeId = e.projeId;
      _kategori = e.kategori;
      _olasilik = e.olasilik.toDouble();
      _etki = e.etki.toDouble();
      _durum = e.durum;
      _hedefTarih = e.hedefTarih;
    } else if (widget.projects.isNotEmpty) {
      _projeId = widget.projects.first.id;
    }
  }

  @override
  void dispose() {
    _baslikController.dispose();
    _aciklamaController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    if (_projeId == null) return;
    setState(() => _loading = true);

    final data = <String, dynamic>{
      'proje_id': _projeId,
      'baslik': _baslikController.text.trim(),
      'aciklama': _aciklamaController.text.trim(),
      'kategori': _kategori,
      'olasilik': _olasilik.round(),
      'etki': _etki.round(),
      'durum': _durum,
      if (_hedefTarih != null)
        'hedef_tarih': _hedefTarih!.toIso8601String().split('T')[0],
    };

    final provider = context.read<RisksProvider>();
    bool ok;
    if (widget.isEdit) {
      ok = await provider.update(widget.existing!.id, data);
    } else {
      ok = await provider.create(data);
    }

    setState(() => _loading = false);
    if (ok && mounted) {
      widget.onSaved();
      Navigator.pop(context);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        left: 16, right: 16, top: 16,
        bottom: MediaQuery.of(context).viewInsets.bottom + 16,
      ),
      child: Form(
        key: _formKey,
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(widget.isEdit ? 'Riski Düzenle' : 'Yeni Risk',
                  style: Theme.of(context).textTheme.titleLarge),
              const SizedBox(height: 16),
              if (widget.projects.isNotEmpty)
                DropdownButtonFormField<int>(
                  value: _projeId,
                  decoration: const InputDecoration(labelText: 'Proje *', isDense: true),
                  items: widget.projects
                      .map((p) => DropdownMenuItem(value: p.id, child: Text(p.name, overflow: TextOverflow.ellipsis)))
                      .toList(),
                  validator: (v) => v == null ? 'Proje seçin' : null,
                  onChanged: (v) => setState(() => _projeId = v),
                ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _baslikController,
                decoration: const InputDecoration(labelText: 'Başlık *'),
                validator: (v) => v == null || v.isEmpty ? 'Başlık gerekli' : null,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _aciklamaController,
                decoration: const InputDecoration(labelText: 'Açıklama'),
                maxLines: 2,
              ),
              const SizedBox(height: 12),
              DropdownButtonFormField<String>(
                value: _kategori,
                decoration: const InputDecoration(labelText: 'Kategori', isDense: true),
                items: const [
                  DropdownMenuItem(value: 'teknik', child: Text('Teknik')),
                  DropdownMenuItem(value: 'mali', child: Text('Mali')),
                  DropdownMenuItem(value: 'zaman', child: Text('Zaman')),
                  DropdownMenuItem(value: 'kapsam', child: Text('Kapsam')),
                  DropdownMenuItem(value: 'kaynak', child: Text('Kaynak')),
                  DropdownMenuItem(value: 'dis', child: Text('Dış')),
                ],
                onChanged: (v) => setState(() => _kategori = v ?? _kategori),
              ),
              const SizedBox(height: 12),
              Text('Olasılık: ${_olasilik.round()}/5',
                  style: Theme.of(context).textTheme.bodyMedium),
              Slider(
                value: _olasilik,
                min: 1, max: 5, divisions: 4,
                label: '${_olasilik.round()}',
                onChanged: (v) => setState(() => _olasilik = v),
              ),
              Text('Etki: ${_etki.round()}/5',
                  style: Theme.of(context).textTheme.bodyMedium),
              Slider(
                value: _etki,
                min: 1, max: 5, divisions: 4,
                label: '${_etki.round()}',
                onChanged: (v) => setState(() => _etki = v),
              ),
              DropdownButtonFormField<String>(
                value: _durum,
                decoration: const InputDecoration(labelText: 'Durum', isDense: true),
                items: const [
                  DropdownMenuItem(value: 'acik', child: Text('Açık')),
                  DropdownMenuItem(value: 'izleniyor', child: Text('İzleniyor')),
                  DropdownMenuItem(value: 'kapali', child: Text('Kapalı')),
                ],
                onChanged: (v) => setState(() => _durum = v ?? _durum),
              ),
              const SizedBox(height: 12),
              OutlinedButton.icon(
                icon: const Icon(Icons.calendar_today, size: 16),
                label: Text(_hedefTarih != null
                    ? _fmt.format(_hedefTarih!)
                    : 'Hedef Tarih'),
                onPressed: () async {
                  final picked = await showDatePicker(
                    context: context,
                    initialDate: _hedefTarih ?? DateTime.now(),
                    firstDate: DateTime.now(),
                    lastDate: DateTime(2035),
                  );
                  if (picked != null) setState(() => _hedefTarih = picked);
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
                      : Text(widget.isEdit ? 'Güncelle' : 'Oluştur'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
