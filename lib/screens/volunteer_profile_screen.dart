import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_theme.dart';
import '../services/auth_service.dart';
import '../services/volunteer_service.dart';

class VolunteerProfileScreen extends StatefulWidget {
  final Map<String, dynamic>? volunteerData;

  const VolunteerProfileScreen({super.key, this.volunteerData});

  @override
  State<VolunteerProfileScreen> createState() => _VolunteerProfileScreenState();
}

class _VolunteerProfileScreenState extends State<VolunteerProfileScreen> {
  Map<String, dynamic>? _user;
  Map<String, dynamic>? _volunteer;
  bool _isEditing = false;

  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _roleController = TextEditingController();
  final _availabilityController = TextEditingController();
  final _notesController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _volunteer = widget.volunteerData;
    _loadUser();
    _populateFields();
  }

  Future<void> _loadUser() async {
    _user = await AuthService.getCachedUser();
    if (mounted) setState(() {});
  }

  void _populateFields() {
    if (_volunteer != null) {
      _nameController.text = _volunteer!['name'] ?? '';
      _phoneController.text = _volunteer!['phone'] ?? '';
      _roleController.text = _volunteer!['role'] ?? '';
      _availabilityController.text = _volunteer!['availability'] ?? '';
      _notesController.text = _volunteer!['notes'] ?? '';
    } else if (_user != null) {
      _nameController.text = _user!['full_name'] ?? '';
      _phoneController.text = _user!['phone'] ?? '';
    }
  }

  Future<void> _saveProfile() async {
    if (_volunteer == null) return;
    try {
      final updated = await VolunteerService.updateVolunteer(
        volunteerId: _volunteer!['id'],
        name: _nameController.text.trim(),
        phone: _phoneController.text.trim(),
        role: _roleController.text.trim(),
        availability: _availabilityController.text.trim(),
        notes: _notesController.text.trim(),
      );
      setState(() {
        _volunteer = updated;
        _isEditing = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Profile updated!'),
            backgroundColor: Color(0xFF166534),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Update failed: $e'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _roleController.dispose();
    _availabilityController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: CustomScrollView(
        physics: const BouncingScrollPhysics(),
        slivers: [
          SliverAppBar(
            floating: true,
            backgroundColor: AppColors.stone950.withValues(alpha: 0.8),
            leading: IconButton(
              icon: const Icon(Icons.arrow_back, color: AppColors.stone100),
              onPressed: () => Navigator.pop(context),
            ),
            title: Text(
              'Volunteer Profile',
              style: GoogleFonts.plusJakartaSans(
                fontSize: 20,
                fontWeight: FontWeight.w800,
                color: AppColors.stone100,
                letterSpacing: -0.5,
              ),
            ),
            actions: [
              if (_volunteer != null)
                IconButton(
                  icon: Icon(
                    _isEditing ? Icons.close : Icons.edit,
                    color: AppColors.stone400,
                  ),
                  onPressed: () =>
                      setState(() => _isEditing = !_isEditing),
                ),
              const SizedBox(width: 8),
            ],
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildProfileHero(),
                  const SizedBox(height: 32),
                  if (_volunteer != null) ...[
                    _buildStatusBadge(),
                    const SizedBox(height: 24),
                    _buildStatsRow(),
                    const SizedBox(height: 24),
                    _buildSkillsSection(),
                    const SizedBox(height: 24),
                  ],
                  _buildDetailsSection(),
                  if (_isEditing) ...[
                    const SizedBox(height: 32),
                    _buildSaveButton(),
                  ],
                  const SizedBox(height: 120),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProfileHero() {
    final name = _volunteer?['name'] ?? _user?['full_name'] ?? 'Volunteer';
    final email = _volunteer?['email'] ?? _user?['email'] ?? '';

    return Center(
      child: Column(
        children: [
          Stack(
            clipBehavior: Clip.none,
            children: [
              Container(
                width: 120,
                height: 120,
                decoration: BoxDecoration(
                  color: AppColors.stone800,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.stone700, width: 4),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.black.withValues(alpha: 0.4),
                      blurRadius: 64,
                    ),
                  ],
                ),
                child: Center(
                  child: Text(
                    name.isNotEmpty ? name[0].toUpperCase() : 'V',
                    style: GoogleFonts.plusJakartaSans(
                      fontSize: 48,
                      fontWeight: FontWeight.w800,
                      color: AppColors.primary,
                    ),
                  ),
                ),
              ),
              if (_volunteer?['checked_in'] == true)
                Positioned(
                  bottom: -6,
                  right: -6,
                  child: Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: const Color(0xFF4ADE80),
                      borderRadius: BorderRadius.circular(9999),
                    ),
                    child: Text(
                      'LIVE',
                      style: GoogleFonts.inter(
                        fontSize: 10,
                        fontWeight: FontWeight.w700,
                        color: AppColors.black,
                        letterSpacing: 2.0,
                      ),
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 16),
          Text(
            name,
            style: GoogleFonts.plusJakartaSans(
              fontSize: 28,
              fontWeight: FontWeight.w800,
              color: AppColors.stone50,
              letterSpacing: -1,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            email,
            style: GoogleFonts.inter(fontSize: 14, color: AppColors.stone400),
          ),
        ],
      ),
    );
  }

  Widget _buildStatusBadge() {
    final status = _volunteer!['status'] ?? 'invited';
    Color badgeColor;
    switch (status) {
      case 'active':
        badgeColor = const Color(0xFF4ADE80);
        break;
      case 'accepted':
        badgeColor = AppColors.primary;
        break;
      case 'declined':
        badgeColor = AppColors.error;
        break;
      case 'inactive':
        badgeColor = AppColors.stone500;
        break;
      default:
        badgeColor = const Color(0xFF60A5FA);
    }

    return Center(
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: badgeColor.withValues(alpha: 0.15),
          borderRadius: BorderRadius.circular(9999),
          border: Border.all(color: badgeColor.withValues(alpha: 0.3)),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 8,
              height: 8,
              decoration: BoxDecoration(
                color: badgeColor,
                shape: BoxShape.circle,
              ),
            ),
            const SizedBox(width: 8),
            Text(
              status.toString().toUpperCase(),
              style: GoogleFonts.inter(
                fontSize: 12,
                fontWeight: FontWeight.w700,
                color: badgeColor,
                letterSpacing: 2.0,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatsRow() {
    return Row(
      children: [
        Expanded(
          child: _miniStat(
            _volunteer!['total_tasks_assigned']?.toString() ?? '0',
            'Tasks',
          ),
        ),
        Expanded(
          child: _miniStat(
            _volunteer!['total_tasks_completed']?.toString() ?? '0',
            'Done',
          ),
        ),
        Expanded(
          child: _miniStat(
            '${_volunteer!['total_hours_logged'] ?? 0}h',
            'Hours',
          ),
        ),
      ],
    );
  }

  Widget _miniStat(String value, String label) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 4),
      padding: const EdgeInsets.symmetric(vertical: 16),
      decoration: BoxDecoration(
        color: AppColors.stone900,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.stone800),
      ),
      child: Column(
        children: [
          Text(
            value,
            style: GoogleFonts.plusJakartaSans(
              fontSize: 22,
              fontWeight: FontWeight.w700,
              color: AppColors.white,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            label.toUpperCase(),
            style: GoogleFonts.inter(
              fontSize: 10,
              fontWeight: FontWeight.w600,
              color: AppColors.stone500,
              letterSpacing: 1.5,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSkillsSection() {
    final skills = (_volunteer?['skills'] as List<dynamic>?) ?? [];
    if (skills.isEmpty) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'SKILLS',
          style: GoogleFonts.plusJakartaSans(
            fontSize: 12,
            fontWeight: FontWeight.w800,
            color: AppColors.stone400,
            letterSpacing: 2.0,
          ),
        ),
        const SizedBox(height: 12),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: skills
              .map(
                (skill) => Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(9999),
                    border: Border.all(
                        color: AppColors.primary.withValues(alpha: 0.25)),
                  ),
                  child: Text(
                    skill.toString(),
                    style: GoogleFonts.inter(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: AppColors.primary,
                    ),
                  ),
                ),
              )
              .toList(),
        ),
      ],
    );
  }

  Widget _buildDetailsSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'DETAILS',
          style: GoogleFonts.plusJakartaSans(
            fontSize: 12,
            fontWeight: FontWeight.w800,
            color: AppColors.stone400,
            letterSpacing: 2.0,
          ),
        ),
        const SizedBox(height: 16),
        Container(
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.stone800),
          ),
          clipBehavior: Clip.antiAlias,
          child: Column(
            children: [
              _detailRow(Icons.person_outline, 'Name', _nameController,
                  editable: _isEditing),
              _detailRow(Icons.phone_outlined, 'Phone', _phoneController,
                  editable: _isEditing),
              _detailRow(Icons.badge_outlined, 'Role', _roleController,
                  editable: _isEditing),
              _detailRow(
                  Icons.schedule, 'Availability', _availabilityController,
                  editable: _isEditing),
              _detailRow(Icons.notes, 'Notes', _notesController,
                  editable: _isEditing, isLast: true),
            ],
          ),
        ),
      ],
    );
  }

  Widget _detailRow(
      IconData icon, String label, TextEditingController controller,
      {bool editable = false, bool isLast = false}) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        border: isLast
            ? null
            : Border(
                bottom: BorderSide(
                    color: AppColors.stone800.withValues(alpha: 0.5))),
      ),
      child: Row(
        children: [
          Icon(icon, color: AppColors.stone500, size: 24),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label.toUpperCase(),
                  style: GoogleFonts.inter(
                    fontSize: 10,
                    fontWeight: FontWeight.w600,
                    color: AppColors.stone500,
                    letterSpacing: 1.5,
                  ),
                ),
                const SizedBox(height: 4),
                if (editable)
                  TextField(
                    controller: controller,
                    style: GoogleFonts.inter(
                        fontSize: 14, color: AppColors.stone200),
                    decoration: InputDecoration(
                      isDense: true,
                      contentPadding: EdgeInsets.zero,
                      border: InputBorder.none,
                      hintText: 'Not set',
                      hintStyle: GoogleFonts.inter(
                          fontSize: 14, color: AppColors.stone600),
                    ),
                  )
                else
                  Text(
                    controller.text.isNotEmpty ? controller.text : 'Not set',
                    style: GoogleFonts.inter(
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                      color: controller.text.isNotEmpty
                          ? AppColors.stone200
                          : AppColors.stone600,
                    ),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSaveButton() {
    return GestureDetector(
      onTap: _saveProfile,
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(vertical: 18),
        decoration: BoxDecoration(
          color: AppColors.primary,
          borderRadius: BorderRadius.circular(9999),
          boxShadow: [
            BoxShadow(
              color: AppColors.primary.withValues(alpha: 0.3),
              blurRadius: 24,
              offset: const Offset(0, 8),
            ),
          ],
        ),
        child: Center(
          child: Text(
            'Save Changes',
            style: GoogleFonts.inter(
              fontSize: 16,
              fontWeight: FontWeight.w700,
              color: AppColors.onPrimary,
            ),
          ),
        ),
      ),
    );
  }
}
