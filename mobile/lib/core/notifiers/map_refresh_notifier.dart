import 'package:flutter/foundation.dart';

class MapRefreshNotifier extends ChangeNotifier {
  void refresh() => notifyListeners();
}
