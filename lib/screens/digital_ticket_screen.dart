import 'dart:math';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_theme.dart';
import '../utils/map_utils.dart';

class DigitalTicketScreen extends StatefulWidget {
  final String eventName;
  final String eventDate;
  final String venue;
  final String tierName;
  final int quantity;
  final int totalAmount;
  final String bookingNumber;

  const DigitalTicketScreen({
    super.key,
    required this.eventName,
    required this.eventDate,
    required this.venue,
    required this.tierName,
    required this.quantity,
    required this.totalAmount,
    required this.bookingNumber,
  });

  @override
  State<DigitalTicketScreen> createState() => _DigitalTicketScreenState();
}

class _DigitalTicketScreenState extends State<DigitalTicketScreen>
    with TickerProviderStateMixin {
  late AnimationController _slideController;
  late AnimationController _shimmerController;
  late Animation<Offset> _slideAnimation;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();
    _slideController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    );
    _shimmerController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat();

    _slideAnimation = Tween<Offset>(
      begin: const Offset(0, 0.3),
      end: Offset.zero,
    ).animate(CurvedAnimation(parent: _slideController, curve: Curves.easeOutBack));

    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _slideController, curve: Curves.easeOut),
    );

    _slideController.forward();
  }

  @override
  void dispose() {
    _slideController.dispose();
    _shimmerController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: Stack(
        children: [
          // Ambient background glow
          Positioned(
            top: -100,
            left: -50,
            child: Container(
              width: 300,
              height: 300,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [
                    AppColors.primary.withValues(alpha: 0.15),
                    Colors.transparent,
                  ],
                ),
              ),
            ),
          ),
          Positioned(
            bottom: -80,
            right: -60,
            child: Container(
              width: 250,
              height: 250,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [
                    AppColors.primary.withValues(alpha: 0.08),
                    Colors.transparent,
                  ],
                ),
              ),
            ),
          ),
          SafeArea(
            child: Column(
              children: [
                // App bar
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      IconButton(
                        icon: const Icon(Icons.close, color: AppColors.white, size: 28),
                        onPressed: () => Navigator.pop(context),
                      ),
                      Text('Your Ticket',
                          style: GoogleFonts.plusJakartaSans(
                              fontSize: 18,
                              fontWeight: FontWeight.w700,
                              color: AppColors.white)),
                      const SizedBox(width: 48),
                    ],
                  ),
                ),
                const SizedBox(height: 8),

                // Success badge
                FadeTransition(
                  opacity: _fadeAnimation,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                    decoration: BoxDecoration(
                      color: const Color(0xFF166534).withValues(alpha: 0.3),
                      borderRadius: BorderRadius.circular(9999),
                      border: Border.all(color: const Color(0xFF22C55E).withValues(alpha: 0.4)),
                    ),
                    child: Row(mainAxisSize: MainAxisSize.min, children: [
                      const Icon(Icons.check_circle, color: Color(0xFF22C55E), size: 20),
                      const SizedBox(width: 8),
                      Text('Booking Confirmed',
                          style: GoogleFonts.inter(
                              fontSize: 14,
                              fontWeight: FontWeight.w700,
                              color: const Color(0xFF22C55E))),
                    ]),
                  ),
                ),

                const SizedBox(height: 24),

                // Ticket card
                Expanded(
                  child: SlideTransition(
                    position: _slideAnimation,
                    child: FadeTransition(
                      opacity: _fadeAnimation,
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 24),
                        child: _buildTicketCard(),
                      ),
                    ),
                  ),
                ),

                // Bottom actions
                FadeTransition(
                  opacity: _fadeAnimation,
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(24, 16, 24, 24),
                    child: Row(
                      children: [
                        Expanded(
                          child: _actionButton(
                            Icons.download_rounded,
                            'Save',
                            AppColors.stone800,
                            AppColors.white,
                            () => _showSnack('Ticket saved to gallery! 📸'),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: _actionButton(
                            Icons.share_rounded,
                            'Share',
                            AppColors.primary,
                            AppColors.black,
                            () => _showSnack('Share link copied! 🔗'),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTicketCard() {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(24),
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Color(0xFF1E1E1E),
            Color(0xFF141414),
            Color(0xFF0F0F0F),
          ],
        ),
        border: Border.all(color: AppColors.stone700.withValues(alpha: 0.5)),
        boxShadow: [
          BoxShadow(
            color: AppColors.primary.withValues(alpha: 0.08),
            blurRadius: 40,
            spreadRadius: 2,
          ),
        ],
      ),
      child: Column(
        children: [
          // Top section — Event info
          Expanded(
            flex: 5,
            child: Padding(
              padding: const EdgeInsets.all(28),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Event icon + tier badge
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Container(
                        width: 56,
                        height: 56,
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            colors: [
                              AppColors.primary,
                              AppColors.primary.withValues(alpha: 0.7),
                            ],
                          ),
                          borderRadius: BorderRadius.circular(14),
                        ),
                        child: const Icon(Icons.music_note_rounded,
                            color: AppColors.black, size: 28),
                      ),
                      AnimatedBuilder(
                        animation: _shimmerController,
                        builder: (context, child) {
                          return Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 16, vertical: 8),
                            decoration: BoxDecoration(
                              gradient: LinearGradient(
                                colors: [
                                  AppColors.primary,
                                  AppColors.primary.withValues(alpha: 0.8),
                                  AppColors.primary,
                                ],
                                stops: [
                                  (_shimmerController.value - 0.3).clamp(0.0, 1.0),
                                  _shimmerController.value,
                                  (_shimmerController.value + 0.3).clamp(0.0, 1.0),
                                ],
                              ),
                              borderRadius: BorderRadius.circular(9999),
                            ),
                            child: Text(
                              widget.tierName.toUpperCase(),
                              style: GoogleFonts.inter(
                                fontSize: 11,
                                fontWeight: FontWeight.w800,
                                color: AppColors.black,
                                letterSpacing: 2.0,
                              ),
                            ),
                          );
                        },
                      ),
                    ],
                  ),

                  const SizedBox(height: 24),

                  // Event name
                  Text(
                    widget.eventName,
                    style: GoogleFonts.plusJakartaSans(
                      fontSize: 28,
                      fontWeight: FontWeight.w800,
                      color: AppColors.white,
                      letterSpacing: -0.5,
                      height: 1.2,
                    ),
                  ),
                  const SizedBox(height: 12),

                  // Date & venue
                  Row(children: [
                    Icon(Icons.calendar_today_rounded,
                        color: AppColors.stone400, size: 14),
                    const SizedBox(width: 6),
                    Text(widget.eventDate,
                        style: GoogleFonts.inter(
                            fontSize: 13,
                            color: AppColors.stone400,
                            fontWeight: FontWeight.w500)),
                  ]),
                  const SizedBox(height: 6),
                  Row(children: [
                    Icon(Icons.location_on_rounded,
                        color: AppColors.stone400, size: 14),
                    const SizedBox(width: 6),
                    Expanded(
                      child: Text(widget.venue.isNotEmpty ? widget.venue : 'Location details TBA',
                          style: GoogleFonts.inter(
                              fontSize: 13,
                              color: AppColors.stone400,
                              fontWeight: FontWeight.w500),
                          overflow: TextOverflow.ellipsis),
                    ),
                    GestureDetector(
                      onTap: () {
                        final searchTarget = widget.venue.isNotEmpty
                            ? widget.venue
                            : '${widget.eventName} event location';
                        MapUtils.openMap(searchTarget);
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppColors.stone800.withValues(alpha: 0.5),
                          borderRadius: BorderRadius.circular(9999),
                          border: Border.all(color: AppColors.stone700),
                        ),
                        child: Row(
                          children: [
                            Text('Map', style: GoogleFonts.inter(fontSize: 11, color: AppColors.white, fontWeight: FontWeight.w600)),
                            const SizedBox(width: 4),
                            const Icon(Icons.directions, color: AppColors.primary, size: 12),
                          ],
                        ),
                      ),
                    ),
                  ]),

                  const Spacer(),

                  // Ticket details row
                  Row(
                    children: [
                      _infoChip('TICKETS', '${widget.quantity}'),
                      const SizedBox(width: 16),
                      _infoChip('SEAT', _generateSeat()),
                      const SizedBox(width: 16),
                      _infoChip(
                          'GATE', String.fromCharCode(65 + Random().nextInt(6))),
                    ],
                  ),
                ],
              ),
            ),
          ),

          // Dotted divider with cutouts
          SizedBox(
            height: 32,
            child: Row(
              children: [
                // Left cutout
                Container(
                  width: 16,
                  height: 32,
                  decoration: const BoxDecoration(
                    color: AppColors.background,
                    borderRadius: BorderRadius.only(
                      topRight: Radius.circular(16),
                      bottomRight: Radius.circular(16),
                    ),
                  ),
                ),
                // Dotted line
                Expanded(
                  child: LayoutBuilder(
                    builder: (context, constraints) {
                      final dashCount = (constraints.maxWidth / 10).floor();
                      return Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: List.generate(dashCount, (_) {
                          return Container(
                            width: 5,
                            height: 1.5,
                            color: AppColors.stone700.withValues(alpha: 0.5),
                          );
                        }),
                      );
                    },
                  ),
                ),
                // Right cutout
                Container(
                  width: 16,
                  height: 32,
                  decoration: const BoxDecoration(
                    color: AppColors.background,
                    borderRadius: BorderRadius.only(
                      topLeft: Radius.circular(16),
                      bottomLeft: Radius.circular(16),
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Bottom section — QR & booking
          Expanded(
            flex: 3,
            child: Padding(
              padding: const EdgeInsets.fromLTRB(28, 8, 28, 28),
              child: Row(
                children: [
                  // QR Code
                  Container(
                    width: 100,
                    height: 100,
                    decoration: BoxDecoration(
                      color: AppColors.white,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Padding(
                      padding: const EdgeInsets.all(8),
                      child: _buildMiniQR(),
                    ),
                  ),
                  const SizedBox(width: 20),
                  // Booking details
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text('BOOKING ID',
                            style: GoogleFonts.inter(
                                fontSize: 10,
                                fontWeight: FontWeight.w700,
                                color: AppColors.stone500,
                                letterSpacing: 2.0)),
                        const SizedBox(height: 4),
                        Text(widget.bookingNumber,
                            style: GoogleFonts.jetBrainsMono(
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                                color: AppColors.stone200)),
                        const SizedBox(height: 16),
                        Text('TOTAL PAID',
                            style: GoogleFonts.inter(
                                fontSize: 10,
                                fontWeight: FontWeight.w700,
                                color: AppColors.stone500,
                                letterSpacing: 2.0)),
                        const SizedBox(height: 4),
                        Text('₹${widget.totalAmount}',
                            style: GoogleFonts.plusJakartaSans(
                                fontSize: 24,
                                fontWeight: FontWeight.w800,
                                color: AppColors.primary)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _infoChip(String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label,
            style: GoogleFonts.inter(
                fontSize: 9,
                fontWeight: FontWeight.w700,
                color: AppColors.stone500,
                letterSpacing: 1.5)),
        const SizedBox(height: 2),
        Text(value,
            style: GoogleFonts.plusJakartaSans(
                fontSize: 16,
                fontWeight: FontWeight.w700,
                color: AppColors.white)),
      ],
    );
  }

  Widget _buildMiniQR() {
    // Generate a deterministic QR-like grid pattern
    final rand = Random(widget.bookingNumber.hashCode);
    return GridView.builder(
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 9,
        crossAxisSpacing: 1.5,
        mainAxisSpacing: 1.5,
      ),
      itemCount: 81,
      itemBuilder: (context, index) {
        // Make corners always dark (QR finder patterns)
        final row = index ~/ 9;
        final col = index % 9;
        final isCorner = (row < 3 && col < 3) ||
            (row < 3 && col > 5) ||
            (row > 5 && col < 3);
        final isFilled = isCorner || rand.nextBool();
        return Container(
          decoration: BoxDecoration(
            color: isFilled ? AppColors.black : AppColors.white,
            borderRadius: BorderRadius.circular(1),
          ),
        );
      },
    );
  }

  String _generateSeat() {
    final rand = Random(widget.bookingNumber.hashCode);
    final row = String.fromCharCode(65 + rand.nextInt(10));
    final seat = rand.nextInt(40) + 1;
    return '$row$seat';
  }

  Widget _actionButton(IconData icon, String label, Color bg, Color fg,
      VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 18),
        decoration: BoxDecoration(
          color: bg,
          borderRadius: BorderRadius.circular(16),
          border: bg == AppColors.stone800
              ? Border.all(color: AppColors.stone700)
              : null,
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: fg, size: 20),
            const SizedBox(width: 8),
            Text(label,
                style: GoogleFonts.inter(
                    fontSize: 16, fontWeight: FontWeight.w700, color: fg)),
          ],
        ),
      ),
    );
  }

  void _showSnack(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      backgroundColor: AppColors.stone800,
      behavior: SnackBarBehavior.floating,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      content: Text(msg,
          style: GoogleFonts.inter(
              fontWeight: FontWeight.w600, color: AppColors.white)),
    ));
  }
}
