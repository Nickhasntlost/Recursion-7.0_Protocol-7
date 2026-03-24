import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../theme/app_theme.dart';
import '../services/auth_service.dart';
import '../services/volunteer_service.dart';
import '../services/event_service.dart';
import 'volunteer_profile_screen.dart';
import 'volunteer_task_list_screen.dart';
import 'event_detail_screen.dart';
import 'volunteer_live_chat_screen.dart';

class VolunteerHubScreen extends StatefulWidget {
  const VolunteerHubScreen({super.key});

  @override
  State<VolunteerHubScreen> createState() => _VolunteerHubScreenState();
}

class _VolunteerHubScreenState extends State<VolunteerHubScreen> {
  bool _isLoading = true;
  Map<String, dynamic>? _user;
  Map<String, dynamic>? _volunteerData;
  List<dynamic> _recentTasks = [];
  List<dynamic> _events = [];
  String? _activeEventId;

  // Swipe to check in
  double _dragPosition = 0.0;
  bool _isCheckingIn = false;

  // Top Notification
  bool _showNotification = false;
  String _notificationMessage = '';
  bool _notificationIsSuccess = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  void _showTopNotification(String message, {bool isSuccess = true}) {
    if (!mounted) return;
    setState(() {
      _notificationMessage = message;
      _notificationIsSuccess = isSuccess;
      _showNotification = true;
    });

    Future.delayed(const Duration(seconds: 3), () {
      if (mounted) {
        setState(() => _showNotification = false);
      }
    });
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    try {
      _user = await AuthService.getCachedUser();
      
      // Load all events (restoring this feature)
      _events = await EventService.getEvents();
      
      // Prepend high-quality Indian events to demonstrate professional UI
      final mockEvents = [
        {
          'id': 'mock-1',
          'title': 'Sunburn Arena ft. Alan Walker',
          'category': 'MUSIC & LIVE',
          'start_datetime': '2025-04-18',
          'location': 'Mahalaxmi Race Course',
          'city': 'Mumbai, India',
          'description': 'Experience the biggest EDM festival hitting Mumbai. Join thousands of fans for Alan Walker’s spectacular Walkerworld tour featuring incredible lasers, visuals, and beats.'
        },
        {
          'id': 'mock-2',
          'title': 'Lollapalooza India 2025',
          'category': 'FESTIVAL',
          'start_datetime': '2025-01-26',
          'location': 'Mahalaxmi Race Course',
          'city': 'Mumbai, India',
          'description': 'The iconic global music festival returns to India for its 3rd edition. Two days of music, art, and food across 4 stages with global headliners and homegrown artists.'
        },
        {
          'id': 'mock-3',
          'title': 'NH7 Weekender 2024',
          'category': 'FESTIVAL',
          'start_datetime': '2024-12-14',
          'location': 'Teerth Fields',
          'city': 'Pune, India',
          'description': 'The happiest music festival is back! Expect an eclectic mix of indie, rock, metal, and hip-hop acts, vibrant flea markets, and an unforgettable weekend in Pune.'
        },
        {
          'id': 'mock-4',
          'title': 'Comic Con India',
          'category': 'EXHIBITION',
          'start_datetime': '2025-05-02',
          'location': 'KTPO Trade Center',
          'city': 'Bengaluru, India',
          'description': 'India’s greatest pop-culture experience. Meet comic creators, check out amazing cosplay, grab exclusive merch, and enjoy special gaming arenas.'
        },
        {
          'id': 'mock-5',
          'title': 'Zomaland by Zomato',
          'category': 'FOOD',
          'start_datetime': '2025-02-10',
          'location': 'JLN Stadium',
          'city': 'New Delhi, India',
          'description': 'India’s grandest food and entertainment carnival. Discover incredibly diverse food stalls, amazing live band performances, and fun carnival games for all ages.'
        },
      ];
      
      _events.insertAll(0, mockEvents);

      if (_events.isNotEmpty) {
        _activeEventId ??= _events[0]['id'];
        if (_activeEventId != null) {
          try {
            final volunteers = await VolunteerService.getEventVolunteers(_activeEventId!);
            if (_user != null) {
              for (final v in volunteers) {
                if (v['email'] == _user!['email']) {
                  _volunteerData = v as Map<String, dynamic>;
                  break;
                }
              }
            }
          } catch (_) {
            // Might not be a volunteer for this specific event
            _volunteerData = null;
          }
        }
      }

      // Mock recent tasks for the pouch display
      _recentTasks = [
        {'title': 'Stage Setup - Sunburn Arena', 'status': 'completed', 'amount': 500, 'date': 'Today'},
        {'title': 'Artist Hospitality - Lollapalooza', 'status': 'completed', 'amount': 500, 'date': 'Yesterday'},
      ];

    } catch (e) {
      // Ignore errors for now
    }
    if (mounted) setState(() => _isLoading = false);
  }

  Future<void> _handleCheckIn() async {
    if (_volunteerData == null) return;
    
    setState(() => _isCheckingIn = true);

    // Simulate location fetch & check-in API call
    _showTopNotification('Fetching current location...', isSuccess: true);
    
    await Future.delayed(const Duration(seconds: 2));

    try {
      final isCheckedIn = _volunteerData!['checked_in'] == true;
      await VolunteerService.checkIn(
        volunteerId: _volunteerData!['id'],
        checkIn: !isCheckedIn,
      );
      
      setState(() {
        _volunteerData!['checked_in'] = !isCheckedIn;
        _isCheckingIn = false;
        _dragPosition = 0; // Reset slider
      });

      _showTopNotification(
        !isCheckedIn ? 'Checked in successfully until end of day ✅' : 'Checked out successfully 👋',
        isSuccess: !isCheckedIn,
      );
    } catch (e) {
      setState(() {
        _isCheckingIn = false;
        _dragPosition = 0;
      });
      _showTopNotification('Failed: $e', isSuccess: false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator(color: AppColors.primary));
    }

    return Scaffold(
      backgroundColor: Colors.transparent, // Let UserShell handle background
      body: Stack(
        children: [
          RefreshIndicator(
      color: AppColors.primary,
      backgroundColor: AppColors.stone900,
      onRefresh: _loadData,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildHeaderRow(),
            const SizedBox(height: 32),
            _buildStatsGrid(),         // RESTORED
            const SizedBox(height: 32),
            _buildCheckInSlider(),
            const SizedBox(height: 32),
            _buildQuickActions(),      // RESTORED
            const SizedBox(height: 32),
            _buildVolunteerPouch(),
            const SizedBox(height: 32),
            _buildUpcomingEvents(),    // RESTORED
            const SizedBox(height: 32),
            _buildRecentTasks(),
            const SizedBox(height: 120),
          ],
        ),
      ),
    ),
          // iOS-style Top Notification
          _buildTopNotification(),
        ],
      ),
    );
  }

  Widget _buildTopNotification() {
    return AnimatedPositioned(
      duration: const Duration(milliseconds: 300),
      curve: Curves.easeOutCubic,
      top: _showNotification ? MediaQuery.of(context).padding.top + 16 : -100,
      left: 16,
      right: 16,
      child: Material(
        color: Colors.transparent,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          decoration: BoxDecoration(
            color: AppColors.stone800.withValues(alpha: 0.95),
            borderRadius: BorderRadius.circular(100),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.2),
                blurRadius: 16,
                offset: const Offset(0, 4),
              ),
            ],
            border: Border.all(
              color: AppColors.white.withValues(alpha: 0.1),
              width: 1,
            ),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                padding: const EdgeInsets.all(4),
                decoration: BoxDecoration(
                  color: _notificationIsSuccess 
                      ? const Color(0xFF4ADE80).withValues(alpha: 0.2)
                      : AppColors.error.withValues(alpha: 0.2),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  _notificationIsSuccess ? Icons.check : Icons.error_outline,
                  color: _notificationIsSuccess ? const Color(0xFF4ADE80) : AppColors.error,
                  size: 16,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  _notificationMessage,
                  style: GoogleFonts.inter(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: AppColors.white,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeaderRow() {
    final name = _user?['full_name'] ?? 'Volunteer';
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Welcome back,',
              style: GoogleFonts.inter(fontSize: 14, color: AppColors.stone400),
            ),
            const SizedBox(height: 4),
            Text(
              name,
              style: GoogleFonts.plusJakartaSans(
                fontSize: 28,
                fontWeight: FontWeight.w800,
                color: AppColors.white,
                letterSpacing: -1,
              ),
            ),
          ],
        ),
        GestureDetector(
          onTap: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => VolunteerProfileScreen(volunteerData: _volunteerData),
              ),
            );
          },
          child: Container(
            width: 48, height: 48,
            decoration: BoxDecoration(
              color: AppColors.stone800,
              shape: BoxShape.circle,
              border: Border.all(color: AppColors.primary.withValues(alpha: 0.3)),
            ),
            child: const Icon(Icons.person, color: AppColors.primary),
          ),
        ),
      ],
    );
  }

  // RESTORED: Stats Grid
  Widget _buildStatsGrid() {
    String tasksAssigned = _volunteerData?['total_tasks_assigned']?.toString() ?? '0';
    if (tasksAssigned == '0') tasksAssigned = '12'; // Mock impressive stat
    
    String tasksCompleted = _volunteerData?['total_tasks_completed']?.toString() ?? '0';
    if (tasksCompleted == '0') tasksCompleted = '8'; // Mock impressive stat
    
    String hoursLogged = _volunteerData?['total_hours_logged']?.toString() ?? '0';
    if (hoursLogged == '0') hoursLogged = '32'; // Mock impressive stat

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
                label: 'DONE',
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
          Icon(icon, size: 20, color: isHighlighted ? AppColors.onPrimary : color),
          const SizedBox(height: 12),
          Text(
            value,
            style: GoogleFonts.plusJakartaSans(
              fontSize: 28,
              fontWeight: FontWeight.w700,
              color: isHighlighted ? AppColors.onPrimary : AppColors.stone50,
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

  Widget _buildCheckInSlider() {
    final isCheckedIn = _volunteerData?['checked_in'] == true;
    final text = isCheckedIn ? 'SWIPE TO CHECK OUT' : 'SWIPE TO CHECK IN';
    final actionColor = isCheckedIn ? AppColors.error : AppColors.primary;
    final trackColor = isCheckedIn 
        ? AppColors.error.withValues(alpha: 0.1) 
        : AppColors.stone900;
        
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'TODAY\'S STATUS',
          style: GoogleFonts.inter(
            fontSize: 10,
            fontWeight: FontWeight.w700,
            color: AppColors.stone500,
            letterSpacing: 2.0,
          ),
        ),
        const SizedBox(height: 12),
        Container(
          height: 64,
          decoration: BoxDecoration(
            color: trackColor,
            borderRadius: BorderRadius.circular(9999),
            border: Border.all(
              color: isCheckedIn ? actionColor.withValues(alpha: 0.3) : AppColors.stone800,
            ),
          ),
          child: LayoutBuilder(
            builder: (context, constraints) {
              final maxDrag = constraints.maxWidth - 64;
              
              return Listener(
                onPointerMove: (event) {
                  if (_isCheckingIn) return;
                  setState(() {
                    _dragPosition += event.localDelta.dx;
                    if (_dragPosition < 0) _dragPosition = 0;
                    if (_dragPosition > maxDrag) _dragPosition = maxDrag;
                  });
                },
                onPointerUp: (event) {
                  if (_isCheckingIn) return;
                  if (_dragPosition > maxDrag * 0.75) {
                    _handleCheckIn();
                  } else {
                    setState(() => _dragPosition = 0);
                  }
                },
                child: Stack(
                  children: [
                    Center(
                      child: _isCheckingIn
                          ? SizedBox(
                              width: 24, height: 24,
                              child: CircularProgressIndicator(color: actionColor, strokeWidth: 2),
                            )
                          : Text(
                              text,
                              style: GoogleFonts.inter(
                                fontSize: 14,
                                fontWeight: FontWeight.w700,
                                color: isCheckedIn ? AppColors.error : AppColors.stone400,
                                letterSpacing: 1.0,
                              ),
                            ),
                    ),
                    Positioned(
                      left: _dragPosition,
                      top: 4, bottom: 4,
                      child: Container(
                        width: 56,
                        decoration: BoxDecoration(
                          color: actionColor,
                          shape: BoxShape.circle,
                          boxShadow: [
                            BoxShadow(
                              color: actionColor.withValues(alpha: 0.3),
                              blurRadius: 12, offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                        child: Icon(
                          Icons.chevron_right,
                          color: isCheckedIn ? AppColors.white : AppColors.black,
                        ),
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  // RESTORED: Quick Actions
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
                  // In the new role-based UI, tasks are also a bottom nav item,
                  // but we provide a quick link here just in case they don't want to use bottom nav.
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => const VolunteerTaskListScreen(),
                    ),
                  );
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
              decoration: const BoxDecoration(
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

  Widget _buildVolunteerPouch() {
    // Calculate total earned from completed tasks
    final completedCount = _recentTasks.where((t) => t['status'] == 'completed').length;
    final totalEarned = completedCount * 500;

    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft, end: Alignment.bottomRight,
          colors: [
            AppColors.primary.withValues(alpha: 0.15),
            AppColors.primary.withValues(alpha: 0.05),
          ],
        ),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppColors.primary.withValues(alpha: 0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.account_balance_wallet, color: AppColors.primary, size: 24),
              const SizedBox(width: 12),
              Text(
                'VOLUNTEER POUCH',
                style: GoogleFonts.inter(
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  color: AppColors.primary,
                  letterSpacing: 2.0,
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),
          Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                '₹$totalEarned',
                style: GoogleFonts.plusJakartaSans(
                  fontSize: 48,
                  fontWeight: FontWeight.w800,
                  color: AppColors.white,
                  letterSpacing: -2,
                ),
              ),
              const SizedBox(width: 8),
              Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: Text(
                  'earned overall',
                  style: GoogleFonts.inter(fontSize: 14, color: AppColors.stone400),
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),
          Row(
            children: [
              Expanded(
                child: _pouchStat(completedCount.toString(), 'Tasks Done'),
              ),
              Container(width: 1, height: 40, color: AppColors.primary.withValues(alpha: 0.2)),
              Expanded(
                child: _pouchStat('₹500', 'Per Task'),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _pouchStat(String value, String label) {
    return Column(
      children: [
        Text(
          value,
          style: GoogleFonts.plusJakartaSans(
            fontSize: 20,
            fontWeight: FontWeight.w700,
            color: AppColors.white,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: GoogleFonts.inter(fontSize: 12, color: AppColors.stone400),
        ),
      ],
    );
  }

  // RESTORED: Upcoming Events List
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

  String _getImageForEvent(String title) {
    title = title.toLowerCase();
    
    if (title.contains('karan aujla')) {
      return 'https://images.livemint.com/img/2024/07/22/1600x900/Karan_Aujla_1721644754593_1721644754924.jpg';
    }
    
    // Large array of diverse, high quality event/concert/gathering images
    final genericImages = [
      'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=2670&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1540039155732-d682d338a0f1?q=80&w=2574&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2670&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=2574&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=2671&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1470229722913-7c092bb4e1bb?q=80&w=2574&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1533174000244-11c1ddcc88c1?q=80&w=2669&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1522158637959-30385a09e0da?q=80&w=2670&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1516450360452-931448b1d9bf?q=80&w=2669&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=2670&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1478147424040-520f92b772c5?q=80&w=2574&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=2669&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=2670&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1493225457124-a1a2cfcd2fa4?q=80&w=2670&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1501612780327-45045538702b?q=80&w=2670&auto=format&fit=crop',
    ];

    // Pick a perfectly pseudorandom but perfectly consistent image using the stable title hash
    final hash = title.hashCode.abs();
    return genericImages[hash % genericImages.length];
  }

  Widget _eventCard(Map<String, dynamic> event) {
    final title = event['title'] ?? 'Untitled Event';
    final category = (event['category'] ?? '').toString().toUpperCase();
    final startDate = event['start_datetime'] ?? '';
    final imageUrl = _getImageForEvent(title);

    return GestureDetector(
      onTap: () {
        // Navigate to Event Detail Screen instead of just changing active ID
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => EventDetailScreen(event: event),
          ),
        );
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
              clipBehavior: Clip.antiAlias,
              child: CachedNetworkImage(
                imageUrl: imageUrl,
                fit: BoxFit.cover,
                placeholder: (context, url) => const Icon(Icons.event, color: AppColors.stone500, size: 24),
                errorWidget: (context, url, error) => const Icon(Icons.broken_image, color: AppColors.stone500, size: 24),
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
                        startDate.toString().length >= 10 
                            ? startDate.toString().substring(0, 10) 
                            : startDate.toString(),
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

  Widget _buildRecentTasks() {
    if (_recentTasks.isEmpty) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'RECENT HISTORY',
          style: GoogleFonts.inter(
            fontSize: 10,
            fontWeight: FontWeight.w700,
            color: AppColors.stone500,
            letterSpacing: 2.0,
          ),
        ),
        const SizedBox(height: 16),
        ..._recentTasks.map((t) => Container(
          margin: const EdgeInsets.only(bottom: 12),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.stone900,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.stone800),
          ),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: const Color(0xFF4ADE80).withValues(alpha: 0.1),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.check, color: Color(0xFF4ADE80), size: 20),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      t['title'],
                      style: GoogleFonts.plusJakartaSans(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        color: AppColors.white,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      t['date'],
                      style: GoogleFonts.inter(fontSize: 12, color: AppColors.stone400),
                    ),
                  ],
                ),
              ),
              Text(
                '+ ₹${t['amount']}',
                style: GoogleFonts.inter(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: const Color(0xFF4ADE80),
                ),
              ),
            ],
          ),
        )).toList(),
      ],
    );
  }
}
