import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_theme.dart';
import '../services/auth_service.dart';
import '../services/api_service.dart';

class LoginScreen extends StatefulWidget {
  final void Function(String role) onLoginSuccess;

  const LoginScreen({super.key, required this.onLoginSuccess});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen>
    with SingleTickerProviderStateMixin {
  bool _isLogin = true;
  bool _isLoading = false;
  String? _errorMessage;

  // Login fields
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  String _loginRole = 'user'; // 'user' or 'volunteer'

  // Signup fields (user-only)
  final _signupEmailController = TextEditingController();
  final _signupUsernameController = TextEditingController();
  final _signupFullNameController = TextEditingController();
  final _signupPasswordController = TextEditingController();
  final _signupPhoneController = TextEditingController();
  final _signupCityController = TextEditingController();
  final _signupCountryController = TextEditingController();

  bool _obscurePassword = true;

  late AnimationController _animCtrl;
  late Animation<double> _fadeAnim;

  @override
  void initState() {
    super.initState();
    _animCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 400),
    );
    _fadeAnim = CurvedAnimation(parent: _animCtrl, curve: Curves.easeInOut);
    _animCtrl.forward();
  }

  @override
  void dispose() {
    _animCtrl.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _signupEmailController.dispose();
    _signupUsernameController.dispose();
    _signupFullNameController.dispose();
    _signupPasswordController.dispose();
    _signupPhoneController.dispose();
    _signupCityController.dispose();
    _signupCountryController.dispose();
    super.dispose();
  }

  void _switchMode() {
    _animCtrl.reverse().then((_) {
      setState(() {
        _isLogin = !_isLogin;
        _errorMessage = null;
      });
      _animCtrl.forward();
    });
  }

  Future<void> _handleLogin() async {
    if (_emailController.text.isEmpty || _passwordController.text.isEmpty) {
      setState(() => _errorMessage = 'Please fill in all fields');
      return;
    }

    setState(() { _isLoading = true; _errorMessage = null; });

    try {
      await AuthService.login(
        email: _emailController.text.trim(),
        password: _passwordController.text,
      );
      // Store the selected role locally
      await ApiService.saveSelectedRole(_loginRole);
      widget.onLoginSuccess(_loginRole);
    } on ApiException catch (e) {
      setState(() => _errorMessage = e.message);
    } catch (e) {
      setState(() => _errorMessage = 'Network error. Please try again.');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _handleSignup() async {
    if (_signupEmailController.text.isEmpty ||
        _signupUsernameController.text.isEmpty ||
        _signupFullNameController.text.isEmpty ||
        _signupPasswordController.text.isEmpty) {
      setState(() => _errorMessage = 'Please fill in all required fields');
      return;
    }

    if (_signupPasswordController.text.length < 8) {
      setState(() => _errorMessage = 'Password must be at least 8 characters');
      return;
    }

    setState(() { _isLoading = true; _errorMessage = null; });

    try {
      await AuthService.signup(
        email: _signupEmailController.text.trim(),
        username: _signupUsernameController.text.trim(),
        fullName: _signupFullNameController.text.trim(),
        password: _signupPasswordController.text,
        phone: _signupPhoneController.text.trim(),
        city: _signupCityController.text.trim(),
        country: _signupCountryController.text.trim(),
      );
      // New signups always start as user
      await ApiService.saveSelectedRole('user');
      widget.onLoginSuccess('user');
    } on ApiException catch (e) {
      setState(() => _errorMessage = e.message);
    } catch (e) {
      setState(() => _errorMessage = 'Network error. Please try again.');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 48),
                _buildHeader(),
                const SizedBox(height: 40),
                _buildTabSwitch(),
                const SizedBox(height: 32),
                FadeTransition(
                  opacity: _fadeAnim,
                  child: _isLogin ? _buildLoginForm() : _buildSignupForm(),
                ),
                const SizedBox(height: 48),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: 56, height: 56,
          decoration: BoxDecoration(
            color: AppColors.primary,
            borderRadius: BorderRadius.circular(16)),
          child: const Center(
            child: Icon(Icons.bolt, color: AppColors.onPrimary, size: 32)),
        ),
        const SizedBox(height: 24),
        Text('Utsova', style: GoogleFonts.plusJakartaSans(
            fontSize: 40, fontWeight: FontWeight.w800,
            color: AppColors.white, letterSpacing: -1.5)),
        const SizedBox(height: 8),
        Text('Curated experiences,\nseamlessly delivered.',
            style: GoogleFonts.inter(
                fontSize: 16, color: AppColors.stone400, height: 1.5)),
      ],
    );
  }

  Widget _buildTabSwitch() {
    return Container(
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: AppColors.stone900,
        borderRadius: BorderRadius.circular(9999)),
      child: Row(children: [
        Expanded(child: _tabButton('Sign In', _isLogin)),
        Expanded(child: _tabButton('Sign Up', !_isLogin)),
      ]),
    );
  }

  Widget _tabButton(String label, bool isActive) {
    return GestureDetector(
      onTap: isActive ? null : _switchMode,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 300),
        padding: const EdgeInsets.symmetric(vertical: 14),
        decoration: BoxDecoration(
          color: isActive ? AppColors.primary : Colors.transparent,
          borderRadius: BorderRadius.circular(9999)),
        child: Center(
          child: Text(label, style: GoogleFonts.inter(
              fontSize: 14, fontWeight: FontWeight.w700,
              color: isActive ? AppColors.onPrimary : AppColors.stone500)),
        ),
      ),
    );
  }

  // ── LOGIN FORM ──────────────────────────────────────────────

  Widget _buildLoginForm() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Role selector
        Text('LOGIN AS', style: GoogleFonts.inter(
            fontSize: 10, fontWeight: FontWeight.w700,
            color: AppColors.stone500, letterSpacing: 2.0)),
        const SizedBox(height: 12),
        _buildRoleSelector(),
        const SizedBox(height: 24),
        _inputField(
          controller: _emailController,
          label: 'EMAIL', hint: 'you@example.com',
          icon: Icons.mail_outline,
          keyboardType: TextInputType.emailAddress,
        ),
        const SizedBox(height: 20),
        _inputField(
          controller: _passwordController,
          label: 'PASSWORD', hint: '••••••••',
          icon: Icons.lock_outline, isPassword: true,
        ),
        if (_errorMessage != null) ...[
          const SizedBox(height: 16), _errorBanner()],
        const SizedBox(height: 28),
        _primaryButton('Sign In', _handleLogin),
        const SizedBox(height: 20),
        _switchText('Don\'t have an account?', 'Sign up'),
      ],
    );
  }

  Widget _buildRoleSelector() {
    return Container(
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: AppColors.stone900,
        borderRadius: BorderRadius.circular(9999),
        border: Border.all(color: AppColors.stone800)),
      child: Row(children: [
        Expanded(child: _roleOption('user', 'User', Icons.person)),
        const SizedBox(width: 4),
        Expanded(child: _roleOption('volunteer', 'Volunteer', Icons.volunteer_activism)),
      ]),
    );
  }

  Widget _roleOption(String value, String label, IconData icon) {
    final isActive = _loginRole == value;
    return GestureDetector(
      onTap: () => setState(() => _loginRole = value),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 250),
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: isActive ? AppColors.primary : Colors.transparent,
          borderRadius: BorderRadius.circular(9999)),
        child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
          Icon(icon, size: 18,
              color: isActive ? AppColors.onPrimary : AppColors.stone500),
          const SizedBox(width: 8),
          Text(label, style: GoogleFonts.inter(
              fontSize: 13, fontWeight: FontWeight.w700,
              color: isActive ? AppColors.onPrimary : AppColors.stone500)),
        ]),
      ),
    );
  }

  // ── SIGNUP FORM (user only) ──────────────────────────────────

  Widget _buildSignupForm() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _inputField(controller: _signupFullNameController,
            label: 'FULL NAME', hint: 'Rahul Sharma', icon: Icons.person_outline),
        const SizedBox(height: 20),
        _inputField(controller: _signupUsernameController,
            label: 'USERNAME', hint: 'rahulsharma', icon: Icons.alternate_email),
        const SizedBox(height: 20),
        _inputField(controller: _signupEmailController,
            label: 'EMAIL', hint: 'you@example.com',
            icon: Icons.mail_outline, keyboardType: TextInputType.emailAddress),
        const SizedBox(height: 20),
        _inputField(controller: _signupPasswordController,
            label: 'PASSWORD', hint: 'Min 8 characters',
            icon: Icons.lock_outline, isPassword: true),
        const SizedBox(height: 20),
        _inputField(controller: _signupPhoneController,
            label: 'PHONE (OPTIONAL)', hint: '+91 98765 43210',
            icon: Icons.phone_outlined, keyboardType: TextInputType.phone),
        const SizedBox(height: 20),
        Row(children: [
          Expanded(child: _inputField(controller: _signupCityController,
              label: 'CITY', hint: 'Mumbai', icon: Icons.location_city)),
          const SizedBox(width: 16),
          Expanded(child: _inputField(controller: _signupCountryController,
              label: 'COUNTRY', hint: 'India', icon: Icons.public)),
        ]),
        if (_errorMessage != null) ...[
          const SizedBox(height: 16), _errorBanner()],
        const SizedBox(height: 28),
        _primaryButton('Create Account', _handleSignup),
        const SizedBox(height: 20),
        _switchText('Already have an account?', 'Sign in'),
      ],
    );
  }

  // ── SHARED WIDGETS ──────────────────────────────────────────

  Widget _inputField({
    required TextEditingController controller,
    required String label, required String hint, required IconData icon,
    TextInputType keyboardType = TextInputType.text, bool isPassword = false,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(left: 16, bottom: 6),
          child: Text(label, style: GoogleFonts.inter(
              fontSize: 10, fontWeight: FontWeight.w700,
              color: AppColors.stone500, letterSpacing: 2.0)),
        ),
        Container(
          decoration: BoxDecoration(
            color: AppColors.stone900,
            borderRadius: BorderRadius.circular(9999),
            border: Border.all(color: AppColors.stone800)),
          child: TextField(
            controller: controller,
            keyboardType: keyboardType,
            obscureText: isPassword && _obscurePassword,
            style: GoogleFonts.inter(fontSize: 16, color: AppColors.white),
            decoration: InputDecoration(
              hintText: hint,
              hintStyle: GoogleFonts.inter(fontSize: 16, color: AppColors.stone600),
              prefixIcon: Icon(icon, color: AppColors.stone500, size: 20),
              suffixIcon: isPassword
                  ? GestureDetector(
                      onTap: () => setState(() => _obscurePassword = !_obscurePassword),
                      child: Icon(_obscurePassword ? Icons.visibility_off : Icons.visibility,
                          color: AppColors.stone500, size: 20),
                    )
                  : null,
              border: InputBorder.none,
              contentPadding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
            ),
          ),
        ),
      ],
    );
  }

  Widget _errorBanner() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.errorContainer.withValues(alpha: 0.3),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.error.withValues(alpha: 0.3))),
      child: Row(children: [
        const Icon(Icons.error_outline, color: AppColors.error, size: 20),
        const SizedBox(width: 12),
        Expanded(child: Text(_errorMessage!, style: GoogleFonts.inter(
            fontSize: 13, color: AppColors.error, fontWeight: FontWeight.w500))),
      ]),
    );
  }

  Widget _primaryButton(String label, VoidCallback onPressed) {
    return GestureDetector(
      onTap: _isLoading ? null : onPressed,
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(vertical: 18),
        decoration: BoxDecoration(
          color: _isLoading ? AppColors.primary.withValues(alpha: 0.6) : AppColors.primary,
          borderRadius: BorderRadius.circular(9999),
          boxShadow: _isLoading ? null : [
            BoxShadow(color: AppColors.primary.withValues(alpha: 0.3),
                blurRadius: 24, offset: const Offset(0, 8)),
          ],
        ),
        child: Center(
          child: _isLoading
              ? const SizedBox(width: 24, height: 24,
                  child: CircularProgressIndicator(color: AppColors.onPrimary, strokeWidth: 2.5))
              : Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                  Text(label, style: GoogleFonts.inter(
                      fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.onPrimary)),
                  const SizedBox(width: 8),
                  const Icon(Icons.arrow_forward, color: AppColors.onPrimary, size: 20),
                ]),
        ),
      ),
    );
  }

  Widget _switchText(String prefix, String action) {
    return Center(
      child: GestureDetector(
        onTap: _switchMode,
        child: RichText(
          text: TextSpan(
            style: GoogleFonts.inter(fontSize: 14, color: AppColors.stone400),
            children: [
              TextSpan(text: '$prefix '),
              TextSpan(text: action, style: GoogleFonts.inter(
                  fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.primary)),
            ],
          ),
        ),
      ),
    );
  }
}
