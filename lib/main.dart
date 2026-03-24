import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'theme/app_theme.dart';
import 'widgets/bottom_nav_bar.dart';
import 'screens/attendee_home_screen.dart';
import 'screens/event_detail_screen.dart';
import 'screens/user_profile_screen.dart';
import 'screens/book_experience_screen.dart';
import 'screens/book_menu_screen.dart';
import 'screens/login_screen.dart';
import 'screens/volunteer_hub_screen.dart';
import 'screens/volunteer_task_list_screen.dart';
import 'screens/volunteer_live_chat_screen.dart';
import 'services/auth_service.dart';
import 'services/api_service.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const UtsovaApp());
}

class UtsovaApp extends StatelessWidget {
  const UtsovaApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Utsova',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.darkTheme,
      home: const AuthGate(),
    );
  }
}

/// Auth gate — checks if user is logged in, determines role, routes to correct panel.
class AuthGate extends StatefulWidget {
  const AuthGate({super.key});

  @override
  State<AuthGate> createState() => _AuthGateState();
}

class _AuthGateState extends State<AuthGate> {
  bool _checking = true;
  bool _isLoggedIn = false;
  String _userRole = 'user'; // 'user' or 'volunteer'

  @override
  void initState() {
    super.initState();
    _checkAuth();
  }

  Future<void> _checkAuth() async {
    final loggedIn = await AuthService.isLoggedIn();
    if (loggedIn) {
      final role = await ApiService.getSelectedRole();
      setState(() {
        _isLoggedIn = true;
        _userRole = role ?? 'user';
        _checking = false;
      });
    } else {
      setState(() {
        _isLoggedIn = false;
        _checking = false;
      });
    }
  }

  void _onLoginSuccess(String role) {
    setState(() {
      _isLoggedIn = true;
      _userRole = role;
    });
  }

  void _onLogout() async {
    await AuthService.logout();
    setState(() {
      _isLoggedIn = false;
      _userRole = 'user';
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_checking) {
      return const Scaffold(
        backgroundColor: AppColors.background,
        body: Center(child: CircularProgressIndicator(color: AppColors.primary)),
      );
    }

    if (!_isLoggedIn) {
      return LoginScreen(onLoginSuccess: _onLoginSuccess);
    }

    if (_userRole == 'volunteer') {
      return VolunteerShell(onLogout: _onLogout);
    }

    return UserShell(onLogout: _onLogout);
  }
}

// ═══════════════════════════════════════════════════════════════
// USER PANEL — Explore, Events, Profile, Book Experience
// ═══════════════════════════════════════════════════════════════
class UserShell extends StatefulWidget {
  final VoidCallback onLogout;
  const UserShell({super.key, required this.onLogout});

  @override
  State<UserShell> createState() => _UserShellState();
}

class _UserShellState extends State<UserShell> {
  int _currentIndex = 0;

  final List<Widget> _screens = const [
    AttendeeHomeScreen(),
    EventDetailScreen(),
    UserProfileScreen(),
    BookExperienceScreen(),
  ];

  void _navigateTo(int index) => setState(() => _currentIndex = index);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      drawer: _buildDrawer(),
      body: Builder(
        builder: (context) => Stack(
          children: [
            Column(children: [
              _buildTopAppBar(context),
              Expanded(
                child: IndexedStack(index: _currentIndex, children: _screens),
              ),
            ]),
            Positioned(
              left: 0, right: 0, bottom: 0,
              child: BottomNavBar(
                currentIndex: _currentIndex,
                onTap: _navigateTo,
                items: const [
                  BottomNavItem(Icons.explore, 'Explore'),
                  BottomNavItem(Icons.event, 'Events'),
                  BottomNavItem(Icons.person, 'Profile'),
                  BottomNavItem(Icons.shopping_cart, 'Book'),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDrawer() {
    return Drawer(
      backgroundColor: AppColors.surface,
      child: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.all(24),
              child: Text('Utsova', style: GoogleFonts.plusJakartaSans(
                  fontSize: 28, fontWeight: FontWeight.w800,
                  color: AppColors.white, letterSpacing: -1)),
            ),
            const Divider(color: AppColors.stone800),
            _drawerItem(Icons.explore, 'Explore', 0),
            _drawerItem(Icons.event, 'Events', 1),
            _drawerItem(Icons.person, 'Profile', 2),
            _drawerItem(Icons.shopping_cart, 'Book Experience', 3),
            ListTile(
              leading: const Icon(Icons.confirmation_number, color: AppColors.stone400),
              title: Text('Booked Events', style: GoogleFonts.inter(
                  fontSize: 16, fontWeight: FontWeight.w500, color: AppColors.stone200)),
              onTap: () { 
                Navigator.pop(context); 
                Navigator.push(context, MaterialPageRoute(builder: (_) => const BookMenuScreen()));
              },
            ),
            const Spacer(),
            const Divider(color: AppColors.stone800),
            ListTile(
              leading: const Icon(Icons.logout, color: AppColors.error),
              title: Text('Log Out', style: GoogleFonts.inter(
                  fontSize: 16, fontWeight: FontWeight.w500, color: AppColors.error)),
              onTap: () { Navigator.pop(context); widget.onLogout(); },
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }

  Widget _drawerItem(IconData icon, String label, int index) {
    final isActive = _currentIndex == index;
    return ListTile(
      leading: Icon(icon, color: isActive ? AppColors.primary : AppColors.stone400),
      title: Text(label, style: GoogleFonts.inter(
          fontSize: 16, fontWeight: isActive ? FontWeight.w700 : FontWeight.w500,
          color: isActive ? AppColors.primary : AppColors.stone200)),
      onTap: () { Navigator.pop(context); _navigateTo(index); },
    );
  }

  Widget _buildTopAppBar(BuildContext context) {
    return ClipRRect(
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
        child: Container(
          color: AppColors.stone950.withValues(alpha: 0.8),
          padding: EdgeInsets.only(
            top: MediaQuery.of(context).padding.top + 8,
            left: 16, right: 16, bottom: 12,
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              IconButton(
                icon: const Icon(Icons.menu, color: AppColors.white, size: 28),
                onPressed: () => Scaffold.of(context).openDrawer(),
              ),
              Text('Utsova', style: GoogleFonts.plusJakartaSans(
                  fontSize: 20, fontWeight: FontWeight.w800,
                  color: AppColors.white, letterSpacing: -1)),
              IconButton(
                icon: const Icon(Icons.search, color: AppColors.white),
                onPressed: () {},
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════
// VOLUNTEER PANEL — Hub, Tasks
// ═══════════════════════════════════════════════════════════════
class VolunteerShell extends StatefulWidget {
  final VoidCallback onLogout;
  const VolunteerShell({super.key, required this.onLogout});

  @override
  State<VolunteerShell> createState() => _VolunteerShellState();
}

class _VolunteerShellState extends State<VolunteerShell> {
  int _currentIndex = 0;

  late final List<Widget> _screens;

  @override
  void initState() {
    super.initState();
    _screens = [
      const VolunteerHubScreen(),
      const VolunteerTaskListScreen(),
      const VolunteerLiveChatScreen(),
    ];
  }

  void _navigateTo(int index) => setState(() => _currentIndex = index);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      drawer: _buildDrawer(),
      body: Builder(
        builder: (context) => Stack(
          children: [
            Column(children: [
              _buildTopAppBar(context),
              Expanded(
                child: IndexedStack(index: _currentIndex, children: _screens),
              ),
            ]),
            Positioned(
              left: 0, right: 0, bottom: 0,
              child: BottomNavBar(
                currentIndex: _currentIndex,
                onTap: _navigateTo,
                items: const [
                  BottomNavItem(Icons.volunteer_activism, 'Hub'),
                  BottomNavItem(Icons.assignment, 'Tasks'),
                  BottomNavItem(Icons.chat_bubble, 'Chat'),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDrawer() {
    return Drawer(
      backgroundColor: AppColors.surface,
      child: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.all(24),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text('Utsova', style: GoogleFonts.plusJakartaSans(
                    fontSize: 28, fontWeight: FontWeight.w800,
                    color: AppColors.white, letterSpacing: -1)),
                const SizedBox(height: 4),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                  decoration: BoxDecoration(
                    color: AppColors.primary, borderRadius: BorderRadius.circular(9999)),
                  child: Text('VOLUNTEER', style: GoogleFonts.inter(
                      fontSize: 10, fontWeight: FontWeight.w700,
                      color: AppColors.onPrimary, letterSpacing: 2.0)),
                ),
              ]),
            ),
            const Divider(color: AppColors.stone800),
            ListTile(
              leading: Icon(Icons.volunteer_activism,
                  color: _currentIndex == 0 ? AppColors.primary : AppColors.stone400),
              title: Text('Volunteer Hub', style: GoogleFonts.inter(
                  fontSize: 16, fontWeight: _currentIndex == 0 ? FontWeight.w700 : FontWeight.w500,
                  color: _currentIndex == 0 ? AppColors.primary : AppColors.stone200)),
              onTap: () { Navigator.pop(context); _navigateTo(0); },
            ),
            ListTile(
              leading: Icon(Icons.assignment,
                  color: _currentIndex == 1 ? AppColors.primary : AppColors.stone400),
              title: Text('My Tasks', style: GoogleFonts.inter(
                  fontSize: 16, fontWeight: _currentIndex == 1 ? FontWeight.w700 : FontWeight.w500,
                  color: _currentIndex == 1 ? AppColors.primary : AppColors.stone200)),
              onTap: () { Navigator.pop(context); _navigateTo(1); },
            ),
            ListTile(
              leading: Icon(Icons.chat_bubble,
                  color: _currentIndex == 2 ? AppColors.primary : AppColors.stone400),
              title: Text('Live Chat', style: GoogleFonts.inter(
                  fontSize: 16, fontWeight: _currentIndex == 2 ? FontWeight.w700 : FontWeight.w500,
                  color: _currentIndex == 2 ? AppColors.primary : AppColors.stone200)),
              onTap: () { Navigator.pop(context); _navigateTo(2); },
            ),
            const Spacer(),
            const Divider(color: AppColors.stone800),
            ListTile(
              leading: const Icon(Icons.logout, color: AppColors.error),
              title: Text('Log Out', style: GoogleFonts.inter(
                  fontSize: 16, fontWeight: FontWeight.w500, color: AppColors.error)),
              onTap: () { Navigator.pop(context); widget.onLogout(); },
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }

  Widget _buildTopAppBar(BuildContext context) {
    return ClipRRect(
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
        child: Container(
          color: AppColors.stone950.withValues(alpha: 0.8),
          padding: EdgeInsets.only(
            top: MediaQuery.of(context).padding.top + 8,
            left: 16, right: 16, bottom: 12,
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              IconButton(
                icon: const Icon(Icons.menu, color: AppColors.white, size: 28),
                onPressed: () => Scaffold.of(context).openDrawer(),
              ),
              Row(children: [
                Text('Utsova', style: GoogleFonts.plusJakartaSans(
                    fontSize: 20, fontWeight: FontWeight.w800,
                    color: AppColors.white, letterSpacing: -1)),
                const SizedBox(width: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(9999)),
                  child: Text('VOL', style: GoogleFonts.inter(
                      fontSize: 10, fontWeight: FontWeight.w700,
                      color: AppColors.primary, letterSpacing: 1.0)),
                ),
              ]),
              const SizedBox(width: 48), // spacer
            ],
          ),
        ),
      ),
    );
  }
}
