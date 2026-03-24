import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import 'package:google_fonts/google_fonts.dart';
import 'recursion_3d_screen.dart';
import 'ipl_routing_screen.dart';

class BookMenuScreen extends StatelessWidget {
  const BookMenuScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.black,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 32.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Booked Events', 
                style: GoogleFonts.plusJakartaSans(
                  fontSize: 36, 
                  fontWeight: FontWeight.w800, 
                  color: AppColors.white,
                  letterSpacing: -1,
                ),
              ),
              const SizedBox(height: 12),
              Text('Access your exclusive booked experiences.', 
                style: GoogleFonts.inter(
                  fontSize: 16, 
                  color: AppColors.stone400,
                  fontWeight: FontWeight.w500,
                ),
              ),
              const SizedBox(height: 48),
              
              // EVENT 1: Recursion 3D
              Expanded(
                child: _buildEventCard(
                  context,
                  title: 'Recursion',
                  subtitle: 'Interactive 3D Experience',
                  icon: Icons.view_in_ar_rounded,
                  colors: [const Color(0xFF6366F1), const Color(0xFF8B5CF6)],
                  onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const Recursion3DScreen())),
                ),
              ),
              
              const SizedBox(height: 24),
              
              // EVENT 2: IPL Stadium
              Expanded(
                child: _buildEventCard(
                  context,
                  title: 'IPL Stadium',
                  subtitle: 'Live Routing & Navigation',
                  icon: Icons.map_rounded,
                  colors: [AppColors.primary, const Color(0xFFEAB308)],
                  onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const IPLRoutingScreen())),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildEventCard(BuildContext context, {
    required String title,
    required String subtitle,
    required IconData icon,
    required List<Color> colors,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(24),
          gradient: LinearGradient(
            colors: [
              AppColors.neutral900,
              AppColors.neutral900.withValues(alpha: 0.8),
            ],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          border: Border.all(color: AppColors.stone800, width: 2),
          boxShadow: [
            BoxShadow(
              color: colors[0].withValues(alpha: 0.1),
              blurRadius: 24,
              offset: const Offset(0, 8),
            ),
          ],
        ),
        child: Stack(
          children: [
            // Decorative Icon Background
            Positioned(
              right: -30,
              bottom: -30,
              child: Icon(icon, size: 180, color: colors[0].withValues(alpha: 0.05)),
            ),
            
            Padding(
              padding: const EdgeInsets.all(28.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(colors: colors),
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: colors[0].withValues(alpha: 0.3),
                          blurRadius: 12,
                          spreadRadius: 2,
                        ),
                      ],
                    ),
                    child: Icon(icon, color: Colors.white, size: 32),
                  ),
                  const Spacer(),
                  Text(title, 
                    style: GoogleFonts.plusJakartaSans(
                      fontSize: 28, 
                      fontWeight: FontWeight.w800, 
                      color: AppColors.white,
                      height: 1.2,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(subtitle, 
                    style: GoogleFonts.inter(
                      fontSize: 15, 
                      color: AppColors.stone400,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
