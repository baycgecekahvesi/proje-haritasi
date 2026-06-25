class UserModel {
  final int id;
  final String username;
  final String email;
  final String firstName;
  final String lastName;
  final String role;
  final String meslekRolu;
  final bool isActive;

  const UserModel({
    required this.id,
    required this.username,
    required this.email,
    required this.firstName,
    required this.lastName,
    required this.role,
    required this.meslekRolu,
    required this.isActive,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] as int,
      username: json['username'] as String? ?? '',
      email: json['email'] as String? ?? '',
      firstName: json['first_name'] as String? ?? '',
      lastName: json['last_name'] as String? ?? '',
      role: json['role'] as String? ?? 'viewer',
      meslekRolu: json['meslek_rolu'] as String? ?? '',
      isActive: json['is_active'] as bool? ?? true,
    );
  }

  bool get isAdmin => role == 'admin';
  bool get isEditor => role == 'admin' || role == 'editor';
  String get fullName => '$firstName $lastName'.trim();
}
