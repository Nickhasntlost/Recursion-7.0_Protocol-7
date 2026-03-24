import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../services/api_service.dart';
import '../services/demo_events.dart';
import 'package:google_fonts/google_fonts.dart';
import 'book_tickets_screen.dart';

class BookExperienceScreen extends StatefulWidget {
  const BookExperienceScreen({super.key});

  @override
  State<BookExperienceScreen> createState() => _BookExperienceScreenState();
}

class _BookExperienceScreenState extends State<BookExperienceScreen> {
  List<Map<String, dynamic>> _events = [];
  bool _isLoading = true;
  String? _error;
  String _selectedCategory = 'All';

  final List<String> _categories = [
    'All',
    'Concert',
    'Sports',
    'Festival',
    'Comedy',
    'Theater',
    'Workshop',
    'Conference',
  ];

  @override
  void initState() {
    super.initState();
    _fetchEvents();
  }

  Future<void> _fetchEvents() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final queryParams = <String, String>{};
      if (_selectedCategory != 'All') {
        queryParams['category'] = _selectedCategory.toLowerCase();
      }
      final events =
          await ApiService.getList('/events', auth: false, queryParams: queryParams.isNotEmpty ? queryParams : null);
      setState(() {
        _events = events.cast<Map<String, dynamic>>();
        _isLoading = false;
      });
    } on ApiException {
      _useDemoData();
    } catch (_) {
      _useDemoData();
    }
  }

  void _useDemoData() {
    var filtered = demoEvents;
    if (_selectedCategory != 'All') {
      filtered = demoEvents
          .where((e) =>
              (e['category'] as String).toLowerCase() ==
              _selectedCategory.toLowerCase())
          .toList();
    }
    setState(() {
      _events = filtered.map((e) => Map<String, dynamic>.from(e)).toList();
      _isLoading = false;
      _error = null;
    });
  }

  IconData _categoryIcon(String category) {
    switch (category.toLowerCase()) {
      case 'concert':
        return Icons.music_note_rounded;
      case 'sports':
        return Icons.sports_rounded;
      case 'festival':
        return Icons.celebration_rounded;
      case 'comedy':
        return Icons.sentiment_very_satisfied_rounded;
      case 'theater':
        return Icons.theater_comedy_rounded;
      case 'workshop':
        return Icons.build_rounded;
      case 'conference':
        return Icons.business_rounded;
      case 'exhibition':
        return Icons.museum_rounded;
      default:
        return Icons.event_rounded;
    }
  }

  String _formatDate(String? dateStr) {
    if (dateStr == null) return '';
    try {
      final dt = DateTime.parse(dateStr);
      final months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ];
      return '${months[dt.month - 1]} ${dt.day}';
    } catch (_) {
      return dateStr;
    }
  }

  String _formatPrice(dynamic minPrice, dynamic maxPrice) {
    final min = (minPrice ?? 0).toDouble().round();
    final max = (maxPrice ?? 0).toDouble().round();
    if (min == max) return '₹$min';
    return '₹$min – ₹$max';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: RefreshIndicator(
        color: AppColors.primary,
        backgroundColor: AppColors.surface,
        onRefresh: _fetchEvents,
        child: CustomScrollView(
          slivers: [
            // Header
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(24, 24, 24, 0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Book Experience',
                        style: GoogleFonts.plusJakartaSans(
                            fontSize: 28,
                            fontWeight: FontWeight.w800,
                            color: AppColors.white,
                            letterSpacing: -1)),
                    const SizedBox(height: 4),
                    Text('Find and book tickets for upcoming events',
                        style: GoogleFonts.inter(
                            fontSize: 14, color: AppColors.stone400)),
                    const SizedBox(height: 20),
                  ],
                ),
              ),
            ),

            // Category chips
            SliverToBoxAdapter(
              child: SizedBox(
                height: 40,
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 24),
                  itemCount: _categories.length,
                  separatorBuilder: (_, __) => const SizedBox(width: 8),
                  itemBuilder: (context, index) {
                    final cat = _categories[index];
                    final isActive = _selectedCategory == cat;
                    return GestureDetector(
                      onTap: () {
                        setState(() => _selectedCategory = cat);
                        _fetchEvents();
                      },
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 250),
                        padding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 8),
                        decoration: BoxDecoration(
                          color: isActive
                              ? AppColors.primary
                              : AppColors.neutral900,
                          borderRadius: BorderRadius.circular(9999),
                          border: isActive
                              ? null
                              : Border.all(color: AppColors.stone800),
                        ),
                        child: Text(cat,
                            style: GoogleFonts.inter(
                                fontSize: 13,
                                fontWeight:
                                    isActive ? FontWeight.w700 : FontWeight.w500,
                                color: isActive
                                    ? AppColors.black
                                    : AppColors.stone300)),
                      ),
                    );
                  },
                ),
              ),
            ),

            const SliverToBoxAdapter(child: SizedBox(height: 24)),

            // Content
            if (_isLoading)
              SliverToBoxAdapter(
                child: SizedBox(
                  height: 300,
                  child: Center(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const CircularProgressIndicator(
                            color: AppColors.primary, strokeWidth: 2.5),
                        const SizedBox(height: 16),
                        Text('Loading events...',
                            style: GoogleFonts.inter(
                                fontSize: 14, color: AppColors.stone400)),
                      ],
                    ),
                  ),
                ),
              )
            else if (_error != null)
              SliverToBoxAdapter(
                child: _buildErrorState(),
              )
            else if (_events.isEmpty)
              SliverToBoxAdapter(
                child: _buildEmptyState(),
              )
            else
              SliverPadding(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                sliver: SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (context, index) {
                      if (index >= _events.length) return null;
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 16),
                        child: _buildEventCard(_events[index]),
                      );
                    },
                    childCount: _events.length,
                  ),
                ),
              ),

            // Bottom padding for nav bar
            const SliverToBoxAdapter(child: SizedBox(height: 100)),
          ],
        ),
      ),
    );
  }

  Widget _buildEventCard(Map<String, dynamic> event) {
    final title = event['title'] ?? 'Untitled Event';
    final category = (event['category'] ?? 'other').toString();
    final dateStr = event['start_datetime']?.toString();
    final coverImage = event['cover_image'] as String?;
    final performers = (event['performers'] as List<dynamic>?) ?? [];
    final isFeatured = event['is_featured'] == true;
    final totalCapacity = event['total_capacity'] ?? 0;
    final totalSold = event['total_sold'] ?? 0;
    final remaining = totalCapacity - totalSold;

    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => BookTicketsScreen(event: event),
          ),
        );
      },
      child: Container(
        decoration: BoxDecoration(
          color: AppColors.neutral900,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isFeatured
                ? AppColors.primary.withValues(alpha: 0.3)
                : AppColors.white.withValues(alpha: 0.05),
          ),
        ),
        clipBehavior: Clip.antiAlias,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image / Banner
            SizedBox(
              height: 160,
              width: double.infinity,
              child: Stack(
                fit: StackFit.expand,
                children: [
                  if (coverImage != null && coverImage.isNotEmpty)
                    Image.network(coverImage,
                        fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) => _placeholderBanner(category))
                  else
                    _placeholderBanner(category),
                  // Gradient overlay
                  Positioned(
                    bottom: 0,
                    left: 0,
                    right: 0,
                    child: Container(
                      height: 60,
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.bottomCenter,
                          end: Alignment.topCenter,
                          colors: [
                            AppColors.neutral900,
                            AppColors.neutral900.withValues(alpha: 0),
                          ],
                        ),
                      ),
                    ),
                  ),
                  // Category badge
                  Positioned(
                    top: 12,
                    left: 12,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 10, vertical: 5),
                      decoration: BoxDecoration(
                        color: AppColors.black.withValues(alpha: 0.6),
                        borderRadius: BorderRadius.circular(9999),
                        border: Border.all(
                            color: AppColors.white.withValues(alpha: 0.1)),
                      ),
                      child: Row(mainAxisSize: MainAxisSize.min, children: [
                        Icon(_categoryIcon(category), size: 12,
                            color: AppColors.primary),
                        const SizedBox(width: 4),
                        Text(
                            category[0].toUpperCase() + category.substring(1),
                            style: GoogleFonts.inter(
                                fontSize: 11,
                                fontWeight: FontWeight.w600,
                                color: AppColors.white)),
                      ]),
                    ),
                  ),
                  // Featured badge
                  if (isFeatured)
                    Positioned(
                      top: 12,
                      right: 12,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 10, vertical: 5),
                        decoration: BoxDecoration(
                          color: AppColors.primary,
                          borderRadius: BorderRadius.circular(9999),
                        ),
                        child: Text('FEATURED',
                            style: GoogleFonts.inter(
                                fontSize: 10,
                                fontWeight: FontWeight.w700,
                                color: AppColors.black,
                                letterSpacing: 1.0)),
                      ),
                    ),
                ],
              ),
            ),

            // Info section
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Title
                  Text(title,
                      style: GoogleFonts.plusJakartaSans(
                          fontSize: 18,
                          fontWeight: FontWeight.w700,
                          color: AppColors.white,
                          height: 1.2),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis),
                  const SizedBox(height: 8),

                  // Date & performers
                  Row(children: [
                    if (dateStr != null) ...[
                      Icon(Icons.calendar_today_rounded,
                          size: 13, color: AppColors.stone400),
                      const SizedBox(width: 5),
                      Text(_formatDate(dateStr),
                          style: GoogleFonts.inter(
                              fontSize: 13, color: AppColors.stone400)),
                    ],
                    if (performers.isNotEmpty) ...[
                      const SizedBox(width: 12),
                      Icon(Icons.person_rounded,
                          size: 13, color: AppColors.stone400),
                      const SizedBox(width: 4),
                      Expanded(
                        child: Text(
                            performers
                                .take(2)
                                .map((p) => p.toString())
                                .join(', '),
                            style: GoogleFonts.inter(
                                fontSize: 13, color: AppColors.stone400),
                            overflow: TextOverflow.ellipsis),
                      ),
                    ],
                  ]),
                  const SizedBox(height: 12),

                  // Price & availability row
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                          _formatPrice(
                              event['min_price'], event['max_price']),
                          style: GoogleFonts.plusJakartaSans(
                              fontSize: 18,
                              fontWeight: FontWeight.w800,
                              color: AppColors.primary)),
                      if (remaining > 0 && remaining <= 50)
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: const Color(0xFFFBBF24)
                                .withValues(alpha: 0.15),
                            borderRadius: BorderRadius.circular(9999),
                          ),
                          child: Text('$remaining left',
                              style: GoogleFonts.inter(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w700,
                                  color: const Color(0xFFFBBF24))),
                        )
                      else if (remaining <= 0)
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: AppColors.error.withValues(alpha: 0.15),
                            borderRadius: BorderRadius.circular(9999),
                          ),
                          child: Text('Sold Out',
                              style: GoogleFonts.inter(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w700,
                                  color: AppColors.error)),
                        ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _placeholderBanner(String category) {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            AppColors.primary.withValues(alpha: 0.2),
            AppColors.stone900,
          ],
        ),
      ),
      child: Center(
        child: Icon(_categoryIcon(category),
            size: 48, color: AppColors.primary.withValues(alpha: 0.5)),
      ),
    );
  }

  Widget _buildErrorState() {
    return SizedBox(
      height: 300,
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.cloud_off_rounded,
                size: 48, color: AppColors.stone500),
            const SizedBox(height: 16),
            Text(_error ?? 'Something went wrong',
                style: GoogleFonts.inter(
                    fontSize: 14, color: AppColors.stone400),
                textAlign: TextAlign.center),
            const SizedBox(height: 16),
            GestureDetector(
              onTap: _fetchEvents,
              child: Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                decoration: BoxDecoration(
                  color: AppColors.primary,
                  borderRadius: BorderRadius.circular(9999),
                ),
                child: Text('Retry',
                    style: GoogleFonts.inter(
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        color: AppColors.black)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return SizedBox(
      height: 300,
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.event_busy_rounded,
                size: 48, color: AppColors.stone500),
            const SizedBox(height: 16),
            Text('No events found',
                style: GoogleFonts.plusJakartaSans(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    color: AppColors.stone300)),
            const SizedBox(height: 4),
            Text('Try a different category or check back later',
                style: GoogleFonts.inter(
                    fontSize: 13, color: AppColors.stone500)),
          ],
        ),
      ),
    );
  }
}
