import { useCallback, useState } from 'react';
import { View, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useFocusEffect } from 'expo-router';
import ScreenContainer from '@/components/screen-container';
import NavigationBar from '@/components/navigation-bar';
import StatCard from '@/components/stat-card';
import Avatar from '@/components/avatar';
import { ThemedText } from '@/components/themed-text';
import { getProfile } from '@/data/profile';
import type { Profile } from '@/types/profile';
import { formatJoinDate } from '@/utils/format';
import { Colors, Fonts, Radius } from '@/constants/theme';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
    const [profile, setProfile] = useState<Profile | null>(null);
    const router = useRouter();
    useFocusEffect(
        useCallback(() => {
            getProfile().then(setProfile);
        }, [])
    );

    if (!profile) {
        return (
            <View style={{ flex: 1 }}>
                <ScreenContainer />
                <NavigationBar />
            </View>
        );
    }

    return (
        <View style={{ flex: 1 }}>
            <ScreenContainer>
                <View style={styles.header}>
                    <Avatar size={88} />
                    <View style={styles.nameBlock}>
                        <ThemedText style={styles.name}>{profile.name}</ThemedText>
                        <ThemedText style={styles.joined}>
                            exploring since {formatJoinDate(profile.joinedAt)}
                        </ThemedText>
                        <ThemedText style={styles.location}>{profile.location}</ThemedText>
                    </View>
                </View>

                <View style={styles.statRow}>
                    <StatCard value={String(profile.adventureCount)} label="adventures" />
                    <StatCard value={String(profile.landmarkCount)} label="landmarks" />
                    <StatCard value={String(profile.cityPercent)} unit="%" label="of city" />
                </View>

                <View style={styles.section}>
                    <ThemedText style={styles.sectionLabel}>FRIENDS</ThemedText>
                    <View style={styles.sectionDivider} />
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.friendRow}>
                        {profile.friends.map((friend) => (
                            <View key={friend.id} style={styles.friend}>
                                <Avatar size={56} />
                                <ThemedText style={styles.friendName}>{friend.name}</ThemedText>
                            </View>
                        ))}
                    </ScrollView>
                </View>

                <View style={styles.section}>
                    <ThemedText style={styles.sectionLabel}>SETTINGS</ThemedText>
                    <View style={styles.sectionDivider} />
                    <Pressable style={styles.settingsRow} onPress={() => router.push('/settings')}>
                        <ThemedText style={styles.settingsText}>Preferences</ThemedText>
                        <ThemedText style={styles.chevron}>›</ThemedText>
                    </Pressable>
                </View>
            </ScreenContainer>
            <NavigationBar />
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        alignItems: 'center',
        gap: 14,
        paddingTop: 24,
    },
    nameBlock: {
        alignItems: 'center',
        gap: 2,
    },
    name: {
        fontFamily: Fonts.handBold,
        fontSize: 30,
    },
    joined: {
        fontFamily: Fonts.regular,
        fontSize: 13,
    },
    location: {
        fontFamily: Fonts.semibold,
        fontSize: 13,
    },
    statRow: {
        flexDirection: 'row',
        gap: 10,
    },
    section: {
        gap: 8,
    },
    sectionLabel: {
        fontFamily: Fonts.handBold,
        fontSize: 14,
        letterSpacing: 1,
    },
    sectionDivider: {
        height: 1,
        backgroundColor: Colors.border,
    },
    friendRow: {
        gap: 18,
        paddingTop: 6,
        paddingRight: 30,
    },
    friend: {
        alignItems: 'center',
        gap: 6,
    },
    friendName: {
        fontFamily: Fonts.regular,
        fontSize: 12,
    },
    settingsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: Colors.surfaceTranslucent,
        borderRadius: Radius.card,
        borderWidth: 1,
        borderColor: Colors.border,
        padding: 16,
        marginTop: 4,
    },
    settingsText: {
        fontFamily: Fonts.medium,
        fontSize: 15,
    },
    chevron: {
        fontFamily: Fonts.regular,
        fontSize: 20,
    },
});