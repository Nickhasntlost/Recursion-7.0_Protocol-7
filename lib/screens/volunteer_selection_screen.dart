import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../theme/app_theme.dart';
import 'package:google_fonts/google_fonts.dart';

class VolunteerSelectionScreen extends StatelessWidget {
  const VolunteerSelectionScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: Stack(children: [
        CustomScrollView(slivers: [
          SliverAppBar(
            floating: true,
            backgroundColor: AppColors.stone950.withValues(alpha: 0.8),
            leading: Padding(
              padding: const EdgeInsets.all(8),
              child: Container(
                decoration: const BoxDecoration(shape: BoxShape.circle),
                child: IconButton(
                  icon: const Icon(Icons.arrow_back, color: AppColors.stone100),
                  onPressed: () => Navigator.pop(context),
                ),
              ),
            ),
            title: Text('Become a Volunteer', style: GoogleFonts.plusJakartaSans(
                fontSize: 20, fontWeight: FontWeight.w800,
                color: AppColors.stone100, letterSpacing: -0.5)),
            actions: [
              Padding(
                padding: const EdgeInsets.only(right: 16),
                child: Container(
                  width: 40, height: 40,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle, color: AppColors.stone800,
                    border: Border.all(color: AppColors.stone700)),
                  clipBehavior: Clip.antiAlias,
                  child: CachedNetworkImage(
                    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Ranbir_Kapoor_promoting_Brahmastra.jpg/800px-Ranbir_Kapoor_promoting_Brahmastra.jpg',
                    fit: BoxFit.cover),
                ),
              ),
            ],
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                // Header
                Text('Join the Collective', style: GoogleFonts.plusJakartaSans(
                    fontSize: 36, fontWeight: FontWeight.w800,
                    color: AppColors.stone50, letterSpacing: -1)),
                const SizedBox(height: 8),
                Text('Fill in your details to start supporting our curated experiences.',
                    style: GoogleFonts.inter(fontSize: 16, color: AppColors.stone400, height: 1.5)),
                const SizedBox(height: 32),
                // Form
                _formField('Full Name', 'Rahul Sharma'),
                const SizedBox(height: 16),
                _formField('Email Address', 'rahul@utsova.io'),
                const SizedBox(height: 16),
                _formField('Phone Number', '+1 (555) 000-0000'),
                const SizedBox(height: 40),
                // Events header
                Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                  Text('Available\nOpportunities', style: GoogleFonts.plusJakartaSans(
                      fontSize: 24, fontWeight: FontWeight.w700,
                      color: AppColors.stone50, letterSpacing: -0.5)),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                    decoration: BoxDecoration(
                        color: AppColors.primary, borderRadius: BorderRadius.circular(9999)),
                    child: Text('48 SPOTS LEFT', style: GoogleFonts.inter(
                        fontSize: 12, fontWeight: FontWeight.w700,
                        color: AppColors.black, letterSpacing: -0.2)),
                  ),
                ]),
                const SizedBox(height: 24),
                // Event cards
                _eventCard(
                  'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/India_film_clapperboard_%28variant%29.svg/960px-India_film_clapperboard_%28variant%29.svg.png',
                  'Indie Film Festival', 'Assist with guest check-in and lounge coordination at the PVR Director\'s Cut.',
                  '12 spots left', '6 PM - 11 PM', true),
                const SizedBox(height: 24),
                _eventCard(
                  'https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/SeedheMaut%28SM%29.jpg/960px-SeedheMaut%28SM%29.jpg',
                  'Hip Hop Night', 'Support stage management and artist hospitality at the Talkatora Stadium.',
                  '4 spots left', '8 PM - 1 AM', false),
                const SizedBox(height: 24),
                _eventCard(
                  'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Raja_Ravi_Varma_-_Mahabharata_-_Shantanu_and_Matsyagandha.jpg/800px-Raja_Ravi_Varma_-_Mahabharata_-_Shantanu_and_Matsyagandha.jpg',
                  'Gallery Opening', 'Provide information to visitors about the featured Indian art collection.',
                  '8 spots left', '5 PM - 9 PM', false),
                const SizedBox(height: 120),
              ]),
            ),
          ),
        ]),
        // Bottom CTA
        Positioned(left: 0, right: 0, bottom: 0, child: _buildBottomCTA()),
      ]),
    );
  }

  Widget _formField(String label, String placeholder) {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Padding(
        padding: const EdgeInsets.only(left: 16, bottom: 4),
        child: Text(label.toUpperCase(), style: GoogleFonts.inter(
            fontSize: 10, fontWeight: FontWeight.w700,
            color: AppColors.stone500, letterSpacing: 2.0)),
      ),
      Container(
        width: double.infinity, padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
        decoration: BoxDecoration(
            color: AppColors.stone900, borderRadius: BorderRadius.circular(9999)),
        child: Text(placeholder, style: GoogleFonts.inter(
            fontSize: 16, color: AppColors.stone600)),
      ),
    ]);
  }

  Widget _eventCard(String img, String title, String desc,
      String spots, String time, bool selected) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: selected ? AppColors.primary : AppColors.stone900,
        borderRadius: BorderRadius.circular(16)),
      child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Container(
          width: 96, height: 128,
          decoration: BoxDecoration(borderRadius: BorderRadius.circular(12),
              boxShadow: selected ? [BoxShadow(color: AppColors.black.withValues(alpha: 0.3), blurRadius: 16)] : null),
          clipBehavior: Clip.antiAlias,
          child: CachedNetworkImage(imageUrl: img, fit: BoxFit.cover,
              color: selected ? null : const Color(0xFF808080),
              colorBlendMode: selected ? null : BlendMode.saturation),
        ),
        const SizedBox(width: 24),
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
            Expanded(child: Text(title, style: GoogleFonts.plusJakartaSans(
                fontSize: 20, fontWeight: FontWeight.w700,
                color: selected ? AppColors.black : AppColors.stone100, letterSpacing: -0.5))),
            Container(
              width: 48, height: 48,
              decoration: BoxDecoration(
                  color: selected ? AppColors.black : AppColors.stone800,
                  shape: BoxShape.circle),
              child: Icon(selected ? Icons.check_circle : Icons.add,
                  color: selected ? AppColors.primary : AppColors.stone400),
            ),
          ]),
          const SizedBox(height: 8),
          Text(desc, maxLines: 2, overflow: TextOverflow.ellipsis,
              style: GoogleFonts.inter(fontSize: 14,
                  color: selected ? AppColors.black.withValues(alpha: 0.7) : AppColors.stone400)),
          const SizedBox(height: 16),
          Row(children: [
            Icon(Icons.group, size: 14,
                color: selected ? AppColors.black.withValues(alpha: 0.6) : AppColors.stone500),
            const SizedBox(width: 6),
            Text(spots, style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w700,
                color: selected ? AppColors.black.withValues(alpha: 0.6) : AppColors.stone500)),
            const SizedBox(width: 16),
            Icon(Icons.schedule, size: 14,
                color: selected ? AppColors.black.withValues(alpha: 0.6) : AppColors.stone500),
            const SizedBox(width: 6),
            Text(time, style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w700,
                color: selected ? AppColors.black.withValues(alpha: 0.6) : AppColors.stone500)),
          ]),
        ])),
      ]),
    );
  }

  Widget _buildBottomCTA() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
          gradient: LinearGradient(begin: Alignment.topCenter, end: Alignment.bottomCenter,
              colors: [AppColors.stone950.withValues(alpha: 0), AppColors.stone950.withValues(alpha: 0.8), AppColors.stone950])),
      child: Container(
        width: double.infinity, padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 32),
        decoration: BoxDecoration(
            color: AppColors.primary, borderRadius: BorderRadius.circular(9999),
            boxShadow: [BoxShadow(color: AppColors.black.withValues(alpha: 0.4), blurRadius: 50, offset: const Offset(0, 20))]),
        child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
          Text('Confirm Selection', style: GoogleFonts.inter(
              fontSize: 18, fontWeight: FontWeight.w700, color: AppColors.black)),
          Row(children: [
            Text('1 Event', style: GoogleFonts.inter(
                fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.black.withValues(alpha: 0.6))),
            const SizedBox(width: 8),
            const Icon(Icons.arrow_forward, color: AppColors.black),
          ]),
        ]),
      ),
    );
  }
}
