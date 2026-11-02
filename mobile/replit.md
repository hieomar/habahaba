# GTMS — IPC Grain Traceability

Flutter field application for NASFAM grain traceability (farmer registration, purchases, sync, trace lookup).

## Run

```bash
cd flutter_app
flutter pub get
flutter run -d android   # or chrome / windows
flutter analyze
```

## Stack

- Flutter 3.x + Dart 3.8+
- Provider (DI + state)
- Feature-first clean architecture
- Material 3 + google_fonts

## Layout

```
flutter_app/lib/
  app/           app.dart, di.dart, shell/
  core/          theme, constants, utils, widgets
  domain/        entities, repository contracts
  data/          local store + repository implementations
  state/         GtmsController
  features/      auth, dashboard, farmers, purchases, sync, profile, trace
```

## Notes

- Static seed data lives in `data/datasources/local_seed_data.dart`.
- Screens never import data sources directly; use `GtmsController`.
- Android application id: `org.nasfam.gtms`
