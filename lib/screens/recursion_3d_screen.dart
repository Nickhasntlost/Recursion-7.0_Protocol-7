import 'package:flutter/material.dart';
import 'package:model_viewer_plus/model_viewer_plus.dart';
import '../theme/app_theme.dart';
import 'package:google_fonts/google_fonts.dart';

class Recursion3DScreen extends StatelessWidget {
  const Recursion3DScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.black,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded, color: AppColors.white),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text('Recursion 3D', 
          style: GoogleFonts.plusJakartaSans(
            fontWeight: FontWeight.w700, 
            color: AppColors.white
          ),
        ),
      ),
      body: const Center(
        child: ModelViewer(
          backgroundColor: Color(0xFF000000),
          src: 'assets/models/model.glb',
          alt: "A 3D model of Recursion",
          ar: true,
          autoRotate: true,
          cameraControls: true,
          disableZoom: false,
        ),
      ),
    );
  }
}
