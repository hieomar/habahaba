import 'package:flutter/material.dart';
import 'package:gtms/app/app.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  configureSystemUi();
  runApp(const GtmsApp());
}
