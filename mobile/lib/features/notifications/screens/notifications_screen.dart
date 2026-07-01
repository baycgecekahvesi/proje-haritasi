import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:proje_haritasi_mobile/core/network/dio_client.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  final _dio = DioClient().dio;
  List<dynamic> _notifications = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final res = await _dio.get('/notifications');
      setState(() {
        _notifications = res.data as List<dynamic>? ?? [];
        _loading = false;
      });
    } catch (e) {
      setState(() {
        _error = 'Yüklenemedi';
        _loading = false;
      });
    }
  }

  Future<void> _markRead(dynamic id) async {
    try {
      await _dio.post('/notifications/$id/read');
      setState(() {
        _notifications = _notifications.map((n) {
          final m = n as Map<String, dynamic>;
          if (m['id'] == id) {
            return {...m, 'is_read': true};
          }
          return n;
        }).toList();
      });
    } catch (_) {}
  }

  Future<void> _markAllRead() async {
    try {
      await _dio.post('/notifications/read-all');
      setState(() {
        _notifications = _notifications.map((n) {
          final m = n as Map<String, dynamic>;
          return {...m, 'is_read': true};
        }).toList();
      });
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('İşlem başarısız')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Bildirimler'),
        actions: [
          TextButton(
            onPressed: _markAllRead,
            child: const Text('Tümünü Okundu İşaretle'),
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(
                  child: Text(_error!,
                      style: const TextStyle(color: Colors.red)))
              : _notifications.isEmpty
                  ? const Center(
                      child: Text('Bildirim bulunamadı',
                          style: TextStyle(color: Colors.grey)))
                  : RefreshIndicator(
                      onRefresh: _load,
                      child: ListView.builder(
                        itemCount: _notifications.length,
                        itemBuilder: (_, i) {
                          final m =
                              _notifications[i] as Map<String, dynamic>;
                          final isRead = m['is_read'] as bool? ?? false;
                          final id = m['id'];
                          final createdAt =
                              m['created_at'] as String? ?? '';
                          String formattedDate = createdAt;
                          try {
                            formattedDate = DateFormat('dd.MM.yyyy HH:mm')
                                .format(DateTime.parse(createdAt).toLocal());
                          } catch (_) {}

                          return ListTile(
                            leading: Icon(
                              isRead
                                  ? Icons.notifications_none
                                  : Icons.notifications,
                              color: isRead
                                  ? Colors.grey
                                  : Theme.of(context).colorScheme.primary,
                            ),
                            title: Text(
                              m['message'] as String? ?? '',
                              style: TextStyle(
                                fontWeight: isRead
                                    ? FontWeight.normal
                                    : FontWeight.bold,
                              ),
                            ),
                            subtitle: Text(formattedDate),
                            onTap: isRead ? null : () => _markRead(id),
                          );
                        },
                      ),
                    ),
    );
  }
}
