import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';

class LocalDb {
  static final LocalDb _instance = LocalDb._internal();
  factory LocalDb() => _instance;
  LocalDb._internal();

  Database? _db;

  Future<Database> get db async {
    _db ??= await _open();
    return _db!;
  }

  Future<Database> _open() async {
    final dbPath = join(await getDatabasesPath(), 'proje_haritasi.db');
    return openDatabase(
      dbPath,
      version: 1,
      onCreate: (db, version) async {
        await db.execute('''
          CREATE TABLE projects (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            province TEXT NOT NULL,
            status TEXT NOT NULL,
            progress INTEGER DEFAULT 0,
            is_delayed INTEGER DEFAULT 0,
            planned_end TEXT,
            task_count INTEGER DEFAULT 0,
            synced_at TEXT
          )
        ''');
        await db.execute('''
          CREATE TABLE pending_actions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            action_type TEXT NOT NULL,
            endpoint TEXT NOT NULL,
            method TEXT NOT NULL,
            payload TEXT,
            created_at TEXT NOT NULL
          )
        ''');
      },
    );
  }

  Future<void> upsertProjects(List<Map<String, dynamic>> projects) async {
    final database = await db;
    final batch = database.batch();
    for (final p in projects) {
      batch.insert(
        'projects',
        {
          'id': p['id'],
          'name': p['name'] ?? '',
          'province': p['province'] ?? '',
          'status': p['status'] ?? '',
          'progress': p['progress'] ?? 0,
          'is_delayed': (p['is_delayed'] == true) ? 1 : 0,
          'planned_end': p['planned_end'],
          'task_count': p['task_count'] ?? 0,
          'synced_at': DateTime.now().toIso8601String(),
        },
        conflictAlgorithm: ConflictAlgorithm.replace,
      );
    }
    await batch.commit(noResult: true);
  }

  Future<List<Map<String, dynamic>>> getProjects() async {
    final database = await db;
    return database.query('projects', orderBy: 'name');
  }

  Future<void> queueAction({
    required String actionType,
    required String endpoint,
    required String method,
    String? payload,
  }) async {
    final database = await db;
    await database.insert('pending_actions', {
      'action_type': actionType,
      'endpoint': endpoint,
      'method': method,
      'payload': payload,
      'created_at': DateTime.now().toIso8601String(),
    });
  }

  Future<List<Map<String, dynamic>>> getPendingActions() async {
    final database = await db;
    return database.query('pending_actions', orderBy: 'created_at');
  }

  Future<void> deletePendingAction(int id) async {
    final database = await db;
    await database.delete('pending_actions', where: 'id = ?', whereArgs: [id]);
  }
}
