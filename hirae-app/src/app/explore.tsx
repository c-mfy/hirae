import Mapbox, { Camera, MapView, UserLocation } from '@rnmapbox/maps';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_TOKEN ?? '');

export default function MapScreen() {
  const [coords, setCoords] = useState<[number, number] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      // Ask for foreground permission only for now.
      // Background ("Always Allow") is a separate request we'll add on Day 2.
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission denied');
        return;
      }

      const position = await Location.getCurrentPositionAsync({});
      // Mapbox expects [longitude, latitude] — note the order
      setCoords([position.coords.longitude, position.coords.latitude]);
    })();
  }, []);

  if (error) {
    return (
      <View style={styles.center}>
        <Text>{error}</Text>
      </View>
    );
  }

  if (!coords) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={styles.loadingText}>Finding you…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView style={styles.map}>
        <Camera centerCoordinate={coords} zoomLevel={14} animationDuration={0} />
        <UserLocation />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: 8, color: '#8B9080' },
});