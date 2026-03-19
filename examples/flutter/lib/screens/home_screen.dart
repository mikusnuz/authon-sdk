import 'package:flutter/material.dart';
import '../main.dart';

const _features = [
  _Feature(
    icon: Icons.lock_outline,
    title: 'Email & Password Auth',
    desc: 'Full sign-in / sign-up flow with validation and error handling.',
  ),
  _Feature(
    icon: Icons.public,
    title: 'Social Login (10 providers)',
    desc:
        'Google, Apple, Kakao, Naver, Facebook, GitHub, Discord, X, LINE, Microsoft.',
  ),
  _Feature(
    icon: Icons.shield_outlined,
    title: 'Two-Factor Auth (MFA)',
    desc: 'TOTP authenticator app setup with QR code and backup codes.',
  ),
  _Feature(
    icon: Icons.devices_outlined,
    title: 'Session Management',
    desc: 'List all active sessions across devices, revoke any session.',
  ),
  _Feature(
    icon: Icons.person_outline,
    title: 'Profile Management',
    desc:
        'Update display name, avatar URL, phone number via updateProfile().',
  ),
  _Feature(
    icon: Icons.refresh,
    title: 'Token Refresh',
    desc:
        'Automatic access token refresh using stored refresh token.',
  ),
];

class _Feature {
  final IconData icon;
  final String title;
  final String desc;
  const _Feature({required this.icon, required this.title, required this.desc});
}

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final authon = AuthonServiceProvider.of(context);
    final user = authon.currentUser;
    final isSignedIn = authon.isSignedIn;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Authon Flutter Example'),
        actions: [
          if (isSignedIn)
            Padding(
              padding: const EdgeInsets.only(right: 12),
              child: GestureDetector(
                onTap: () => Navigator.of(context).pushNamed('/profile'),
                child: CircleAvatar(
                  radius: 18,
                  backgroundColor: const Color(0xFF7C3AED),
                  child: Text(
                    user?.initials ?? '?',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
              ),
            ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          _HeroSection(isSignedIn: isSignedIn, user: user != null ? user.displayLabel : null),
          const SizedBox(height: 32),
          if (isSignedIn) ...[
            _SignedInActions(onSignOut: () => _handleSignOut(context)),
            const SizedBox(height: 32),
          ],
          _FeatureGrid(features: _features),
          const SizedBox(height: 32),
          _QuickStartCard(),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  Future<void> _handleSignOut(BuildContext context) async {
    final authon = AuthonServiceProvider.of(context);
    try {
      await authon.signOut();
      if (context.mounted) {
        Navigator.of(context).pushReplacementNamed('/');
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Signed out successfully')),
        );
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Sign out failed: $e')),
        );
      }
    }
  }
}

class _HeroSection extends StatelessWidget {
  final bool isSignedIn;
  final String? user;

  const _HeroSection({required this.isSignedIn, this.user});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(
            color: const Color(0xFF4C1D95),
            borderRadius: BorderRadius.circular(99),
            border: Border.all(color: const Color(0xFF7C3AED).withValues(alpha: 0.5)),
          ),
          child: const Text(
            'v0.1.0  |  Reference Implementation',
            style: TextStyle(
              color: Color(0xFFA78BFA),
              fontSize: 12,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
        const SizedBox(height: 16),
        const Text(
          'Authon Flutter\nExample App',
          style: TextStyle(
            color: Color(0xFFF1F5F9),
            fontSize: 32,
            fontWeight: FontWeight.w800,
            height: 1.15,
            letterSpacing: -0.5,
          ),
        ),
        const SizedBox(height: 12),
        const Text(
          'Complete authentication flow demo using the Authon Dart SDK. Every feature — demonstrated and ready to copy.',
          style: TextStyle(
            color: Color(0xFF94A3B8),
            fontSize: 15,
            height: 1.6,
          ),
        ),
        const SizedBox(height: 24),
        if (!isSignedIn) ...[
          Row(
            children: [
              Expanded(
                child: ElevatedButton(
                  onPressed: () => Navigator.of(context).pushNamed('/sign-in'),
                  child: const Text('Sign in'),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: OutlinedButton(
                  onPressed: () => Navigator.of(context).pushNamed('/sign-up'),
                  child: const Text('Create account'),
                ),
              ),
            ],
          ),
        ] else ...[
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            decoration: BoxDecoration(
              color: const Color(0xFF1E293B),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFF334155)),
            ),
            child: Row(
              children: [
                const Icon(Icons.check_circle, color: Color(0xFF22C55E), size: 20),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    'Welcome back, $user',
                    style: const TextStyle(
                      color: Color(0xFFF1F5F9),
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ],
    );
  }
}

class _SignedInActions extends StatelessWidget {
  final VoidCallback onSignOut;

  const _SignedInActions({required this.onSignOut});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Your Account',
          style: TextStyle(
            color: Color(0xFFF1F5F9),
            fontSize: 18,
            fontWeight: FontWeight.w700,
          ),
        ),
        const SizedBox(height: 12),
        GridView.count(
          crossAxisCount: 2,
          crossAxisSpacing: 10,
          mainAxisSpacing: 10,
          childAspectRatio: 2.5,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          children: [
            _ActionTile(
              icon: Icons.person_outline,
              label: 'Profile',
              onTap: () => Navigator.of(context).pushNamed('/profile'),
            ),
            _ActionTile(
              icon: Icons.security,
              label: 'MFA',
              onTap: () => Navigator.of(context).pushNamed('/mfa'),
            ),
            _ActionTile(
              icon: Icons.devices_outlined,
              label: 'Sessions',
              onTap: () => Navigator.of(context).pushNamed('/sessions'),
            ),
            _ActionTile(
              icon: Icons.logout,
              label: 'Sign out',
              onTap: onSignOut,
              danger: false,
            ),
          ],
        ),
      ],
    );
  }
}

class _ActionTile extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;
  final bool danger;

  const _ActionTile({
    required this.icon,
    required this.label,
    required this.onTap,
    this.danger = false,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(10),
      child: Container(
        decoration: BoxDecoration(
          color: const Color(0xFF1E293B),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
            color: danger
                ? const Color(0xFFEF4444).withValues(alpha: 0.4)
                : const Color(0xFF334155),
          ),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icon,
              size: 18,
              color: danger ? const Color(0xFFEF4444) : const Color(0xFF94A3B8),
            ),
            const SizedBox(width: 8),
            Text(
              label,
              style: TextStyle(
                color: danger ? const Color(0xFFEF4444) : const Color(0xFFCBD5E1),
                fontSize: 13,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _FeatureGrid extends StatelessWidget {
  final List<_Feature> features;

  const _FeatureGrid({required this.features});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Features Demonstrated',
          style: TextStyle(
            color: Color(0xFFF1F5F9),
            fontSize: 18,
            fontWeight: FontWeight.w700,
          ),
        ),
        const SizedBox(height: 4),
        const Text(
          'Navigate to each screen to see the feature in action',
          style: TextStyle(color: Color(0xFF64748B), fontSize: 13),
        ),
        const SizedBox(height: 16),
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            crossAxisSpacing: 10,
            mainAxisSpacing: 10,
            childAspectRatio: 1.3,
          ),
          itemCount: features.length,
          itemBuilder: (context, index) {
            final f = features[index];
            return Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: const Color(0xFF1E293B),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFF334155)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Icon(f.icon, color: const Color(0xFF7C3AED), size: 22),
                  const SizedBox(height: 8),
                  Text(
                    f.title,
                    style: const TextStyle(
                      color: Color(0xFFF1F5F9),
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Expanded(
                    child: Text(
                      f.desc,
                      style: const TextStyle(
                        color: Color(0xFF64748B),
                        fontSize: 11,
                        height: 1.4,
                      ),
                      maxLines: 3,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
            );
          },
        ),
      ],
    );
  }
}

class _QuickStartCard extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFF334155)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Quick Start',
            style: TextStyle(
              color: Color(0xFFF1F5F9),
              fontSize: 15,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: const Color(0xFF0F172A),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: const Color(0xFF334155)),
            ),
            child: const Text(
              'final authon = AuthonService(\n'
              '  publishableKey: \'pk_live_...\',\n'
              ');\n\n'
              'await authon.initialize();\n'
              'await authon.signInWithEmail(\n'
              '  email, password,\n'
              ');',
              style: TextStyle(
                color: Color(0xFF93C5FD),
                fontSize: 12,
                fontFamily: 'monospace',
                height: 1.6,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
