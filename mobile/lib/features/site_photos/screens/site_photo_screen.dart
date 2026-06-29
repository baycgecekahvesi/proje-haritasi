import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:image_picker/image_picker.dart';
import 'package:dio/dio.dart';
import 'package:intl/intl.dart';
import 'package:proje_haritasi_mobile/core/network/dio_client.dart';
import '../models/site_photo_model.dart';

class SitePhotoScreen extends StatefulWidget {
  final int projectId;
  final String projectName;

  const SitePhotoScreen({
    super.key,
    required this.projectId,
    required this.projectName,
  });

  @override
  State<SitePhotoScreen> createState() => _SitePhotoScreenState();
}

class _SitePhotoScreenState extends State<SitePhotoScreen> {
  final _dio = DioClient().dio;
  final _picker = ImagePicker();
  List<SitePhotoModel> _photos = [];
  bool _loading = true;
  bool _uploading = false;

  @override
  void initState() {
    super.initState();
    _loadPhotos();
  }

  Future<void> _loadPhotos() async {
    setState(() => _loading = true);
    try {
      final res = await _dio.get('/documents/site-photos/${widget.projectId}');
      final list = (res.data as List<dynamic>)
          .map((e) => SitePhotoModel.fromJson(e as Map<String, dynamic>))
          .toList();
      setState(() {
        _photos = list;
        _loading = false;
      });
    } catch (e) {
      setState(() => _loading = false);
    }
  }

  Future<Position?> _getLocation() async {
    try {
      final serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) return null;
      var perm = await Geolocator.checkPermission();
      if (perm == LocationPermission.denied) {
        perm = await Geolocator.requestPermission();
        if (perm == LocationPermission.denied) return null;
      }
      return await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(accuracy: LocationAccuracy.high),
      );
    } catch (_) {
      return null;
    }
  }

  Future<void> _pickAndUpload(ImageSource source) async {
    final picked = await _picker.pickImage(source: source, imageQuality: 80);
    if (picked == null) return;

    setState(() => _uploading = true);
    try {
      final pos = await _getLocation();
      final now = DateTime.now();

      final formData = FormData.fromMap({
        'file': await MultipartFile.fromFile(picked.path, filename: 'photo.jpg'),
        'description': '',
        if (pos != null) 'latitude': pos.latitude.toString(),
        if (pos != null) 'longitude': pos.longitude.toString(),
        'taken_at': now.toIso8601String(),
      });

      await _dio.post(
        '/documents/site-photos/${widget.projectId}',
        data: formData,
        options: Options(contentType: 'multipart/form-data'),
      );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Fotoğraf yüklendi'),
            backgroundColor: Colors.green,
          ),
        );
        _loadPhotos();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Yükleme hatası: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      setState(() => _uploading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('${widget.projectName} — Saha Fotoğrafları'),
        actions: [
          if (_uploading)
            const Padding(
              padding: EdgeInsets.all(16),
              child: SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(strokeWidth: 2),
              ),
            ),
          IconButton(icon: const Icon(Icons.refresh), onPressed: _loadPhotos),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _photos.isEmpty
              ? const Center(
                  child: Text(
                    'Henüz fotoğraf yok.',
                    style: TextStyle(color: Colors.grey),
                  ),
                )
              : GridView.builder(
                  padding: const EdgeInsets.all(8),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    crossAxisSpacing: 8,
                    mainAxisSpacing: 8,
                  ),
                  itemCount: _photos.length,
                  itemBuilder: (ctx, i) {
                    final p = _photos[i];
                    return Card(
                      clipBehavior: Clip.antiAlias,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          Expanded(
                            child: Image.network(
                              p.photoUrl,
                              fit: BoxFit.cover,
                              errorBuilder: (_, __, ___) =>
                                  const Icon(Icons.broken_image, size: 48),
                            ),
                          ),
                          Padding(
                            padding: const EdgeInsets.all(6),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                if (p.takenAt != null)
                                  Text(
                                    DateFormat('dd.MM.yyyy HH:mm').format(p.takenAt!),
                                    style: const TextStyle(
                                        fontSize: 11, color: Colors.grey),
                                  ),
                                if (p.latitude != null)
                                  Text(
                                    '📍 ${p.latitude!.toStringAsFixed(4)}, ${p.longitude!.toStringAsFixed(4)}',
                                    style: const TextStyle(
                                        fontSize: 10, color: Colors.grey),
                                  ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    );
                  },
                ),
      floatingActionButton: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          FloatingActionButton.small(
            heroTag: 'gallery',
            onPressed: () => _pickAndUpload(ImageSource.gallery),
            child: const Icon(Icons.photo_library),
          ),
          const SizedBox(height: 8),
          FloatingActionButton(
            heroTag: 'camera',
            onPressed: () => _pickAndUpload(ImageSource.camera),
            child: const Icon(Icons.camera_alt),
          ),
        ],
      ),
    );
  }
}
