class User {
  final String id;
  final String name;
  final String email;
  final String role;
  final String status;
  final String? organization;
  final String? avatar;

  User({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    required this.status,
    this.organization,
    this.avatar,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      role: json['role'] ?? 'donor',
      status: json['status'] ?? 'pending',
      organization: json['organization'],
      avatar: json['avatar'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'role': role,
      'status': status,
      'organization': organization,
      'avatar': avatar,
    };
  }
}
