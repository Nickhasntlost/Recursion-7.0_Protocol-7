import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_theme.dart';
import '../services/task_service.dart';
import '../services/event_service.dart';

class VolunteerTaskListScreen extends StatefulWidget {
  const VolunteerTaskListScreen({super.key});

  @override
  State<VolunteerTaskListScreen> createState() => _VolunteerTaskListScreenState();
}

class _VolunteerTaskListScreenState extends State<VolunteerTaskListScreen> {
  int _selectedTab = 0;
  bool _isLoading = true;
  List<dynamic> _allTasks = [];
  String? _activeEventId;

  final _tabs = ['Assigned', 'Pending Review', 'Completed'];
  final _tabStatuses = ['in_progress', 'pending_review', 'completed'];

  @override
  void initState() {
    super.initState();
    _loadTasks();
  }

  Future<void> _loadTasks() async {
    setState(() => _isLoading = true);
    try {
      final events = await EventService.getEvents();
      if (events.isNotEmpty) {
        _activeEventId = events[0]['id'];
        if (_activeEventId != null) {
          _allTasks = await TaskService.getEventTasks(_activeEventId!);
          
          // Mock data if no tasks exist for demo 
          if (_allTasks.isEmpty) {
            _allTasks = [
              {
                'id': 't1', 'title': 'Stage Setup Assistance', 'description': 'Help the audio team set up the main stage speakers.',
                'priority': 'high', 'status': 'in_progress', 'assigned_to_volunteer_name': 'You', 'estimated_hours': 2,
              },
              {
                'id': 't2', 'title': 'VIP Guest Ushering', 'description': 'Guide VIP guests from entrance to lounge.',
                'priority': 'medium', 'status': 'pending_review', 'assigned_to_volunteer_name': 'You', 'estimated_hours': 4,
              },
              {
                'id': 't3', 'title': 'Merch Stand Setup', 'description': 'Unbox and arrange merchandise.',
                'priority': 'low', 'status': 'completed', 'assigned_to_volunteer_name': 'You', 'estimated_hours': 1,
              }
            ];
          }
        }
      }
    } catch (e) {
      _allTasks = [];
    }
    if (mounted) setState(() => _isLoading = false);
  }

  List<dynamic> get _filteredTasks {
    final status = _tabStatuses[_selectedTab];
    return _allTasks.where((t) => t['status'] == status).toList();
  }

  Future<void> _promptImageUploadAndComplete(Map<String, dynamic> task) async {
    // Show a bottom sheet to "upload" an image
    bool? uploaded = await showModalBottomSheet<bool>(
      context: context,
      backgroundColor: AppColors.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) => Container(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(width: 48, height: 4, decoration: BoxDecoration(
              color: AppColors.stone800, borderRadius: BorderRadius.circular(9999))),
            const SizedBox(height: 32),
            Container(
              width: 80, height: 80,
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.add_a_photo, color: AppColors.primary, size: 32),
            ),
            const SizedBox(height: 24),
            Text('Upload Proof of Work', style: GoogleFonts.plusJakartaSans(
              fontSize: 24, fontWeight: FontWeight.w800, color: AppColors.white)),
            const SizedBox(height: 8),
            Text('To mark this task as complete and earn ₹500, please upload a photo verifying the work.',
              textAlign: TextAlign.center,
              style: GoogleFonts.inter(fontSize: 14, color: AppColors.stone400, height: 1.5)),
            const SizedBox(height: 32),
            GestureDetector(
              onTap: () {
                Navigator.pop(context, true); // Simulate successful upload
              },
              child: Container(
                width: double.infinity, padding: const EdgeInsets.symmetric(vertical: 16),
                decoration: BoxDecoration(color: AppColors.primary, borderRadius: BorderRadius.circular(9999)),
                child: Center(child: Text('Take Photo / Upload', style: GoogleFonts.inter(
                  fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.black))),
              ),
            ),
          ],
        ),
      ),
    );

    if (uploaded == true) {
      // Move task to 'pending_review'
      setState(() {
        final index = _allTasks.indexWhere((t) => t['id'] == task['id']);
        if (index != -1) {
          _allTasks[index] = Map<String, dynamic>.from(_allTasks[index]);
          _allTasks[index]['status'] = 'pending_review';
        }
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Proof uploaded. Awaiting admin review for ₹500 reward.'),
          backgroundColor: AppColors.primary,
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: CustomScrollView(
        physics: const BouncingScrollPhysics(),
        slivers: [
          SliverAppBar(
            floating: true,
            backgroundColor: AppColors.stone950.withValues(alpha: 0.8),
            leading: IconButton(
              icon: const Icon(Icons.arrow_back, color: AppColors.stone100),
              onPressed: () => Navigator.pop(context),
            ),
            title: Text(
              'My Tasks',
              style: GoogleFonts.plusJakartaSans(
                fontSize: 20,
                fontWeight: FontWeight.w800,
                color: AppColors.stone100,
                letterSpacing: -0.5,
              ),
            ),
            actions: [
              IconButton(
                icon: const Icon(Icons.refresh, color: AppColors.stone400),
                onPressed: _loadTasks,
              ),
              const SizedBox(width: 8),
            ],
          ),
          SliverToBoxAdapter(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 8),
                _buildTabBar(),
                const SizedBox(height: 24),
                _isLoading
                    ? const Padding(
                        padding: EdgeInsets.all(64),
                        child: Center(
                            child: CircularProgressIndicator(
                                color: AppColors.primary)),
                      )
                    : _filteredTasks.isEmpty
                        ? _buildEmptyState()
                        : Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 24),
                            child: Column(
                              children: List.generate(
                                _filteredTasks.length,
                                (i) => Padding(
                                  padding: EdgeInsets.only(
                                      bottom: i < _filteredTasks.length - 1
                                          ? 16
                                          : 0),
                                  child: _taskCard(
                                      _filteredTasks[i] as Map<String, dynamic>),
                                ),
                              ),
                            ),
                          ),
                const SizedBox(height: 120),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTabBar() {
    return SizedBox(
      height: 44,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 24),
        itemCount: _tabs.length,
        separatorBuilder: (_, __) => const SizedBox(width: 10),
        itemBuilder: (context, index) {
          final isActive = _selectedTab == index;
          final count = _allTasks
              .where((t) => t['status'] == _tabStatuses[index])
              .length;

          return GestureDetector(
            onTap: () => setState(() => _selectedTab = index),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
              decoration: BoxDecoration(
                color: isActive ? AppColors.primary : AppColors.stone900,
                borderRadius: BorderRadius.circular(9999),
                border: isActive
                    ? null
                    : Border.all(
                        color: AppColors.white.withValues(alpha: 0.1)),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    _tabs[index],
                    style: GoogleFonts.inter(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color:
                          isActive ? AppColors.onPrimary : AppColors.stone300,
                    ),
                  ),
                  const SizedBox(width: 6),
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: isActive
                          ? AppColors.onPrimary.withValues(alpha: 0.2)
                          : AppColors.stone800,
                      borderRadius: BorderRadius.circular(9999),
                    ),
                    child: Text(
                      count.toString(),
                      style: GoogleFonts.inter(
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        color: isActive
                            ? AppColors.onPrimary
                            : AppColors.stone500,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildEmptyState() {
    return Padding(
      padding: const EdgeInsets.all(48),
      child: Center(
        child: Column(
          children: [
            const Icon(Icons.task_alt, color: AppColors.stone600, size: 64),
            const SizedBox(height: 16),
            Text(
              'No tasks in this tab',
              style: GoogleFonts.plusJakartaSans(
                fontSize: 18,
                fontWeight: FontWeight.w700,
                color: AppColors.stone400,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              'Check other tabs for your tasks',
              style:
                  GoogleFonts.inter(fontSize: 14, color: AppColors.stone500),
            ),
          ],
        ),
      ),
    );
  }

  Widget _taskCard(Map<String, dynamic> task) {
    final title = task['title'] ?? 'Untitled';
    final desc = task['description'] ?? '';
    final priority = task['priority'] ?? 'medium';
    final status = task['status'] ?? 'todo';
    final estimatedHours = task['estimated_hours'];

    Color priorityColor;
    switch (priority) {
      case 'high':
        priorityColor = const Color(0xFFF97316);
        break;
      case 'medium':
        priorityColor = AppColors.primary;
        break;
      default:
        priorityColor = AppColors.stone500;
    }

    Color statusColor;
    IconData statusIcon;
    switch (status) {
      case 'completed':
        statusColor = const Color(0xFF4ADE80);
        statusIcon = Icons.check_circle;
        break;
      case 'pending_review':
        statusColor = const Color(0xFFFBBF24);
        statusIcon = Icons.hourglass_top;
        break;
      case 'in_progress':
      default:
        statusColor = const Color(0xFF60A5FA);
        statusIcon = Icons.autorenew;
        break;
    }

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.stone900,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.stone800),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(statusIcon, color: statusColor, size: 20),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  title,
                  style: GoogleFonts.plusJakartaSans(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: AppColors.white,
                  ),
                ),
              ),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: priorityColor.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(9999),
                ),
                child: Text(
                  priority.toString().toUpperCase(),
                  style: GoogleFonts.inter(
                    fontSize: 10,
                    fontWeight: FontWeight.w700,
                    color: priorityColor,
                    letterSpacing: 1.0,
                  ),
                ),
              ),
            ],
          ),
          if (desc.isNotEmpty) ...[
            const SizedBox(height: 10),
            Text(
              desc,
              style: GoogleFonts.inter(
                  fontSize: 13, color: AppColors.stone400, height: 1.4),
            ),
          ],
          const SizedBox(height: 14),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  const Icon(Icons.timer, size: 14, color: AppColors.stone500),
                  const SizedBox(width: 4),
                  Text('${estimatedHours ?? 2}h est.', 
                      style: GoogleFonts.inter(fontSize: 12, color: AppColors.stone500)),
                ],
              ),
              Row(
                children: [
                  const Icon(Icons.currency_rupee, size: 14, color: AppColors.primary),
                  Text('500', 
                      style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.primary)),
                ],
              ),
            ],
          ),
          
          if (status == 'in_progress' || status == 'todo') ...[
            const SizedBox(height: 20),
            GestureDetector(
              onTap: () => _promptImageUploadAndComplete(task),
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(vertical: 14),
                decoration: BoxDecoration(
                  color: AppColors.primary,
                  borderRadius: BorderRadius.circular(9999),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.camera_alt, color: AppColors.black, size: 18),
                    const SizedBox(width: 8),
                    Text(
                      'Upload Proof & Complete',
                      style: GoogleFonts.inter(
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        color: AppColors.black,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],

          if (status == 'pending_review') ...[
            const SizedBox(height: 20),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 14),
              decoration: BoxDecoration(
                color: const Color(0xFFFBBF24).withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(9999),
                border: Border.all(color: const Color(0xFFFBBF24).withValues(alpha: 0.3)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.hourglass_empty, color: Color(0xFFFBBF24), size: 18),
                  const SizedBox(width: 8),
                  Text(
                    'Awaiting Admin Approval',
                    style: GoogleFonts.inter(
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      color: const Color(0xFFFBBF24),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }
}
