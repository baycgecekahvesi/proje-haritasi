class ProjectModel {
  final int id;
  final String name;
  final String province;
  final String status;
  final String statusDisplay;
  final int progress;
  final bool isDelayed;
  final String? ownerUsername;
  final DateTime? plannedStart;
  final DateTime? plannedEnd;
  final int taskCount;

  const ProjectModel({
    required this.id,
    required this.name,
    required this.province,
    required this.status,
    required this.statusDisplay,
    required this.progress,
    required this.isDelayed,
    this.ownerUsername,
    this.plannedStart,
    this.plannedEnd,
    required this.taskCount,
  });

  factory ProjectModel.fromJson(Map<String, dynamic> json) {
    return ProjectModel(
      id: json['id'] as int,
      name: json['name'] as String? ?? '',
      province: json['province'] as String? ?? '',
      status: json['status'] as String? ?? '',
      statusDisplay: json['status_display'] as String? ?? json['status'] as String? ?? '',
      progress: json['progress'] as int? ?? 0,
      isDelayed: json['is_delayed'] as bool? ?? false,
      ownerUsername: json['owner_username'] as String?,
      plannedStart: json['planned_start'] != null
          ? DateTime.tryParse(json['planned_start'] as String)
          : null,
      plannedEnd: json['planned_end'] != null
          ? DateTime.tryParse(json['planned_end'] as String)
          : null,
      taskCount: json['task_count'] as int? ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'province': province,
      'status': status,
      'progress': progress,
      if (plannedStart != null)
        'planned_start': plannedStart!.toIso8601String().split('T')[0],
      if (plannedEnd != null)
        'planned_end': plannedEnd!.toIso8601String().split('T')[0],
    };
  }
}

class PaginatedProjects {
  final List<ProjectModel> items;
  final int count;

  const PaginatedProjects({required this.items, required this.count});

  factory PaginatedProjects.fromJson(Map<String, dynamic> json) {
    final rawItems = json['items'] as List<dynamic>? ?? [];
    return PaginatedProjects(
      items: rawItems
          .map((e) => ProjectModel.fromJson(e as Map<String, dynamic>))
          .toList(),
      count: json['count'] as int? ?? 0,
    );
  }
}
