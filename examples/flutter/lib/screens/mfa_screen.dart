import 'package:flutter/material.dart';
import '../main.dart';
import '../services/authon_service.dart';

class MfaScreen extends StatefulWidget {
  const MfaScreen({super.key});

  @override
  State<MfaScreen> createState() => _MfaScreenState();
}

enum _SetupStep { idle, setup, verify, done }

class _MfaScreenState extends State<MfaScreen> {
  MfaStatus? _status;
  MfaSetupData? _setupData;
  _SetupStep _step = _SetupStep.idle;
  bool _statusLoading = true;
  bool _actionLoading = false;
  String? _errorMessage;
  String? _successMessage;
  List<String>? _newBackupCodes;

  bool _showDisableForm = false;
  bool _showRegenForm = false;

  final _verifyCodeCtrl = TextEditingController();
  final _disableCodeCtrl = TextEditingController();
  final _regenCodeCtrl = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadStatus();
  }

  @override
  void dispose() {
    _verifyCodeCtrl.dispose();
    _disableCodeCtrl.dispose();
    _regenCodeCtrl.dispose();
    super.dispose();
  }

  Future<void> _loadStatus() async {
    setState(() => _statusLoading = true);
    final authon = AuthonServiceProvider.of(context);
    try {
      final status = await authon.getMfaStatus();
      setState(() => _status = status);
    } on AuthonException catch (e) {
      setState(() => _errorMessage = e.message);
    } finally {
      if (mounted) setState(() => _statusLoading = false);
    }
  }

  Future<void> _startSetup() async {
    setState(() {
      _actionLoading = true;
      _errorMessage = null;
    });
    final authon = AuthonServiceProvider.of(context);
    try {
      final data = await authon.setupMfa();
      setState(() {
        _setupData = data;
        _step = _SetupStep.setup;
      });
    } on AuthonException catch (e) {
      setState(() => _errorMessage = e.message);
    } finally {
      if (mounted) setState(() => _actionLoading = false);
    }
  }

  Future<void> _verifySetup() async {
    final code = _verifyCodeCtrl.text.trim();
    if (code.length != 6) return;
    setState(() {
      _actionLoading = true;
      _errorMessage = null;
    });
    final authon = AuthonServiceProvider.of(context);
    try {
      await authon.verifyMfaSetup(code);
      setState(() {
        _step = _SetupStep.done;
        _successMessage = 'MFA enabled successfully!';
      });
      await _loadStatus();
    } on AuthonException catch (e) {
      setState(() => _errorMessage = e.message);
    } finally {
      if (mounted) setState(() => _actionLoading = false);
    }
  }

  Future<void> _disableMfa() async {
    final code = _disableCodeCtrl.text.trim();
    if (code.length != 6) return;
    setState(() {
      _actionLoading = true;
      _errorMessage = null;
    });
    final authon = AuthonServiceProvider.of(context);
    try {
      await authon.disableMfa(code);
      setState(() {
        _showDisableForm = false;
        _disableCodeCtrl.clear();
        _successMessage = 'MFA has been disabled.';
        _step = _SetupStep.idle;
      });
      await _loadStatus();
    } on AuthonException catch (e) {
      setState(() => _errorMessage = e.message);
    } finally {
      if (mounted) setState(() => _actionLoading = false);
    }
  }

  Future<void> _regenerateBackupCodes() async {
    final code = _regenCodeCtrl.text.trim();
    if (code.length != 6) return;
    setState(() {
      _actionLoading = true;
      _errorMessage = null;
    });
    final authon = AuthonServiceProvider.of(context);
    try {
      final codes = await authon.regenerateBackupCodes(code);
      setState(() {
        _newBackupCodes = codes;
        _showRegenForm = false;
        _regenCodeCtrl.clear();
        _successMessage = 'Backup codes regenerated.';
      });
    } on AuthonException catch (e) {
      setState(() => _errorMessage = e.message);
    } finally {
      if (mounted) setState(() => _actionLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Two-Factor Auth')),
      body: _statusLoading
          ? const Center(child: CircularProgressIndicator())
          : ListView(
              padding: const EdgeInsets.all(20),
              children: [
                _Header(),
                const SizedBox(height: 20),
                if (_errorMessage != null) ...[
                  _AlertBanner(message: _errorMessage!, type: _AlertType.error),
                  const SizedBox(height: 12),
                ],
                if (_successMessage != null) ...[
                  _AlertBanner(message: _successMessage!, type: _AlertType.success),
                  const SizedBox(height: 12),
                ],
                _StatusCard(
                  status: _status,
                  step: _step,
                  setupData: _setupData,
                  verifyCodeCtrl: _verifyCodeCtrl,
                  actionLoading: _actionLoading,
                  onSetupStart: _startSetup,
                  onProceedToVerify: () => setState(() => _step = _SetupStep.verify),
                  onVerify: _verifySetup,
                  onToggleDisable: () => setState(() {
                    _showDisableForm = !_showDisableForm;
                    _showRegenForm = false;
                  }),
                  onToggleRegen: () => setState(() {
                    _showRegenForm = !_showRegenForm;
                    _showDisableForm = false;
                  }),
                ),
                if (_showDisableForm) ...[
                  const SizedBox(height: 16),
                  _DisableForm(
                    codeCtrl: _disableCodeCtrl,
                    loading: _actionLoading,
                    onSubmit: _disableMfa,
                    onCancel: () => setState(() {
                      _showDisableForm = false;
                      _disableCodeCtrl.clear();
                    }),
                  ),
                ],
                if (_showRegenForm) ...[
                  const SizedBox(height: 16),
                  _RegenForm(
                    codeCtrl: _regenCodeCtrl,
                    loading: _actionLoading,
                    onSubmit: _regenerateBackupCodes,
                    onCancel: () => setState(() {
                      _showRegenForm = false;
                      _regenCodeCtrl.clear();
                    }),
                  ),
                ],
                if (_newBackupCodes != null) ...[
                  const SizedBox(height: 16),
                  _BackupCodesDisplay(
                    title: 'New Backup Codes',
                    subtitle: 'Previous backup codes have been invalidated. Save these new codes safely.',
                    codes: _newBackupCodes!,
                  ),
                ],
                const SizedBox(height: 24),
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
          'Two-Factor Authentication',
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
              TextSpan(text: 'Add an extra layer of security using '),
              TextSpan(
                text: 'authon.setupMfa()',
                style: TextStyle(
                  color: Color(0xFF7C3AED),
                  fontFamily: 'monospace',
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _StatusCard extends StatelessWidget {
  final MfaStatus? status;
  final _SetupStep step;
  final MfaSetupData? setupData;
  final TextEditingController verifyCodeCtrl;
  final bool actionLoading;
  final VoidCallback onSetupStart;
  final VoidCallback onProceedToVerify;
  final VoidCallback onVerify;
  final VoidCallback onToggleDisable;
  final VoidCallback onToggleRegen;

  const _StatusCard({
    required this.status,
    required this.step,
    required this.setupData,
    required this.verifyCodeCtrl,
    required this.actionLoading,
    required this.onSetupStart,
    required this.onProceedToVerify,
    required this.onVerify,
    required this.onToggleDisable,
    required this.onToggleRegen,
  });

  @override
  Widget build(BuildContext context) {
    final enabled = status?.enabled ?? false;

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
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Authenticator App',
                      style: TextStyle(
                        color: Color(0xFFF1F5F9),
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      enabled
                          ? '${status?.backupCodesRemaining ?? 0} backup codes remaining'
                          : 'Not configured',
                      style: const TextStyle(color: Color(0xFF64748B), fontSize: 13),
                    ),
                  ],
                ),
              ),
              _StatusBadge(enabled: enabled),
            ],
          ),
          const SizedBox(height: 16),
          if (!enabled && step == _SetupStep.idle)
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: actionLoading ? null : onSetupStart,
                child: actionLoading
                    ? const SizedBox(
                        width: 18,
                        height: 18,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                      )
                    : const Text('Set up authenticator app'),
              ),
            ),
          if (step == _SetupStep.setup && setupData != null) ...[
            _SetupView(setupData: setupData!, onProceed: onProceedToVerify),
          ],
          if (step == _SetupStep.verify) ...[
            _VerifyView(
              codeCtrl: verifyCodeCtrl,
              loading: actionLoading,
              onVerify: onVerify,
            ),
          ],
          if (step == _SetupStep.done && enabled)
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFF22C55E).withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Row(
                children: [
                  Icon(Icons.check_circle_outline, color: Color(0xFF22C55E), size: 18),
                  SizedBox(width: 8),
                  Text(
                    'MFA is now active on your account!',
                    style: TextStyle(color: Color(0xFF86EFAC), fontSize: 13),
                  ),
                ],
              ),
            ),
          if (enabled && step == _SetupStep.idle) ...[
            Row(
              children: [
                OutlinedButton(
                  onPressed: onToggleRegen,
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                    textStyle: const TextStyle(fontSize: 13),
                  ),
                  child: const Text('Regenerate backup codes'),
                ),
                const SizedBox(width: 10),
                OutlinedButton(
                  onPressed: onToggleDisable,
                  style: OutlinedButton.styleFrom(
                    foregroundColor: const Color(0xFFEF4444),
                    side: const BorderSide(color: Color(0xFFEF4444)),
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                    textStyle: const TextStyle(fontSize: 13),
                  ),
                  child: const Text('Disable MFA'),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }
}

class _StatusBadge extends StatelessWidget {
  final bool enabled;
  const _StatusBadge({required this.enabled});

  @override
  Widget build(BuildContext context) {
    final color = enabled ? const Color(0xFF22C55E) : const Color(0xFF64748B);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(99),
        border: Border.all(color: color.withValues(alpha: 0.4)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 6,
            height: 6,
            decoration: BoxDecoration(color: color, shape: BoxShape.circle),
          ),
          const SizedBox(width: 6),
          Text(
            enabled ? 'Enabled' : 'Disabled',
            style: TextStyle(
              color: color,
              fontSize: 12,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}

class _SetupView extends StatelessWidget {
  final MfaSetupData setupData;
  final VoidCallback onProceed;

  const _SetupView({required this.setupData, required this.onProceed});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _AlertBanner(
          message: 'Scan the QR code with your authenticator app (Google Authenticator, Authy, etc.)',
          type: _AlertType.warning,
        ),
        const SizedBox(height: 16),
        const Text(
          'Manual entry key:',
          style: TextStyle(color: Color(0xFF94A3B8), fontSize: 13),
        ),
        const SizedBox(height: 6),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: const Color(0xFF0F172A),
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: const Color(0xFF334155)),
          ),
          child: Text(
            setupData.secret,
            style: const TextStyle(
              color: Color(0xFFF1F5F9),
              fontFamily: 'monospace',
              fontSize: 14,
              letterSpacing: 1.5,
            ),
          ),
        ),
        if (setupData.backupCodes.isNotEmpty) ...[
          const SizedBox(height: 16),
          _BackupCodesDisplay(
            title: 'Backup Codes — Save these now',
            subtitle: 'Store backup codes safely. Each code can only be used once.',
            codes: setupData.backupCodes,
            isWarning: true,
          ),
        ],
        const SizedBox(height: 16),
        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            onPressed: onProceed,
            child: const Text("I've saved my codes — Next"),
          ),
        ),
      ],
    );
  }
}

class _VerifyView extends StatelessWidget {
  final TextEditingController codeCtrl;
  final bool loading;
  final VoidCallback onVerify;

  const _VerifyView({
    required this.codeCtrl,
    required this.loading,
    required this.onVerify,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Enter the 6-digit code from your authenticator app',
          style: TextStyle(
            color: Color(0xFFF1F5F9),
            fontSize: 14,
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: TextField(
                controller: codeCtrl,
                keyboardType: TextInputType.number,
                maxLength: 6,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 22,
                  letterSpacing: 6,
                  fontWeight: FontWeight.w700,
                  color: Color(0xFFF1F5F9),
                ),
                decoration: const InputDecoration(
                  hintText: '000000',
                  counterText: '',
                ),
              ),
            ),
            const SizedBox(width: 12),
            ElevatedButton(
              onPressed: loading ? null : onVerify,
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
              ),
              child: loading
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                    )
                  : const Text('Verify & Enable'),
            ),
          ],
        ),
      ],
    );
  }
}

class _DisableForm extends StatelessWidget {
  final TextEditingController codeCtrl;
  final bool loading;
  final VoidCallback onSubmit;
  final VoidCallback onCancel;

  const _DisableForm({
    required this.codeCtrl,
    required this.loading,
    required this.onSubmit,
    required this.onCancel,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFEF4444).withValues(alpha: 0.4)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Disable MFA',
            style: TextStyle(
              color: Color(0xFFF1F5F9),
              fontSize: 15,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 6),
          RichText(
            text: const TextSpan(
              style: TextStyle(color: Color(0xFF94A3B8), fontSize: 13),
              children: [
                TextSpan(text: 'Enter your current TOTP code. '),
                TextSpan(
                  text: 'disableMfa(code)',
                  style: TextStyle(color: Color(0xFF7C3AED), fontFamily: 'monospace'),
                ),
              ],
            ),
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: codeCtrl,
                  keyboardType: TextInputType.number,
                  maxLength: 6,
                  textAlign: TextAlign.center,
                  style: const TextStyle(letterSpacing: 4, fontSize: 18, color: Color(0xFFF1F5F9)),
                  decoration: const InputDecoration(hintText: '000000', counterText: ''),
                ),
              ),
              const SizedBox(width: 10),
              ElevatedButton(
                onPressed: loading ? null : onSubmit,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFEF4444),
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                ),
                child: loading
                    ? const SizedBox(
                        width: 16,
                        height: 16,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                      )
                    : const Text('Disable'),
              ),
              const SizedBox(width: 8),
              OutlinedButton(
                onPressed: onCancel,
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 16),
                ),
                child: const Text('Cancel'),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _RegenForm extends StatelessWidget {
  final TextEditingController codeCtrl;
  final bool loading;
  final VoidCallback onSubmit;
  final VoidCallback onCancel;

  const _RegenForm({
    required this.codeCtrl,
    required this.loading,
    required this.onSubmit,
    required this.onCancel,
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
            'Regenerate Backup Codes',
            style: TextStyle(
              color: Color(0xFFF1F5F9),
              fontSize: 15,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 6),
          RichText(
            text: const TextSpan(
              style: TextStyle(color: Color(0xFF94A3B8), fontSize: 13),
              children: [
                TextSpan(text: 'Enter your TOTP code to generate new backup codes. '),
                TextSpan(
                  text: 'regenerateBackupCodes(code)',
                  style: TextStyle(color: Color(0xFF7C3AED), fontFamily: 'monospace'),
                ),
              ],
            ),
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: codeCtrl,
                  keyboardType: TextInputType.number,
                  maxLength: 6,
                  textAlign: TextAlign.center,
                  style: const TextStyle(letterSpacing: 4, fontSize: 18, color: Color(0xFFF1F5F9)),
                  decoration: const InputDecoration(hintText: '000000', counterText: ''),
                ),
              ),
              const SizedBox(width: 10),
              ElevatedButton(
                onPressed: loading ? null : onSubmit,
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                ),
                child: loading
                    ? const SizedBox(
                        width: 16,
                        height: 16,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                      )
                    : const Text('Regenerate'),
              ),
              const SizedBox(width: 8),
              OutlinedButton(
                onPressed: onCancel,
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 16),
                ),
                child: const Text('Cancel'),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _BackupCodesDisplay extends StatelessWidget {
  final String title;
  final String subtitle;
  final List<String> codes;
  final bool isWarning;

  const _BackupCodesDisplay({
    required this.title,
    required this.subtitle,
    required this.codes,
    this.isWarning = false,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: const Color(0xFF334155)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(
              color: Color(0xFFF1F5F9),
              fontSize: 14,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 6),
          if (isWarning)
            _AlertBanner(message: subtitle, type: _AlertType.warning)
          else
            Text(subtitle, style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 12)),
          const SizedBox(height: 10),
          GridView.count(
            crossAxisCount: 2,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisSpacing: 8,
            mainAxisSpacing: 8,
            childAspectRatio: 3.5,
            children: codes.map((code) => Container(
              decoration: BoxDecoration(
                color: const Color(0xFF1E293B),
                borderRadius: BorderRadius.circular(6),
                border: Border.all(color: const Color(0xFF334155)),
              ),
              alignment: Alignment.center,
              child: Text(
                code,
                style: const TextStyle(
                  color: Color(0xFF93C5FD),
                  fontFamily: 'monospace',
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  letterSpacing: 1,
                ),
              ),
            )).toList(),
          ),
        ],
      ),
    );
  }
}

enum _AlertType { error, success, warning }

class _AlertBanner extends StatelessWidget {
  final String message;
  final _AlertType type;
  const _AlertBanner({required this.message, required this.type});

  @override
  Widget build(BuildContext context) {
    final Color color;
    final Color textColor;
    final IconData icon;

    switch (type) {
      case _AlertType.error:
        color = const Color(0xFFEF4444);
        textColor = const Color(0xFFFCA5A5);
        icon = Icons.error_outline;
      case _AlertType.success:
        color = const Color(0xFF22C55E);
        textColor = const Color(0xFF86EFAC);
        icon = Icons.check_circle_outline;
      case _AlertType.warning:
        color = const Color(0xFFF59E0B);
        textColor = const Color(0xFFFCD34D);
        icon = Icons.warning_amber_outlined;
    }

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color.withValues(alpha: 0.4)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color, size: 18),
          const SizedBox(width: 8),
          Expanded(
            child: Text(message, style: TextStyle(color: textColor, fontSize: 13)),
          ),
        ],
      ),
    );
  }
}

class MfaVerifyScreen extends StatefulWidget {
  final String mfaToken;
  const MfaVerifyScreen({super.key, required this.mfaToken});

  @override
  State<MfaVerifyScreen> createState() => _MfaVerifyScreenState();
}

class _MfaVerifyScreenState extends State<MfaVerifyScreen> {
  final _codeCtrl = TextEditingController();
  bool _loading = false;
  String? _errorMessage;

  @override
  void dispose() {
    _codeCtrl.dispose();
    super.dispose();
  }

  Future<void> _verify() async {
    final code = _codeCtrl.text.trim();
    if (code.length != 6) return;
    setState(() {
      _loading = true;
      _errorMessage = null;
    });
    final authon = AuthonServiceProvider.of(context);
    try {
      await authon.verifyMfa(widget.mfaToken, code);
      if (mounted) Navigator.of(context).pushReplacementNamed('/');
    } on AuthonException catch (e) {
      setState(() => _errorMessage = e.message);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Two-Factor Authentication')),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Center(
              child: Icon(Icons.key, size: 56, color: Color(0xFF7C3AED)),
            ),
            const SizedBox(height: 20),
            const Text(
              'Verify Your Identity',
              textAlign: TextAlign.center,
              style: TextStyle(
                color: Color(0xFFF1F5F9),
                fontSize: 22,
                fontWeight: FontWeight.w800,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Enter the 6-digit code from your authenticator app',
              textAlign: TextAlign.center,
              style: TextStyle(color: Color(0xFF94A3B8), fontSize: 14),
            ),
            const SizedBox(height: 32),
            if (_errorMessage != null) ...[
              _AlertBanner(message: _errorMessage!, type: _AlertType.error),
              const SizedBox(height: 16),
            ],
            TextField(
              controller: _codeCtrl,
              keyboardType: TextInputType.number,
              maxLength: 6,
              textAlign: TextAlign.center,
              autofocus: true,
              style: const TextStyle(
                fontSize: 28,
                letterSpacing: 8,
                fontWeight: FontWeight.w700,
                color: Color(0xFFF1F5F9),
              ),
              decoration: const InputDecoration(
                hintText: '000000',
                counterText: '',
              ),
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: _loading ? null : _verify,
              child: _loading
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                    )
                  : const Text('Verify'),
            ),
            const SizedBox(height: 12),
            OutlinedButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Back'),
            ),
          ],
        ),
      ),
    );
  }
}
