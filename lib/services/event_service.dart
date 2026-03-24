import 'api_service.dart';

/// Event service — fetches events from the real API.
class EventService {
  /// Get list of events with optional filters.
  static Future<List<dynamic>> getEvents({
    String? category,
    String? city,
    String status = 'published',
    String? search,
    int skip = 0,
    int limit = 20,
  }) async {
    final queryParams = <String, String>{
      'status': status,
      'skip': skip.toString(),
      'limit': limit.toString(),
    };
    if (category != null) queryParams['category'] = category;
    if (city != null) queryParams['city'] = city;
    if (search != null) queryParams['search'] = search;

    return await ApiService.getList('/events', queryParams: queryParams, auth: false);
  }

  /// Get a single event by ID or slug.
  static Future<Map<String, dynamic>> getEvent(String eventId) async {
    return await ApiService.get('/events/$eventId', auth: false);
  }
}
