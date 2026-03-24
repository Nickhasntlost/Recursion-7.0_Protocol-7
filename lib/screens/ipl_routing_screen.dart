import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:geolocator/geolocator.dart';
import '../theme/app_theme.dart';
import 'package:google_fonts/google_fonts.dart';

class IPLRoutingScreen extends StatefulWidget {
  const IPLRoutingScreen({super.key});

  @override
  State<IPLRoutingScreen> createState() => _IPLRoutingScreenState();
}

class _IPLRoutingScreenState extends State<IPLRoutingScreen> {
  GoogleMapController? _mapController;
  
  // Wankhede Stadium (IPL Venue) Example Coordinates
  final LatLng _destinationParams = const LatLng(18.9389, 72.8258);
  LatLng? _currentPosition;
  
  Map<PolylineId, Polyline> polylines = {};
  Set<Marker> markers = {};
  
  bool _isLoading = true;
  String _statusText = 'Fetching precise live location...';

  // The user's provided Google Maps Configuration Key
  final String _googleMapsApiKey = "AIzaSyD4PYkoFUIa65_GUSzMqRNF4_xbMgCDvy8";

  @override
  void initState() {
    super.initState();
    _initializeMapRouting();
  }

  Future<void> _initializeMapRouting() async {
    try {
      // 1. Check and request location permissions
      bool serviceEnabled;
      LocationPermission permission;

      serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        setState(() => _statusText = 'Location services are disabled. Please enable them.');
        return;
      }

      permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          setState(() => _statusText = 'Location permissions are denied');
          return;
        }
      }
      
      if (permission == LocationPermission.deniedForever) {
        setState(() => _statusText = 'Location permissions are permanently denied.');
        return;
      } 

      // 2. Fetch current physical location
      Position position = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(accuracy: LocationAccuracy.high)
      );
      
      _currentPosition = LatLng(position.latitude, position.longitude);
      
      // Add markers immediately
      markers.addAll({
        Marker(
          markerId: const MarkerId('currentLocation'),
          position: _currentPosition!,
          icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueAzure),
          infoWindow: const InfoWindow(title: 'You are here'),
        ),
        Marker(
          markerId: const MarkerId('destination'),
          position: _destinationParams,
          icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueOrange),
          infoWindow: const InfoWindow(title: 'IPL Stadium (Wankhede)'),
        ),
      });

      setState(() {
        _statusText = 'Calculating optimal driving route...';
      });

      // 3. Fetch Polyline routing connecting current location to the stadium manually
      final url = 'https://maps.googleapis.com/maps/api/directions/json?origin=${_currentPosition!.latitude},${_currentPosition!.longitude}&destination=${_destinationParams.latitude},${_destinationParams.longitude}&key=$_googleMapsApiKey';
      
      final response = await http.get(Uri.parse(url));
      
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        
        if (data['routes'] != null && data['routes'].isNotEmpty) {
          final encodedString = data['routes'][0]['overview_polyline']['points'];
          List<LatLng> polylineCoordinates = _decodePolyline(encodedString);
          
          PolylineId id = const PolylineId("routing_line");
          Polyline polyline = Polyline(
            polylineId: id,
            color: AppColors.primary,
            points: polylineCoordinates,
            width: 5,
          );
          polylines[id] = polyline;
        } else {
          setState(() {
            _statusText = 'No valid driving route found based on API response.';
          });
        }
      } else {
        setState(() {
          _statusText = 'Failed to fetch directions: ${response.statusCode}';
        });
      }

      // 4. Reveal Map
      setState(() {
        _isLoading = false;
      });
      
    } catch (e) {
      setState(() {
        _statusText = 'Error loading map framework: $e';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.black,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded, color: AppColors.white),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text('Routing to Stadium', 
          style: GoogleFonts.plusJakartaSans(
            fontWeight: FontWeight.w700, 
            color: AppColors.white
          ),
        ),
      ),
      body: _isLoading 
        ? Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const CircularProgressIndicator(color: AppColors.primary),
                const SizedBox(height: 24),
                Text(_statusText, 
                  style: GoogleFonts.inter(color: AppColors.stone400, fontWeight: FontWeight.w500),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          )
        : GoogleMap(
            initialCameraPosition: CameraPosition(
              target: _currentPosition ?? _destinationParams,
              zoom: 13.5, // Zoomed out enough to potentially see route
            ),
            myLocationEnabled: true,
            myLocationButtonEnabled: true,
            markers: markers,
            polylines: Set<Polyline>.of(polylines.values),
            onMapCreated: (GoogleMapController controller) {
              _mapController = controller;
              // Animate camera to fit both points perfectly
              if (_currentPosition != null && polylines.isNotEmpty) {
                _mapController?.animateCamera(
                  CameraUpdate.newLatLngBounds(
                    _boundsFromLatLngList([_currentPosition!, _destinationParams]),
                    60.0, // Padding
                  ),
                );
              }
            },
            mapType: MapType.normal,
        ),
    );
  }

  // Utility to calculate bounding box so both user and stadium fit on screen
  LatLngBounds _boundsFromLatLngList(List<LatLng> list) {
    assert(list.isNotEmpty);
    double? x0, x1, y0, y1;
    for (LatLng latLng in list) {
      if (x0 == null) {
        x0 = x1 = latLng.latitude;
        y0 = y1 = latLng.longitude;
      } else {
        if (latLng.latitude > x1!) x1 = latLng.latitude;
        if (latLng.latitude < x0) x0 = latLng.latitude;
        if (latLng.longitude > y1!) y1 = latLng.longitude;
        if (latLng.longitude < y0!) y0 = latLng.longitude;
      }
    }
    return LatLngBounds(northeast: LatLng(x1!, y1!), southwest: LatLng(x0!, y0!));
  }

  // Pure Dart implementation of the Google Maps Polyline Decoding algorithm
  List<LatLng> _decodePolyline(String encoded) {
    List<LatLng> points = [];
    int index = 0, len = encoded.length;
    int lat = 0, lng = 0;

    while (index < len) {
      int b, shift = 0, result = 0;
      do {
        b = encoded.codeUnitAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      int dlat = ((result & 1) != 0 ? ~(result >> 1) : (result >> 1));
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.codeUnitAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      int dlng = ((result & 1) != 0 ? ~(result >> 1) : (result >> 1));
      lng += dlng;

      points.add(LatLng(lat / 1E5, lng / 1E5));
    }
    return points;
  }
}
