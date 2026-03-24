import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_theme.dart';
import '../services/event_service.dart';
import '../services/volunteer_service.dart';
import '../services/auth_service.dart';
import 'volunteer_task_list_screen.dart';
import 'volunteer_profile_screen.dart';
import 'volunteer_live_chat_screen.dart';

class VolunteerDashboardScreen extends StatefulWidget {
  const VolunteerDashboardScreen({super.key});

  @override
  State<VolunteerDashboardScreen> createState() =>
      _VolunteerDashboardScreenState();
}

class _VolunteerDashboardScreenState extends State<VolunteerDashboardScreen> {
  bool _isLoading = true;
  Map<String, dynamic>? _user;
  List<dynamic> _events = [];
  Map<String, dynamic>? _volunteerData; // current volunteer record
  String? _activeEventId;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    try {
      _user = await AuthService.getCachedUser();
      _events = await EventService.getEvents();

      // Try to find volunteer records for this user across events
      if (_events.isNotEmpty) {
        _activeEventId = _events[0]['id'] as String?;
        if (_activeEventId != null) {
          try {
            final volunteers =
                await VolunteerService.getEventVolunteers(_activeEventId!);
            // Find this user's volunteer record by email match
            if (_user != null) {
              for (final v in volunteers) {
                if (v['email'] == _user!['email']) {
                  _volunteerData = v as Map<String, dynamic>;
                  break;
                }
              }
            }
          } catch (_) {
            // Not a volunteer for this event
          }
        }
      }
    } catch (e) {
      // Handle errors silently, show empty state
    }
    if (mounted) setState(() => _isLoading = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: Stack(
        children: [
          CustomScrollView(
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
                  'Volunteer Hub',
                  style: GoogleFonts.plusJakartaSans(
                    fontSize: 20,
                    fontWeight: FontWeight.w800,
                    color: AppColors.stone100,
                    letterSpacing: -0.5,
                  ),
                ),
                actions: [
                  IconButton(
                    icon: const Icon(Icons.refresh, color: AppColors.stone400),
                    onPressed: _loadData,
                  ),
                  const SizedBox(width: 8),
                ],
              ),
              SliverToBoxAdapter(
                child: _isLoading
                    ? const Padding(
                        padding: EdgeInsets.all(64),
                        child: Center(
                          child: CircularProgressIndicator(
                              color: AppColors.primary),
                        ),
                      )
                    : Padding(
                        padding: const EdgeInsets.all(24),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            _buildWelcomeHeader(),
                            const SizedBox(height: 28),
                            _buildStatsGrid(),
                            const SizedBox(height: 28),
                            _buildCheckInCard(),
                            const SizedBox(height: 28),
                            _buildQuickActions(),
                            const SizedBox(height: 28),
                            _buildUpcomingEvents(),
                            const SizedBox(height: 120),
                          ],
                        ),
                      ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildWelcomeHeader() {
    final name = _user?['full_name'] ?? 'Volunteer';
    final role = _volunteerData?['role'] ?? 'Volunteer';
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Welcome back,',
          style: GoogleFonts.inter(
              fontSize: 14, color: AppColors.stone400, height: 1.5),
        ),
        Text(
          name,
          style: GoogleFonts.plusJakartaSans(
            fontSize: 32,
            fontWeight: FontWeight.w800,
            color: AppColors.stone50,
            letterSpacing: -1,
          ),
        ),
        const SizedBox(height: 8),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
          decoration: BoxDecoration(
            color: AppColors.primary,
            borderRadius: BorderRadius.circular(9999),
          ),
          child: Text(
            role.toString().toUpperCase(),
            style: GoogleFonts.inter(
              fontSize: 10,
              fontWeight: FontWeight.w700,
              color: AppColors.onPrimary,
              letterSpacing: 2.0,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildStatsGrid() {
    final tasksAssigned =
        _volunteerData?['total_tasks_assigned']?.toString() ?? '0';
    final tasksCompleted =
        _volunteerData?['total_tasks_completed']?.toString() ?? '0';
    final hoursLogged =
        _volunteerData?['total_hours_logged']?.toString() ?? '0';

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'YOUR STATS',
          style: GoogleFonts.plusJakartaSans(
            fontSize: 12,
            fontWeight: FontWeight.w800,
            color: AppColors.stone400,
            letterSpacing: 2.0,
          ),
        ),
        const SizedBox(height: 16),
        Row(
          children: [
            Expanded(
              child: _statCard(
                icon: Icons.assignment,
                value: tasksAssigned,
                label: 'ASSIGNED',
                color: AppColors.primary,
                isHighlighted: true,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _statCard(
                icon: Icons.check_circle,
                value: tasksCompleted,
                label: 'COMPLETED',
                color: const Color(0xFF4ADE80),
                isHighlighted: false,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _statCard(
                icon: Icons.schedule,
                value: '${hoursLogged}h',
                label: 'HOURS',
                color: const Color(0xFF60A5FA),
                isHighlighted: false,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _statCard({
    required IconData icon,
    required String value,
    required String label,
    required Color color,
    required bool isHighlighted,
  }) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: isHighlighted ? AppColors.primary : AppColors.stone900,
        borderRadius: BorderRadius.circular(16),
        border: isHighlighted
            ? null
            : Border.all(color: AppColors.stone800),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon,
              size: 20,
              color:
                  isHighlighted ? AppColors.onPrimary : color),
          const SizedBox(height: 12),
          Text(
            value,
            style: GoogleFonts.plusJakartaSans(
              fontSize: 28,
              fontWeight: FontWeight.w700,
              color: isHighlighted
                  ? AppColors.onPrimary
                  : AppColors.stone50,
            ),
          ),
          Text(
            label,
            style: GoogleFonts.inter(
              fontSize: 10,
              fontWeight: FontWeight.w600,
              color: isHighlighted
                  ? AppColors.onPrimary.withValues(alpha: 0.7)
                  : AppColors.stone500,
              letterSpacing: 1.5,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCheckInCard() {
    final isCheckedIn = _volunteerData?['checked_in'] == true;
    final status = _volunteerData?['status'] ?? 'invited';

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: isCheckedIn
              ? [const Color(0xFF166534), const Color(0xFF14532D)]
              : [AppColors.stone900, AppColors.stone800],
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color:
              isCheckedIn ? const Color(0xFF4ADE80).withValues(alpha: 0.3) : AppColors.stone700,
        ),
      ),
      child: Row(
        children: [
          Container(
            width: 56,
            height: 56,
            decoration: BoxDecoration(
              color: isCheckedIn
                  ? const Color(0xFF4ADE80).withValues(alpha: 0.2)
                  : AppColors.stone800,
              shape: BoxShape.circle,
            ),
            child: Icon(
              isCheckedIn ? Icons.check_circle : Icons.login,
              color: isCheckedIn
                  ? const Color(0xFF4ADE80)
                  : AppColors.stone400,
              size: 28,
            ),
          ),
          const SizedBox(width: 20),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  isCheckedIn ? 'Checked In' : 'Not Checked In',
                  style: GoogleFonts.plusJakartaSans(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    color: AppColors.white,
                  ),
                ),
                const SizedBox(height: 4),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                    color: AppColors.white.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(9999),
                  ),
                  child: Text(
                    status.toString().toUpperCase(),
                    style: GoogleFonts.inter(
                      fontSize: 10,
                      fontWeight: FontWeight.w700,
                      color: AppColors.stone300,
                      letterSpacing: 1.5,
                    ),
                  ),
                ),
              ],
            ),
          ),
          if (_volunteerData != null)
            GestureDetector(
              onTap: () => _toggleCheckIn(),
              child: Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                decoration: BoxDecoration(
                  color: isCheckedIn ? AppColors.error : AppColors.primary,
                  borderRadius: BorderRadius.circular(9999),
                ),
                child: Text(
                  isCheckedIn ? 'Check Out' : 'Check In',
                  style: GoogleFonts.inter(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: isCheckedIn ? AppColors.white : AppColors.onPrimary,
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }

  Future<void> _toggleCheckIn() async {
    if (_volunteerData == null) return;
    final volunteerId = _volunteerData!['id'] as String;
    final isCheckedIn = _volunteerData!['checked_in'] == true;

    try {
      await VolunteerService.checkIn(
        volunteerId: volunteerId,
        checkIn: !isCheckedIn,
      );
      setState(() {
        _volunteerData!['checked_in'] = !isCheckedIn;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
                isCheckedIn ? 'Checked out successfully' : 'Checked in successfully'),
            backgroundColor: isCheckedIn ? AppColors.stone700 : const Color(0xFF166534),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed: $e'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }

  Widget _buildQuickActions() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'QUICK ACTIONS',
          style: GoogleFonts.plusJakartaSans(
            fontSize: 12,
            fontWeight: FontWeight.w800,
            color: AppColors.stone400,
            letterSpacing: 2.0,
          ),
        ),
        const SizedBox(height: 16),
        Row(
          children: [
            Expanded(
              child: _quickActionCard(
                icon: Icons.assignment_turned_in,
                label: 'My Tasks',
                onTap: () {
                  if (_activeEventId != null) {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => VolunteerTaskListScreen(
                          eventId: _activeEventId!,
                          volunteerName:
                              _volunteerData?['name'] ?? _user?['full_name'] ?? '',
                        ),
                      ),
                    );
                  }
                },
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: _quickActionCard(
                icon: Icons.person,
                label: 'My Profile',
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => VolunteerProfileScreen(
                        volunteerData: _volunteerData,
                      ),
                    ),
                  );
                },
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: _quickActionCard(
                icon: Icons.chat_bubble,
                label: 'Live Chat',
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => const VolunteerLiveChatScreen(),
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _quickActionCard({
    required IconData icon,
    required String label,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.stone800),
        ),
        child: Column(
          children: [
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: AppColors.stone800,
                shape: BoxShape.circle,
              ),
              child: Icon(icon, color: AppColors.primary, size: 24),
            ),
            const SizedBox(height: 12),
            Text(
              label,
              style: GoogleFonts.inter(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: AppColors.stone200,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildUpcomingEvents() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'AVAILABLE EVENTS',
          style: GoogleFonts.plusJakartaSans(
            fontSize: 12,
            fontWeight: FontWeight.w800,
            color: AppColors.stone400,
            letterSpacing: 2.0,
          ),
        ),
        const SizedBox(height: 16),
        if (_events.isEmpty)
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(32),
            decoration: BoxDecoration(
              color: AppColors.stone900,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.stone800),
            ),
            child: Column(
              children: [
                const Icon(Icons.event_busy,
                    color: AppColors.stone600, size: 48),
                const SizedBox(height: 12),
                Text(
                  'No events available',
                  style: GoogleFonts.inter(
                      fontSize: 14, color: AppColors.stone500),
                ),
              ],
            ),
          )
        else
          ...List.generate(
            _events.length > 5 ? 5 : _events.length,
            (i) => Padding(
              padding: EdgeInsets.only(bottom: i < _events.length - 1 ? 12 : 0),
              child: _eventCard(_events[i] as Map<String, dynamic>),
            ),
          ),
      ],
    );
  }

  Widget _eventCard(Map<String, dynamic> event) {
    final title = event['title'] ?? 'Untitled Event';
    final category = (event['category'] ?? '').toString().toUpperCase();
    final startDate = event['start_datetime'] ?? '';
    final status = event['status'] ?? 'draft';

    return GestureDetector(
      onTap: () {
        setState(() => _activeEventId = event['id'] as String?);
        _loadData();
      },
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: _activeEventId == event['id']
              ? AppColors.primary.withValues(alpha: 0.1)
              : AppColors.stone900,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: _activeEventId == event['id']
                ? AppColors.primary.withValues(alpha: 0.4)
                : AppColors.stone800,
          ),
        ),
        child: Row(
          children: [
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: _activeEventId == event['id']
                    ? AppColors.primary
                    : AppColors.stone800,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(
                Icons.event,
                color: _activeEventId == event['id']
                    ? AppColors.onPrimary
                    : AppColors.stone500,
                size: 24,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: GoogleFonts.plusJakartaSans(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                      color: AppColors.white,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          color: AppColors.primary.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(9999),
                        ),
                        child: Text(
                          category,
                          style: GoogleFonts.inter(
                            fontSize: 10,
                            fontWeight: FontWeight.w700,
                            color: AppColors.primary,
                            letterSpacing: 1.0,
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        startDate.toString().substring(0, 10),
                        style: GoogleFonts.inter(
                            fontSize: 12, color: AppColors.stone500),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            Icon(
              Icons.chevron_right,
              color: AppColors.stone600,
              size: 20,
            ),
          ],
        ),
      ),
    );
  }
}
