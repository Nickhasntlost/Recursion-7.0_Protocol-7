import 'api_service.dart';

/// Auth service — calls POST /auth/signup, POST /auth/login, GET /auth/me.
/// On success, stores access_token + user in SharedPreferences so every
/// subsequent API call auto-attaches `Authorization: Bearer {token}`.
class AuthService {
  /// Register a new user. Returns the full token response including user data.
  static Future<Map<String, dynamic>> signup({
    required String email,
    required String username,
    required String fullName,
    required String password,
    String? phone,
    String? city,
    String? country,
    String role = 'user',
  }) async {
    final body = <String, dynamic>{
      'email': email,
      'username': username,
      'full_name': fullName,
      'password': password,
      'role': role,
    };
    if (phone != null && phone.isNotEmpty) body['phone'] = phone;
    if (city != null && city.isNotEmpty) body['city'] = city;
    if (country != null && country.isNotEmpty) body['country'] = country;

    final response = await ApiService.post('/auth/signup', body: body, auth: false);

    // Store tokens + user exactly like the Axios interceptor pattern
    await ApiService.saveTokens(
      response['access_token'] as String,
      response['refresh_token'] as String,
    );
    await ApiService.saveUser(response['user'] as Map<String, dynamic>);

    return response;
  }

  /// Login with email + password. Returns token response with user data.
  static Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) async {
    final response = await ApiService.post('/auth/login', body: {
      'email': email,
      'password': password,
    }, auth: false);

    // Store tokens + user
    await ApiService.saveTokens(
      response['access_token'] as String,
      response['refresh_token'] as String,
    );
    await ApiService.saveUser(response['user'] as Map<String, dynamic>);

    return response;
  }

  /// Get current authenticated user info.
  static Future<Map<String, dynamic>> getMe() async {
    final response = await ApiService.get('/auth/me');
    await ApiService.saveUser(response);
    return response;
  }

  /// Logout — clears all stored tokens and user data.
  static Future<void> logout() async {
    await ApiService.clearAll();
  }

  /// Check if a user is currently logged in.
  static Future<bool> isLoggedIn() async {
    return await ApiService.isAuthenticated();
  }

  /// Get cached user data from SharedPreferences.
  static Future<Map<String, dynamic>?> getCachedUser() async {
    return await ApiService.getUser();
  }
}
