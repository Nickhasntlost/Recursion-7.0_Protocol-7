import 'api_service.dart';

/// Volunteer service — CRUD + check-in for per-event volunteers.
class VolunteerService {
  /// Create a volunteer for an event.
  static Future<Map<String, dynamic>> createVolunteer({
    required String eventId,
    required String name,
    required String email,
    String? phone,
    String? role,
    List<String>? skills,
    String? availability,
    String? emergencyContactName,
    String? emergencyContactPhone,
    String? notes,
    String? specialRequirements,
  }) async {
    final body = <String, dynamic>{
      'name': name,
      'email': email,
    };
    if (phone != null) body['phone'] = phone;
    if (role != null) body['role'] = role;
    if (skills != null && skills.isNotEmpty) body['skills'] = skills;
    if (availability != null) body['availability'] = availability;
    if (emergencyContactName != null) body['emergency_contact_name'] = emergencyContactName;
    if (emergencyContactPhone != null) body['emergency_contact_phone'] = emergencyContactPhone;
    if (notes != null) body['notes'] = notes;
    if (specialRequirements != null) body['special_requirements'] = specialRequirements;

    return await ApiService.post('/volunteers/$eventId', body: body);
  }

  /// Get all volunteers for an event, optionally filtered by status.
  static Future<List<dynamic>> getEventVolunteers(String eventId, {String? status}) async {
    final queryParams = <String, String>{};
    if (status != null) queryParams['status'] = status;
    return await ApiService.getList('/volunteers/$eventId', queryParams: queryParams.isNotEmpty ? queryParams : null);
  }

  /// Update a volunteer's details.
  static Future<Map<String, dynamic>> updateVolunteer({
    required String volunteerId,
    String? name,
    String? phone,
    String? role,
    List<String>? skills,
    String? availability,
    String? status,
    String? notes,
  }) async {
    final body = <String, dynamic>{};
    if (name != null) body['name'] = name;
    if (phone != null) body['phone'] = phone;
    if (role != null) body['role'] = role;
    if (skills != null) body['skills'] = skills;
    if (availability != null) body['availability'] = availability;
    if (status != null) body['status'] = status;
    if (notes != null) body['notes'] = notes;

    return await ApiService.patch('/volunteers/$volunteerId', body: body);
  }

  /// Delete a volunteer from an event.
  static Future<void> deleteVolunteer(String volunteerId) async {
    await ApiService.delete('/volunteers/$volunteerId');
  }

  /// Check in or out a volunteer.
  static Future<Map<String, dynamic>> checkIn({
    required String volunteerId,
    required bool checkIn,
  }) async {
    return await ApiService.post('/volunteers/$volunteerId/check-in', body: {
      'check_in': checkIn,
    });
  }
}
