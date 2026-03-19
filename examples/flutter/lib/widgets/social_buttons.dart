import 'package:flutter/material.dart';
import '../main.dart';
import '../services/authon_service.dart';

const _providers = [
  _OAuthProvider('google', 'Google', Color(0xFFEA4335)),
  _OAuthProvider('apple', 'Apple', Color(0xFFFFFFFF)),
  _OAuthProvider('kakao', 'Kakao', Color(0xFFFEE500)),
  _OAuthProvider('naver', 'Naver', Color(0xFF03C75A)),
  _OAuthProvider('facebook', 'Facebook', Color(0xFF1877F2)),
  _OAuthProvider('github', 'GitHub', Color(0xFF24292E)),
  _OAuthProvider('discord', 'Discord', Color(0xFF5865F2)),
  _OAuthProvider('twitter', 'X (Twitter)', Color(0xFF000000)),
  _OAuthProvider('line', 'LINE', Color(0xFF00B900)),
  _OAuthProvider('microsoft', 'Microsoft', Color(0xFF0078D4)),
];

class _OAuthProvider {
  final String id;
  final String label;
  final Color color;

  const _OAuthProvider(this.id, this.label, this.color);
}

class SocialButtons extends StatefulWidget {
  final VoidCallback? onSuccess;
  final void Function(String error)? onError;
  final bool compact;

  const SocialButtons({
    super.key,
    this.onSuccess,
    this.onError,
    this.compact = false,
  });

  @override
  State<SocialButtons> createState() => _SocialButtonsState();
}

class _SocialButtonsState extends State<SocialButtons> {
  String? _loadingProvider;

  Future<void> _handleTap(String provider) async {
    if (_loadingProvider != null) return;
    setState(() => _loadingProvider = provider);
    try {
      final authon = AuthonServiceProvider.of(context);
      await authon.launchOAuthProvider(provider);
      widget.onSuccess?.call();
    } on AuthonException catch (e) {
      widget.onError?.call(e.message);
    } catch (e) {
      widget.onError?.call(e.toString());
    } finally {
      if (mounted) setState(() => _loadingProvider = null);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (widget.compact) {
      return Wrap(
        spacing: 8,
        runSpacing: 8,
        children: _providers.map((p) => _CompactButton(
          provider: p,
          loading: _loadingProvider == p.id,
          onTap: () => _handleTap(p.id),
        )).toList(),
      );
    }

    return Column(
      children: _providers.map((p) => Padding(
        padding: const EdgeInsets.only(bottom: 8),
        child: _FullButton(
          provider: p,
          loading: _loadingProvider == p.id,
          onTap: () => _handleTap(p.id),
        ),
      )).toList(),
    );
  }
}

class _FullButton extends StatelessWidget {
  final _OAuthProvider provider;
  final bool loading;
  final VoidCallback onTap;

  const _FullButton({
    required this.provider,
    required this.loading,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      child: OutlinedButton(
        onPressed: loading ? null : onTap,
        style: OutlinedButton.styleFrom(
          padding: const EdgeInsets.symmetric(vertical: 14),
          side: const BorderSide(color: Color(0xFF334155)),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        ),
        child: loading
            ? const SizedBox(
                width: 18,
                height: 18,
                child: CircularProgressIndicator(strokeWidth: 2),
              )
            : Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  _ProviderIcon(provider: provider, size: 20),
                  const SizedBox(width: 10),
                  Text(
                    'Continue with ${provider.label}',
                    style: const TextStyle(
                      color: Color(0xFFCBD5E1),
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
      ),
    );
  }
}

class _CompactButton extends StatelessWidget {
  final _OAuthProvider provider;
  final bool loading;
  final VoidCallback onTap;

  const _CompactButton({
    required this.provider,
    required this.loading,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Tooltip(
      message: provider.label,
      child: InkWell(
        onTap: loading ? null : onTap,
        borderRadius: BorderRadius.circular(10),
        child: Container(
          width: 44,
          height: 44,
          decoration: BoxDecoration(
            color: const Color(0xFF1E293B),
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: const Color(0xFF334155)),
          ),
          child: loading
              ? const Center(
                  child: SizedBox(
                    width: 16,
                    height: 16,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  ),
                )
              : Center(child: _ProviderIcon(provider: provider, size: 20)),
        ),
      ),
    );
  }
}

class _ProviderIcon extends StatelessWidget {
  final _OAuthProvider provider;
  final double size;

  const _ProviderIcon({required this.provider, required this.size});

  @override
  Widget build(BuildContext context) {
    final icon = _iconForProvider(provider.id);
    return Icon(icon, size: size, color: provider.color);
  }

  IconData _iconForProvider(String id) {
    switch (id) {
      case 'github':
        return Icons.code;
      case 'google':
        return Icons.g_mobiledata_rounded;
      case 'apple':
        return Icons.apple;
      case 'facebook':
        return Icons.facebook;
      case 'microsoft':
        return Icons.window;
      case 'discord':
        return Icons.headset_mic;
      case 'twitter':
        return Icons.close;
      case 'line':
        return Icons.chat_bubble;
      case 'kakao':
        return Icons.chat;
      case 'naver':
        return Icons.navigation;
      default:
        return Icons.account_circle;
    }
  }
}
