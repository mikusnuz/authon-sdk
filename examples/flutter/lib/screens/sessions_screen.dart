import 'package:flutter/material.dart';
import '../main.dart';
import '../services/authon_service.dart';

class SessionsScreen extends StatefulWidget {
  const SessionsScreen({super.key});

  @override
  State<SessionsScreen> createState() => _SessionsScreenState();
}

class _SessionsScreenState extends State<SessionsScreen> {
  List<AuthonSession> _sessions = [];
  bool _loading = true;
  String? _revokingId;
  String? _errorMessage;
  String? _successMessage;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _errorMessage = null;
    });
    final authon = AuthonServiceProvider.of(context);
    try {
      final sessions = await authon.listSessions();
      setState(() => _sessions = sessions);
    } on AuthonException catch (e) {
      setState(() => _errorMessage = e.message);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _revoke(String sessionId) async {
    setState(() {
      _revokingId = sessionId;
      _successMessage = null;
    });
    final authon = AuthonServiceProvider.of(context);
    try {
      await authon.revokeSession(sessionId);
      setState(() {
        _sessions = _sessions.where((s) => s.id != sessionId).toList();
        _successMessage = 'Session revoked successfully.';
      });
    } on AuthonException catch (e) {
      setState(() => _errorMessage = e.message);
    } finally {
      if (mounted) setState(() => _revokingId = null);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Active Sessions'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loading ? null : _load,
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : ListView(
              padding: const EdgeInsets.all(20),
              children: [
                _Header(),
                const SizedBox(height: 16),
                if (_errorMessage != null) ...[
                  _AlertBanner(message: _errorMessage!, isError: true),
                  const SizedBox(height: 12),
                ],
                if (_successMessage != null) ...[
                  _AlertBanner(message: _successMessage!, isError: false),
                  const SizedBox(height: 12),
                ],
                _SessionCountBadge(count: _sessions.length),
                const SizedBox(height: 12),
                if (_sessions.isEmpty)
                  const _EmptyState()
                else
                  ...List.generate(_sessions.length, (index) {
                    final session = _sessions[index];
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 10),
                      child: _SessionTile(
                        session: session,
                        isCurrent: index == 0,
                        isRevoking: _revokingId == session.id,
                        onRevoke: () => _revoke(session.id),
                      ),
                    );
                  }),
                const SizedBox(height: 16),
                _SecurityTip(),
              ],
            ),
    );
  }
}

class _Header extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Active Sessions',
          style: TextStyle(
            color: Color(0xFFF1F5F9),
            fontSize: 24,
            fontWeight: FontWeight.w800,
          ),
        ),
        const SizedBox(height: 6),
        RichText(
          text: const TextSpan(
            style: TextStyle(color: Color(0xFF94A3B8), fontSize: 13),
            children: [
              TextSpan(text: 'Manage sessions using '),
              TextSpan(
                text: 'listSessions()',
                style: TextStyle(color: Color(0xFF7C3AED), fontFamily: 'monospace'),
              ),
              TextSpan(text: ' and '),
              TextSpan(
                text: 'revokeSession(id)',
                style: TextStyle(color: Color(0xFF7C3AED), fontFamily: 'monospace'),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _SessionCountBadge extends StatelessWidget {
  final int count;
  const _SessionCountBadge({required this.count});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: const Color(0xFF334155)),
      ),
      child: Text(
        '$count active ${count == 1 ? 'session' : 'sessions'}',
        style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 13),
      ),
    );
  }
}

class _EmptyState extends StatelessWidget {
  const _EmptyState();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 40),
      alignment: Alignment.center,
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFF334155)),
      ),
      child: const Column(
        children: [
          Icon(Icons.inbox_outlined, size: 40, color: Color(0xFF475569)),
          SizedBox(height: 12),
          Text(
            'No active sessions found',
            style: TextStyle(color: Color(0xFF64748B), fontSize: 15),
          ),
        ],
      ),
    );
  }
}

class _SessionTile extends StatelessWidget {
  final AuthonSession session;
  final bool isCurrent;
  final bool isRevoking;
  final VoidCallback onRevoke;

  const _SessionTile({
    required this.session,
    required this.isCurrent,
    required this.isRevoking,
    required this.onRevoke,
  });

  String _formatRelative(DateTime dt) {
    final diff = DateTime.now().difference(dt);
    if (diff.inMinutes < 1) return 'Just now';
    if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    return '${diff.inDays}d ago';
  }

  String _formatDate(DateTime dt) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return '${months[dt.month - 1]} ${dt.day}, ${dt.year}';
  }

  String _parseBrowser(String? ua) {
    if (ua == null || ua.isEmpty) return 'Unknown';
    if (ua.contains('Flutter') || ua.contains('Dart')) return 'Flutter App';
    if (ua.contains('Chrome') && !ua.contains('Edg')) return 'Chrome';
    if (ua.contains('Firefox')) return 'Firefox';
    if (ua.contains('Safari') && !ua.contains('Chrome')) return 'Safari';
    if (ua.contains('Edg')) return 'Edge';
    return 'Browser';
  }

  IconData _deviceIcon(String? ua) {
    if (ua == null) return Icons.computer_outlined;
    final lower = ua.toLowerCase();
    if (lower.contains('mobile') || lower.contains('android') || lower.contains('iphone')) {
      return Icons.smartphone_outlined;
    }
    if (lower.contains('tablet') || lower.contains('ipad')) {
      return Icons.tablet_outlined;
    }
    if (lower.contains('flutter') || lower.contains('dart')) {
      return Icons.phone_android_outlined;
    }
    return Icons.computer_outlined;
  }

  @override
  Widget build(BuildContext context) {
    final browser = _parseBrowser(session.userAgent);
    final icon = _deviceIcon(session.userAgent);
    final ua = session.userAgent ?? '';
    final shortUa = ua.length > 55 ? '${ua.substring(0, 55)}...' : ua;

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isCurrent
              ? const Color(0xFF7C3AED).withValues(alpha: 0.4)
              : const Color(0xFF334155),
        ),
      ),
      child: Row(
        children: [
          Container(
            width: 42,
            height: 42,
            decoration: BoxDecoration(
              color: isCurrent
                  ? const Color(0xFF7C3AED).withValues(alpha: 0.15)
                  : const Color(0xFF334155).withValues(alpha: 0.4),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, size: 20, color: isCurrent ? const Color(0xFFA78BFA) : const Color(0xFF64748B)),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(
                      browser,
                      style: const TextStyle(
                        color: Color(0xFFF1F5F9),
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    if (isCurrent) ...[
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                        decoration: BoxDecoration(
                          color: const Color(0xFF22C55E).withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(99),
                        ),
                        child: const Text(
                          'Current',
                          style: TextStyle(
                            color: Color(0xFF22C55E),
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
                if (shortUa.isNotEmpty) ...[
                  const SizedBox(height: 2),
                  Text(
                    shortUa,
                    style: const TextStyle(color: Color(0xFF475569), fontSize: 11),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
                const SizedBox(height: 4),
                Wrap(
                  spacing: 12,
                  children: [
                    if (session.ipAddress != null)
                      Text(
                        'IP: ${session.ipAddress}',
                        style: const TextStyle(color: Color(0xFF64748B), fontSize: 11),
                      ),
                    Text(
                      'Active ${_formatRelative(session.lastActiveAt)}',
                      style: const TextStyle(color: Color(0xFF64748B), fontSize: 11),
                    ),
                    Text(
                      'Signed in ${_formatDate(session.createdAt)}',
                      style: const TextStyle(color: Color(0xFF64748B), fontSize: 11),
                    ),
                  ],
                ),
              ],
            ),
          ),
          if (!isCurrent) ...[
            const SizedBox(width: 10),
            ElevatedButton(
              onPressed: isRevoking ? null : onRevoke,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFEF4444),
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                minimumSize: Size.zero,
                textStyle: const TextStyle(fontSize: 13),
              ),
              child: isRevoking
                  ? const SizedBox(
                      width: 14,
                      height: 14,
                      child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                    )
                  : const Text('Revoke'),
            ),
          ],
        ],
      ),
    );
  }
}

class _SecurityTip extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFF334155)),
      ),
      child: const Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Security Tip',
            style: TextStyle(
              color: Color(0xFF94A3B8),
              fontSize: 12,
              fontWeight: FontWeight.w600,
              letterSpacing: 0.5,
            ),
          ),
          SizedBox(height: 8),
          Text(
            'If you notice any suspicious sessions, revoke them immediately and change your password. Sessions are automatically cleared after 30 days of inactivity.',
            style: TextStyle(color: Color(0xFF64748B), fontSize: 13, height: 1.6),
          ),
        ],
      ),
    );
  }
}

class _AlertBanner extends StatelessWidget {
  final String message;
  final bool isError;
  const _AlertBanner({required this.message, required this.isError});

  @override
  Widget build(BuildContext context) {
    final color = isError ? const Color(0xFFEF4444) : const Color(0xFF22C55E);
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color.withValues(alpha: 0.4)),
      ),
      child: Row(
        children: [
          Icon(
            isError ? Icons.error_outline : Icons.check_circle_outline,
            color: color,
            size: 18,
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              message,
              style: TextStyle(
                color: isError ? const Color(0xFFFCA5A5) : const Color(0xFF86EFAC),
                fontSize: 13,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
