import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:proje_haritasi_mobile/features/map/models/province_model.dart';

class TurkeyMapWidget extends StatefulWidget {
  final List<ProvinceModel> provinces;
  final void Function(String province)? onProvinceTap;

  const TurkeyMapWidget({
    super.key,
    required this.provinces,
    this.onProvinceTap,
  });

  @override
  State<TurkeyMapWidget> createState() => _TurkeyMapWidgetState();
}

class _TurkeyMapWidgetState extends State<TurkeyMapWidget> {
  String? _coloredSvg;

  @override
  void initState() {
    super.initState();
    _buildColoredSvg();
  }

  @override
  void didUpdateWidget(TurkeyMapWidget old) {
    super.didUpdateWidget(old);
    if (old.provinces != widget.provinces) {
      _buildColoredSvg();
    }
  }

  Future<void> _buildColoredSvg() async {
    String svg = await rootBundle.loadString('assets/turkiye.svg');

    // Varsayılan dolgu: projesiz iller açık gri-mavi
    svg = svg.replaceFirst('<g id="turkiye">', '<g id="turkiye" fill="#dde4f5" stroke="#ffffff" stroke-width="0.5">');

    // API'den gelen her il için renk enjekte et
    for (final p in widget.provinces) {
      if (p.projectCount == 0) continue;
      final color = p.hasDelay ? '#e74c3c' : p.color;
      // data-iladi değerini içeren <g ... > etiketini bul ve fill ekle
      svg = svg.replaceAll(
        'data-iladi="${p.province}"',
        'data-iladi="${p.province}" fill="$color"',
      );
    }

    if (mounted) setState(() => _coloredSvg = svg);
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Container(
          width: double.infinity,
          height: 220,
          color: const Color(0xFFF0F4FF),
          child: _coloredSvg == null
              ? const Center(child: CircularProgressIndicator())
              : SvgPicture.string(
                  _coloredSvg!,
                  fit: BoxFit.contain,
                ),
        ),
        const SizedBox(height: 8),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Wrap(
            spacing: 16,
            runSpacing: 4,
            children: const [
              _Legend(color: Color(0xFF4f6ef7), label: 'Aktif'),
              _Legend(color: Color(0xFFf39c12), label: 'Beklemede'),
              _Legend(color: Color(0xFF27ae60), label: 'Tamamlandı'),
              _Legend(color: Color(0xFFe74c3c), label: 'Gecikmeli'),
              _Legend(color: Color(0xFFdde4f5), label: 'Projesiz'),
            ],
          ),
        ),
      ],
    );
  }
}

class _Legend extends StatelessWidget {
  final Color color;
  final String label;
  const _Legend({required this.color, required this.label});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 10,
          height: 10,
          decoration: BoxDecoration(color: color, shape: BoxShape.circle),
        ),
        const SizedBox(width: 4),
        Text(label, style: const TextStyle(fontSize: 10)),
      ],
    );
  }
}
