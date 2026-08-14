import { useCallback, useState } from 'react';
import { View, Pressable, Linking, StyleSheet } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ScreenContainer from '@/components/screen-container';
import { ThemedText } from '@/components/themed-text';
import { Colors, Fonts, Radius } from '@/constants/theme';

type Units = 'km' | 'mi';

export default function SettingsScreen() {
  const router = useRouter();
  const [locationStatus, setLocationStatus] = useState('Checking…');
  const [units, setUnits] = useState<Units>('km');

  useFocusEffect(
    useCallback(() => {
      Location.getForegroundPermissionsAsync().then(({ status }) => {
        setLocationStatus(status === 'granted' ? 'While using' : 'Denied');
      });
      AsyncStorage.getItem('units').then((v) => {
        if (v === 'km' || v === 'mi') setUnits(v);
      });
    }, [])
  );

  const changeUnits = async (next: Units) => {
    setUnits(next);
    await AsyncStorage.setItem('units', next);
  };

  return (
    <ScreenContainer>
      <View style={styles.topbar}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <ThemedText style={styles.back}>‹</ThemedText>
        </Pressable>
        <ThemedText style={styles.screenTitle}>settings</ThemedText>
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionLabel}>PERMISSIONS</ThemedText>
        <View style={styles.sectionDivider} />

        <Pressable style={styles.row} onPress={() => Linking.openSettings()}>
          <View style={styles.rowMain}>
            <ThemedText style={styles.rowLabel}>Location</ThemedText>
            <ThemedText style={styles.rowSub}>Needed to reveal the map</ThemedText>
          </View>
          <View style={styles.rowRight}>
            <ThemedText
              style={[
                styles.status,
                locationStatus !== 'Always' && styles.statusWarn,
              ]}>
              {locationStatus}
            </ThemedText>
            <ThemedText style={styles.chev}>›</ThemedText>
          </View>
        </Pressable>

        <View style={styles.rowDivider} />

        <Pressable style={styles.row} onPress={() => Linking.openSettings()}>
          <View style={styles.rowMain}>
            <ThemedText style={styles.rowLabel}>Notifications</ThemedText>
            <ThemedText style={styles.rowSub}>Alerts for nearby notes</ThemedText>
          </View>
          <View style={styles.rowRight}>
            <ThemedText style={styles.chev}>›</ThemedText>
          </View>
        </Pressable>
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionLabel}>PREFERENCES</ThemedText>
        <View style={styles.sectionDivider} />

        <View style={styles.row}>
          <ThemedText style={styles.rowLabel}>Units</ThemedText>
          <View style={styles.segmented}>
            <Pressable
              style={[styles.seg, units === 'km' && styles.segActive]}
              onPress={() => changeUnits('km')}>
              <ThemedText
                style={[styles.segText, units === 'km' && styles.segTextActive]}>
                km
              </ThemedText>
            </Pressable>
            <Pressable
              style={[styles.seg, units === 'mi' && styles.segActive]}
              onPress={() => changeUnits('mi')}>
              <ThemedText
                style={[styles.segText, units === 'mi' && styles.segTextActive]}>
                mi
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionLabel}>ABOUT</ThemedText>
        <View style={styles.sectionDivider} />

        <View style={styles.row}>
          <ThemedText style={styles.rowLabel}>Version</ThemedText>
          <ThemedText style={styles.status}>1.0.0</ThemedText>
        </View>

        <View style={styles.rowDivider} />

        <Pressable style={styles.row} onPress={() => {}}>
          <ThemedText style={styles.rowLabel}>Send feedback</ThemedText>
          <ThemedText style={styles.chev}>›</ThemedText>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 20,
  },
  back: { fontFamily: Fonts.regular, fontSize: 28, lineHeight: 30 },
  screenTitle: { fontFamily: Fonts.handBold, fontSize: 26 },

  section: { gap: 0 },
  sectionLabel: {
    fontFamily: Fonts.handBold,
    fontSize: 14,
    letterSpacing: 1,
    marginBottom: 6,
  },
  sectionDivider: { height: 1, backgroundColor: Colors.border },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    gap: 12,
  },
  rowDivider: { height: 1, backgroundColor: Colors.border },
  rowMain: { flex: 1, gap: 2 },
  rowLabel: { fontFamily: Fonts.medium, fontSize: 15 },
  rowSub: { fontFamily: Fonts.regular, fontSize: 12, opacity: 0.7 },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  status: { fontFamily: Fonts.medium, fontSize: 13 },
  statusWarn: { color: '#B9694A' },
  chev: { fontFamily: Fonts.regular, fontSize: 20, opacity: 0.5 },

  segmented: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceTranslucent,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.pill,
    padding: 3,
  },
  seg: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: Radius.pill },
  segActive: { backgroundColor: Colors.primary },
  segText: { fontFamily: Fonts.medium, fontSize: 13 },
  segTextActive: { color: Colors.background },
});