import 'package:flutter/material.dart';
import 'screens/home_screen.dart';
import 'screens/sign_in_screen.dart';
import 'screens/sign_up_screen.dart';
import 'screens/profile_screen.dart';
import 'screens/reset_password_screen.dart';
import 'screens/mfa_screen.dart';
import 'screens/sessions_screen.dart';
import 'screens/delete_account_screen.dart';
import 'services/authon_service.dart';
import 'widgets/auth_guard.dart';

void main() {
  runApp(const AuthonExampleApp());
}

class AuthonExampleApp extends StatefulWidget {
  const AuthonExampleApp({super.key});

  @override
  State<AuthonExampleApp> createState() => _AuthonExampleAppState();
}

class _AuthonExampleAppState extends State<AuthonExampleApp> {
  late final AuthonService _authon;
  bool _initialized = false;

  @override
  void initState() {
    super.initState();
    _authon = AuthonService(
      publishableKey: const String.fromEnvironment(
        'AUTHON_PUBLISHABLE_KEY',
        defaultValue: 'pk_test_your_publishable_key_here',
      ),
    );
    _authon.initialize().then((_) {
      if (mounted) setState(() => _initialized = true);
    });
  }

  @override
  void dispose() {
    _authon.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AuthonServiceProvider(
      service: _authon,
      child: MaterialApp(
        title: 'Authon Flutter Example',
        debugShowCheckedModeBanner: false,
        theme: _buildDarkTheme(),
        home: _initialized
            ? const HomeScreen()
            : const Scaffold(
                body: Center(child: CircularProgressIndicator()),
              ),
        routes: {
          '/': (context) => const HomeScreen(),
          '/sign-in': (context) => const SignInScreen(),
          '/sign-up': (context) => const SignUpScreen(),
          '/profile': (context) => const AuthGuard(child: ProfileScreen()),
          '/reset-password': (context) => const ResetPasswordScreen(),
          '/mfa': (context) => const AuthGuard(child: MfaScreen()),
          '/sessions': (context) => const AuthGuard(child: SessionsScreen()),
          '/delete-account': (context) =>
              const AuthGuard(child: DeleteAccountScreen()),
        },
      ),
    );
  }

  ThemeData _buildDarkTheme() {
    const colorScheme = ColorScheme.dark(
      primary: Color(0xFF7C3AED),
      primaryContainer: Color(0xFF4C1D95),
      secondary: Color(0xFF6366F1),
      surface: Color(0xFF0F172A),
      error: Color(0xFFEF4444),
      onPrimary: Colors.white,
      onSurface: Color(0xFFF1F5F9),
    );

    return ThemeData(
      colorScheme: colorScheme,
      scaffoldBackgroundColor: const Color(0xFF0F172A),
      fontFamily: 'SF Pro Display',
      appBarTheme: const AppBarTheme(
        backgroundColor: Color(0xFF0F172A),
        foregroundColor: Color(0xFFF1F5F9),
        elevation: 0,
        centerTitle: false,
        titleTextStyle: TextStyle(
          color: Color(0xFFF1F5F9),
          fontSize: 18,
          fontWeight: FontWeight.w600,
        ),
      ),
      cardTheme: CardTheme(
        color: const Color(0xFF1E293B),
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: const BorderSide(color: Color(0xFF334155)),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: const Color(0xFF1E293B),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: Color(0xFF334155)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: Color(0xFF334155)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: Color(0xFF7C3AED), width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: Color(0xFFEF4444)),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: Color(0xFFEF4444), width: 2),
        ),
        labelStyle: const TextStyle(color: Color(0xFF94A3B8)),
        hintStyle: const TextStyle(color: Color(0xFF475569)),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: const Color(0xFF7C3AED),
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          textStyle: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600),
          elevation: 0,
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: const Color(0xFF94A3B8),
          side: const BorderSide(color: Color(0xFF334155)),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          textStyle: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600),
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: const Color(0xFF7C3AED),
        ),
      ),
      dividerTheme: const DividerThemeData(color: Color(0xFF334155)),
      snackBarTheme: SnackBarThemeData(
        backgroundColor: const Color(0xFF1E293B),
        contentTextStyle: const TextStyle(color: Color(0xFFF1F5F9)),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }
}

class AuthonServiceProvider extends InheritedWidget {
  final AuthonService service;

  const AuthonServiceProvider({
    super.key,
    required this.service,
    required super.child,
  });

  static AuthonService of(BuildContext context) {
    final provider =
        context.dependOnInheritedWidgetOfExactType<AuthonServiceProvider>();
    assert(provider != null, 'AuthonServiceProvider not found in widget tree');
    return provider!.service;
  }

  @override
  bool updateShouldNotify(AuthonServiceProvider oldWidget) =>
      service != oldWidget.service;
}
