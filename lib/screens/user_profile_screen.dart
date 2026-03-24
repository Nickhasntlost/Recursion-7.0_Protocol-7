import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../theme/app_theme.dart';
import 'package:google_fonts/google_fonts.dart';

class UserProfileScreen extends StatelessWidget {
  const UserProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 24),
        child: Column(children: [
          const SizedBox(height: 8),
          _buildProfileHero(),
          const SizedBox(height: 32),
          _buildStatsGrid(),
          const SizedBox(height: 32),
          _buildSettingsSection('Account Settings', [
            _settingsRow(Icons.person_outline, 'Personal Info', trailing: true),
            _settingsRow(Icons.credit_card, 'Payment Methods', trailing: true),
            _settingsRow(Icons.notifications, 'Notification Preferences', trailing: true),
          ]),
          const SizedBox(height: 32),
          _buildSettingsSection('App Preferences', [
            _settingsRow(Icons.translate, 'Language',
                trailingWidget: Text('ENGLISH', style: GoogleFonts.inter(
                    fontSize: 12, fontWeight: FontWeight.w700,
                    color: AppColors.primary, letterSpacing: 2.0))),
            _settingsRow(Icons.dark_mode, 'Dark Mode',
                trailingWidget: _toggle()),
          ]),
          const SizedBox(height: 32),
          _buildSettingsSection('Support', [
            _settingsRow(Icons.help_center, 'Help Center', trailing: true),
            _settingsRow(Icons.mail, 'Contact Us', trailing: true),
          ]),
          const SizedBox(height: 32),
          _buildLogoutButton(),
          const SizedBox(height: 120),
        ]),
      ),
    );
  }

  Widget _buildProfileHero() {
    return Column(children: [
      // Avatar with PRO badge
      Stack(clipBehavior: Clip.none, children: [
        Container(
          width: 128, height: 128,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.stone800, width: 4),
            boxShadow: [BoxShadow(color: AppColors.black.withValues(alpha: 0.4), blurRadius: 64)],
          ),
          clipBehavior: Clip.antiAlias,
          child: CachedNetworkImage(
            imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Ranbir_Kapoor_promoting_Brahmastra.jpg/800px-Ranbir_Kapoor_promoting_Brahmastra.jpg',
            fit: BoxFit.cover,
          ),
        ),
        Positioned(
          bottom: -8, right: -8,
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
            decoration: BoxDecoration(
              color: AppColors.primary, borderRadius: BorderRadius.circular(9999)),
            child: Text('PRO', style: GoogleFonts.inter(
                fontSize: 10, fontWeight: FontWeight.w700,
                color: AppColors.onPrimary, letterSpacing: 2.0)),
          ),
        ),
      ]),
      const SizedBox(height: 16),
      Text('Rahul Sharma', style: GoogleFonts.plusJakartaSans(
          fontSize: 28, fontWeight: FontWeight.w800,
          color: AppColors.stone50, letterSpacing: -1)),
      const SizedBox(height: 4),
      Text('rahul@utsova.io', style: GoogleFonts.inter(
          fontSize: 14, color: AppColors.stone400)),
    ]);
  }

  Widget _buildStatsGrid() {
    return Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
      // Events square
      Expanded(
        child: Container(
          height: 160, padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: AppColors.surface, borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.stone800)),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Icon(Icons.event, color: AppColors.primary),
              Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text('12', style: GoogleFonts.plusJakartaSans(
                    fontSize: 28, fontWeight: FontWeight.w700, color: AppColors.stone50)),
                Text('EVENTS', style: GoogleFonts.inter(
                    fontSize: 10, color: AppColors.stone400, letterSpacing: 2.0)),
              ]),
            ],
          ),
        ),
      ),
      const SizedBox(width: 16),
      // Right column
      Expanded(
        child: Column(children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.primary, borderRadius: BorderRadius.circular(16)),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text('4', style: GoogleFonts.plusJakartaSans(
                  fontSize: 20, fontWeight: FontWeight.w700, color: AppColors.onPrimary)),
              Text('TASKS', style: GoogleFonts.inter(
                  fontSize: 10, fontWeight: FontWeight.w600,
                  color: AppColors.onPrimary, letterSpacing: 2.0)),
            ]),
          ),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.stone800, borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.stone700)),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text('Premium Member', style: GoogleFonts.plusJakartaSans(
                  fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.stone50)),
              const SizedBox(height: 2),
              Text('SINCE 2024', style: GoogleFonts.inter(
                  fontSize: 10, color: AppColors.stone400, letterSpacing: 2.0)),
            ]),
          ),
        ]),
      ),
    ]);
  }

  Widget _buildSettingsSection(String title, List<Widget> items) {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Padding(
        padding: const EdgeInsets.symmetric(horizontal: 8),
        child: Text(title.toUpperCase(), style: GoogleFonts.plusJakartaSans(
            fontSize: 12, fontWeight: FontWeight.w800,
            color: AppColors.stone400, letterSpacing: 2.0)),
      ),
      const SizedBox(height: 16),
      Container(
        decoration: BoxDecoration(
          color: AppColors.surface, borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.stone800),
          boxShadow: [BoxShadow(color: AppColors.black.withValues(alpha: 0.4), blurRadius: 64)],
        ),
        clipBehavior: Clip.antiAlias,
        child: Column(children: items),
      ),
    ]);
  }

  Widget _settingsRow(IconData icon, String label,
      {bool trailing = false, Widget? trailingWidget}) {
    return InkWell(
      onTap: () {
        // Dummy action
      },
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          border: Border(bottom: BorderSide(color: AppColors.stone800.withValues(alpha: 0.5)))),
        child: Row(children: [
          Icon(icon, color: AppColors.stone500, size: 24),
          const SizedBox(width: 16),
          Expanded(child: Text(label, style: GoogleFonts.inter(
              fontSize: 14, fontWeight: FontWeight.w500, color: AppColors.stone200))),
          if (trailingWidget != null) trailingWidget,
          if (trailing) const Icon(Icons.chevron_right, color: AppColors.stone600, size: 20),
        ]),
      ),
    );
  }

  Widget _toggle() {
    return GestureDetector(
      onTap: () {
        // Dummy action for toggle
      },
      child: Container(
        width: 48, height: 24,
        padding: const EdgeInsets.all(4),
        decoration: BoxDecoration(
          color: AppColors.primary, borderRadius: BorderRadius.circular(9999)),
        alignment: Alignment.centerRight,
        child: Container(width: 16, height: 16,
            decoration: const BoxDecoration(
                color: AppColors.onPrimary, shape: BoxShape.circle)),
      ),
    );
  }

  Widget _buildLogoutButton() {
    return InkWell(
      onTap: () {
        // Dummy action
      },
      borderRadius: BorderRadius.circular(16),
      child: Container(
        width: double.infinity, padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: AppColors.errorContainer.withValues(alpha: 0.2),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.error.withValues(alpha: 0.2))),
        child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
          const Icon(Icons.logout, color: AppColors.error),
          const SizedBox(width: 12),
          Text('LOG OUT', style: GoogleFonts.plusJakartaSans(
              fontSize: 14, fontWeight: FontWeight.w700,
              color: AppColors.error, letterSpacing: 2.0)),
        ]),
      ),
    );
  }
}
