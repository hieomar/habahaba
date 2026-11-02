import 'dart:async';

import 'package:connectivity_plus/connectivity_plus.dart';

/// A lightweight connectivity service that exposes the device network state.
/// Compatible with connectivity_plus v6+, where [checkConnectivity] and
/// [onConnectivityChanged] both deal with [List<ConnectivityResult>].
class ConnectivityService {
  ConnectivityService() {
    _initialize();
  }

  final Connectivity _connectivity = Connectivity();
  final StreamController<bool> _controller = StreamController<bool>.broadcast();

  bool _isOnline = true;
  bool get isOnline => _isOnline;

  Stream<bool> get stream => _controller.stream;

  Future<bool> checkConnectivity() async {
    await _refresh();
    return _isOnline;
  }

  Future<void> _initialize() async {
    await _refresh();
    _connectivity.onConnectivityChanged.listen((List<ConnectivityResult> results) {
      final online = results.isNotEmpty && !results.contains(ConnectivityResult.none);
      _isOnline = online;
      if (!_controller.isClosed) {
        _controller.add(online);
      }
    });
  }

  Future<void> _refresh() async {
    try {
      final results = await _connectivity.checkConnectivity();
      _isOnline = results.isNotEmpty && !results.contains(ConnectivityResult.none);
      if (!_controller.isClosed) {
        _controller.add(_isOnline);
      }
    } catch (_) {
      _isOnline = false;
      if (!_controller.isClosed) {
        _controller.add(false);
      }
    }
  }

  void dispose() {
    _controller.close();
  }
}
