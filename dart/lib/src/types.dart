/// Represents an Authon user.
class User {
  final String id;
  final String? email;
  final bool emailVerified;
  final String? phone;
  final bool phoneVerified;
  final String? username;
  final String? firstName;
  final String? lastName;
  final String? displayName;
  final String? avatarUrl;
  final bool banned;
  final Map<String, dynamic>? metadata;
  final List<ExternalAccount>? externalAccounts;
  final DateTime createdAt;
  final DateTime updatedAt;

  User({
    required this.id,
    this.email,
    this.emailVerified = false,
    this.phone,
    this.phoneVerified = false,
    this.username,
    this.firstName,
    this.lastName,
    this.displayName,
    this.avatarUrl,
    this.banned = false,
    this.metadata,
    this.externalAccounts,
    required this.createdAt,
    required this.updatedAt,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] as String,
      email: json['email'] as String?,
      emailVerified: json['emailVerified'] as bool? ?? false,
      phone: json['phone'] as String?,
      phoneVerified: json['phoneVerified'] as bool? ?? false,
      username: json['username'] as String?,
      firstName: json['firstName'] as String?,
      lastName: json['lastName'] as String?,
      displayName: json['displayName'] as String?,
      avatarUrl: json['avatarUrl'] as String?,
      banned: json['banned'] as bool? ?? false,
      metadata: json['metadata'] as Map<String, dynamic>?,
      externalAccounts: (json['externalAccounts'] as List<dynamic>?)
          ?.map((e) => ExternalAccount.fromJson(e as Map<String, dynamic>))
          .toList(),
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        if (email != null) 'email': email,
        'emailVerified': emailVerified,
        if (phone != null) 'phone': phone,
        'phoneVerified': phoneVerified,
        if (username != null) 'username': username,
        if (firstName != null) 'firstName': firstName,
        if (lastName != null) 'lastName': lastName,
        if (displayName != null) 'displayName': displayName,
        if (avatarUrl != null) 'avatarUrl': avatarUrl,
        'banned': banned,
        if (metadata != null) 'metadata': metadata,
        'createdAt': createdAt.toIso8601String(),
        'updatedAt': updatedAt.toIso8601String(),
      };
}

/// Represents an OAuth-linked external account.
class ExternalAccount {
  final String provider;
  final String providerId;
  final String? email;

  ExternalAccount({
    required this.provider,
    required this.providerId,
    this.email,
  });

  factory ExternalAccount.fromJson(Map<String, dynamic> json) {
    return ExternalAccount(
      provider: json['provider'] as String,
      providerId: json['providerId'] as String,
      email: json['email'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
        'provider': provider,
        'providerId': providerId,
        if (email != null) 'email': email,
      };
}

/// Represents an active user session.
class Session {
  final String id;
  final String userId;
  final String status;
  final DateTime lastActiveAt;
  final DateTime expireAt;
  final DateTime createdAt;

  Session({
    required this.id,
    required this.userId,
    required this.status,
    required this.lastActiveAt,
    required this.expireAt,
    required this.createdAt,
  });

  factory Session.fromJson(Map<String, dynamic> json) {
    return Session(
      id: json['id'] as String,
      userId: json['userId'] as String,
      status: json['status'] as String,
      lastActiveAt: DateTime.parse(json['lastActiveAt'] as String),
      expireAt: DateTime.parse(json['expireAt'] as String),
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'userId': userId,
        'status': status,
        'lastActiveAt': lastActiveAt.toIso8601String(),
        'expireAt': expireAt.toIso8601String(),
        'createdAt': createdAt.toIso8601String(),
      };
}

/// Represents an incoming webhook event from Authon.
class WebhookEvent {
  final String id;
  final String type;
  final dynamic data;
  final DateTime timestamp;

  WebhookEvent({
    required this.id,
    required this.type,
    required this.data,
    required this.timestamp,
  });

  factory WebhookEvent.fromJson(Map<String, dynamic> json) {
    return WebhookEvent(
      id: json['id'] as String,
      type: json['type'] as String,
      data: json['data'],
      timestamp: DateTime.parse(json['timestamp'] as String),
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'type': type,
        'data': data,
        'timestamp': timestamp.toIso8601String(),
      };
}

/// A paginated list response.
class ListResult<T> {
  final List<T> data;
  final int totalCount;
  final int page;
  final int perPage;

  ListResult({
    required this.data,
    required this.totalCount,
    required this.page,
    required this.perPage,
  });
}

/// Options for list endpoints.
class ListOptions {
  final int? page;
  final int? perPage;

  ListOptions({this.page, this.perPage});
}

/// Parameters for creating a user.
class CreateUserParams {
  final String? email;
  final String? phone;
  final String? username;
  final String? firstName;
  final String? lastName;
  final String? password;
  final Map<String, dynamic>? metadata;

  CreateUserParams({
    this.email,
    this.phone,
    this.username,
    this.firstName,
    this.lastName,
    this.password,
    this.metadata,
  });

  Map<String, dynamic> toJson() => {
        if (email != null) 'email': email,
        if (phone != null) 'phone': phone,
        if (username != null) 'username': username,
        if (firstName != null) 'firstName': firstName,
        if (lastName != null) 'lastName': lastName,
        if (password != null) 'password': password,
        if (metadata != null) 'metadata': metadata,
      };
}

/// Parameters for updating a user.
class UpdateUserParams {
  final String? email;
  final String? phone;
  final String? username;
  final String? firstName;
  final String? lastName;
  final Map<String, dynamic>? metadata;

  UpdateUserParams({
    this.email,
    this.phone,
    this.username,
    this.firstName,
    this.lastName,
    this.metadata,
  });

  Map<String, dynamic> toJson() => {
        if (email != null) 'email': email,
        if (phone != null) 'phone': phone,
        if (username != null) 'username': username,
        if (firstName != null) 'firstName': firstName,
        if (lastName != null) 'lastName': lastName,
        if (metadata != null) 'metadata': metadata,
      };
}
