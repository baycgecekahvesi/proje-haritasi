import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:provider/provider.dart';
import 'package:proje_haritasi_mobile/core/network/dio_client.dart';
import 'package:proje_haritasi_mobile/core/router/app_router.dart';
import 'package:proje_haritasi_mobile/core/theme/app_theme.dart';
import 'package:proje_haritasi_mobile/core/notifiers/map_refresh_notifier.dart';
import 'package:proje_haritasi_mobile/features/auth/providers/auth_provider.dart';
import 'package:proje_haritasi_mobile/features/projects/providers/projects_provider.dart';
import 'package:proje_haritasi_mobile/features/risks/providers/risks_provider.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Set up auth expiry callback before running the app
  final authProvider = AuthProvider();
  DioClient().onAuthExpired = () {
    authProvider.logout();
    routerNotifier.refresh();
  };

  await authProvider.checkAuth();

  runApp(ProjeHaritasiApp(authProvider: authProvider));
}

class ProjeHaritasiApp extends StatelessWidget {
  final AuthProvider authProvider;

  const ProjeHaritasiApp({super.key, required this.authProvider});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider<AuthProvider>.value(value: authProvider),
        ChangeNotifierProvider<MapRefreshNotifier>(
          create: (_) => MapRefreshNotifier(),
        ),
        ChangeNotifierProxyProvider<MapRefreshNotifier, ProjectsProvider>(
          create: (_) => ProjectsProvider(),
          update: (_, mapRefresh, projects) {
            projects!.mapRefresh = mapRefresh;
            return projects;
          },
        ),
        ChangeNotifierProvider<RisksProvider>(
          create: (_) => RisksProvider(),
        ),
      ],
      child: MaterialApp.router(
        title: 'ProjeHaritası',
        theme: AppTheme.light,
        routerConfig: appRouter,
        locale: const Locale('tr', 'TR'),
        localizationsDelegates: const [
          GlobalMaterialLocalizations.delegate,
          GlobalWidgetsLocalizations.delegate,
          GlobalCupertinoLocalizations.delegate,
        ],
        supportedLocales: const [
          Locale('tr', 'TR'),
          Locale('en', 'US'),
        ],
        debugShowCheckedModeBanner: false,
      ),
    );
  }
}
