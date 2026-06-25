class ProvinceModel {
  final String province;
  final String color;
  final int projectCount;
  final double avgProgress;
  final bool hasDelay;

  const ProvinceModel({
    required this.province,
    required this.color,
    required this.projectCount,
    required this.avgProgress,
    required this.hasDelay,
  });

  factory ProvinceModel.fromJson(Map<String, dynamic> json) {
    return ProvinceModel(
      province: json['province'] as String? ?? '',
      color: json['color'] as String? ?? '#808080',
      projectCount: json['project_count'] as int? ?? 0,
      avgProgress: (json['avg_progress'] as num?)?.toDouble() ?? 0.0,
      hasDelay: json['has_delay'] as bool? ?? false,
    );
  }
}
