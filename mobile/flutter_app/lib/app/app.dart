import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';

import 'package:gtms/app/di.dart';
import 'package:gtms/app/shell/main_shell.dart';
import 'package:gtms/core/constants/app_constants.dart';
import 'package:gtms/core/theme/app_scroll_behavior.dart';
import 'package:gtms/core/theme/app_theme.dart';
import 'package:gtms/features/auth/presentation/login_screen.dart';
import 'package:gtms/state/gtms_controller.dart';

class GtmsApp extends StatelessWidget {
  const GtmsApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: buildAppProviders(),
      child: Consumer<GtmsController>(
        builder: (context, controller, _) {
          return MaterialApp(
            title: AppConstants.appName,
            debugShowCheckedModeBanner: false,
            theme: AppTheme.lightTheme,
            darkTheme: AppTheme.darkTheme,
            themeMode: controller.themeMode,
            scrollBehavior: const AppScrollBehavior(),
            home: const _AuthGate(),
          );
        },
      ),
    );
  }
}

/// Routes between login and the authenticated main shell.
class _AuthGate extends StatelessWidget {
  const _AuthGate();

  @override
  Widget build(BuildContext context) {
    final isAuthed = context.watch<GtmsController>().isAuthenticated;
    return isAuthed ? const MainShell() : const LoginScreen();
  }
}

/// Configures system UI chrome once at startup.
void configureSystemUi() {
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
      systemNavigationBarColor: Colors.white,
      systemNavigationBarIconBrightness: Brightness.dark,
    ),
  );
  SystemChrome.setPreferredOrientations(const [
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);
}
