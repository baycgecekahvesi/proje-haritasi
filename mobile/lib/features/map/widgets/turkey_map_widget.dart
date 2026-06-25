import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:proje_haritasi_mobile/features/map/models/province_model.dart';

class TurkeyMapWidget extends StatelessWidget {
  final List<ProvinceModel> provinces;
  final void Function(String province)? onProvinceTap;

  const TurkeyMapWidget({
    super.key,
    required this.provinces,
    this.onProvinceTap,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      height: 220,
      color: Theme.of(context).colorScheme.surfaceContainerHighest.withValues(alpha: 0.3),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Expanded(
            child: SvgPicture.asset(
              'assets/turkiye.svg',
              fit: BoxFit.contain,
              placeholderBuilder: (_) => const Center(
                child: CircularProgressIndicator(),
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                _Legend(color: Colors.green, label: 'Tamamlandı'),
                const SizedBox(width: 12),
                _Legend(color: Colors.blue, label: 'Aktif'),
                const SizedBox(width: 12),
                _Legend(color: Colors.orange, label: 'Gecikmiş'),
                const SizedBox(width: 12),
                _Legend(color: Colors.grey, label: 'Yok'),
              ],
            ),
          ),
        ],
      ),
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
