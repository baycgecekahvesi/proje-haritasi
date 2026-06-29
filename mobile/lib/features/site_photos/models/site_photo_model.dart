class SitePhotoModel {
  final int id;
  final int projectId;
  final String uploadedByUsername;
  final String photoUrl;
  final String description;
  final double? latitude;
  final double? longitude;
  final DateTime? takenAt;
  final DateTime uploadedAt;

  const SitePhotoModel({
    required this.id,
    required this.projectId,
    required this.uploadedByUsername,
    required this.photoUrl,
    required this.description,
    this.latitude,
    this.longitude,
    this.takenAt,
    required this.uploadedAt,
  });

  factory SitePhotoModel.fromJson(Map<String, dynamic> json) {
    return SitePhotoModel(
      id: json['id'] as int,
      projectId: json['project_id'] as int,
      uploadedByUsername: json['uploaded_by_username'] as String? ?? '',
      photoUrl: json['photo_url'] as String? ?? '',
      description: json['description'] as String? ?? '',
      latitude: (json['latitude'] as num?)?.toDouble(),
      longitude: (json['longitude'] as num?)?.toDouble(),
      takenAt: json['taken_at'] != null
          ? DateTime.tryParse(json['taken_at'] as String)
          : null,
      uploadedAt: DateTime.parse(json['uploaded_at'] as String),
    );
  }
}
