import { View, StyleSheet, ActivityIndicator } from 'react-native';
import ScreenContainer from '@/components/screen-container';
import NavigationBar from '@/components/navigation-bar';
import TimelineEntry from '@/components/timeline-entry';
import { ThemedText } from '@/components/themed-text';
import { getAdventures } from '@/data/adventures';
import { groupByMonth, type AdventureSection } from '@/utils/group-adventures';
import { formatDistance, formatShortDate } from '@/utils/format';
import { Colors, Fonts } from '@/constants/theme';

import { useCallback, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';

export default function JournalScreen() {
    const [sections, setSections] = useState<AdventureSection[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    useFocusEffect(
        useCallback(() => {
            getAdventures()
                .then((adventures) => setSections(groupByMonth(adventures)))
                .catch((e) => setError(e.message));
        }, [])
    );

    const totalAdventures =
        sections?.reduce((sum, s) => sum + s.entries.length, 0) ?? 0;
    const totalLandmarks =
        sections?.reduce(
            (sum, s) => sum + s.entries.reduce((n, e) => n + e.landmarkCount, 0),
            0
        ) ?? 0;

    return (
        <View style={{ flex: 1 }}>
            <ScreenContainer>
                <View style={styles.header}>
                    <ThemedText style={styles.title}>XIN&apos;S JOURNAL</ThemedText>
                    <ThemedText style={styles.subtitle}>
                        <ThemedText style={styles.subtitleBold}>
                            {totalAdventures} adventures
                        </ThemedText>
                        {` · ${totalLandmarks} landmarks discovered`}
                    </ThemedText>
                </View>

                <View style={styles.headerDivider} />

                {error && <ThemedText style={styles.message}>{error}</ThemedText>}

                {!sections && !error && (
                    <ActivityIndicator style={{ marginTop: 40 }} color={Colors.primary} />
                )}

                {sections?.length === 0 && (
                    <ThemedText style={styles.message}>
                        No adventures yet. Go for a walk to start your first one.
                    </ThemedText>
                )}

                {sections?.map((section) => (
                    <View key={section.month} style={styles.section}>
                        <ThemedText style={styles.month}>{section.month}</ThemedText>
                        <View>
                            {section.entries.map((entry, index) => (
                                <TimelineEntry
                                    key={entry.id}
                                    title={entry.title}
                                    distance={formatDistance(entry.distanceMeters)}
                                    date={formatShortDate(entry.startedAt)}
                                    percent={String(entry.percentRevealed)}
                                    note={entry.note ?? undefined}
                                    hasLandmark={entry.landmarkCount > 0}
                                    isLast={index === section.entries.length - 1}
                                    onPress={() => router.push(`/adventure/${entry.id}`)}
                                />
                            ))}
                        </View>
                    </View>
                ))}
            </ScreenContainer>
            <NavigationBar />
        </View>
    );
}

const styles = StyleSheet.create({
    header: { alignItems: 'center', gap: 6, paddingTop: 20 },
    title: { fontFamily: Fonts.handBold, fontSize: 34, letterSpacing: 2 },
    subtitle: { fontFamily: Fonts.regular, fontSize: 13 },
    subtitleBold: { fontFamily: Fonts.semibold, fontSize: 13 },
    headerDivider: { height: 1, backgroundColor: Colors.border },
    section: { gap: 10 },
    month: {
        fontFamily: Fonts.handBold,
        fontSize: 14,
        letterSpacing: 1.5,
        textAlign: 'right',
    },
    message: {
        fontFamily: Fonts.regular,
        fontSize: 14,
        textAlign: 'center',
        marginTop: 40,
    },
});