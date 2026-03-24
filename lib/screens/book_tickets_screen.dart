import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'digital_ticket_screen.dart';
import '../utils/map_utils.dart';

class BookTicketsScreen extends StatefulWidget {
  final Map<String, dynamic> event;

  const BookTicketsScreen({super.key, required this.event});

  @override
  State<BookTicketsScreen> createState() => _BookTicketsScreenState();
}

class _BookTicketsScreenState extends State<BookTicketsScreen>
    with TickerProviderStateMixin {
  int _selectedTier = 0;
  int _ticketCount = 1;
  bool _isProcessing = false;

  late AnimationController _pulseController;
  late Animation<double> _pulseAnimation;

  List<Map<String, dynamic>> get tiers {
    final ticketTiers = widget.event['ticket_tiers'] as List<dynamic>? ?? [];
    if (ticketTiers.isEmpty) {
      // Fallback tiers if none from API
      return [
        {
          'tier_id': 'default',
          'tier_name': 'General Admission',
          'price': 999.0,
          'description': 'Standard entry',
          'perks': <String>[],
          'available_quantity': 100,
        },
      ];
    }
    return ticketTiers.map((t) {
      final tier = t as Map<String, dynamic>;
      return {
        'tier_id': tier['tier_id'] ?? '',
        'tier_name': tier['tier_name'] ?? 'General',
        'price': (tier['price'] ?? tier['current_price'] ?? 0).toDouble(),
        'description': tier['description'] ?? '',
        'perks': (tier['perks'] as List<dynamic>?)?.cast<String>() ?? <String>[],
        'available_quantity': tier['available_quantity'] ?? 0,
      };
    }).toList();
  }

  IconData _tierIcon(int index) {
    const icons = [
      Icons.confirmation_number_outlined,
      Icons.star_outline_rounded,
      Icons.diamond_outlined,
      Icons.workspace_premium_outlined,
    ];
    return icons[index % icons.length];
  }

  String get _eventTitle => widget.event['title'] ?? 'Event';
  String get _eventDate {
    final dt = widget.event['start_datetime'];
    if (dt == null) return '';
    try {
      final parsed = DateTime.parse(dt.toString());
      final months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ];
      return '${months[parsed.month - 1]} ${parsed.day}, ${parsed.year}';
    } catch (_) {
      return dt.toString();
    }
  }

  String get _eventVenue => widget.event['venue_name'] ?? '';
  double? get _eventLat => widget.event['lat'];
  double? get _eventLng => widget.event['lng'];

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    );
    _pulseAnimation = Tween<double>(begin: 1.0, end: 1.05).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );
    _pulseController.repeat(reverse: true);
  }

  @override
  void dispose() {
    _pulseController.dispose();
    super.dispose();
  }

  void _handleConfirmAndPay() async {
    setState(() => _isProcessing = true);
    await Future.delayed(const Duration(milliseconds: 2500));
    if (!mounted) return;
    setState(() => _isProcessing = false);

    final sel = tiers[_selectedTier];
    final price = (sel['price'] as double).round();
    final subtotal = price * _ticketCount;
    final total = subtotal + (subtotal * 0.05).round() + (subtotal * 0.18).round();
    
    // Generate a shorter, cleaner booking number using timezone-aware logic without bringing in math import if not needed
    final timestamp = DateTime.now().millisecondsSinceEpoch.toString();
    final bookingNumber = 'BK-${timestamp.substring(timestamp.length - 6)}';

    Navigator.push(
      context,
      PageRouteBuilder(
        transitionDuration: const Duration(milliseconds: 500),
        reverseTransitionDuration: const Duration(milliseconds: 300),
        pageBuilder: (context, animation, secondaryAnimation) =>
            DigitalTicketScreen(
          eventName: _eventTitle,
          eventDate: _eventDate,
          venue: _eventVenue,
          tierName: sel['tier_name'] as String,
          quantity: _ticketCount,
          totalAmount: total,
          bookingNumber: bookingNumber,
        ),
        transitionsBuilder: (context, animation, secondaryAnimation, child) {
          return FadeTransition(opacity: animation, child: child);
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final tierList = tiers;
    if (_selectedTier >= tierList.length) _selectedTier = 0;
    final sel = tierList[_selectedTier];
    final price = (sel['price'] as double).round();
    final subtotal = price * _ticketCount;
    final convenienceFee = (subtotal * 0.05).round();
    final gst = (subtotal * 0.18).round();
    final total = subtotal + convenienceFee + gst;

    final category = widget.event['category'] ?? '';
    final coverImage = widget.event['cover_image'] as String?;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: Stack(children: [
        // Ambient glow
        Positioned(
          top: -60,
          right: -80,
          child: Container(
            width: 250,
            height: 250,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: RadialGradient(
                colors: [
                  AppColors.primary.withValues(alpha: 0.06),
                  Colors.transparent,
                ],
              ),
            ),
          ),
        ),
        CustomScrollView(slivers: [
          SliverAppBar(
            floating: true,
            backgroundColor: AppColors.stone950.withValues(alpha: 0.9),
            leading: IconButton(
              icon: const Icon(Icons.arrow_back, color: AppColors.white),
              onPressed: () => Navigator.pop(context),
            ),
            title: Text('Book Tickets',
                style: GoogleFonts.plusJakartaSans(
                    fontSize: 20,
                    fontWeight: FontWeight.w800,
                    color: AppColors.white,
                    letterSpacing: -0.5)),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Event summary card
                    Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                          colors: [
                            AppColors.neutral900,
                            AppColors.neutral900.withValues(alpha: 0.8),
                          ],
                        ),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                            color: AppColors.white.withValues(alpha: 0.05)),
                      ),
                      child: Row(children: [
                        // Event image or icon
                        Container(
                          width: 64,
                          height: 64,
                          decoration: BoxDecoration(
                            gradient: coverImage == null
                                ? LinearGradient(
                                    colors: [
                                      AppColors.primary,
                                      AppColors.primary.withValues(alpha: 0.7),
                                    ],
                                  )
                                : null,
                            borderRadius: BorderRadius.circular(14),
                            boxShadow: [
                              BoxShadow(
                                color: AppColors.primary.withValues(alpha: 0.3),
                                blurRadius: 12,
                                spreadRadius: 1,
                              ),
                            ],
                          ),
                          clipBehavior: Clip.antiAlias,
                          child: coverImage != null
                              ? Image.network(coverImage,
                                  fit: BoxFit.cover,
                                  errorBuilder: (_, __, ___) =>
                                      const Icon(Icons.event, color: AppColors.black, size: 32))
                              : Icon(_categoryIcon(category),
                                  color: AppColors.black, size: 32),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                            child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                              Text(_eventTitle,
                                  style: GoogleFonts.plusJakartaSans(
                                      fontSize: 18,
                                      fontWeight: FontWeight.w700,
                                      color: AppColors.white),
                                  maxLines: 2,
                                  overflow: TextOverflow.ellipsis),
                              const SizedBox(height: 4),
                              Text(
                                  [_eventDate, _eventVenue]
                                      .where((s) => s.isNotEmpty)
                                      .join(' • '),
                                  style: GoogleFonts.inter(
                                      fontSize: 13,
                                      color: AppColors.stone400)),
                            ])),
                      ]),
                    ),
                    const SizedBox(height: 16),
                    
                    // Embedded Google Map
                    if (_eventLat != null && _eventLng != null)
                      Container(
                        height: 200,
                        margin: const EdgeInsets.symmetric(vertical: 8),
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: AppColors.stone800),
                          color: AppColors.neutral900,
                        ),
                        clipBehavior: Clip.antiAlias,
                        child: Stack(
                          children: [
                            GoogleMap(
                              initialCameraPosition: CameraPosition(
                                target: LatLng(_eventLat!, _eventLng!),
                                zoom: 15,
                              ),
                              markers: {
                                Marker(
                                  markerId: const MarkerId('venue_marker'),
                                  position: LatLng(_eventLat!, _eventLng!),
                                  infoWindow: InfoWindow(title: _eventVenue),
                                  icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueOrange),
                                ),
                              },
                              myLocationButtonEnabled: false,
                              zoomControlsEnabled: false,
                              mapToolbarEnabled: false,
                            ),
                            // Map Overlay Gradient for styling
                            Positioned.fill(
                              child: IgnorePointer(
                                child: Container(
                                  decoration: BoxDecoration(
                                    border: Border.all(color: AppColors.white.withValues(alpha: 0.1)),
                                    borderRadius: BorderRadius.circular(16),
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      
                    const SizedBox(height: 8),

                    // Get Directions Button (Always Visible)
                    GestureDetector(
                      onTap: () {
                        // Fallback to event title/city if venue isn't provided in data
                        final searchTarget = _eventVenue.isNotEmpty
                            ? _eventVenue
                            : '${_eventTitle} event location';
                        MapUtils.openMap(searchTarget);
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 20),
                        decoration: BoxDecoration(
                          color: AppColors.neutral900,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: AppColors.stone800),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(Icons.directions, color: AppColors.primary, size: 20),
                            const SizedBox(width: 8),
                            Text('Get Directions',
                                style: GoogleFonts.inter(
                                    fontSize: 14,
                                    fontWeight: FontWeight.w600,
                                    color: AppColors.white)),
                          ],
                        ),
                      ),
                    ),
                    
                    const SizedBox(height: 32),

                    // Ticket Tier Selection
                    Text('SELECT TIER',
                        style: GoogleFonts.inter(
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            color: AppColors.stone500,
                            letterSpacing: 2.0)),
                    const SizedBox(height: 16),
                    ...List.generate(tierList.length, (i) {
                      final t = tierList[i];
                      final isSelected = _selectedTier == i;
                      final avail = t['available_quantity'] as int;
                      final perksList = t['perks'] as List<String>;
                      final desc = t['description'] as String;
                      final subtitle = perksList.isNotEmpty
                          ? perksList.join(' • ')
                          : desc.isNotEmpty
                              ? desc
                              : 'Standard entry';

                      return GestureDetector(
                        onTap: avail > 0
                            ? () => setState(() => _selectedTier = i)
                            : null,
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 300),
                          curve: Curves.easeInOut,
                          margin: const EdgeInsets.only(bottom: 12),
                          padding: const EdgeInsets.all(20),
                          decoration: BoxDecoration(
                            gradient: isSelected
                                ? LinearGradient(
                                    colors: [
                                      AppColors.primary,
                                      AppColors.primary.withValues(alpha: 0.85),
                                    ],
                                  )
                                : null,
                            color: isSelected
                                ? null
                                : avail > 0
                                    ? AppColors.neutral900
                                    : AppColors.neutral900.withValues(alpha: 0.5),
                            borderRadius: BorderRadius.circular(16),
                            border: isSelected
                                ? null
                                : Border.all(color: AppColors.stone800),
                            boxShadow: isSelected
                                ? [
                                    BoxShadow(
                                      color: AppColors.primary
                                          .withValues(alpha: 0.2),
                                      blurRadius: 16,
                                      spreadRadius: 1,
                                    ),
                                  ]
                                : null,
                          ),
                          child: Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Row(children: [
                                  Icon(
                                    _tierIcon(i),
                                    color: isSelected
                                        ? AppColors.black
                                        : avail > 0
                                            ? AppColors.stone400
                                            : AppColors.stone600,
                                    size: 22,
                                  ),
                                  const SizedBox(width: 14),
                                  Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Text(t['tier_name'] as String,
                                            style: GoogleFonts.inter(
                                                fontSize: 16,
                                                fontWeight: FontWeight.w700,
                                                color: isSelected
                                                    ? AppColors.black
                                                    : avail > 0
                                                        ? AppColors.white
                                                        : AppColors.stone500)),
                                        const SizedBox(height: 2),
                                        SizedBox(
                                          width: MediaQuery.of(context)
                                                  .size
                                                  .width *
                                              0.38,
                                          child: Text(subtitle,
                                              style: GoogleFonts.inter(
                                                  fontSize: 12,
                                                  color: isSelected
                                                      ? AppColors.black
                                                          .withValues(
                                                              alpha: 0.6)
                                                      : AppColors.stone400),
                                              overflow: TextOverflow.ellipsis,
                                              maxLines: 1),
                                        ),
                                      ]),
                                ]),
                                Column(
                                    crossAxisAlignment: CrossAxisAlignment.end,
                                    children: [
                                      Text(
                                          '₹${(t['price'] as double).round()}',
                                          style: GoogleFonts.plusJakartaSans(
                                              fontSize: 20,
                                              fontWeight: FontWeight.w800,
                                              color: isSelected
                                                  ? AppColors.black
                                                  : avail > 0
                                                      ? AppColors.white
                                                      : AppColors.stone500)),
                                      if (avail == 0)
                                        Text('SOLD OUT',
                                            style: GoogleFonts.inter(
                                                fontSize: 9,
                                                fontWeight: FontWeight.w700,
                                                letterSpacing: 1.0,
                                                color: AppColors.error)),
                                      if (avail > 0 && avail <= 20)
                                        Text('$avail LEFT',
                                            style: GoogleFonts.inter(
                                                fontSize: 9,
                                                fontWeight: FontWeight.w700,
                                                letterSpacing: 1.0,
                                                color: const Color(
                                                    0xFFFBBF24))),
                                    ]),
                              ]),
                        ),
                      );
                    }),

                    const SizedBox(height: 24),
                    // Ticket count
                    Text('TICKETS',
                        style: GoogleFonts.inter(
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            color: AppColors.stone500,
                            letterSpacing: 2.0)),
                    const SizedBox(height: 16),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 24, vertical: 16),
                      decoration: BoxDecoration(
                          color: AppColors.neutral900,
                          borderRadius: BorderRadius.circular(16)),
                      child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text('Number of tickets',
                                style: GoogleFonts.inter(
                                    fontSize: 14, color: AppColors.stone200)),
                            Row(children: [
                              _counterBtn(Icons.remove, () {
                                if (_ticketCount > 1) {
                                  setState(() => _ticketCount--);
                                }
                              }),
                              Padding(
                                padding:
                                    const EdgeInsets.symmetric(horizontal: 20),
                                child: Text('$_ticketCount',
                                    style: GoogleFonts.plusJakartaSans(
                                        fontSize: 20,
                                        fontWeight: FontWeight.w700,
                                        color: AppColors.white)),
                              ),
                              _counterBtn(Icons.add, () {
                                final maxTix = (sel['available_quantity'] as int)
                                    .clamp(0, 10);
                                if (_ticketCount < maxTix) {
                                  setState(() => _ticketCount++);
                                }
                              }),
                            ]),
                          ]),
                    ),

                    const SizedBox(height: 32),
                    // Order Summary
                    Text('ORDER SUMMARY',
                        style: GoogleFonts.inter(
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            color: AppColors.stone500,
                            letterSpacing: 2.0)),
                    const SizedBox(height: 16),
                    Container(
                      padding: const EdgeInsets.all(24),
                      decoration: BoxDecoration(
                          color: AppColors.neutral900,
                          borderRadius: BorderRadius.circular(16)),
                      child: Column(children: [
                        _summaryRow(
                            '${sel['tier_name']} × $_ticketCount', '₹$subtotal'),
                        const SizedBox(height: 8),
                        _summaryRow('Convenience fee', '₹$convenienceFee'),
                        const SizedBox(height: 8),
                        _summaryRow('GST (18%)', '₹$gst'),
                        const SizedBox(height: 12),
                        const Divider(color: AppColors.stone800),
                        const SizedBox(height: 12),
                        Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text('Total',
                                  style: GoogleFonts.inter(
                                      fontSize: 16,
                                      fontWeight: FontWeight.w700,
                                      color: AppColors.white)),
                              Text('₹$total',
                                  style: GoogleFonts.plusJakartaSans(
                                      fontSize: 24,
                                      fontWeight: FontWeight.w800,
                                      color: AppColors.primary)),
                            ]),
                      ]),
                    ),

                    const SizedBox(height: 24),
                    Center(
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.lock_outline_rounded,
                              color: AppColors.stone500, size: 14),
                          const SizedBox(width: 6),
                          Text('Secured by 256-bit encryption',
                              style: GoogleFonts.inter(
                                  fontSize: 12, color: AppColors.stone500)),
                        ],
                      ),
                    ),
                    const SizedBox(height: 120),
                  ]),
            ),
          ),
        ]),

        // Bottom CTA
        Positioned(
          left: 0,
          right: 0,
          bottom: 0,
          child: Container(
            padding: const EdgeInsets.fromLTRB(24, 16, 24, 32),
            decoration: BoxDecoration(
              color: AppColors.background.withValues(alpha: 0.95),
              border: Border(
                  top: BorderSide(
                      color: AppColors.stone800.withValues(alpha: 0.5))),
            ),
            child: ScaleTransition(
              scale: _pulseAnimation,
              child: GestureDetector(
                onTap: _isProcessing ? null : _handleConfirmAndPay,
                child: Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(vertical: 20),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [
                        AppColors.primary,
                        AppColors.primary.withValues(alpha: 0.85),
                      ],
                    ),
                    borderRadius: BorderRadius.circular(9999),
                    boxShadow: [
                      BoxShadow(
                        color: AppColors.primary.withValues(alpha: 0.3),
                        blurRadius: 20,
                        spreadRadius: 2,
                      ),
                    ],
                  ),
                  child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text('Confirm & Pay ₹$total',
                            style: GoogleFonts.inter(
                                fontSize: 18,
                                fontWeight: FontWeight.w700,
                                color: AppColors.black)),
                        const SizedBox(width: 8),
                        const Icon(Icons.arrow_forward, color: AppColors.black),
                      ]),
                ),
              ),
            ),
          ),
        ),

        // Processing overlay
        if (_isProcessing) _buildProcessingOverlay(),
      ]),
    );
  }

  IconData _categoryIcon(String category) {
    switch (category.toLowerCase()) {
      case 'concert':
        return Icons.music_note;
      case 'sports':
        return Icons.sports;
      case 'conference':
        return Icons.business;
      case 'theater':
        return Icons.theater_comedy;
      case 'festival':
        return Icons.celebration;
      case 'comedy':
        return Icons.sentiment_very_satisfied;
      case 'workshop':
        return Icons.build;
      case 'exhibition':
        return Icons.museum;
      default:
        return Icons.event;
    }
  }

  Widget _buildProcessingOverlay() {
    return Container(
      color: AppColors.black.withValues(alpha: 0.85),
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TweenAnimationBuilder<double>(
              tween: Tween(begin: 0.0, end: 1.0),
              duration: const Duration(milliseconds: 600),
              builder: (context, value, child) {
                return Transform.scale(
                  scale: value,
                  child: Container(
                    width: 80,
                    height: 80,
                    decoration: BoxDecoration(
                      color: AppColors.primary.withValues(alpha: 0.15),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.payment_rounded,
                        color: AppColors.primary, size: 36),
                  ),
                );
              },
            ),
            const SizedBox(height: 32),
            Text('Processing Payment',
                style: GoogleFonts.plusJakartaSans(
                    fontSize: 22,
                    fontWeight: FontWeight.w700,
                    color: AppColors.white)),
            const SizedBox(height: 8),
            Text('Please wait while we confirm your booking...',
                style: GoogleFonts.inter(fontSize: 14, color: AppColors.stone400)),
            const SizedBox(height: 32),
            SizedBox(
              width: 200,
              child: LinearProgressIndicator(
                backgroundColor: AppColors.stone800,
                valueColor: AlwaysStoppedAnimation<Color>(AppColors.primary),
                minHeight: 3,
                borderRadius: BorderRadius.circular(9999),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _counterBtn(IconData icon, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 36,
        height: 36,
        decoration: const BoxDecoration(
            color: AppColors.stone800, shape: BoxShape.circle),
        child: Icon(icon, color: AppColors.white, size: 18),
      ),
    );
  }

  Widget _summaryRow(String label, String value) {
    return Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
      Text(label,
          style: GoogleFonts.inter(fontSize: 14, color: AppColors.stone400)),
      Text(value,
          style: GoogleFonts.inter(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: AppColors.stone200)),
    ]);
  }
}
