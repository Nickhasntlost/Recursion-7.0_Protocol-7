import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../theme/app_theme.dart';
import 'package:google_fonts/google_fonts.dart';

class AdminDashboardScreen extends StatelessWidget {
  const AdminDashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 24),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          // Header
          Text('CONTROL CENTER', style: GoogleFonts.inter(
              fontSize: 14, fontWeight: FontWeight.w500,
              color: AppColors.primary, letterSpacing: 3.0)),
          const SizedBox(height: 4),
          Text('Admin Dashboard', style: GoogleFonts.plusJakartaSans(
              fontSize: 36, fontWeight: FontWeight.w800,
              color: AppColors.white, letterSpacing: -1)),
          const SizedBox(height: 24),
          _buildStatsGrid(),
          const SizedBox(height: 32),
          _buildChartSection(),
          const SizedBox(height: 32),
          _buildLiveFeed(),
          const SizedBox(height: 32),
          _buildTasksSection(),
          const SizedBox(height: 120),
        ]),
      ),
    );
  }

  Widget _buildStatsGrid() {
    return Column(children: [
      Row(children: [
        Expanded(child: _statCard(Icons.event_available, '24', 'Active Events')),
        const SizedBox(width: 16),
        Expanded(child: _statCard(Icons.groups, '142', 'Volunteers')),
      ]),
      const SizedBox(height: 16),
      Row(children: [
        Expanded(child: _statCard(Icons.pending_actions, '08', 'Pending Tasks')),
        const SizedBox(width: 16),
        Expanded(child: _statCard(Icons.confirmation_number, '3.2k', 'Live Tickets')),
      ]),
    ]);
  }

  Widget _statCard(IconData icon, String value, String label) {
    return Container(
      height: 160, padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
          color: AppColors.stone900, borderRadius: BorderRadius.circular(16)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Icon(icon, color: AppColors.primary, size: 28),
          Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(value, style: GoogleFonts.plusJakartaSans(
                fontSize: 28, fontWeight: FontWeight.w700, color: AppColors.white)),
            Text(label.toUpperCase(), style: GoogleFonts.inter(
                fontSize: 10, fontWeight: FontWeight.w500,
                color: AppColors.stone400, letterSpacing: 1.5)),
          ]),
        ],
      ),
    );
  }

  Widget _buildChartSection() {
    return Container(
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(
          color: AppColors.stone900, borderRadius: BorderRadius.circular(16)),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
          Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('Attendee Entry', style: GoogleFonts.plusJakartaSans(
                fontSize: 20, fontWeight: FontWeight.w700, color: AppColors.white)),
            Text('Live flow tracking across all gates',
                style: GoogleFonts.inter(fontSize: 14, color: AppColors.stone400)),
          ]),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
            decoration: BoxDecoration(
                color: AppColors.primary, borderRadius: BorderRadius.circular(9999)),
            child: Text('LIVE', style: GoogleFonts.inter(
                fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.black)),
          ),
        ]),
        const SizedBox(height: 24),
        // Bar chart
        SizedBox(
          height: 200,
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [0.2, 0.35, 0.25, 0.5, 0.7, 0.6, 0.85, 0.95, 0.65, 0.4, 0.3, 0.55]
                .asMap().entries.map((e) {
              final isHighlight = e.key == 7;
              return Expanded(
                child: Container(
                  margin: const EdgeInsets.symmetric(horizontal: 2),
                  height: 200 * e.value,
                  decoration: BoxDecoration(
                    color: isHighlight ? AppColors.primary : AppColors.white.withValues(alpha: 0.1),
                    borderRadius: const BorderRadius.only(
                        topLeft: Radius.circular(2), topRight: Radius.circular(2)),
                    boxShadow: isHighlight ? [BoxShadow(
                        color: AppColors.primary.withValues(alpha: 0.3), blurRadius: 20)] : null,
                  ),
                ),
              );
            }).toList(),
          ),
        ),
        const SizedBox(height: 8),
        Container(
          padding: const EdgeInsets.only(top: 8),
          decoration: const BoxDecoration(border: Border(top: BorderSide(color: AppColors.stone800))),
          child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
            for (final t in ['08:00 AM', '12:00 PM', '04:00 PM', '08:00 PM'])
              Text(t, style: GoogleFonts.inter(
                  fontSize: 10, color: AppColors.stone500, letterSpacing: -0.2)),
          ]),
        ),
      ]),
    );
  }

  Widget _buildLiveFeed() {
    return Container(
      height: 400, padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
          color: AppColors.stone900, borderRadius: BorderRadius.circular(16)),
      child: Column(children: [
        Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
          Row(children: [
            Container(width: 8, height: 8,
                decoration: BoxDecoration(color: Colors.red.shade400, shape: BoxShape.circle)),
            const SizedBox(width: 8),
            Text('LIVE FEED', style: GoogleFonts.inter(
                fontSize: 12, fontWeight: FontWeight.w700,
                color: AppColors.white, letterSpacing: 2.0)),
          ]),
          GestureDetector(
            onTap: () {
              // Dummy action
            },
            child: Text('Clear', style: GoogleFonts.inter(
                fontSize: 12, fontWeight: FontWeight.w700,
                color: AppColors.stone400, decoration: TextDecoration.underline)),
          ),
        ]),
        const SizedBox(height: 24),
        Expanded(
          child: ListView(children: [
            _feedItem(Icons.person_pin, AppColors.primary,
                'Volunteer Checked In', 'Neha Sharma @ Main Gate', '2 mins ago'),
            const SizedBox(height: 16),
            _feedItemUrgent(),
            const SizedBox(height: 16),
            _feedItem(Icons.schedule, AppColors.primary,
                'Event Start - 5 mins', 'Keynote: Future of Design', '8 mins ago'),
            const SizedBox(height: 16),
            _feedItem(Icons.confirmation_number, AppColors.primary,
                'Sold Out', 'VIP passes for Day 2', '12 mins ago'),
          ]),
        ),
      ]),
    );
  }

  Widget _feedItem(IconData icon, Color color, String title, String sub, String time) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
          color: AppColors.stone800, borderRadius: BorderRadius.circular(12)),
      child: Row(children: [
        Icon(icon, color: color),
        const SizedBox(width: 16),
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(title, style: GoogleFonts.inter(
              fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.white)),
          Text(sub, style: GoogleFonts.inter(fontSize: 12, color: AppColors.stone400)),
          const SizedBox(height: 4),
          Text(time, style: GoogleFonts.inter(fontSize: 10, color: AppColors.stone500)),
        ])),
      ]),
    );
  }

  Widget _feedItemUrgent() {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
          color: const Color(0xFF450A0A).withValues(alpha: 0.3),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.red.shade500.withValues(alpha: 0.2))),
      child: Row(children: [
        Icon(Icons.warning, color: Colors.red.shade400),
        const SizedBox(width: 16),
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text('Urgent Support at Gate B', style: GoogleFonts.inter(
              fontSize: 14, fontWeight: FontWeight.w700, color: Colors.red.shade200)),
          Text('Scanner malfunction reported',
              style: GoogleFonts.inter(fontSize: 12, color: Colors.red.shade300.withValues(alpha: 0.8))),
          const SizedBox(height: 4),
          Text('5 mins ago',
              style: GoogleFonts.inter(fontSize: 10, color: Colors.red.shade400.withValues(alpha: 0.6))),
        ])),
      ]),
    );
  }

  Widget _buildTasksSection() {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
        Text('Assigned Tasks', style: GoogleFonts.plusJakartaSans(
            fontSize: 24, fontWeight: FontWeight.w800,
            color: AppColors.white, letterSpacing: -0.5)),
        GestureDetector(
          onTap: () {
            // Dummy action
          },
          child: Row(children: [
            Text('Manage All', style: GoogleFonts.inter(
                fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.primary)),
            const SizedBox(width: 4),
            const Icon(Icons.arrow_forward, color: AppColors.primary, size: 14),
          ]),
        ),
      ]),
      const SizedBox(height: 24),
      Container(
        decoration: BoxDecoration(
            color: AppColors.stone900, borderRadius: BorderRadius.circular(16)),
        child: Column(children: [
          _taskRow('Check-in Desk A', 'Terminal 2 Lobby', Icons.desk,
              'Deepika Padukone',
              'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Deepika_Padukone_Cannes_2018.jpg/800px-Deepika_Padukone_Cannes_2018.jpg',
              'IN PROGRESS', '00:42:15', true),
          _taskRow('Stage Setup', 'Main Ballroom', Icons.layers,
              'Rahul Verma',
              'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Ranbir_Kapoor_promoting_Brahmastra.jpg/800px-Ranbir_Kapoor_promoting_Brahmastra.jpg',
              'COMPLETED', '--:--:--', false),
          _taskRow('Catering Logistics', 'Staff Lounge', Icons.restaurant,
              "Amit Singh",
              'https://upload.wikimedia.org/wikipedia/commons/7/76/Karan_Aujla_2020.jpg',
              'IN PROGRESS', '01:12:08', true),
        ]),
      ),
    ]);
  }

  Widget _taskRow(String task, String loc, IconData icon,
      String person, String avatar, String status, String time, bool isActive) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
          border: Border(bottom: BorderSide(color: AppColors.stone800.withValues(alpha: 0.5)))),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Top: Icon + Task + Status
          Row(children: [
            Container(
              width: 40, height: 40,
              decoration: const BoxDecoration(color: AppColors.primary, shape: BoxShape.circle),
              child: Icon(icon, color: AppColors.black, size: 18),
            ),
            const SizedBox(width: 12),
            Expanded(child: Text(task, style: GoogleFonts.inter(
                fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.white))),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
              decoration: BoxDecoration(
                  color: status == 'COMPLETED' ? AppColors.primary : AppColors.stone800,
                  borderRadius: BorderRadius.circular(9999)),
              child: Text(status, style: GoogleFonts.inter(
                  fontSize: 10, fontWeight: FontWeight.w700,
                  color: status == 'COMPLETED' ? AppColors.black : AppColors.stone400)),
            ),
          ]),
          const SizedBox(height: 10),
          // Bottom: Location + Person + Time
          Padding(
            padding: const EdgeInsets.only(left: 52),
            child: Row(children: [
              const Icon(Icons.location_on, size: 14, color: AppColors.stone500),
              const SizedBox(width: 4),
              Text(loc, style: GoogleFonts.inter(fontSize: 12, color: AppColors.stone400)),
              const Spacer(),
              Container(
                width: 20, height: 20,
                decoration: const BoxDecoration(shape: BoxShape.circle),
                clipBehavior: Clip.antiAlias,
                child: CachedNetworkImage(imageUrl: avatar, fit: BoxFit.cover),
              ),
              const SizedBox(width: 6),
              Text(person, style: GoogleFonts.inter(
                  fontSize: 11, color: AppColors.stone300)),
            ]),
          ),
          if (isActive)
            Padding(
              padding: const EdgeInsets.only(left: 52, top: 6),
              child: Row(children: [
                const Icon(Icons.timer, size: 14, color: AppColors.primary),
                const SizedBox(width: 4),
                Text(time, style: GoogleFonts.inter(
                    fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.primary)),
              ]),
            ),
        ],
      ),
    );
  }
}
