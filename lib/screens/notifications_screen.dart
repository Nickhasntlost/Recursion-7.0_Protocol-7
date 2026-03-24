import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import 'package:google_fonts/google_fonts.dart';

class NotificationsScreen extends StatelessWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 8),
            Text('Notifications',
                style: GoogleFonts.plusJakartaSans(
                    fontSize: 48, fontWeight: FontWeight.w800,
                    color: AppColors.white, letterSpacing: -2)),
            const SizedBox(height: 8),
            Text('Your curated updates for today.',
                style: GoogleFonts.inter(
                    fontSize: 14, fontWeight: FontWeight.w500,
                    color: AppColors.stone400)),
            const SizedBox(height: 24),
            _buildTabStrip(),
            const SizedBox(height: 32),
            _notifItem(Icons.event_available, AppColors.primary, AppColors.black,
                'Event Starting Soon: Utsova 2024 starts in 30 mins',
                '2 MINS AGO', true),
            const SizedBox(height: 16),
            _notifItem(Icons.assignment, AppColors.neutral800, AppColors.stone100,
                'New Task Assigned: Setup Stage B for Jazz Night',
                '15 MINS AGO', false),
            const SizedBox(height: 16),
            _notifItem(Icons.hourglass_top, AppColors.neutral800, AppColors.stone100,
                "Waitlist Update: You've moved to #3 for Noir Supper Club",
                '1 HOUR AGO', true),
            const SizedBox(height: 32),
            _buildBentoGrid(),
            const SizedBox(height: 120),
          ],
        ),
      ),
    );
  }

  Widget _buildTabStrip() {
    return Row(children: [
      _tabChip('All', true),
      const SizedBox(width: 8),
      _tabChip('Events', false),
      const SizedBox(width: 8),
      _tabChip('Tasks', false),
    ]);
  }

  Widget _tabChip(String label, bool active) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 10),
      decoration: BoxDecoration(
        color: active ? AppColors.primary : AppColors.neutral900,
        borderRadius: BorderRadius.circular(9999),
      ),
      child: Text(label,
          style: GoogleFonts.inter(
              fontSize: 14,
              fontWeight: active ? FontWeight.w700 : FontWeight.w600,
              color: active ? AppColors.onPrimary : AppColors.stone100)),
    );
  }

  Widget _notifItem(IconData icon, Color iconBg, Color iconColor,
      String title, String time, bool unread) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.neutral900,
        borderRadius: BorderRadius.circular(24),
      ),
      child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Container(
          width: 48, height: 48,
          decoration: BoxDecoration(color: iconBg, borderRadius: BorderRadius.circular(16)),
          child: Icon(icon, color: iconColor, size: 24),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(title, style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w700,
                color: AppColors.stone100, height: 1.3)),
            const SizedBox(height: 4),
            Text(time, style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600,
                color: AppColors.stone500, letterSpacing: 2.0)),
          ]),
        ),
        if (unread)
          Container(width: 8, height: 8, margin: const EdgeInsets.only(top: 8),
              decoration: const BoxDecoration(color: AppColors.primary, shape: BoxShape.circle)),
      ]),
    );
  }

  Widget _buildBentoGrid() {
    return Row(children: [
      Expanded(
        child: Container(
          height: 180, padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
              color: const Color(0xFFF5F5F5), borderRadius: BorderRadius.circular(16)),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Icon(Icons.auto_awesome, size: 36, color: AppColors.black),
              Text('Weekly Wrap-up is ready',
                  style: GoogleFonts.plusJakartaSans(fontSize: 20, fontWeight: FontWeight.w700,
                      color: AppColors.black, height: 1.2)),
            ],
          ),
        ),
      ),
      const SizedBox(width: 16),
      Expanded(
        child: Container(
          height: 180, padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
              color: AppColors.primary, borderRadius: BorderRadius.circular(16)),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Icon(Icons.celebration, size: 36, color: AppColors.black),
              Text('Top Contributor Badge earned',
                  style: GoogleFonts.plusJakartaSans(fontSize: 20, fontWeight: FontWeight.w700,
                      color: AppColors.black, height: 1.2)),
            ],
          ),
        ),
      ),
    ]);
  }
}
