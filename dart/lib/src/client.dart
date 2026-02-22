import 'dart:convert';
import 'package:http/http.dart' as http;
import 'types.dart';
import 'webhook.dart';

/// Exception thrown when the Authup API returns an error.
class AuthupException implements Exception {
  final int statusCode;
  final String message;
  final String? code;

  AuthupException({
    required this.statusCode,
    required this.message,
    this.code,
  });

  @override
  String toString() =>
      code != null ? '$code: $message' : 'AuthupException: $message';
}

/// Server-side Authup client for Dart and Flutter.
class AuthupBackend {
  final String _secretKey;
  final String _apiUrl;
  final http.Client _httpClient;

  late final UserService users;
  late final WebhookService webhooks;

  /// Creates a new [AuthupBackend] with the given [secretKey].
  ///
  /// Optionally set [apiUrl] (defaults to `https://api.authup.dev`).
  AuthupBackend({
    required String secretKey,
    String apiUrl = 'https://api.authup.dev',
    http.Client? httpClient,
  })  : _secretKey = secretKey,
        _apiUrl = apiUrl.replaceAll(RegExp(r'/$'), ''),
        _httpClient = httpClient ?? http.Client() {
    users = UserService(this);
    webhooks = WebhookService();
  }

  /// Verifies an access token and returns the associated user.
  Future<User> verifyToken(String accessToken) async {
    final response = await _request(
      'GET',
      '/v1/auth/verify',
      headers: {'Authorization': 'Bearer $accessToken'},
    );
    return User.fromJson(response);
  }

  Future<Map<String, dynamic>> _request(
    String method,
    String path, {
    Map<String, String>? headers,
    Map<String, dynamic>? body,
  }) async {
    final uri = Uri.parse('$_apiUrl$path');
    final reqHeaders = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $_secretKey',
      'User-Agent': 'authup-dart/0.1.0',
      ...?headers,
    };

    late http.Response response;

    switch (method) {
      case 'GET':
        response = await _httpClient.get(uri, headers: reqHeaders);
        break;
      case 'POST':
        response = await _httpClient.post(
          uri,
          headers: reqHeaders,
          body: body != null ? jsonEncode(body) : null,
        );
        break;
      case 'PATCH':
        response = await _httpClient.patch(
          uri,
          headers: reqHeaders,
          body: body != null ? jsonEncode(body) : null,
        );
        break;
      case 'DELETE':
        response = await _httpClient.delete(uri, headers: reqHeaders);
        break;
      default:
        throw ArgumentError('Unsupported HTTP method: $method');
    }

    if (response.statusCode >= 400) {
      Map<String, dynamic>? errorBody;
      try {
        errorBody = jsonDecode(response.body) as Map<String, dynamic>;
      } catch (_) {}

      throw AuthupException(
        statusCode: response.statusCode,
        message: errorBody?['message'] as String? ?? response.body,
        code: errorBody?['code'] as String?,
      );
    }

    if (response.body.isEmpty) return {};
    return jsonDecode(response.body) as Map<String, dynamic>;
  }

  /// Closes the underlying HTTP client.
  void close() {
    _httpClient.close();
  }
}

/// Handles user management operations.
class UserService {
  final AuthupBackend _backend;

  UserService(this._backend);

  /// Lists users with optional pagination.
  Future<ListResult<User>> list({ListOptions? options}) async {
    var path = '/v1/users';
    if (options != null) {
      final params = <String>[];
      if (options.page != null) params.add('page=${options.page}');
      if (options.perPage != null) params.add('perPage=${options.perPage}');
      if (params.isNotEmpty) path += '?${params.join('&')}';
    }

    final response = await _backend._request('GET', path);
    final data = (response['data'] as List<dynamic>)
        .map((e) => User.fromJson(e as Map<String, dynamic>))
        .toList();

    return ListResult<User>(
      data: data,
      totalCount: response['totalCount'] as int,
      page: response['page'] as int,
      perPage: response['perPage'] as int,
    );
  }

  /// Gets a user by ID.
  Future<User> get(String userId) async {
    final response = await _backend._request('GET', '/v1/users/$userId');
    return User.fromJson(response);
  }

  /// Creates a new user.
  Future<User> create(CreateUserParams params) async {
    final response = await _backend._request(
      'POST',
      '/v1/users',
      body: params.toJson(),
    );
    return User.fromJson(response);
  }

  /// Updates an existing user.
  Future<User> update(String userId, UpdateUserParams params) async {
    final response = await _backend._request(
      'PATCH',
      '/v1/users/$userId',
      body: params.toJson(),
    );
    return User.fromJson(response);
  }

  /// Deletes a user by ID.
  Future<void> delete(String userId) async {
    await _backend._request('DELETE', '/v1/users/$userId');
  }

  /// Bans a user by ID.
  Future<User> ban(String userId) async {
    final response =
        await _backend._request('POST', '/v1/users/$userId/ban');
    return User.fromJson(response);
  }

  /// Unbans a user by ID.
  Future<User> unban(String userId) async {
    final response =
        await _backend._request('POST', '/v1/users/$userId/unban');
    return User.fromJson(response);
  }
}

/// Handles webhook verification.
class WebhookService {
  /// Verifies a webhook payload and returns the parsed data.
  Map<String, dynamic> verify(String payload, String signature, String secret) {
    return WebhookVerifier.verify(payload, signature, secret);
  }
}
