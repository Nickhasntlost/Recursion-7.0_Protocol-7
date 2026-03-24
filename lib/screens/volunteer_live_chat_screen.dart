import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_theme.dart';
import '../services/event_service.dart';
import 'chat_detail_screen.dart';

class VolunteerLiveChatScreen extends StatefulWidget {
  const VolunteerLiveChatScreen({super.key});

  @override
  State<VolunteerLiveChatScreen> createState() => _VolunteerLiveChatScreenState();
}

class _VolunteerLiveChatScreenState extends State<VolunteerLiveChatScreen> {
  bool _isLoading = true;
  List<dynamic> _events = [];

  @override
  void initState() {
    super.initState();
    _loadEvents();
  }

  Future<void> _loadEvents() async {
    setState(() => _isLoading = true);
    try {
      final allEvents = await EventService.getEvents();
      if (mounted) {
        setState(() {
          _events = allEvents;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.transparent,
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
          : _events.isEmpty
              ? _buildEmptyState()
              : RefreshIndicator(
                  color: AppColors.primary,
                  backgroundColor: AppColors.stone900,
                  onRefresh: _loadEvents,
                  child: _buildEventsList(),
                ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              color: AppColors.stone800,
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.chat_bubble_outline, size: 40, color: AppColors.stone600),
          ),
          const SizedBox(height: 20),
          Text(
            'No Events Available',
            style: GoogleFonts.plusJakartaSans(
              fontSize: 20,
              fontWeight: FontWeight.w700,
              color: AppColors.stone300,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Events will appear here for live chat.',
            style: GoogleFonts.inter(fontSize: 14, color: AppColors.stone500),
          ),
        ],
      ),
    );
  }

  Widget _buildEventsList() {
    return ListView.builder(
      physics: const AlwaysScrollableScrollPhysics(),
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 120),
      itemCount: _events.length + 1, // +1 for header
      itemBuilder: (context, index) {
        if (index == 0) {
          return Padding(
            padding: const EdgeInsets.only(bottom: 20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Live Chat',
                  style: GoogleFonts.plusJakartaSans(
                    fontSize: 28,
                    fontWeight: FontWeight.w800,
                    color: AppColors.white,
                    letterSpacing: -1,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Select an event to start chatting',
                  style: GoogleFonts.inter(fontSize: 14, color: AppColors.stone400),
                ),
              ],
            ),
          );
        }

        final event = _events[index - 1];
        final title = event['title'] ?? 'Untitled Event';
        final category = (event['category'] ?? '').toString().toUpperCase();
        final location = event['location'] ?? event['city'] ?? '';
        final startDate = (event['start_datetime'] ?? '').toString();
        final dateLabel = startDate.length >= 10 ? startDate.substring(0, 10) : '';

        // Color palette for event icons
        final colors = [
          const Color(0xFF8B5CF6),
          const Color(0xFF06B6D4),
          const Color(0xFFF59E0B),
          const Color(0xFFEC4899),
          const Color(0xFF10B981),
        ];
        final accentColor = colors[(index - 1) % colors.length];

        return GestureDetector(
          onTap: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => ChatDetailScreen(
                  eventId: event['id'] ?? 'unknown',
                  eventTitle: title,
                ),
              ),
            );
          },
          child: Container(
            margin: const EdgeInsets.only(bottom: 12),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.stone900,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.stone800),
            ),
            child: Row(
              children: [
                // Event icon
                Container(
                  width: 52,
                  height: 52,
                  decoration: BoxDecoration(
                    color: accentColor.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: Icon(Icons.chat_bubble_rounded, color: accentColor, size: 24),
                ),
                const SizedBox(width: 14),
                // Event details
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        title,
                        style: GoogleFonts.plusJakartaSans(
                          fontSize: 15,
                          fontWeight: FontWeight.w700,
                          color: AppColors.white,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          if (category.isNotEmpty) ...[
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                              decoration: BoxDecoration(
                                color: accentColor.withOpacity(0.15),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(
                                category,
                                style: GoogleFonts.inter(
                                  fontSize: 10,
                                  fontWeight: FontWeight.w700,
                                  color: accentColor,
                                  letterSpacing: 0.5,
                                ),
                              ),
                            ),
                            const SizedBox(width: 8),
                          ],
                          if (dateLabel.isNotEmpty)
                            Text(
                              dateLabel,
                              style: GoogleFonts.inter(fontSize: 11, color: AppColors.stone500),
                            ),
                        ],
                      ),
                      if (location.isNotEmpty) ...[
                        const SizedBox(height: 2),
                        Text(
                          location,
                          style: GoogleFonts.inter(fontSize: 11, color: AppColors.stone500),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ],
                  ),
                ),
                const Icon(Icons.chevron_right, color: AppColors.stone600, size: 20),
              ],
            ),
          ),
        );
      },
    );
  }
}
