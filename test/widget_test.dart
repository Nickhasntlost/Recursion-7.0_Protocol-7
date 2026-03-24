import 'package:flutter_test/flutter_test.dart';
import 'package:app/main.dart';

void main() {
  testWidgets('Assemble app smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const AssembleApp());
    expect(find.text('Assemble'), findsOneWidget);
  });
}
