---
name: Flutter GTMS dependency pins
description: Versions that must not be bumped due to Dart SDK constraints
---

## Dart SDK on this Replit: 3.8.0

## Pinned dependencies
- `path_provider: 2.1.5` — 2.1.6+ requires Dart ^3.10.0; causes "version solving failed" on pub get

**Why:** Replit's Flutter installation ships Dart 3.8.0; any package requiring 3.10.0+ will break the build.
**How to apply:** Keep `path_provider: 2.1.5` in pubspec.yaml; do not run `flutter pub upgrade` without checking SDK requirements.
