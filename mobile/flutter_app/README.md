# GTMS — IPC Grain Traceability (Flutter)

NASFAM field mobile app for farmer registration, commodity purchases, offline-first sync, and bag/trace lookup.

## Architecture

```
lib/
├── main.dart                 # Bootstrap
├── app/                      # App shell, DI, auth gate
├── core/                     # Theme, constants, shared widgets/utils
├── domain/                   # Entities + repository contracts
├── data/                     # Local store, seed data, repository impls
├── state/                    # GtmsController (presentation state)
└── features/                 # Feature modules (auth, dashboard, farmers, …)
    └── <feature>/presentation/
```

Layers:

| Layer | Responsibility |
|-------|----------------|
| **Presentation** (`features/*/presentation`) | UI only; talks to `GtmsController` |
| **State** (`state/`) | ChangeNotifier façade for screens |
| **Domain** | Pure models + repository interfaces |
| **Data** | Local in-memory store (swap for API/SQLite later) |

## Run on Android emulator

```bash
cd flutter_app
flutter pub get
flutter devices
# Start an AVD in Android Studio, then:
flutter run -d emulator-5554
# or pick any listed android device/emulator:
flutter run
```

Build APK:

```bash
flutter build apk --debug
```

### Demo login

Any non-empty username and password works in this offline demo build.

## Analyze & test

```bash
flutter analyze
flutter test
```

## Next backend integration points

Replace `LocalDataStore` implementations behind:

- `AuthRepository`
- `FarmerRepository`
- `PurchaseRepository`
- `SyncRepository`

without rewriting feature screens.
