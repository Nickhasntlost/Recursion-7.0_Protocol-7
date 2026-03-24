import 'api_service.dart';

/// Chat service for handling event live chat messaging.
class ChatService {
  /// Fetch chat messages for an event
  static Future<List<dynamic>> getMessages(String eventId) async {
    return await ApiService.getList('/chat/$eventId');
  }

  /// Send a message to the event chat
  static Future<Map<String, dynamic>> sendMessage(String eventId, String content) async {
    return await ApiService.post(
      '/chat/$eventId',
      body: {'content': content},
    );
  }

  /// Mark a message as read
  static Future<Map<String, dynamic>> markAsRead(String messageId) async {
    return await ApiService.post('/chat/$messageId/read');
  }
}
