class TaskModel {
  final int id;
  final int projectId;
  final String title;
  final String description;
  final String priority;
  final String priorityDisplay;
  final bool isDone;
  final DateTime? dueDate;
  final String? assigneeUsername;

  const TaskModel({
    required this.id,
    required this.projectId,
    required this.title,
    required this.description,
    required this.priority,
    required this.priorityDisplay,
    required this.isDone,
    this.dueDate,
    this.assigneeUsername,
  });

  factory TaskModel.fromJson(Map<String, dynamic> json) {
    return TaskModel(
      id: json['id'] as int,
      projectId: json['project_id'] as int? ?? 0,
      title: json['title'] as String? ?? '',
      description: json['description'] as String? ?? '',
      priority: json['priority'] as String? ?? 'medium',
      priorityDisplay: json['priority_display'] as String? ?? json['priority'] as String? ?? '',
      isDone: json['is_done'] as bool? ?? false,
      dueDate: json['due_date'] != null
          ? DateTime.tryParse(json['due_date'] as String)
          : null,
      assigneeUsername: json['assignee_username'] as String?,
    );
  }
}
