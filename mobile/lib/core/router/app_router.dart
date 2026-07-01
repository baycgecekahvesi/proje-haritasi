import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:proje_haritasi_mobile/core/storage/token_storage.dart';
import 'package:proje_haritasi_mobile/features/auth/screens/login_screen.dart';
import 'package:proje_haritasi_mobile/features/home/screens/home_shell.dart';
import 'package:proje_haritasi_mobile/features/map/screens/map_screen.dart';
import 'package:proje_haritasi_mobile/features/profile/screens/profile_screen.dart';
import 'package:proje_haritasi_mobile/features/projects/screens/project_detail_screen.dart';
import 'package:proje_haritasi_mobile/features/projects/screens/project_form_screen.dart';
import 'package:proje_haritasi_mobile/features/projects/screens/projects_list_screen.dart';
import 'package:proje_haritasi_mobile/features/notifications/screens/notifications_screen.dart';
import 'package:proje_haritasi_mobile/features/tasks/screens/tasks_screen.dart';

class RouterNotifier extends ChangeNotifier {
  Future<void> refresh() async {
    notifyListeners();
  }
}

final routerNotifier = RouterNotifier();

final appRouter = GoRouter(
  initialLocation: '/map',
  refreshListenable: routerNotifier,
  redirect: (context, state) async {
    final token = await TokenStorage.getToken();
    final isOnLogin = state.matchedLocation == '/login';

    if (token == null && !isOnLogin) return '/login';
    if (token != null && isOnLogin) return '/map';
    return null;
  },
  routes: [
    GoRoute(
      path: '/login',
      builder: (context, state) => const LoginScreen(),
    ),
    StatefulShellRoute.indexedStack(
      builder: (context, state, navigationShell) =>
          HomeShell(navigationShell: navigationShell),
      branches: [
        StatefulShellBranch(
          routes: [
            GoRoute(
              path: '/map',
              builder: (context, state) => const MapScreen(),
            ),
          ],
        ),
        StatefulShellBranch(
          routes: [
            GoRoute(
              path: '/projects',
              builder: (context, state) => const ProjectsListScreen(),
            ),
          ],
        ),
        StatefulShellBranch(
          routes: [
            GoRoute(
              path: '/tasks',
              builder: (context, state) => const TasksScreen(),
            ),
          ],
        ),
        StatefulShellBranch(
          routes: [
            GoRoute(
              path: '/notifications',
              builder: (context, state) => const NotificationsScreen(),
            ),
          ],
        ),
        StatefulShellBranch(
          routes: [
            GoRoute(
              path: '/profile',
              builder: (context, state) => const ProfileScreen(),
            ),
          ],
        ),
      ],
    ),
    GoRoute(
      path: '/projects/new',
      builder: (context, state) => const ProjectFormScreen(),
    ),
    GoRoute(
      path: '/projects/:id',
      builder: (context, state) =>
          ProjectDetailScreen(projectId: state.pathParameters['id']!),
    ),
    GoRoute(
      path: '/projects/:id/edit',
      builder: (context, state) =>
          ProjectFormScreen(projectId: state.pathParameters['id']),
    ),
  ],
);
