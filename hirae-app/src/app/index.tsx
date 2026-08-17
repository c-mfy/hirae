import { useCallback, useState } from 'react';
import { View, Pressable } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import Mapbox, { MapView, Camera, ShapeSource, FillLayer, LineLayer } from '@rnmapbox/maps';
import ScreenContainer from '@/components/screen-container';
import NavigationBar from '@/components/navigation-bar';
import { ThemedText } from '@/components/themed-text';
import { Fonts, Radius, Colors } from '@/constants/theme';
import StatCard from '@/components/stat-card';
import AdventureCard from '@/components/adventure-card';
import { getAdventures } from '@/data/adventures';
import type { Adventure } from '@/types/adventure';
import { formatDistance, formatShortDate, formatPercent } from '@/utils/format';
import { useTracking } from '@/context/tracking-context';

export default function HomeScreen() {
  const router = useRouter();
  const [recent, setRecent] = useState<Adventure[]>([]);
  const { boundary, percent, coords, settledArea, liveArea } = useTracking();

  useFocusEffect(
    useCallback(() => {
      getAdventures().then((all) => {
        const sorted = [...all].sort(
          (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
        );
        setRecent(sorted.slice(0, 2));
      });
    }, [])
  );

  return (
    <View style={{ flex: 1 }}>
      <ScreenContainer>
        <ThemedText style={{ fontFamily: Fonts.handBold, fontSize: 20 }}>
          hirae
        </ThemedText>

        <View style={{ alignItems: 'center', gap: 2 }}>
          <ThemedText style={{ fontFamily: Fonts.handRegular, fontSize: 18 }}>
            good morning, Xin
          </ThemedText>
          <ThemedText style={{ fontFamily: Fonts.handBold, fontSize: 30 }}>
            Ready to Wander?
          </ThemedText>
        </View>

        <View style={{ gap: 8 }}>
          <ThemedText
            style={{
              fontFamily: Fonts.medium,
              fontSize: 14,
              textAlign: 'right',
            }}>
            {boundary?.name ?? 'Locating…'} ▾
          </ThemedText>

          <Pressable
            onPress={() => router.replace('/map')}
            style={{
              height: 190,
              borderRadius: Radius.card,
              backgroundColor: Colors.surface,
              borderWidth: 1,
              borderColor: Colors.border,
              overflow: 'hidden',
            }}>
            <MapView
              style={{ flex: 1 }}
              styleURL={Mapbox.StyleURL.Light}
              scrollEnabled={false}
              zoomEnabled={false}
              rotateEnabled={false}
              pitchEnabled={false}
              logoEnabled={false}
              attributionEnabled={false}
              scaleBarEnabled={false}>
              {coords && (
                <Camera zoomLevel={12} centerCoordinate={coords} animationDuration={0} />
              )}

              {settledArea && (
                <ShapeSource id="home-settled" shape={settledArea}>
                  <FillLayer
                    id="home-settled-fill"
                    style={{ fillColor: Colors.primary, fillOpacity: 0.18 }}
                  />
                  <LineLayer
                    id="home-settled-outline"
                    style={{ lineColor: Colors.primary, lineWidth: 1.2, lineOpacity: 0.5 }}
                  />
                </ShapeSource>
              )}

              {liveArea && (
                <ShapeSource id="home-live" shape={liveArea}>
                  <FillLayer
                    id="home-live-fill"
                    style={{ fillColor: Colors.primary, fillOpacity: 0.18 }}
                  />
                  <LineLayer
                    id="home-live-outline"
                    style={{ lineColor: Colors.primary, lineWidth: 1.2, lineOpacity: 0.5 }}
                  />
                </ShapeSource>
              )}
            </MapView>
          </Pressable>
        </View>

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <StatCard value={formatPercent(percent)} unit="%" label="exploration" />
          <StatCard value="3 of 8" label="landmarks" />
        </View>

        <View style={{ gap: 10 }}>
          <Pressable onPress={() => router.replace('/journal')} hitSlop={8}>
            <ThemedText
              style={{
                fontFamily: Fonts.handBold,
                fontSize: 14,
                textAlign: 'center',
                letterSpacing: 1,
              }}>
              RECENT ADVENTURES
            </ThemedText>
          </Pressable>

          {recent.map((entry) => (
            <AdventureCard
              key={entry.id}
              title={entry.title}
              distance={formatDistance(entry.distanceMeters)}
              date={formatShortDate(entry.startedAt)}
              percent={String(entry.percentRevealed)}
              onPress={() =>
                router.push({ pathname: '/adventure/[id]', params: { id: entry.id } })
              }
            />
          ))}
        </View>
      </ScreenContainer>
      <NavigationBar />
    </View>
  );
}