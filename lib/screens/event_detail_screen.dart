import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../theme/app_theme.dart';
import 'package:google_fonts/google_fonts.dart';
import 'book_experience_screen.dart';

class EventDetailScreen extends StatelessWidget {
  final Map<String, dynamic>? event;

  const EventDetailScreen({super.key, this.event});

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

  @override
  Widget build(BuildContext context) {
    // Extract dynamic data with fallbacks
    final title = event?['title'] ?? 'Karan Aujla\nIt Was All A Dream';
    final location = event?['location'] ?? 'JLN Stadium';
    final city = event?['city'] ?? 'New Delhi, India';
    final date = event?['start_datetime']?.toString().substring(0, 10) ?? 'Apr 12, 2025';
    final category = (event?['category'] ?? 'MUSIC & LIVE').toString().toUpperCase();
    final description = event?['description'] ?? 
        'An unforgettable night with Karan Aujla performing his biggest hits live. '
        'Get ready for electrifying Punjabi beats, insane energy, and a crowd of 50,000+ fans. '
        'Food stalls, merch booths, and VIP lounges available.';
    
    final imageUrl = _getImageForEvent(title);
    
    return Scaffold(
      backgroundColor: AppColors.background,
      body: Stack(children: [
        CustomScrollView(slivers: [
          SliverAppBar(
            floating: true,
            backgroundColor: AppColors.background.withValues(alpha: 0.8),
            leading: Padding(
              padding: const EdgeInsets.all(8),
              child: Container(
                decoration: const BoxDecoration(color: AppColors.surfaceContainerLow, shape: BoxShape.circle),
                child: IconButton(
                  icon: const Icon(Icons.arrow_back, color: AppColors.onSurface),
                  onPressed: () => Navigator.pop(context),
                ),
              ),
            ),
            title: Text('CURATED', style: GoogleFonts.plusJakartaSans(
                fontSize: 24, fontWeight: FontWeight.w700,
                color: AppColors.white, letterSpacing: -1)),
            actions: [
              GestureDetector(
                onTap: () {
                  // Dummy action
                },
                child: Padding(
                  padding: const EdgeInsets.all(8),
                  child: Container(
                    width: 40, height: 40,
                    decoration: const BoxDecoration(color: AppColors.surfaceContainerLow, shape: BoxShape.circle),
                    child: const Icon(Icons.share, color: AppColors.onSurface, size: 20),
                  ),
                ),
              ),
              const SizedBox(width: 8),
            ],
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                _buildHero(imageUrl, category),
                const SizedBox(height: 32),
                _buildEventIdentity(title, location, city, date),
                const SizedBox(height: 40),
                _buildOrganizerSection(description),
                const SizedBox(height: 40),
                _buildTicketTiers(),
                const SizedBox(height: 120),
              ]),
            ),
          ),
        ]),
        Positioned(left: 0, right: 0, bottom: 0, child: _buildStickyBottom(context)),
      ]),
    );
  }

  Widget _buildHero(String imageUrl, String category) {
    return Stack(children: [
      Container(
        width: double.infinity, height: 360,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          color: AppColors.surfaceContainerHigh,
          boxShadow: [BoxShadow(color: AppColors.black.withValues(alpha: 0.4), blurRadius: 32, offset: const Offset(0, 16))],
        ),
        clipBehavior: Clip.antiAlias,
        child: CachedNetworkImage(
          imageUrl: imageUrl,
          fit: BoxFit.cover,
          placeholder: (c, u) => Container(color: AppColors.surfaceContainerHigh),
          errorWidget: (c, u, e) => Container(color: AppColors.surfaceContainerHigh,
              child: const Icon(Icons.image, color: AppColors.stone500, size: 48)),
        ),
      ),
      Positioned(top: 16, left: 16,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
          decoration: BoxDecoration(
            color: AppColors.primary, borderRadius: BorderRadius.circular(9999),
            boxShadow: [BoxShadow(color: AppColors.black.withValues(alpha: 0.3), blurRadius: 16)]),
          child: Text(category, style: GoogleFonts.inter(
              fontSize: 10, fontWeight: FontWeight.w700,
              color: AppColors.onPrimary, letterSpacing: 2.0)),
        ),
      ),
    ]);
  }

  Widget _buildEventIdentity(String title, String location, String city, String date) {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text(title, style: GoogleFonts.plusJakartaSans(
          fontSize: 40, fontWeight: FontWeight.w800,
          color: AppColors.white, letterSpacing: -2, height: 0.95)),
      const SizedBox(height: 20),
      Row(children: [
        Container(
          width: 40, height: 40,
          decoration: const BoxDecoration(color: AppColors.surfaceContainerLow, shape: BoxShape.circle),
          child: const Icon(Icons.location_on, color: AppColors.primary, size: 20),
        ),
        const SizedBox(width: 12),
        Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(location, style: GoogleFonts.inter(
              fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.white)),
          Text(city, style: GoogleFonts.inter(fontSize: 12, color: AppColors.onSurfaceVariant)),
        ]),
      ]),
      const SizedBox(height: 16),
      Row(children: [
        Container(
          width: 40, height: 40,
          decoration: const BoxDecoration(color: AppColors.surfaceContainerLow, shape: BoxShape.circle),
          child: const Icon(Icons.calendar_today, color: AppColors.primary, size: 20),
        ),
        const SizedBox(width: 12),
        Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(date, style: GoogleFonts.inter(
              fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.white)),
          Text('19:00 — 23:00 IST', style: GoogleFonts.inter(fontSize: 12, color: AppColors.onSurfaceVariant)), // Still mock time
        ]),
      ]),
    ]);
  }

  Widget _buildOrganizerSection(String description) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
          color: AppColors.surfaceContainerLow, borderRadius: BorderRadius.circular(16)),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
          Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('ORGANIZED BY', style: GoogleFonts.inter(
                fontSize: 10, fontWeight: FontWeight.w700,
                color: AppColors.onSurfaceVariant, letterSpacing: 3.0)),
            const SizedBox(height: 4),
            Text('Team Innovation', style: GoogleFonts.inter(
                fontSize: 18, fontWeight: FontWeight.w700, color: AppColors.white)),
          ]),
          Container(
            width: 48, height: 48,
            decoration: BoxDecoration(color: AppColors.primary, borderRadius: BorderRadius.circular(12)),
            child: const Icon(Icons.token, color: AppColors.onPrimary, size: 24),
          ),
        ]),
        const SizedBox(height: 20),
        Text(
          description,
          style: GoogleFonts.inter(fontSize: 14, color: AppColors.onSurfaceVariant, height: 1.6),
        ),
        const SizedBox(height: 20),
        Row(children: [
          SizedBox(
            width: 80, height: 32,
            child: Stack(children: [
              _avatar(0, 'https://upload.wikimedia.org/wikipedia/commons/7/76/Karan_Aujla_2020.jpg'),
              _avatar(18, 'https://upload.wikimedia.org/wikipedia/commons/4/46/Samay_raina_%28cropped%29.jpg'),
              _avatar(36, 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/SeedheMaut%28SM%29.jpg/960px-SeedheMaut%28SM%29.jpg'),
              Positioned(left: 54, child: Container(
                width: 32, height: 32,
                decoration: BoxDecoration(
                  color: AppColors.primary, shape: BoxShape.circle,
                  border: Border.all(color: AppColors.surfaceContainerLow, width: 2)),
                child: Center(child: Text('+2.4k', style: GoogleFonts.inter(
                    fontSize: 9, fontWeight: FontWeight.w700, color: AppColors.onPrimary))),
              )),
            ]),
          ),
          const SizedBox(width: 12),
          Text('Already attending', style: GoogleFonts.inter(
              fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.primary)),
        ]),
      ]),
    );
  }

  Widget _avatar(double left, String url) {
    return Positioned(left: left, child: Container(
      width: 32, height: 32,
      decoration: BoxDecoration(shape: BoxShape.circle,
          border: Border.all(color: AppColors.surfaceContainerLow, width: 2)),
      clipBehavior: Clip.antiAlias,
      child: CachedNetworkImage(imageUrl: url, fit: BoxFit.cover),
    ));
  }

  Widget _buildTicketTiers() {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text('Ticket Tiers', style: GoogleFonts.plusJakartaSans(
          fontSize: 24, fontWeight: FontWeight.w700,
          color: AppColors.white, letterSpacing: -0.5)),
      const SizedBox(height: 24),
      _ticketCard('Standard', 'General entry + digital pass', '₹1,499', 'Available', false),
      const SizedBox(height: 16),
      _ticketCard('VIP', 'Front row + meet & greet + merch', '₹3,999', 'Selling Fast', true),
      const SizedBox(height: 16),
      _ticketCard('Platinum', 'VIP lounge + backstage + dinner', '₹7,999', 'Limited', false),
    ]);
  }

  Widget _ticketCard(String title, String sub, String price, String status, bool featured) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: featured ? AppColors.primary : AppColors.surfaceContainerLowest,
        borderRadius: BorderRadius.circular(16),
        border: featured ? null : Border.all(color: AppColors.outlineVariant.withValues(alpha: 0.1)),
        boxShadow: featured ? [BoxShadow(color: AppColors.primary.withValues(alpha: 0.2), blurRadius: 24)] : null,
      ),
      child: Stack(children: [
        if (featured)
          Positioned(top: -8, right: -8, child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
            decoration: const BoxDecoration(
              color: AppColors.black,
              borderRadius: BorderRadius.only(bottomLeft: Radius.circular(8))),
            child: Text('MOST POPULAR', style: GoogleFonts.inter(
                fontSize: 8, fontWeight: FontWeight.w700,
                color: AppColors.white, letterSpacing: 2.0)),
          )),
        Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(title, style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.w700,
                color: featured ? AppColors.black : AppColors.white)),
            const SizedBox(height: 4),
            Text(sub, style: GoogleFonts.inter(fontSize: 12,
                color: featured ? AppColors.black.withValues(alpha: 0.7) : AppColors.onSurfaceVariant)),
          ])),
          Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
            Text(price, style: GoogleFonts.inter(fontSize: 20, fontWeight: FontWeight.w800,
                color: featured ? AppColors.black : AppColors.white)),
            Text(status.toUpperCase(), style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.w700,
                color: featured ? AppColors.black.withValues(alpha: 0.7) : AppColors.primary)),
          ]),
        ]),
      ]),
    );
  }

  Widget _buildStickyBottom(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.background.withValues(alpha: 0.9),
        border: Border(top: BorderSide(color: AppColors.outlineVariant.withValues(alpha: 0.1))),
        boxShadow: [BoxShadow(color: AppColors.black.withValues(alpha: 0.4), blurRadius: 32)],
      ),
      padding: const EdgeInsets.fromLTRB(24, 16, 24, 32),
      child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
        Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisSize: MainAxisSize.min, children: [
          Text('STARTING FROM', style: GoogleFonts.inter(
              fontSize: 10, fontWeight: FontWeight.w700,
              color: AppColors.onSurfaceVariant, letterSpacing: 2.0)),
          const SizedBox(height: 2),
          Text('₹1,499', style: GoogleFonts.plusJakartaSans(
              fontSize: 24, fontWeight: FontWeight.w800, color: AppColors.white)),
        ]),
        GestureDetector(
          onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const BookExperienceScreen())),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
            decoration: BoxDecoration(
              color: AppColors.primary, borderRadius: BorderRadius.circular(9999),
              boxShadow: [BoxShadow(color: AppColors.primary.withValues(alpha: 0.2), blurRadius: 16)]),
            child: Row(children: [
              Text('Book Now', style: GoogleFonts.inter(
                  fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.onPrimary)),
              const SizedBox(width: 8),
              const Icon(Icons.arrow_forward, color: AppColors.onPrimary, size: 18),
            ]),
          ),
        ),
      ]),
    );
  }
}
