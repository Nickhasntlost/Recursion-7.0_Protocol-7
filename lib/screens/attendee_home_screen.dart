import 'dart:async';
import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../theme/app_theme.dart';
import 'package:google_fonts/google_fonts.dart';
import 'event_detail_screen.dart';
import 'book_experience_screen.dart';

class AttendeeHomeScreen extends StatefulWidget {
  const AttendeeHomeScreen({super.key});

  @override
  State<AttendeeHomeScreen> createState() => _AttendeeHomeScreenState();
}

class _AttendeeHomeScreenState extends State<AttendeeHomeScreen> {
  int _selectedCategory = 0;

  late PageController _heroPageController;
  Timer? _heroTimer;
  int _currentHeroIndex = 0;

  final _featuredEventsData = [
    {
      'title': 'Karan Aujla\nIt Was All A Dream Tour',
      'dateLoc': 'Apr 12 • JLN Stadium, New Delhi',
      'img': 'https://upload.wikimedia.org/wikipedia/commons/7/76/Karan_Aujla_2020.jpg',
    },
    {
      'title': 'Samay Raina\nUnfiltered Tour',
      'dateLoc': 'Apr 14 • NSCI Dome, Mumbai',
      'img': 'https://upload.wikimedia.org/wikipedia/commons/4/46/Samay_raina_%28cropped%29.jpg',
    },
    {
      'title': 'Seedhe Maut\nNayaab Tour',
      'dateLoc': 'Apr 18 • Talkatora Stadium, Delhi',
      'img': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/SeedheMaut%28SM%29.jpg/960px-SeedheMaut%28SM%29.jpg',
    },
  ];

  @override
  void initState() {
    super.initState();
    _heroPageController = PageController();
    _heroTimer = Timer.periodic(const Duration(seconds: 4), (timer) {
      if (_heroPageController.hasClients) {
        _currentHeroIndex = (_currentHeroIndex + 1) % _featuredEventsData.length;
        _heroPageController.animateToPage(
          _currentHeroIndex,
          duration: const Duration(milliseconds: 800),
          curve: Curves.easeInOutQuint,
        );
      }
    });
  }

  @override
  void dispose() {
    _heroPageController.dispose();
    _heroTimer?.cancel();
    super.dispose();
  }

  final _categories = [
    {'icon': Icons.grid_view, 'label': 'All'},
    {'icon': Icons.restaurant, 'label': 'Dining'},
    {'icon': Icons.mic, 'label': 'Open Mic'},
    {'icon': Icons.movie, 'label': 'Cinema'},
    {'icon': Icons.palette, 'label': 'Exhibits'},
    {'icon': Icons.sports_cricket, 'label': 'Sports'},
    {'icon': Icons.music_note, 'label': 'Music'},
  ];

  // All events data
  final _allEvents = [
    {'title': 'Karan Aujla Live', 'category': 'Music', 'loc': 'JLN Stadium, Delhi', 'date': 'Apr 12', 'time': '19:00 — 23:00',
      'img': 'https://upload.wikimedia.org/wikipedia/commons/7/76/Karan_Aujla_2020.jpg'},
    {'title': 'Samay Raina Live', 'category': 'Open Mic', 'loc': 'NSCI Dome, Mumbai', 'date': 'Apr 14', 'time': '20:00 — 22:30',
      'img': 'https://upload.wikimedia.org/wikipedia/commons/4/46/Samay_raina_%28cropped%29.jpg'},
    {'title': 'Seedhe Maut Concert', 'category': 'Music', 'loc': 'Talkatora Stadium, Delhi', 'date': 'Apr 18', 'time': '18:00 — 22:00',
      'img': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/SeedheMaut%28SM%29.jpg/960px-SeedheMaut%28SM%29.jpg'},
    {'title': 'Butter Chicken Festival', 'category': 'Dining', 'loc': 'Connaught Place, Delhi', 'date': 'Apr 20', 'time': '12:00 — 22:00',
      'img': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Butter_Chicken_%26_Butter_Naan_-_Home_-_Chandigarh_-_India_-_0006.jpg/960px-Butter_Chicken_%26_Butter_Naan_-_Home_-_Chandigarh_-_India_-_0006.jpg'},
    {'title': 'Indie Film Screening', 'category': 'Cinema', 'loc': 'PVR Director\'s Cut, Vasant Kunj', 'date': 'Apr 22', 'time': '17:00 — 20:00',
      'img': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/India_film_clapperboard_%28variant%29.svg/960px-India_film_clapperboard_%28variant%29.svg.png'},
    {'title': 'Modern Art Exhibition', 'category': 'Exhibits', 'loc': 'National Gallery, Delhi', 'date': 'Apr 25', 'time': '10:00 — 18:00',
      'img': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Raja_Ravi_Varma_-_Mahabharata_-_Shantanu_and_Matsyagandha.jpg/800px-Raja_Ravi_Varma_-_Mahabharata_-_Shantanu_and_Matsyagandha.jpg'},
    {'title': 'IPL Fan Zone', 'category': 'Sports', 'loc': 'Arun Jaitley Stadium, Delhi', 'date': 'Apr 15', 'time': '15:30 — 23:00',
      'img': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Kotla.jpg/800px-Kotla.jpg'},
  ];

  List<Map<String, dynamic>> get _filteredEvents {
    if (_selectedCategory == 0) return _allEvents.cast<Map<String, dynamic>>();
    final catLabel = _categories[_selectedCategory]['label'] as String;
    return _allEvents.where((e) => e['category'] == catLabel).toList().cast<Map<String, dynamic>>();
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        _buildHeroSection(context),
        const SizedBox(height: 32),
        _buildCategoryChips(),
        const SizedBox(height: 24),
        // Filtered events list
        _buildFilteredEvents(),
        const SizedBox(height: 32),
        _buildTimeline(),
        const SizedBox(height: 32),
        _buildTrendingSection(context),
        const SizedBox(height: 32),
        _buildFooter(),
        const SizedBox(height: 100),
      ]),
    );
  }

  Widget _buildHeroSection(BuildContext ctx) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: SizedBox(
        width: double.infinity, height: 480,
        child: ClipRRect(
          borderRadius: BorderRadius.circular(16),
          child: Container(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.white.withValues(alpha: 0.05)),
            ),
            child: PageView.builder(
              controller: _heroPageController,
              itemCount: _featuredEventsData.length,
              onPageChanged: (index) {
                _currentHeroIndex = index;
              },
              itemBuilder: (context, index) {
                final event = _featuredEventsData[index];
                return GestureDetector(
                  onTap: () => Navigator.push(ctx, MaterialPageRoute(builder: (_) => const EventDetailScreen())),
                  child: Stack(children: [
                    Positioned.fill(
                      child: CachedNetworkImage(
                        imageUrl: event['img'] as String,
                        fit: BoxFit.cover,
                        placeholder: (c, u) => Container(color: AppColors.neutral900),
                        errorWidget: (c, u, e) => Container(color: AppColors.neutral900,
                            child: const Icon(Icons.broken_image, color: AppColors.stone500, size: 48)),
                      ),
                    ),
                    Positioned.fill(
                      child: Container(
                        decoration: BoxDecoration(gradient: LinearGradient(
                          begin: Alignment.topCenter, end: Alignment.bottomCenter,
                          colors: [Colors.transparent, Colors.transparent,
                            AppColors.stone950.withValues(alpha: 0.8), AppColors.stone950],
                        )),
                      ),
                    ),
                    Positioned(
                      left: 24, right: 24, bottom: 24,
                      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                          decoration: BoxDecoration(color: AppColors.primary, borderRadius: BorderRadius.circular(9999)),
                          child: Text('FEATURED EXPERIENCE', style: GoogleFonts.inter(
                              fontSize: 10, fontWeight: FontWeight.w700,
                              color: AppColors.onPrimary, letterSpacing: 2.0)),
                        ),
                        const SizedBox(height: 12),
                        Text(event['title'] as String,
                            style: GoogleFonts.plusJakartaSans(fontSize: 32, fontWeight: FontWeight.w800,
                                color: AppColors.white, letterSpacing: -1.5, height: 1.25)),
                        const SizedBox(height: 8),
                        Text(event['dateLoc'] as String,
                            style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w500, color: AppColors.stone300)),
                        const SizedBox(height: 20),
                        GestureDetector(
                          onTap: () => Navigator.push(ctx, MaterialPageRoute(builder: (_) => const BookExperienceScreen())),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
                            decoration: BoxDecoration(color: AppColors.primary, borderRadius: BorderRadius.circular(9999)),
                            child: Row(mainAxisSize: MainAxisSize.min, children: [
                              Text('Book Experience', style: GoogleFonts.inter(
                                  fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.onPrimary)),
                              const SizedBox(width: 8),
                              const Icon(Icons.arrow_forward, color: AppColors.onPrimary, size: 20),
                            ]),
                          ),
                        ),
                      ]),
                    ),
                  ]),
                );
              },
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildCategoryChips() {
    return SizedBox(
      height: 48,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 24),
        itemCount: _categories.length,
        separatorBuilder: (_, _) => const SizedBox(width: 10),
        itemBuilder: (context, index) {
          final cat = _categories[index];
          final isActive = _selectedCategory == index;
          return GestureDetector(
            onTap: () => setState(() => _selectedCategory = index),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              decoration: BoxDecoration(
                color: isActive ? AppColors.primary : AppColors.neutral900,
                borderRadius: BorderRadius.circular(9999),
                border: isActive ? null : Border.all(color: AppColors.white.withValues(alpha: 0.1)),
              ),
              child: Row(mainAxisSize: MainAxisSize.min, children: [
                Icon(cat['icon'] as IconData, size: 18,
                    color: isActive ? AppColors.onPrimary : AppColors.stone300),
                const SizedBox(width: 6),
                Text(cat['label'] as String, style: GoogleFonts.inter(
                    fontSize: 13, fontWeight: FontWeight.w600,
                    color: isActive ? AppColors.onPrimary : AppColors.stone300)),
              ]),
            ),
          );
        },
      ),
    );
  }

  Widget _buildFilteredEvents() {
    final events = _filteredEvents;
    if (events.isEmpty) {
      return Padding(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
        child: Text('No events in this category yet.',
            style: GoogleFonts.inter(fontSize: 14, color: AppColors.stone500)),
      );
    }
    return SizedBox(
      height: 200,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 24),
        itemCount: events.length,
        separatorBuilder: (_, _) => const SizedBox(width: 16),
        itemBuilder: (context, index) {
          final e = events[index];
          return GestureDetector(
            onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const EventDetailScreen())),
            child: Container(
              width: 260, padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.neutral900, borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.white.withValues(alpha: 0.05)),
              ),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Row(children: [
                  Container(
                    width: 48, height: 48,
                    decoration: BoxDecoration(borderRadius: BorderRadius.circular(12)),
                    clipBehavior: Clip.antiAlias,
                    child: CachedNetworkImage(
                      imageUrl: e['img'] as String,
                      fit: BoxFit.cover,
                      placeholder: (c, u) => Container(color: AppColors.neutral900),
                      errorWidget: (c, u, err) => Container(color: AppColors.neutral900, child: const Center(child: Icon(Icons.broken_image, color: AppColors.stone500, size: 24))),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text(e['title'] as String, style: GoogleFonts.plusJakartaSans(
                        fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.white),
                        maxLines: 1, overflow: TextOverflow.ellipsis),
                    Text((e['category'] as String).toUpperCase(), style: GoogleFonts.inter(
                        fontSize: 10, fontWeight: FontWeight.w700,
                        color: AppColors.primary, letterSpacing: 1.5)),
                  ])),
                ]),
                const Spacer(),
                Row(children: [
                  const Icon(Icons.location_on, size: 14, color: AppColors.stone400),
                  const SizedBox(width: 4),
                  Expanded(child: Text(e['loc'] as String, style: GoogleFonts.inter(
                      fontSize: 12, color: AppColors.stone400), maxLines: 1, overflow: TextOverflow.ellipsis)),
                ]),
                const SizedBox(height: 4),
                Row(children: [
                  const Icon(Icons.schedule, size: 14, color: AppColors.stone400),
                  const SizedBox(width: 4),
                  Text('${e['date']} • ${e['time']}', style: GoogleFonts.inter(
                      fontSize: 12, color: AppColors.stone500)),
                ]),
              ]),
            ),
          );
        },
      ),
    );
  }

  Widget _buildTimeline() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text('Your Weekend', style: GoogleFonts.plusJakartaSans(
            fontSize: 24, fontWeight: FontWeight.w800,
            color: AppColors.white, letterSpacing: -0.5)),
        const SizedBox(height: 24),
        _timelineRow(day: '12', month: 'APR', isActive: true, category: 'MUSIC',
            title: 'Karan Aujla Live', time: '19:00 — 23:00',
            loc: 'JLN Stadium, New Delhi', showLine: true),
        _timelineRow(day: '13', month: 'APR', isActive: false, category: 'OPEN MIC',
            title: 'Samay Raina: Unfiltered', time: '20:00 — 22:30',
            loc: 'NSCI Dome, Mumbai', showLine: true),
        _timelineRow(day: '14', month: 'APR', isActive: false, category: 'DINING',
            title: 'Midnight Street Food Walk', time: '22:00 — 01:00',
            loc: 'Chandni Chowk, Old Delhi', showLine: false),
      ]),
    );
  }

  Widget _timelineRow({required String day, required String month, required bool isActive,
      required String category, required String title, required String time,
      required String loc, required bool showLine}) {
    return GestureDetector(
      onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const EventDetailScreen())),
      child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Column(children: [
          Container(
            width: 48, height: 48,
            decoration: BoxDecoration(
              color: isActive ? AppColors.primary : AppColors.neutral800,
              shape: BoxShape.circle,
              border: isActive ? null : Border.all(color: AppColors.white.withValues(alpha: 0.1)),
            ),
            child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
              Text(day, style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w700,
                  color: isActive ? AppColors.onPrimary : AppColors.stone300)),
              const SizedBox(height: 2),
              Text(month, style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.w600,
                  color: isActive ? AppColors.onPrimary.withValues(alpha: 0.8) : AppColors.stone500)),
            ]),
          ),
          if (showLine)
            Container(width: 2, height: 80, margin: const EdgeInsets.only(top: 8),
                color: AppColors.neutral800),
        ]),
        const SizedBox(width: 16),
        Expanded(
          child: Container(
            margin: const EdgeInsets.only(bottom: 24),
            decoration: BoxDecoration(
              color: AppColors.neutral900,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.white.withValues(alpha: 0.05)),
            ),
            clipBehavior: Clip.antiAlias,
            child: IntrinsicHeight(
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Container(
                    width: 4,
                    color: isActive ? AppColors.primary : AppColors.stone600,
                  ),
                  Expanded(
                    child: Padding(
                      padding: const EdgeInsets.all(20),
                      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                        Text(category, style: GoogleFonts.inter(
                            fontSize: 10, fontWeight: FontWeight.w700,
                            letterSpacing: 2.0, color: isActive ? AppColors.primary : AppColors.stone400)),
                        const SizedBox(height: 4),
                        Text(title, style: GoogleFonts.inter(
                            fontSize: 18, fontWeight: FontWeight.w700, color: AppColors.white, height: 1.2)),
                        const SizedBox(height: 8),
                        Row(children: [
                          const Icon(Icons.schedule, size: 14, color: AppColors.stone400),
                          const SizedBox(width: 4),
                          Text(time, style: GoogleFonts.inter(fontSize: 13, color: AppColors.stone400)),
                        ]),
                        const SizedBox(height: 4),
                        Row(children: [
                          const Icon(Icons.location_on, size: 14, color: AppColors.stone400),
                          const SizedBox(width: 4),
                          Expanded(child: Text(loc, style: GoogleFonts.inter(fontSize: 13, color: AppColors.stone500),
                              maxLines: 1, overflow: TextOverflow.ellipsis)),
                        ]),
                      ]),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ]),
    );
  }

  Widget _buildTrendingSection(BuildContext ctx) {
    final trending = [
      {'title': 'Samay Raina: Unfiltered', 'loc': 'NSCI Dome, Mumbai', 'date': 'Apr 14 • Selling Fast',
        'badge': 'Filling Fast', 'badgeColor': AppColors.white, 'badgeTextColor': AppColors.black,
        'img': 'https://upload.wikimedia.org/wikipedia/commons/4/46/Samay_raina_%28cropped%29.jpg'},
      {'title': 'Seedhe Maut: Nayaab Tour', 'loc': 'Talkatora Stadium, Delhi', 'date': 'Apr 18 • Available',
        'badge': 'New Drop', 'badgeColor': AppColors.primary, 'badgeTextColor': AppColors.onPrimary,
        'img': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/SeedheMaut%28SM%29.jpg/960px-SeedheMaut%28SM%29.jpg'},
      {'title': 'IPL Fan Zone Delhi', 'loc': 'Arun Jaitley Stadium', 'date': 'Apr 15 • Limited',
        'badge': 'Trending', 'badgeColor': AppColors.white, 'badgeTextColor': AppColors.black,
        'img': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Kotla.jpg/800px-Kotla.jpg'},
    ];

    return Column(children: [
      Padding(
        padding: const EdgeInsets.symmetric(horizontal: 24),
        child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
          Text('Trending Now', style: GoogleFonts.plusJakartaSans(
              fontSize: 24, fontWeight: FontWeight.w800,
              color: AppColors.white, letterSpacing: -0.5)),
          GestureDetector(
            onTap: () {
              ScaffoldMessenger.of(ctx).showSnackBar(
                const SnackBar(content: Text('Loading more trending events...')),
              );
            },
            child: Text('VIEW ALL', style: GoogleFonts.inter(
                fontSize: 12, fontWeight: FontWeight.w700,
                color: AppColors.primary, letterSpacing: 2.0)),
          ),
        ]),
      ),
      const SizedBox(height: 20),
      SizedBox(
        height: 320,
        child: ListView.separated(
          scrollDirection: Axis.horizontal,
          padding: const EdgeInsets.symmetric(horizontal: 24),
          itemCount: trending.length,
          separatorBuilder: (_, _) => const SizedBox(width: 20),
          itemBuilder: (context, index) {
            final t = trending[index];
            return GestureDetector(
              onTap: () => Navigator.push(ctx, MaterialPageRoute(builder: (_) => const EventDetailScreen())),
              child: SizedBox(
                width: 220,
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Container(
                    width: 220, height: 220,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppColors.white.withValues(alpha: 0.05)),
                    ),
                    clipBehavior: Clip.antiAlias,
                    child: Stack(children: [
                      Positioned.fill(child: CachedNetworkImage(
                          imageUrl: t['img'] as String, fit: BoxFit.cover,
                          placeholder: (c, u) => Container(color: AppColors.neutral900),
                          errorWidget: (c, u, e) => Container(color: AppColors.neutral900, 
                              child: const Center(child: Icon(Icons.broken_image, color: AppColors.stone500))))),
                      Positioned(top: 12, right: 12,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                              color: t['badgeColor'] as Color,
                              borderRadius: BorderRadius.circular(9999)),
                          child: Text((t['badge'] as String).toUpperCase(), style: GoogleFonts.inter(
                              fontSize: 10, fontWeight: FontWeight.w700,
                              color: t['badgeTextColor'] as Color)),
                        ),
                      ),
                    ]),
                  ),
                  const SizedBox(height: 12),
                  Text(t['title'] as String, style: GoogleFonts.plusJakartaSans(
                      fontSize: 16, fontWeight: FontWeight.w700,
                      color: AppColors.white, letterSpacing: -0.3, height: 1.25),
                      maxLines: 2, overflow: TextOverflow.ellipsis),
                  const SizedBox(height: 2),
                  Text(t['loc'] as String, style: GoogleFonts.inter(
                      fontSize: 12, color: AppColors.stone400),
                      maxLines: 1, overflow: TextOverflow.ellipsis),
                  Text(t['date'] as String, style: GoogleFonts.inter(fontSize: 11, color: AppColors.stone500)),
                ]),
              ),
            );
          },
        ),
      ),
    ]);
  }

  Widget _buildFooter() {
    return Container(
      padding: const EdgeInsets.fromLTRB(24, 32, 24, 48),
      decoration: const BoxDecoration(
        border: Border(top: BorderSide(color: AppColors.neutral800)),
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text('Utsova', style: GoogleFonts.plusJakartaSans(
            fontSize: 24, fontWeight: FontWeight.w800,
            color: AppColors.white, letterSpacing: -1)),
        const SizedBox(height: 16),
        Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            _footerLink('About Curations'),
            _footerLink('Member Benefits'),
            _footerLink('Support'),
          ])),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            _footerLink('Terms'),
            _footerLink('Privacy Policy'),
            _footerLink('Contact'),
          ])),
        ]),
        const SizedBox(height: 32),
        Text('© 2025 UTSOVA INDIA. ALL RIGHTS RESERVED.', style: GoogleFonts.inter(
            fontSize: 12, fontWeight: FontWeight.w500,
            color: AppColors.stone500, letterSpacing: 0.5)),
      ]),
    );
  }

  Widget _footerLink(String text) {
    return GestureDetector(
      onTap: () {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Opening $text...')),
        );
      },
      child: Padding(
        padding: const EdgeInsets.only(bottom: 8),
        child: Text(text, style: GoogleFonts.inter(
            fontSize: 14, fontWeight: FontWeight.w500, color: AppColors.stone400)),
      ),
    );
  }
}
