import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;
import 'package:url_launcher/url_launcher.dart';

const String _baseUrl = 'https://api.authon.dev';
const String _storageKeyToken = 'authon_access_token';
const String _storageKeyRefresh = 'authon_refresh_token';

class AuthonUser {
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
  final List<ExternalAccount> externalAccounts;
  final DateTime createdAt;
  final DateTime updatedAt;

  const AuthonUser({
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
    this.externalAccounts = const [],
    required this.createdAt,
    required this.updatedAt,
  });

  factory AuthonUser.fromJson(Map<String, dynamic> json) {
    return AuthonUser(
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
      externalAccounts: (json['externalAccounts'] as List<dynamic>?)
              ?.map((e) => ExternalAccount.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
    );
  }

  String get initials {
    if (displayName != null && displayName!.isNotEmpty) {
      final parts = displayName!.trim().split(' ');
      if (parts.length >= 2) {
        return '${parts.first[0]}${parts.last[0]}'.toUpperCase();
      }
      return displayName![0].toUpperCase();
    }
    if (email != null && email!.isNotEmpty) {
      return email![0].toUpperCase();
    }
    return '?';
  }

  String get displayLabel => displayName ?? email?.split('@').first ?? username ?? id;
}

class ExternalAccount {
  final String provider;
  final String providerId;
  final String? email;

  const ExternalAccount({
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
}

class AuthonSession {
  final String id;
  final String userId;
  final String status;
  final String? userAgent;
  final String? ipAddress;
  final DateTime lastActiveAt;
  final DateTime expireAt;
  final DateTime createdAt;

  const AuthonSession({
    required this.id,
    required this.userId,
    required this.status,
    this.userAgent,
    this.ipAddress,
    required this.lastActiveAt,
    required this.expireAt,
    required this.createdAt,
  });

  factory AuthonSession.fromJson(Map<String, dynamic> json) {
    return AuthonSession(
      id: json['id'] as String,
      userId: json['userId'] as String,
      status: json['status'] as String,
      userAgent: json['userAgent'] as String?,
      ipAddress: json['ipAddress'] as String?,
      lastActiveAt: DateTime.parse(json['lastActiveAt'] as String),
      expireAt: DateTime.parse(json['expireAt'] as String),
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }
}

class MfaStatus {
  final bool enabled;
  final int backupCodesRemaining;

  const MfaStatus({
    required this.enabled,
    required this.backupCodesRemaining,
  });

  factory MfaStatus.fromJson(Map<String, dynamic> json) {
    return MfaStatus(
      enabled: json['enabled'] as bool? ?? false,
      backupCodesRemaining: json['backupCodesRemaining'] as int? ?? 0,
    );
  }
}

class MfaSetupData {
  final String secret;
  final String qrCodeUrl;
  final List<String> backupCodes;

  const MfaSetupData({
    required this.secret,
    required this.qrCodeUrl,
    required this.backupCodes,
  });

  factory MfaSetupData.fromJson(Map<String, dynamic> json) {
    return MfaSetupData(
      secret: json['secret'] as String,
      qrCodeUrl: json['qrCodeUrl'] as String? ?? '',
      backupCodes: (json['backupCodes'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          [],
    );
  }
}

class AuthonException implements Exception {
  final int statusCode;
  final String message;
  final String? code;

  const AuthonException({
    required this.statusCode,
    required this.message,
    this.code,
  });

  @override
  String toString() => code != null ? '$code: $message' : message;
}

class AuthonMfaRequiredException implements Exception {
  final String mfaToken;
  const AuthonMfaRequiredException(this.mfaToken);
}

class AuthonService {
  final String publishableKey;
  final FlutterSecureStorage _storage;
  final http.Client _http;

  String? _accessToken;
  String? _refreshToken;
  AuthonUser? _currentUser;

  AuthonService({
    required this.publishableKey,
    FlutterSecureStorage? storage,
    http.Client? httpClient,
  })  : _storage = storage ?? const FlutterSecureStorage(),
        _http = httpClient ?? http.Client();

  AuthonUser? get currentUser => _currentUser;
  bool get isSignedIn => _currentUser != null && _accessToken != null;

  Future<void> initialize() async {
    _accessToken = await _storage.read(key: _storageKeyToken);
    _refreshToken = await _storage.read(key: _storageKeyRefresh);
    if (_accessToken != null) {
      try {
        await _loadCurrentUser();
      } catch (_) {
        await _clearTokens();
      }
    }
  }

  Future<AuthonUser> signInWithEmail(String email, String password) async {
    final body = await _request(
      'POST',
      '/v1/auth/sign-in',
      body: {'email': email, 'password': password},
      requiresAuth: false,
    );

    if (body['mfaRequired'] == true) {
      throw AuthonMfaRequiredException(body['mfaToken'] as String);
    }

    await _storeTokens(
      accessToken: body['accessToken'] as String,
      refreshToken: body['refreshToken'] as String?,
    );
    _currentUser = AuthonUser.fromJson(body['user'] as Map<String, dynamic>);
    return _currentUser!;
  }

  Future<AuthonUser> signUpWithEmail(
    String email,
    String password, {
    String? displayName,
  }) async {
    final body = await _request(
      'POST',
      '/v1/auth/sign-up',
      body: {
        'email': email,
        'password': password,
        if (displayName != null) 'displayName': displayName,
      },
      requiresAuth: false,
    );

    await _storeTokens(
      accessToken: body['accessToken'] as String,
      refreshToken: body['refreshToken'] as String?,
    );
    _currentUser = AuthonUser.fromJson(body['user'] as Map<String, dynamic>);
    return _currentUser!;
  }

  Future<AuthonUser> verifyMfa(String mfaToken, String code) async {
    final body = await _request(
      'POST',
      '/v1/auth/mfa/verify',
      body: {'mfaToken': mfaToken, 'code': code},
      requiresAuth: false,
    );

    await _storeTokens(
      accessToken: body['accessToken'] as String,
      refreshToken: body['refreshToken'] as String?,
    );
    _currentUser = AuthonUser.fromJson(body['user'] as Map<String, dynamic>);
    return _currentUser!;
  }

  Future<void> signOut() async {
    try {
      await _request('POST', '/v1/auth/sign-out');
    } catch (_) {}
    await _clearTokens();
    _currentUser = null;
  }

  Future<void> sendPasswordResetEmail(String email) async {
    await _request(
      'POST',
      '/v1/auth/forgot-password',
      body: {'email': email},
      requiresAuth: false,
    );
  }

  Future<AuthonUser> updateProfile({
    String? displayName,
    String? avatarUrl,
    String? phone,
    String? firstName,
    String? lastName,
  }) async {
    final body = await _request(
      'PATCH',
      '/v1/auth/me',
      body: {
        if (displayName != null) 'displayName': displayName,
        if (avatarUrl != null) 'avatarUrl': avatarUrl,
        if (phone != null) 'phone': phone,
        if (firstName != null) 'firstName': firstName,
        if (lastName != null) 'lastName': lastName,
      },
    );
    _currentUser = AuthonUser.fromJson(body);
    return _currentUser!;
  }

  Future<void> deleteAccount() async {
    await _request('DELETE', '/v1/auth/me');
    await _clearTokens();
    _currentUser = null;
  }

  Future<MfaStatus> getMfaStatus() async {
    final body = await _request('GET', '/v1/auth/mfa/status');
    return MfaStatus.fromJson(body);
  }

  Future<MfaSetupData> setupMfa() async {
    final body = await _request('POST', '/v1/auth/mfa/setup');
    return MfaSetupData.fromJson(body);
  }

  Future<void> verifyMfaSetup(String code) async {
    await _request(
      'POST',
      '/v1/auth/mfa/setup/verify',
      body: {'code': code},
    );
  }

  Future<void> disableMfa(String code) async {
    await _request(
      'POST',
      '/v1/auth/mfa/disable',
      body: {'code': code},
    );
  }

  Future<List<String>> regenerateBackupCodes(String code) async {
    final body = await _request(
      'POST',
      '/v1/auth/mfa/backup-codes/regenerate',
      body: {'code': code},
    );
    return (body['backupCodes'] as List<dynamic>)
        .map((e) => e as String)
        .toList();
  }

  Future<List<AuthonSession>> listSessions() async {
    final body = await _request('GET', '/v1/auth/sessions');
    final data = body['data'] as List<dynamic>? ?? body['sessions'] as List<dynamic>? ?? [];
    return data
        .map((e) => AuthonSession.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<void> revokeSession(String sessionId) async {
    await _request('DELETE', '/v1/auth/sessions/$sessionId');
  }

  Future<void> launchOAuthProvider(String provider) async {
    final redirectUri = Uri.encodeComponent('authon-flutter-example://oauth');
    final url = Uri.parse(
      '$_baseUrl/v1/auth/oauth/$provider?publishableKey=$publishableKey&redirectUri=$redirectUri',
    );
    if (!await launchUrl(url, mode: LaunchMode.externalApplication)) {
      throw AuthonException(
        statusCode: 0,
        message: 'Could not launch OAuth for $provider',
      );
    }
  }

  Future<AuthonUser> handleOAuthCallback(String code, String state) async {
    final body = await _request(
      'POST',
      '/v1/auth/oauth/callback',
      body: {'code': code, 'state': state},
      requiresAuth: false,
    );

    await _storeTokens(
      accessToken: body['accessToken'] as String,
      refreshToken: body['refreshToken'] as String?,
    );
    _currentUser = AuthonUser.fromJson(body['user'] as Map<String, dynamic>);
    return _currentUser!;
  }

  Future<void> _loadCurrentUser() async {
    final body = await _request('GET', '/v1/auth/me');
    _currentUser = AuthonUser.fromJson(body);
  }

  Future<Map<String, dynamic>> _request(
    String method,
    String path, {
    Map<String, dynamic>? body,
    bool requiresAuth = true,
  }) async {
    final uri = Uri.parse('$_baseUrl$path');
    final headers = <String, String>{
      'Content-Type': 'application/json',
      'User-Agent': 'authon-flutter/0.1.0',
    };

    if (requiresAuth && _accessToken != null) {
      headers['Authorization'] = 'Bearer $_accessToken';
    } else if (!requiresAuth) {
      headers['x-publishable-key'] = publishableKey;
    }

    late http.Response response;
    final encodedBody = body != null ? jsonEncode(body) : null;

    switch (method) {
      case 'GET':
        response = await _http.get(uri, headers: headers);
      case 'POST':
        response = await _http.post(uri, headers: headers, body: encodedBody);
      case 'PATCH':
        response = await _http.patch(uri, headers: headers, body: encodedBody);
      case 'DELETE':
        response = await _http.delete(uri, headers: headers, body: encodedBody);
      default:
        throw ArgumentError('Unsupported HTTP method: $method');
    }

    if (response.statusCode == 401 && requiresAuth && _refreshToken != null) {
      final refreshed = await _tryRefresh();
      if (refreshed) {
        headers['Authorization'] = 'Bearer $_accessToken';
        switch (method) {
          case 'GET':
            response = await _http.get(uri, headers: headers);
          case 'POST':
            response = await _http.post(uri, headers: headers, body: encodedBody);
          case 'PATCH':
            response = await _http.patch(uri, headers: headers, body: encodedBody);
          case 'DELETE':
            response = await _http.delete(uri, headers: headers, body: encodedBody);
        }
      }
    }

    if (response.statusCode >= 400) {
      Map<String, dynamic>? errorBody;
      try {
        errorBody = jsonDecode(response.body) as Map<String, dynamic>;
      } catch (_) {}
      throw AuthonException(
        statusCode: response.statusCode,
        message: errorBody?['message'] as String? ?? response.body,
        code: errorBody?['code'] as String?,
      );
    }

    if (response.body.isEmpty) return {};
    return jsonDecode(response.body) as Map<String, dynamic>;
  }

  Future<bool> _tryRefresh() async {
    if (_refreshToken == null) return false;
    try {
      final uri = Uri.parse('$_baseUrl/v1/auth/refresh');
      final response = await _http.post(
        uri,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'refreshToken': _refreshToken}),
      );
      if (response.statusCode == 200) {
        final body = jsonDecode(response.body) as Map<String, dynamic>;
        await _storeTokens(
          accessToken: body['accessToken'] as String,
          refreshToken: body['refreshToken'] as String?,
        );
        return true;
      }
    } catch (_) {}
    await _clearTokens();
    return false;
  }

  Future<void> _storeTokens({
    required String accessToken,
    String? refreshToken,
  }) async {
    _accessToken = accessToken;
    await _storage.write(key: _storageKeyToken, value: accessToken);
    if (refreshToken != null) {
      _refreshToken = refreshToken;
      await _storage.write(key: _storageKeyRefresh, value: refreshToken);
    }
  }

  Future<void> _clearTokens() async {
    _accessToken = null;
    _refreshToken = null;
    await _storage.delete(key: _storageKeyToken);
    await _storage.delete(key: _storageKeyRefresh);
  }

  void dispose() {
    _http.close();
  }
}
