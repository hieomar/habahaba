import 'package:flutter_test/flutter_test.dart';
import 'package:gtms/app/app.dart';

void main() {
  testWidgets('GtmsApp boots to login', (WidgetTester tester) async {
    await tester.pumpWidget(const GtmsApp());
    await tester.pump();
    expect(find.textContaining('Traceability'), findsWidgets);
    expect(find.text('Username or Email'), findsOneWidget);
  });
}
