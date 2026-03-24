import 'api_service.dart';

/// Task service — CRUD + status updates for event tasks.
class TaskService {
  /// Get all tasks for an event, optionally filtered by status or assignee.
  static Future<List<dynamic>> getEventTasks(String eventId, {String? status, String? assignedTo}) async {
    final queryParams = <String, String>{};
    if (status != null) queryParams['status'] = status;
    if (assignedTo != null) queryParams['assigned_to'] = assignedTo;

    return await ApiService.getList('/tasks/$eventId', queryParams: queryParams.isNotEmpty ? queryParams : null);
  }

  /// Quick status update for a task.
  static Future<Map<String, dynamic>> updateTaskStatus({
    required String taskId,
    required String status,
    String? notes,
  }) async {
    final body = <String, dynamic>{'status': status};
    if (notes != null) body['notes'] = notes;
    return await ApiService.patch('/tasks/$taskId/status', body: body);
  }

  /// Get a single task by updating it with no changes (workaround — API has no GET /tasks/{id}).
  /// Full task update.
  static Future<Map<String, dynamic>> updateTask({
    required String taskId,
    String? title,
    String? description,
    String? priority,
    String? assignedToVolunteerId,
    String? dueDate,
    String? status,
    double? actualHours,
    String? completionNotes,
  }) async {
    final body = <String, dynamic>{};
    if (title != null) body['title'] = title;
    if (description != null) body['description'] = description;
    if (priority != null) body['priority'] = priority;
    if (assignedToVolunteerId != null) body['assigned_to_volunteer_id'] = assignedToVolunteerId;
    if (dueDate != null) body['due_date'] = dueDate;
    if (status != null) body['status'] = status;
    if (actualHours != null) body['actual_hours'] = actualHours;
    if (completionNotes != null) body['completion_notes'] = completionNotes;

    return await ApiService.patch('/tasks/$taskId', body: body);
  }
}
