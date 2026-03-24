import 'dart:io';
import 'package:url_launcher/url_launcher.dart';

class MapUtils {
  MapUtils._();

  /// Opens the native map application (Google Maps on Android, Apple Maps on iOS)
  /// and requests directions to the provided destination query.
  static Future<void> openMap(String destination) async {
    final query = Uri.encodeComponent(destination);
    
    // Construct URLs for both platforms
    final Uri googleMapsUri = Uri.parse('https://www.google.com/maps/search/?api=1&query=$query');
    final Uri appleMapsUri = Uri.parse('https://maps.apple.com/?q=$query');

    try {
      // Try Google Maps first, force external application (browser or maps app)
      await launchUrl(googleMapsUri, mode: LaunchMode.externalApplication);
    } catch (e) {
      // Fallback to Apple Maps if iOS
      if (Platform.isIOS) {
        try {
          await launchUrl(appleMapsUri, mode: LaunchMode.externalApplication);
        } catch (e2) {
          print('Could not launch maps: $e2');
        }
      } else {
        print('Could not launch maps: $e');
      }
    }
  }
}
