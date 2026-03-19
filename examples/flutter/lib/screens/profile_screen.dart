import 'package:flutter/material.dart';
import '../main.dart';
import '../services/authon_service.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _displayNameCtrl;
  late TextEditingController _avatarUrlCtrl;
  late TextEditingController _phoneCtrl;
  late TextEditingController _firstNameCtrl;
  late TextEditingController _lastNameCtrl;

  bool _loading = false;
  String? _errorMessage;
  String? _successMessage;

  @override
  void initState() {
    super.initState();
    final user = AuthonServiceProvider.of(context).currentUser;
    _displayNameCtrl = TextEditingController(text: user?.displayName ?? '');
    _avatarUrlCtrl = TextEditingController(text: user?.avatarUrl ?? '');
    _phoneCtrl = TextEditingController(text: user?.phone ?? '');
    _firstNameCtrl = TextEditingController(text: user?.firstName ?? '');
    _lastNameCtrl = TextEditingController(text: user?.lastName ?? '');
  }

  @override
  void dispose() {
    _displayNameCtrl.dispose();
    _avatarUrlCtrl.dispose();
    _phoneCtrl.dispose();
    _firstNameCtrl.dispose();
    _lastNameCtrl.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (!(_formKey.currentState?.validate() ?? false)) return;
    setState(() {
      _loading = true;
      _errorMessage = null;
      _successMessage = null;
    });

    final authon = AuthonServiceProvider.of(context);
    try {
      await authon.updateProfile(
        displayName:
            _displayNameCtrl.text.trim().isEmpty ? null : _displayNameCtrl.text.trim(),
        avatarUrl:
            _avatarUrlCtrl.text.trim().isEmpty ? null : _avatarUrlCtrl.text.trim(),
        phone: _phoneCtrl.text.trim().isEmpty ? null : _phoneCtrl.text.trim(),
        firstName:
            _firstNameCtrl.text.trim().isEmpty ? null : _firstNameCtrl.text.trim(),
        lastName:
            _lastNameCtrl.text.trim().isEmpty ? null : _lastNameCtrl.text.trim(),
      );
      setState(() => _successMessage = 'Profile updated successfully');
    } on AuthonException catch (e) {
      setState(() => _errorMessage = e.message);
    } catch (e) {
      setState(() => _errorMessage = e.toString());
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final authon = AuthonServiceProvider.of(context);
    final user = authon.currentUser;

    return Scaffold(
      appBar: AppBar(title: const Text('Profile')),
      body: user == null
          ? const Center(child: CircularProgressIndicator())
          : ListView(
              padding: const EdgeInsets.all(20),
              children: [
                _AvatarSection(user: user),
                const SizedBox(height: 20),
                _InfoCard(user: user),
                const SizedBox(height: 16),
                _EditForm(
                  formKey: _formKey,
                  displayNameCtrl: _displayNameCtrl,
                  avatarUrlCtrl: _avatarUrlCtrl,
                  phoneCtrl: _phoneCtrl,
                  firstNameCtrl: _firstNameCtrl,
                  lastNameCtrl: _lastNameCtrl,
                  loading: _loading,
                  errorMessage: _errorMessage,
                  successMessage: _successMessage,
                  userEmail: user.email,
                  onSave: _save,
                ),
                const SizedBox(height: 16),
                _QuickActionsCard(),
              ],
            ),
    );
  }
}

class _AvatarSection extends StatelessWidget {
  final AuthonUser user;
  const _AvatarSection({required this.user});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        children: [
          CircleAvatar(
            radius: 40,
            backgroundColor: const Color(0xFF7C3AED),
            backgroundImage: user.avatarUrl != null
                ? NetworkImage(user.avatarUrl!)
                : null,
            child: user.avatarUrl == null
                ? Text(
                    user.initials,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 28,
                      fontWeight: FontWeight.w700,
                    ),
                  )
                : null,
          ),
          const SizedBox(height: 12),
          Text(
            user.displayLabel,
            style: const TextStyle(
              color: Color(0xFFF1F5F9),
              fontSize: 20,
              fontWeight: FontWeight.w700,
            ),
          ),
          if (user.email != null) ...[
            const SizedBox(height: 4),
            Text(
              user.email!,
              style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 14),
            ),
          ],
          const SizedBox(height: 8),
          if (user.emailVerified)
            _Badge(label: 'Email verified', color: const Color(0xFF22C55E))
          else
            _Badge(label: 'Not verified', color: const Color(0xFF64748B)),
        ],
      ),
    );
  }
}

class _Badge extends StatelessWidget {
  final String label;
  final Color color;
  const _Badge({required this.label, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(99),
        border: Border.all(color: color.withValues(alpha: 0.4)),
      ),
      child: Text(
        label,
        style: TextStyle(color: color, fontSize: 12, fontWeight: FontWeight.w600),
      ),
    );
  }
}

class _InfoCard extends StatelessWidget {
  final AuthonUser user;
  const _InfoCard({required this.user});

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
            'Account Info',
            style: TextStyle(
              color: Color(0xFF94A3B8),
              fontSize: 12,
              fontWeight: FontWeight.w600,
              letterSpacing: 0.5,
            ),
          ),
          const SizedBox(height: 12),
          _InfoRow(label: 'User ID', value: user.id, mono: true),
          if (user.email != null) _InfoRow(label: 'Email', value: user.email!),
          if (user.phone != null) _InfoRow(label: 'Phone', value: user.phone!),
          _InfoRow(
            label: 'Joined',
            value: _formatDate(user.createdAt),
          ),
          if (user.externalAccounts.isNotEmpty)
            _InfoRow(
              label: 'Linked',
              value: user.externalAccounts.map((e) => e.provider).join(', '),
            ),
        ],
      ),
    );
  }

  String _formatDate(DateTime dt) {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
    return '${months[dt.month - 1]} ${dt.day}, ${dt.year}';
  }
}

class _InfoRow extends StatelessWidget {
  final String label;
  final String value;
  final bool mono;

  const _InfoRow({required this.label, required this.value, this.mono = false});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 72,
            child: Text(
              label,
              style: const TextStyle(color: Color(0xFF64748B), fontSize: 13),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: TextStyle(
                color: const Color(0xFFCBD5E1),
                fontSize: 13,
                fontFamily: mono ? 'monospace' : null,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _EditForm extends StatelessWidget {
  final GlobalKey<FormState> formKey;
  final TextEditingController displayNameCtrl;
  final TextEditingController avatarUrlCtrl;
  final TextEditingController phoneCtrl;
  final TextEditingController firstNameCtrl;
  final TextEditingController lastNameCtrl;
  final bool loading;
  final String? errorMessage;
  final String? successMessage;
  final String? userEmail;
  final VoidCallback onSave;

  const _EditForm({
    required this.formKey,
    required this.displayNameCtrl,
    required this.avatarUrlCtrl,
    required this.phoneCtrl,
    required this.firstNameCtrl,
    required this.lastNameCtrl,
    required this.loading,
    required this.errorMessage,
    required this.successMessage,
    required this.userEmail,
    required this.onSave,
  });

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
            'Edit Profile',
            style: TextStyle(
              color: Color(0xFF94A3B8),
              fontSize: 12,
              fontWeight: FontWeight.w600,
              letterSpacing: 0.5,
            ),
          ),
          const SizedBox(height: 6),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            decoration: BoxDecoration(
              color: const Color(0xFF0F172A),
              borderRadius: BorderRadius.circular(6),
            ),
            child: const Text(
              'authon.updateProfile({ displayName, avatarUrl, phone })',
              style: TextStyle(
                color: Color(0xFF7C3AED),
                fontSize: 11,
                fontFamily: 'monospace',
              ),
            ),
          ),
          const SizedBox(height: 16),
          if (errorMessage != null) ...[
            _AlertBanner(message: errorMessage!, type: _AlertType.error),
            const SizedBox(height: 12),
          ],
          if (successMessage != null) ...[
            _AlertBanner(message: successMessage!, type: _AlertType.success),
            const SizedBox(height: 12),
          ],
          Form(
            key: formKey,
            child: Column(
              children: [
                Row(
                  children: [
                    Expanded(
                      child: TextFormField(
                        controller: firstNameCtrl,
                        decoration: const InputDecoration(labelText: 'First Name'),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: TextFormField(
                        controller: lastNameCtrl,
                        decoration: const InputDecoration(labelText: 'Last Name'),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: displayNameCtrl,
                  decoration: const InputDecoration(labelText: 'Display Name'),
                ),
                const SizedBox(height: 12),
                TextFormField(
                  initialValue: userEmail ?? '',
                  enabled: false,
                  decoration: const InputDecoration(
                    labelText: 'Email',
                    helperText: 'Email cannot be changed',
                    helperStyle: TextStyle(color: Color(0xFF475569)),
                  ),
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: avatarUrlCtrl,
                  keyboardType: TextInputType.url,
                  decoration: const InputDecoration(
                    labelText: 'Avatar URL',
                    hintText: 'https://example.com/avatar.jpg',
                  ),
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: phoneCtrl,
                  keyboardType: TextInputType.phone,
                  decoration: const InputDecoration(
                    labelText: 'Phone',
                    hintText: '+1 (555) 000-0000',
                  ),
                ),
                const SizedBox(height: 20),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: loading ? null : onSave,
                    child: loading
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              color: Colors.white,
                            ),
                          )
                        : const Text('Save changes'),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

enum _AlertType { error, success }

class _AlertBanner extends StatelessWidget {
  final String message;
  final _AlertType type;
  const _AlertBanner({required this.message, required this.type});

  @override
  Widget build(BuildContext context) {
    final color = type == _AlertType.error
        ? const Color(0xFFEF4444)
        : const Color(0xFF22C55E);
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
            type == _AlertType.error ? Icons.error_outline : Icons.check_circle_outline,
            color: color,
            size: 18,
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              message,
              style: TextStyle(
                color: type == _AlertType.error
                    ? const Color(0xFFFCA5A5)
                    : const Color(0xFF86EFAC),
                fontSize: 13,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _QuickActionsCard extends StatelessWidget {
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
            'Quick Actions',
            style: TextStyle(
              color: Color(0xFF94A3B8),
              fontSize: 12,
              fontWeight: FontWeight.w600,
              letterSpacing: 0.5,
            ),
          ),
          const SizedBox(height: 12),
          _QuickAction(
            icon: Icons.security,
            label: 'Two-Factor Authentication',
            onTap: () => Navigator.of(context).pushNamed('/mfa'),
          ),
          const SizedBox(height: 8),
          _QuickAction(
            icon: Icons.devices_outlined,
            label: 'Active Sessions',
            onTap: () => Navigator.of(context).pushNamed('/sessions'),
          ),
          const SizedBox(height: 8),
          _QuickAction(
            icon: Icons.delete_outline,
            label: 'Delete Account',
            onTap: () => Navigator.of(context).pushNamed('/delete-account'),
            danger: true,
          ),
        ],
      ),
    );
  }
}

class _QuickAction extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;
  final bool danger;

  const _QuickAction({
    required this.icon,
    required this.label,
    required this.onTap,
    this.danger = false,
  });

  @override
  Widget build(BuildContext context) {
    final color =
        danger ? const Color(0xFFEF4444) : const Color(0xFF94A3B8);
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        decoration: BoxDecoration(
          color: const Color(0xFF0F172A),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: danger
                ? const Color(0xFFEF4444).withValues(alpha: 0.3)
                : const Color(0xFF334155),
          ),
        ),
        child: Row(
          children: [
            Icon(icon, size: 18, color: color),
            const SizedBox(width: 10),
            Text(
              label,
              style: TextStyle(
                color: color,
                fontSize: 14,
                fontWeight: FontWeight.w500,
              ),
            ),
            const Spacer(),
            Icon(Icons.chevron_right, size: 18, color: color),
          ],
        ),
      ),
    );
  }
}
