import 'package:flutter/material.dart';
import '../main.dart';
import '../services/authon_service.dart';

class DeleteAccountScreen extends StatefulWidget {
  const DeleteAccountScreen({super.key});

  @override
  State<DeleteAccountScreen> createState() => _DeleteAccountScreenState();
}

class _DeleteAccountScreenState extends State<DeleteAccountScreen> {
  final _confirmCtrl = TextEditingController();
  bool _loading = false;
  String? _errorMessage;

  static const _confirmText = 'DELETE';

  bool get _isConfirmed => _confirmCtrl.text == _confirmText;

  @override
  void dispose() {
    _confirmCtrl.dispose();
    super.dispose();
  }

  Future<void> _delete() async {
    if (!_isConfirmed) return;
    setState(() {
      _loading = true;
      _errorMessage = null;
    });

    final authon = AuthonServiceProvider.of(context);
    try {
      await authon.deleteAccount();
      if (mounted) {
        Navigator.of(context).pushNamedAndRemoveUntil('/', (route) => false);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Your account has been deleted.')),
        );
      }
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
    return Scaffold(
      appBar: AppBar(title: const Text('Delete Account')),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Center(
                child: Container(
                  width: 64,
                  height: 64,
                  decoration: BoxDecoration(
                    color: const Color(0xFFEF4444).withValues(alpha: 0.1),
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: const Color(0xFFEF4444).withValues(alpha: 0.4),
                    ),
                  ),
                  child: const Icon(
                    Icons.warning_amber_rounded,
                    color: Color(0xFFEF4444),
                    size: 32,
                  ),
                ),
              ),
              const SizedBox(height: 20),
              const Text(
                'Delete Account',
                textAlign: TextAlign.center,
                style: TextStyle(
                  color: Color(0xFFF1F5F9),
                  fontSize: 24,
                  fontWeight: FontWeight.w800,
                ),
              ),
              const SizedBox(height: 8),
              RichText(
                textAlign: TextAlign.center,
                text: const TextSpan(
                  style: TextStyle(color: Color(0xFF94A3B8), fontSize: 14, height: 1.5),
                  children: [
                    TextSpan(text: 'This action is '),
                    TextSpan(
                      text: 'permanent and irreversible',
                      style: TextStyle(
                        color: Color(0xFFEF4444),
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    TextSpan(text: '. All your data will be deleted immediately.'),
                  ],
                ),
              ),
              const SizedBox(height: 24),
              _WhatWillBeDeleted(),
              const SizedBox(height: 16),
              if (_errorMessage != null) ...[
                _ErrorBanner(message: _errorMessage!),
                const SizedBox(height: 16),
              ],
              _ConfirmInput(
                controller: _confirmCtrl,
                isConfirmed: _isConfirmed,
                onChanged: (_) => setState(() {}),
              ),
              const SizedBox(height: 20),
              _DeleteButton(
                isConfirmed: _isConfirmed,
                loading: _loading,
                onDelete: _delete,
              ),
              const SizedBox(height: 12),
              OutlinedButton(
                onPressed: () => Navigator.of(context).pop(),
                child: const Text('Cancel — Keep my account'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _WhatWillBeDeleted extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFFEF4444).withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: const Color(0xFFEF4444).withValues(alpha: 0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'This will permanently delete:',
            style: TextStyle(
              color: Color(0xFFFCA5A5),
              fontSize: 13,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 8),
          ...[
            'Your account and personal information',
            'All active sessions',
            'MFA configuration and backup codes',
            'Any linked social accounts',
          ].map((item) => Padding(
            padding: const EdgeInsets.only(bottom: 4),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Padding(
                  padding: EdgeInsets.only(top: 3),
                  child: Icon(Icons.circle, size: 6, color: Color(0xFFFCA5A5)),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    item,
                    style: const TextStyle(color: Color(0xFFFCA5A5), fontSize: 13, height: 1.4),
                  ),
                ),
              ],
            ),
          )),
        ],
      ),
    );
  }
}

class _ConfirmInput extends StatelessWidget {
  final TextEditingController controller;
  final bool isConfirmed;
  final ValueChanged<String> onChanged;

  const _ConfirmInput({
    required this.controller,
    required this.isConfirmed,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        RichText(
          text: const TextSpan(
            style: TextStyle(color: Color(0xFF94A3B8), fontSize: 13, height: 1.5),
            children: [
              TextSpan(text: 'Type '),
              TextSpan(
                text: 'DELETE',
                style: TextStyle(
                  color: Color(0xFFEF4444),
                  fontFamily: 'monospace',
                  fontWeight: FontWeight.w700,
                ),
              ),
              TextSpan(text: ' to confirm'),
            ],
          ),
        ),
        const SizedBox(height: 8),
        TextField(
          controller: controller,
          onChanged: onChanged,
          textAlign: TextAlign.center,
          style: TextStyle(
            fontSize: 18,
            fontFamily: 'monospace',
            fontWeight: FontWeight.w700,
            letterSpacing: 2,
            color: isConfirmed ? const Color(0xFFEF4444) : const Color(0xFFF1F5F9),
          ),
          decoration: InputDecoration(
            hintText: 'DELETE',
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: BorderSide(
                color: isConfirmed
                    ? const Color(0xFFEF4444)
                    : const Color(0xFF334155),
                width: isConfirmed ? 2 : 1,
              ),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: BorderSide(
                color: isConfirmed
                    ? const Color(0xFFEF4444)
                    : const Color(0xFF7C3AED),
                width: 2,
              ),
            ),
          ),
        ),
      ],
    );
  }
}

class _DeleteButton extends StatelessWidget {
  final bool isConfirmed;
  final bool loading;
  final VoidCallback onDelete;

  const _DeleteButton({
    required this.isConfirmed,
    required this.loading,
    required this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    return AnimatedOpacity(
      opacity: isConfirmed ? 1.0 : 0.4,
      duration: const Duration(milliseconds: 200),
      child: ElevatedButton(
        onPressed: (isConfirmed && !loading) ? onDelete : null,
        style: ElevatedButton.styleFrom(
          backgroundColor: const Color(0xFFEF4444),
          disabledBackgroundColor: const Color(0xFFEF4444),
          padding: const EdgeInsets.symmetric(vertical: 16),
        ),
        child: loading
            ? const SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
              )
            : const Text(
                'Permanently delete my account',
                style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600),
              ),
      ),
    );
  }
}

class _ErrorBanner extends StatelessWidget {
  final String message;
  const _ErrorBanner({required this.message});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFFEF4444).withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: const Color(0xFFEF4444).withValues(alpha: 0.4)),
      ),
      child: Row(
        children: [
          const Icon(Icons.error_outline, color: Color(0xFFEF4444), size: 18),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              message,
              style: const TextStyle(color: Color(0xFFFCA5A5), fontSize: 13),
            ),
          ),
        ],
      ),
    );
  }
}
