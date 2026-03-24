import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Design tokens from DESIGN.md — Dark Mode palette
class AppColors {
  // Core background
  static const Color background = Color(0xFF0C0A09);
  static const Color surface = Color(0xFF1C1917);
  static const Color surfaceContainerLow = Color(0xFF171717);
  static const Color surfaceContainer = Color(0xFF171717);
  static const Color surfaceContainerHigh = Color(0xFF262626);
  static const Color surfaceContainerHighest = Color(0xFF404040);
  static const Color surfaceContainerLowest = Color(0xFF0A0A0A);
  static const Color surfaceBright = Color(0xFF1C1917);
  static const Color surfaceDim = Color(0xFF171717);

  // Primary accent — "Electric Lime"
  static const Color primary = Color(0xFFE2F16D);
  static const Color primaryContainer = Color(0xFFE2F16D);
  static const Color onPrimary = Color(0xFF000000);
  static const Color onPrimaryContainer = Color(0xFF1C1B1B);

  // Secondary — same lime family
  static const Color secondary = Color(0xFFE2F16D);
  static const Color secondaryContainer = Color(0xFFE2F16D);
  static const Color onSecondary = Color(0xFF000000);
  static const Color onSecondaryContainer = Color(0xFF000000);
  static const Color secondaryFixed = Color(0xFFE2F16D);
  static const Color onSecondaryFixed = Color(0xFF1A1D00);

  // On-surface variants
  static const Color onSurface = Color(0xFFFAFAF9);
  static const Color onSurfaceVariant = Color(0xFFA8A29E);
  static const Color onBackground = Color(0xFFFAFAF9);

  // Outline
  static const Color outline = Color(0xFF525252);
  static const Color outlineVariant = Color(0xFF444748);

  // Error
  static const Color error = Color(0xFFEF4444);
  static const Color errorContainer = Color(0xFF450A0A);
  static const Color onError = Color(0xFFFFFFFF);

  // Stone palette helpers (used in widgets directly)
  static const Color stone50 = Color(0xFFFAFAF9);
  static const Color stone100 = Color(0xFFF5F5F4);
  static const Color stone200 = Color(0xFFE7E5E4);
  static const Color stone300 = Color(0xFFD6D3D1);
  static const Color stone400 = Color(0xFFA8A29E);
  static const Color stone500 = Color(0xFF78716C);
  static const Color stone600 = Color(0xFF57534E);
  static const Color stone700 = Color(0xFF44403C);
  static const Color stone800 = Color(0xFF292524);
  static const Color stone900 = Color(0xFF1C1917);
  static const Color stone950 = Color(0xFF0C0A09);

  static const Color neutral800 = Color(0xFF262626);
  static const Color neutral900 = Color(0xFF171717);
  static const Color neutral950 = Color(0xFF0A0A0A);

  static const Color white = Color(0xFFFFFFFF);
  static const Color black = Color(0xFF000000);
}

class AppTextStyles {
  static TextStyle headline(
      {double fontSize = 24,
      FontWeight fontWeight = FontWeight.w800,
      Color color = AppColors.white}) {
    return GoogleFonts.plusJakartaSans(
      fontSize: fontSize,
      fontWeight: fontWeight,
      color: color,
      letterSpacing: -0.5,
    );
  }

  static TextStyle body(
      {double fontSize = 14,
      FontWeight fontWeight = FontWeight.w400,
      Color color = AppColors.onSurface}) {
    return GoogleFonts.inter(
      fontSize: fontSize,
      fontWeight: fontWeight,
      color: color,
    );
  }

  static TextStyle label(
      {double fontSize = 10,
      FontWeight fontWeight = FontWeight.w700,
      Color color = AppColors.stone500}) {
    return GoogleFonts.inter(
      fontSize: fontSize,
      fontWeight: fontWeight,
      color: color,
      letterSpacing: 2.0,
    );
  }
}

class AppTheme {
  static ThemeData get darkTheme {
    return ThemeData(
      brightness: Brightness.dark,
      scaffoldBackgroundColor: AppColors.background,
      colorScheme: const ColorScheme.dark(
        primary: AppColors.primary,
        onPrimary: AppColors.onPrimary,
        secondary: AppColors.secondary,
        onSecondary: AppColors.onSecondary,
        surface: AppColors.surface,
        onSurface: AppColors.onSurface,
        error: AppColors.error,
        onError: AppColors.onError,
      ),
      textTheme: TextTheme(
        displayLarge: GoogleFonts.plusJakartaSans(
          fontSize: 56,
          fontWeight: FontWeight.w800,
          color: AppColors.white,
          letterSpacing: -2,
        ),
        displayMedium: GoogleFonts.plusJakartaSans(
          fontSize: 40,
          fontWeight: FontWeight.w800,
          color: AppColors.white,
          letterSpacing: -1.5,
        ),
        headlineLarge: GoogleFonts.plusJakartaSans(
          fontSize: 32,
          fontWeight: FontWeight.w800,
          color: AppColors.white,
          letterSpacing: -1,
        ),
        headlineMedium: GoogleFonts.plusJakartaSans(
          fontSize: 24,
          fontWeight: FontWeight.w800,
          color: AppColors.white,
          letterSpacing: -0.5,
        ),
        titleLarge: GoogleFonts.plusJakartaSans(
          fontSize: 20,
          fontWeight: FontWeight.w700,
          color: AppColors.white,
        ),
        titleMedium: GoogleFonts.inter(
          fontSize: 16,
          fontWeight: FontWeight.w600,
          color: AppColors.onSurface,
        ),
        bodyLarge: GoogleFonts.inter(
          fontSize: 16,
          fontWeight: FontWeight.w400,
          color: AppColors.onSurface,
        ),
        bodyMedium: GoogleFonts.inter(
          fontSize: 14,
          fontWeight: FontWeight.w400,
          color: AppColors.onSurface,
        ),
        bodySmall: GoogleFonts.inter(
          fontSize: 12,
          fontWeight: FontWeight.w400,
          color: AppColors.onSurfaceVariant,
        ),
        labelLarge: GoogleFonts.inter(
          fontSize: 14,
          fontWeight: FontWeight.w700,
          color: AppColors.onSurface,
        ),
        labelSmall: GoogleFonts.inter(
          fontSize: 10,
          fontWeight: FontWeight.w700,
          color: AppColors.stone500,
          letterSpacing: 2.0,
        ),
      ),
      useMaterial3: true,
    );
  }
}
