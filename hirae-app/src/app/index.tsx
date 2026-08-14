import { useCallback, useState } from 'react';
import { View, Pressable } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import ScreenContainer from '@/components/screen-container';
import NavigationBar from '@/components/navigation-bar';
import { ThemedText } from '@/components/themed-text';
import { Fonts, Radius, Colors } from '@/constants/theme';
import StatCard from '@/components/stat-card';
import AdventureCard from '@/components/adventure-card';
import { getAdventures } from '@/data/adventures';
import type { Adventure } from '@/types/adventure';
import { formatDistance, formatShortDate } from '@/utils/format';

export default function HomeScreen() {
  const router = useRouter();
  const [recent, setRecent] = useState<Adventure[]>([]);

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
            San Francisco ▾
          </ThemedText>

          <View
            style={{
              height: 190,
              borderRadius: Radius.card,
              backgroundColor: Colors.surface,
              borderWidth: 1,
              borderColor: Colors.border,
            }}
          />
        </View>

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <StatCard value="32" unit="%" label="exploration" />
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